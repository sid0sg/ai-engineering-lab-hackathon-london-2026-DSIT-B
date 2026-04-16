/**
 * Forms routes:
 *   POST /api/forms/upload    – Upload a PDF, extract fields, return draft schema
 *   GET  /api/forms/:formId   – Get a form record by ID
 *   GET  /api/forms           – List all form records
 *   PUT  /api/forms/:formId/fields   – Save draft fields (increments version)
 *   POST /api/forms/:formId/publish  – Publish the current draft (creates snapshot)
 *   GET  /api/forms/:formId/schema   – Serve the active published schema (404 if unpublished)
 *   GET  /api/forms/:formId/audit    – Audit log for a form
 */

import { Router, type Request, type Response, type NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { upload, fileUploadErrorHandler } from '../middleware/fileUpload';
import { extractFromPdf } from '../services/extraction';
import { sanitiseFilename, hasPdfMagicBytes } from '../utils/sanitise';
import { sendError } from '../utils/errors';
import { formStore, schemaStore, publishedSchemaStore, auditStore } from '../store/stores';
import type { VersionEntry } from '../types/schema';

const router = Router();

// ── POST /api/forms/upload ────────────────────────────────────────────────────

router.post(
  '/upload',
  (req: Request, res: Response, next: NextFunction) => {
    // Wrap multer to handle its custom errors before the route handler
    upload.single('file')(req, res, (err) => {
      if (err) {
        fileUploadErrorHandler(err as Error, req, res, next);
      } else {
        next();
      }
    });
  },
  async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      sendError(res, 400, 'NO_FILE_UPLOADED');
      return;
    }

    // Magic-bytes validation: verify the buffer is an actual PDF regardless of
    // client-supplied Content-Type header (OWASP A03 server-side validation).
    if (!hasPdfMagicBytes(req.file.buffer)) {
      sendError(res, 400, 'INVALID_FILE_TYPE');
      return;
    }

    const formId = uuidv4();
    const createdAt = new Date().toISOString();
    const sanitisedName = sanitiseFilename(req.file.originalname);

    // Store form record
    await formStore.create({
      id: formId,
      formId,
      originalFileName: sanitisedName,
      mimeType: req.file.mimetype,
      fileSizeBytes: req.file.size,
      fileBuffer: req.file.buffer,
      createdAt,
      status: 'pending',
    });

    // Log upload action to audit trail
    await auditStore.create({
      id: uuidv4(),
      formId,
      action: 'FORM_UPLOADED',
      timestamp: createdAt,
      details: { fileName: sanitisedName, fileSizeBytes: req.file.size },
    });

    // Trigger extraction
    let draftSchemaId: string;
    try {
      const { schema } = await extractFromPdf(
        req.file.buffer,
        formId,
        sanitisedName
      );

      const schemaId = uuidv4();
      draftSchemaId = schemaId;

      // Persist extracted schema
      await schemaStore.create({ ...schema, id: schemaId });

      // Update form record → extraction-complete
      await formStore.update(formId, {
        status: 'extraction-complete',
        draftSchemaId: schemaId,
      });

      // Log success
      await auditStore.create({
        id: uuidv4(),
        formId,
        action: 'EXTRACTION_COMPLETE',
        timestamp: new Date().toISOString(),
        details: { schemaId, fieldCount: schema.fields.length },
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);

      // Log extraction failure – immutable audit entry
      await auditStore.create({
        id: uuidv4(),
        formId,
        action: 'EXTRACTION_FAILED',
        timestamp: new Date().toISOString(),
        error,
      });

      // Update form record → failed
      await formStore.update(formId, { status: 'extraction-failed' });

      sendError(res, 422, 'EXTRACTION_FAILED');
      return;
    }

    res.status(201).json({
      formId,
      status: 'extraction-complete',
      draftSchemaId,
    });
  }
);

// ── GET /api/forms ─────────────────────────────────────────────────────────────

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const records = await formStore.findAll();
  const forms = await Promise.all(
    records.map(async (record) => {
      let title = record.originalFileName; // fallback if schema not yet extracted
      if (record.draftSchemaId) {
        const schema = await schemaStore.findById(record.draftSchemaId);
        if (schema) title = schema.title;
      }
      return {
        formId: record.formId,
        title,
        status: record.status,
        createdAt: record.createdAt,
        publishedAt: record.publishedAt,
      };
    })
  );
  res.status(200).json({ forms });
});

// ── GET /api/forms/:formId ────────────────────────────────────────────────────

router.get('/:formId', async (req: Request, res: Response): Promise<void> => {
  const { formId } = req.params;
  const record = await formStore.findById(formId);

  if (!record) {
    sendError(res, 404, 'FORM_NOT_FOUND');
    return;
  }

  const { fileBuffer: _buf, ...safe } = record;

  // Include current draft schema in response (AC11)
  let schema = null;
  if (safe.draftSchemaId) {
    schema = await schemaStore.findById(safe.draftSchemaId);
  }

  res.status(200).json({ ...safe, schema });
});

// ── GET /api/forms/:formId/schema ─────────────────────────────────────────────
// Serves only the PUBLISHED schema. Returns 404 if no published version exists.

router.get('/:formId/schema', async (req: Request, res: Response): Promise<void> => {
  const { formId } = req.params;
  const record = await formStore.findById(formId);

  if (!record) {
    sendError(res, 404, 'FORM_NOT_FOUND');
    return;
  }

  if (!record.publishedSchemaId) {
    sendError(res, 404, 'SCHEMA_NOT_PUBLISHED');
    return;
  }

  const published = await publishedSchemaStore.findById(record.publishedSchemaId);
  if (!published) {
    sendError(res, 404, 'SCHEMA_NOT_PUBLISHED');
    return;
  }

  res.status(200).json({
    formId: published.formId,
    title: published.title,
    version: published.version,
    status: published.status,
    fields: published.fields,
    createdAt: published.createdAt,
    updatedAt: published.updatedAt,
    publishedAt: record.publishedAt,
    extractionMeta: published.extractionMeta,
  });
});

// ── PUT /api/forms/:formId/fields ─────────────────────────────────────────────

router.put('/:formId/fields', async (req: Request, res: Response): Promise<void> => {
  const { formId } = req.params;
  const record = await formStore.findById(formId);

  if (!record) {
    sendError(res, 404, 'FORM_NOT_FOUND');
    return;
  }

  if (!record.draftSchemaId) {
    sendError(res, 404, 'SCHEMA_NOT_FOUND');
    return;
  }

  const schema = await schemaStore.findById(record.draftSchemaId);
  if (!schema) {
    sendError(res, 404, 'SCHEMA_NOT_FOUND');
    return;
  }

  const { fields } = req.body as { fields: unknown };
  if (!Array.isArray(fields)) {
    sendError(res, 400, 'INVALID_FIELDS');
    return;
  }

  const newVersion = schema.version + 1;
  const savedAt = new Date().toISOString();

  const updatedSchema = await schemaStore.update(record.draftSchemaId, {
    fields: fields as typeof schema.fields,
    updatedAt: savedAt,
    version: newVersion,
  });

  // Track version history on the form record
  const prevHistory: VersionEntry[] = record.versionHistory ?? [];
  const versionEntry: VersionEntry = {
    version: newVersion,
    savedAt,
    fieldCount: (fields as unknown[]).length,
    isPublished: false,
  };
  await formStore.update(formId, {
    versionHistory: [...prevHistory, versionEntry],
  });

  await auditStore.create({
    id: uuidv4(),
    formId,
    action: 'FIELDS_UPDATED',
    timestamp: savedAt,
    details: { fieldCount: (fields as unknown[]).length, version: newVersion },
  });

  res.status(200).json({ formId, schema: updatedSchema });
});

// ── POST /api/forms/:formId/publish ───────────────────────────────────────────

router.post('/:formId/publish', async (req: Request, res: Response): Promise<void> => {
  const { formId } = req.params;
  const record = await formStore.findById(formId);

  if (!record) {
    sendError(res, 404, 'FORM_NOT_FOUND');
    return;
  }

  if (!record.draftSchemaId) {
    sendError(res, 404, 'SCHEMA_NOT_FOUND');
    return;
  }

  const draft = await schemaStore.findById(record.draftSchemaId);
  if (!draft) {
    sendError(res, 404, 'SCHEMA_NOT_FOUND');
    return;
  }

  const publishedAt = new Date().toISOString();
  const publishedSchemaId = uuidv4();

  // Create an immutable published snapshot
  await publishedSchemaStore.create({
    ...draft,
    id: publishedSchemaId,
    status: 'published',
    updatedAt: publishedAt,
    publishedAt,
  } as Parameters<typeof publishedSchemaStore.create>[0]);

  // Update the draft schema status to 'published'
  await schemaStore.update(record.draftSchemaId, { status: 'published' });

  // Update version history – mark the current version as published
  const prevHistory: VersionEntry[] = record.versionHistory ?? [];
  const updatedHistory = prevHistory.map((entry) =>
    entry.version === draft.version
      ? { ...entry, isPublished: true, publishedAt }
      : entry
  );
  // If this version isn't in history yet (e.g. never saved after extraction), add it
  const alreadyTracked = updatedHistory.some((e) => e.version === draft.version);
  if (!alreadyTracked) {
    updatedHistory.push({
      version: draft.version,
      savedAt: draft.updatedAt,
      fieldCount: draft.fields.length,
      isPublished: true,
      publishedAt,
    });
  }

  // Update form record
  await formStore.update(formId, {
    status: 'published',
    publishedSchemaId,
    publishedAt,
    versionHistory: updatedHistory,
  });

  // Audit log
  await auditStore.create({
    id: uuidv4(),
    formId,
    action: 'FORM_PUBLISHED',
    timestamp: publishedAt,
    details: { version: draft.version, publishedSchemaId },
  });

  res.status(200).json({
    formId,
    version: draft.version,
    status: 'published',
    publishedAt,
  });
});

// ── POST /api/forms/:formId/submit ────────────────────────────────────────────
// Accepts a form submission payload, logs it, returns a reference number.

router.post('/:formId/submit', async (req: Request, res: Response): Promise<void> => {
  const { formId } = req.params;
  const record = await formStore.findById(formId);

  if (!record) {
    sendError(res, 404, 'FORM_NOT_FOUND');
    return;
  }

  const submissionData = req.body as Record<string, unknown>;
  const referenceNumber = `REF-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const submittedAt = new Date().toISOString();

  // Log submission to audit trail
  await auditStore.create({
    id: uuidv4(),
    formId,
    action: 'FORM_SUBMITTED',
    timestamp: submittedAt,
    details: { referenceNumber, fieldCount: Object.keys(submissionData).length },
  });

  // Log the structured payload for observability
  console.log('[FORM SUBMISSION]', JSON.stringify({
    formId,
    referenceNumber,
    submittedAt,
    data: submissionData,
  }, null, 2));

  res.status(200).json({
    formId,
    referenceNumber,
    submittedAt,
    status: 'submitted',
  });
});

// ── GET /api/forms/:formId/audit ──────────────────────────────────────────────

router.get('/:formId/audit', async (req: Request, res: Response): Promise<void> => {
  const { formId } = req.params;
  const record = await formStore.findById(formId);

  if (!record) {
    sendError(res, 404, 'FORM_NOT_FOUND');
    return;
  }

  const entries = await auditStore.findByFormId(formId);
  res.status(200).json({ formId, auditLog: entries });
});

export default router;
