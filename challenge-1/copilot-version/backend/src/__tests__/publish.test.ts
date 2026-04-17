/**
 * Sprint 03 tests: Save with version, Publish, Serve published schema, 404 for missing.
 * Tests POST /api/forms/:formId/publish and the updated GET /api/forms/:formId/schema.
 */

import request from 'supertest';
import { createApp } from '../app';
import { formStore, schemaStore, publishedSchemaStore, auditStore } from '../store/stores';

// Mock pdf-parse so tests run without real PDF files
jest.mock('pdf-parse', () =>
  jest.fn().mockResolvedValue({
    text: 'Application Form\nFull Name\nDate of Birth\nEmail Address\nPhone Number\n',
    numpages: 1,
    numrender: 1,
    info: { Title: 'Test Form' },
    metadata: null,
    version: '1.10.100',
  })
);

const app = createApp();
const VALID_PDF_BUFFER = Buffer.from('%PDF-1.4 fake content for testing purposes');

// Helper: upload a form and return formId
async function uploadForm(): Promise<string> {
  const res = await request(app)
    .post('/api/forms/upload')
    .attach('file', VALID_PDF_BUFFER, {
      filename: 'test-form.pdf',
      contentType: 'application/pdf',
    });
  expect(res.status).toBe(201);
  return res.body.formId as string;
}

beforeEach(() => {
  formStore.clear();
  schemaStore.clear();
  publishedSchemaStore.clear();
  auditStore.clear();
});

// ── AC1 & AC2: PUT /fields increments version and records version history ─────

describe('PUT /api/forms/:formId/fields – version increment and history', () => {
  it('increments the version number on each save', async () => {
    const formId = await uploadForm();

    // Get initial schema to confirm version starts at 1
    const formRes = await request(app).get(`/api/forms/${formId}`);
    expect(formRes.body.schema.version).toBe(1);

    // Save fields → version should become 2
    const saveRes = await request(app)
      .put(`/api/forms/${formId}/fields`)
      .send({ fields: [{ id: 'f1', label: 'Name', type: 'text', required: true, order: 0 }] });

    expect(saveRes.status).toBe(200);
    expect(saveRes.body.schema.version).toBe(2);
  });

  it('creates a version entry in versionHistory on each save', async () => {
    const formId = await uploadForm();

    await request(app)
      .put(`/api/forms/${formId}/fields`)
      .send({ fields: [{ id: 'f1', label: 'Name', type: 'text', required: true, order: 0 }] });

    const formRes = await request(app).get(`/api/forms/${formId}`);
    const record = await formStore.findById(formId);

    expect(record).not.toBeNull();
    expect(Array.isArray(record!.versionHistory)).toBe(true);
    expect(record!.versionHistory!.length).toBeGreaterThanOrEqual(1);

    const entry = record!.versionHistory![record!.versionHistory!.length - 1];
    expect(entry).toHaveProperty('version', 2);
    expect(entry).toHaveProperty('savedAt');
    expect(entry).toHaveProperty('fieldCount', 1);
    expect(entry).toHaveProperty('isPublished', false);
  });

  it('version increments again on second save', async () => {
    const formId = await uploadForm();

    await request(app)
      .put(`/api/forms/${formId}/fields`)
      .send({ fields: [{ id: 'f1', label: 'Name', type: 'text', required: true, order: 0 }] });

    const saveRes2 = await request(app)
      .put(`/api/forms/${formId}/fields`)
      .send({ fields: [{ id: 'f1', label: 'Name', type: 'text', required: true, order: 0 },
                        { id: 'f2', label: 'Email', type: 'text', required: false, order: 1 }] });

    expect(saveRes2.status).toBe(200);
    expect(saveRes2.body.schema.version).toBe(3);
  });
});

// ── AC3 & AC4: POST /api/forms/:formId/publish ────────────────────────────────

describe('POST /api/forms/:formId/publish', () => {
  it('returns 200 with { formId, version, status: "published", publishedAt }', async () => {
    const formId = await uploadForm();

    const publishRes = await request(app).post(`/api/forms/${formId}/publish`);

    expect(publishRes.status).toBe(200);
    expect(publishRes.body).toHaveProperty('formId', formId);
    expect(publishRes.body).toHaveProperty('version');
    expect(publishRes.body).toHaveProperty('status', 'published');
    expect(publishRes.body).toHaveProperty('publishedAt');
    expect(typeof publishRes.body.publishedAt).toBe('string');
  });

  it('marks the form record status as "published"', async () => {
    const formId = await uploadForm();
    await request(app).post(`/api/forms/${formId}/publish`);

    const record = await formStore.findById(formId);
    expect(record).not.toBeNull();
    expect(record!.status).toBe('published');
    expect(record!.publishedAt).toBeTruthy();
    expect(record!.publishedSchemaId).toBeTruthy();
  });

  it('creates a published schema snapshot', async () => {
    const formId = await uploadForm();
    const publishRes = await request(app).post(`/api/forms/${formId}/publish`);

    const record = await formStore.findById(formId);
    expect(record!.publishedSchemaId).toBeTruthy();

    const snapshot = await publishedSchemaStore.findById(record!.publishedSchemaId!);
    expect(snapshot).not.toBeNull();
    expect(snapshot!.status).toBe('published');
    expect(snapshot!.formId).toBe(formId);
    expect(publishRes.body.version).toBe(snapshot!.version);
  });

  it('records publish action in audit log', async () => {
    const formId = await uploadForm();
    await request(app).post(`/api/forms/${formId}/publish`);

    const auditEntries = await auditStore.findByFormId(formId);
    expect(auditEntries.some((e) => e.action === 'FORM_PUBLISHED')).toBe(true);
  });

  it('returns 404 for unknown formId', async () => {
    const res = await request(app).post('/api/forms/nonexistent-id/publish');
    expect(res.status).toBe(404);
    expect(res.body.error).toHaveProperty('code', 'FORM_NOT_FOUND');
  });

  it('marks version history entry as published', async () => {
    const formId = await uploadForm();

    // Save to create a version entry
    await request(app)
      .put(`/api/forms/${formId}/fields`)
      .send({ fields: [{ id: 'f1', label: 'Name', type: 'text', required: true, order: 0 }] });

    await request(app).post(`/api/forms/${formId}/publish`);

    const record = await formStore.findById(formId);
    const publishedEntries = record!.versionHistory!.filter((e) => e.isPublished);
    expect(publishedEntries.length).toBeGreaterThanOrEqual(1);
    expect(publishedEntries[publishedEntries.length - 1]).toHaveProperty('publishedAt');
  });
});

// ── AC5, AC6, AC7: GET /api/forms/:formId/schema ──────────────────────────────

describe('GET /api/forms/:formId/schema', () => {
  it('returns 404 when form has not been published yet', async () => {
    const formId = await uploadForm();

    const res = await request(app).get(`/api/forms/${formId}/schema`);
    expect(res.status).toBe(404);
    expect(res.body.error).toHaveProperty('code', 'SCHEMA_NOT_PUBLISHED');
  });

  it('returns 404 for unknown formId', async () => {
    const res = await request(app).get('/api/forms/nonexistent/schema');
    expect(res.status).toBe(404);
    expect(res.body.error).toHaveProperty('code', 'FORM_NOT_FOUND');
  });

  it('returns the published schema after publishing', async () => {
    const formId = await uploadForm();
    await request(app).post(`/api/forms/${formId}/publish`);

    const res = await request(app).get(`/api/forms/${formId}/schema`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('formId', formId);
    expect(res.body).toHaveProperty('title');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('status', 'published');
    expect(res.body).toHaveProperty('fields');
    expect(Array.isArray(res.body.fields)).toBe(true);
  });

  it('response includes required metadata: formId, version, publishedAt, title', async () => {
    const formId = await uploadForm();
    await request(app).post(`/api/forms/${formId}/publish`);

    const res = await request(app).get(`/api/forms/${formId}/schema`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('formId');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('publishedAt');
    expect(res.body).toHaveProperty('title');
  });

  it('serves the schema at the version that was published, not a later draft', async () => {
    const formId = await uploadForm();

    // Save fields at version 2
    await request(app)
      .put(`/api/forms/${formId}/fields`)
      .send({ fields: [{ id: 'f1', label: 'Name', type: 'text', required: true, order: 0 }] });

    // Publish at version 2
    await request(app).post(`/api/forms/${formId}/publish`);
    const schemaAtPublish = await request(app).get(`/api/forms/${formId}/schema`);
    const publishedVersion = schemaAtPublish.body.version as number;

    // Save again to increment draft to version 3 – published should still be version 2
    await request(app)
      .put(`/api/forms/${formId}/fields`)
      .send({ fields: [
        { id: 'f1', label: 'Name', type: 'text', required: true, order: 0 },
        { id: 'f2', label: 'Email', type: 'text', required: false, order: 1 },
      ] });

    const schemaRes = await request(app).get(`/api/forms/${formId}/schema`);
    expect(schemaRes.status).toBe(200);
    expect(schemaRes.body.version).toBe(publishedVersion);
  });
});

// ── Dashboard: GET /api/forms returns status 'published' ──────────────────────

describe('GET /api/forms – published status in list', () => {
  it('returns "published" status for published forms', async () => {
    const formId = await uploadForm();
    await request(app).post(`/api/forms/${formId}/publish`);

    const listRes = await request(app).get('/api/forms');
    expect(listRes.status).toBe(200);

    const published = (listRes.body.forms as Array<{ formId: string; status: string; publishedAt?: string }>)
      .find((f) => f.formId === formId);
    expect(published).toBeDefined();
    expect(published!.status).toBe('published');
    expect(published!.publishedAt).toBeTruthy();
  });
});

// ── PUT /api/forms/:formId/fields – error branches ────────────────────────────

describe('PUT /api/forms/:formId/fields – error paths', () => {
  it('returns 404 FORM_NOT_FOUND for unknown formId', async () => {
    const res = await request(app)
      .put('/api/forms/nonexistent-id/fields')
      .send({ fields: [] });
    expect(res.status).toBe(404);
    expect(res.body.error).toHaveProperty('code', 'FORM_NOT_FOUND');
  });

  it('returns 400 INVALID_FIELDS when fields is not an array', async () => {
    const formId = await uploadForm();
    const res = await request(app)
      .put(`/api/forms/${formId}/fields`)
      .send({ fields: 'not-an-array' });
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty('code', 'INVALID_FIELDS');
  });

  it('returns 400 INVALID_FIELDS when body has no fields property', async () => {
    const formId = await uploadForm();
    const res = await request(app)
      .put(`/api/forms/${formId}/fields`)
      .send({ wrongKey: [] });
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty('code', 'INVALID_FIELDS');
  });
});

// ── PublishedSchemaRepository.findLatestByFormId ──────────────────────────────

describe('PublishedSchemaRepository.findLatestByFormId', () => {
  it('returns null when no published schema exists for formId', async () => {
    const result = await publishedSchemaStore.findLatestByFormId('no-such-form');
    expect(result).toBeNull();
  });

  it('returns the latest published schema by version after publish', async () => {
    const formId = await uploadForm();
    await request(app).post(`/api/forms/${formId}/publish`);

    const latest = await publishedSchemaStore.findLatestByFormId(formId);
    expect(latest).not.toBeNull();
    expect(latest!.formId).toBe(formId);
    expect(latest!.status).toBe('published');
  });
});
