/**
 * Forms routes:
 *   POST /api/forms/upload    – Upload a PDF, extract fields, return draft schema
 *   GET  /api/forms/:formId   – Get a form record by ID
 *   GET  /api/forms/:formId/schema – Get the draft schema for a form
 *   GET  /api/forms           – List all form records
 */

import { Router, type Request, type Response, type NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { upload, fileUploadErrorHandler } from '../middleware/fileUpload';
import { extractFromPdf } from '../services/extraction';
import { sanitiseFilename, hasPdfMagicBytes } from '../utils/sanitise';
import { sendError } from '../utils/errors';
import { formStore, schemaStore, auditStore } from '../store/stores';

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

router.get('/:formId/schema', async (req: Request, res: Response): Promise<void> => {
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

  res.status(200).json(schema);
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

  const updatedSchema = await schemaStore.update(record.draftSchemaId, {
    fields: fields as typeof schema.fields,
    updatedAt: new Date().toISOString(),
    version: schema.version + 1,
  });

  await auditStore.create({
    id: uuidv4(),
    formId,
    action: 'FIELDS_UPDATED',
    timestamp: new Date().toISOString(),
    details: { fieldCount: (fields as unknown[]).length, version: schema.version + 1 },
  });

  res.status(200).json({ formId, schema: updatedSchema });
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
