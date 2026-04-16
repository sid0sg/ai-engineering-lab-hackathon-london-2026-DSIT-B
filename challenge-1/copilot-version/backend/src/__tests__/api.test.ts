/**
 * Integration tests: POST /api/forms/upload and GET /api/forms/:id routes
 * Uses supertest to test the full Express app without a running server.
 */

import request from 'supertest';
import { createApp } from '../app';
import { formStore, schemaStore, auditStore } from '../store/stores';

// Mock pdf-parse so tests run without real PDF files
jest.mock('pdf-parse', () =>
  jest.fn().mockResolvedValue({
    text: 'Application Form\nFull Name\nDate of Birth\nEmail Address\nPhone Number\nAddress\nPostcode\n',
    numpages: 1,
    numrender: 1,
    info: { Title: 'Test Form' },
    metadata: null,
    version: '1.10.100',
  })
);

const app = createApp();

// Minimal valid PDF magic bytes
const VALID_PDF_BUFFER = Buffer.from('%PDF-1.4 fake content for testing purposes');

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service');
    expect(res.body).toHaveProperty('timestamp');
  });
});

describe('POST /api/forms/upload', () => {
  beforeEach(() => {
    formStore.clear();
    schemaStore.clear();
    auditStore.clear();
  });

  it('returns 201 with formId, status, and draftSchemaId for a valid PDF', async () => {
    const res = await request(app)
      .post('/api/forms/upload')
      .attach('file', VALID_PDF_BUFFER, {
        filename: 'test-form.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('formId');
    expect(res.body).toHaveProperty('status', 'extraction-complete');
    expect(res.body).toHaveProperty('draftSchemaId');
    expect(typeof res.body.formId).toBe('string');
    expect(typeof res.body.draftSchemaId).toBe('string');
  });

  it('returns 400 for non-PDF file type', async () => {
    const res = await request(app)
      .post('/api/forms/upload')
      .attach('file', Buffer.from('<html>not a pdf</html>'), {
        filename: 'form.html',
        contentType: 'text/html',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code', 'INVALID_FILE_TYPE');
    expect(res.body.error).toHaveProperty('message');
  });

  it('returns 400 when file has wrong extension despite valid MIME', async () => {
    const res = await request(app)
      .post('/api/forms/upload')
      .attach('file', VALID_PDF_BUFFER, {
        filename: 'form.exe',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty('code', 'INVALID_FILE_TYPE');
  });

  it('returns 400 when no file is attached', async () => {
    const res = await request(app).post('/api/forms/upload');
    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty('code', 'NO_FILE_UPLOADED');
  });

  it('returns 400 when file has PDF MIME type but non-PDF magic bytes (magic byte bypass attempt)', async () => {
    // Attacker sends a file with PDF MIME type but HTML content — magic bytes check must block this
    const res = await request(app)
      .post('/api/forms/upload')
      .attach('file', Buffer.from('<script>alert(1)</script>'), {
        filename: 'evil.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty('code', 'INVALID_FILE_TYPE');
  });

  it('returns consistent GOV.UK error shape with errorSummary', async () => {
    const res = await request(app)
      .post('/api/forms/upload')
      .attach('file', Buffer.from('not a pdf'), {
        filename: 'test.txt',
        contentType: 'text/plain',
      });

    expect(res.body.error).toHaveProperty('code');
    expect(res.body.error).toHaveProperty('message');
    expect(res.body.error).toHaveProperty('errorSummary');
    expect(Array.isArray(res.body.error.errorSummary)).toBe(true);
  });

  it('stores the form in the form store after successful upload', async () => {
    await request(app)
      .post('/api/forms/upload')
      .attach('file', VALID_PDF_BUFFER, {
        filename: 'housing-benefit.pdf',
        contentType: 'application/pdf',
      });

    const all = await formStore.findAll();
    expect(all).toHaveLength(1);
    expect(all[0].originalFileName).toBe('housing-benefit.pdf');
  });

  it('creates an audit log entry after upload', async () => {
    const uploadRes = await request(app)
      .post('/api/forms/upload')
      .attach('file', VALID_PDF_BUFFER, {
        filename: 'test-form.pdf',
        contentType: 'application/pdf',
      });

    const { formId } = uploadRes.body;
    const auditEntries = await auditStore.findByFormId(formId);
    expect(auditEntries.length).toBeGreaterThanOrEqual(1);
    expect(auditEntries.some((e: { action: string }) => e.action === 'FORM_UPLOADED')).toBe(true);
  });
});

describe('GET /api/forms', () => {
  beforeEach(async () => {
    formStore.clear();
    schemaStore.clear();
    auditStore.clear();

    // Upload a form to have data
    await request(app)
      .post('/api/forms/upload')
      .attach('file', VALID_PDF_BUFFER, {
        filename: 'test-form.pdf',
        contentType: 'application/pdf',
      });
  });

  it('returns a list of forms', async () => {
    const res = await request(app).get('/api/forms');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('forms');
    expect(Array.isArray(res.body.forms)).toBe(true);
    expect(res.body.forms.length).toBeGreaterThanOrEqual(1);
  });

  it('does not include fileBuffer in the response (security)', async () => {
    const res = await request(app).get('/api/forms');
    for (const form of res.body.forms) {
      expect(form).not.toHaveProperty('fileBuffer');
    }
  });
});

describe('GET /api/forms/:formId', () => {
  beforeEach(() => {
    formStore.clear();
    schemaStore.clear();
    auditStore.clear();
  });

  it('returns a form record for a known formId', async () => {
    const uploadRes = await request(app)
      .post('/api/forms/upload')
      .attach('file', VALID_PDF_BUFFER, {
        filename: 'test-form.pdf',
        contentType: 'application/pdf',
      });

    const { formId } = uploadRes.body;
    const res = await request(app).get(`/api/forms/${formId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('formId', formId);
    expect(res.body).not.toHaveProperty('fileBuffer');
  });

  it('returns 404 with GOV.UK error shape for unknown formId', async () => {
    const res = await request(app).get('/api/forms/nonexistent-uuid');
    expect(res.status).toBe(404);
    expect(res.body.error).toHaveProperty('code', 'FORM_NOT_FOUND');
    expect(res.body.error).toHaveProperty('message');
  });
});

describe('GET /api/forms/:formId/schema', () => {
  beforeEach(() => {
    formStore.clear();
    schemaStore.clear();
    auditStore.clear();
  });

  it('returns the extracted draft schema for a successful upload', async () => {
    const uploadRes = await request(app)
      .post('/api/forms/upload')
      .attach('file', VALID_PDF_BUFFER, {
        filename: 'test-form.pdf',
        contentType: 'application/pdf',
      });

    const { formId } = uploadRes.body;
    const res = await request(app).get(`/api/forms/${formId}/schema`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('formId', formId);
    expect(res.body).toHaveProperty('title');
    expect(res.body).toHaveProperty('version', 1);
    expect(res.body).toHaveProperty('status', 'draft');
    expect(res.body).toHaveProperty('fields');
    expect(Array.isArray(res.body.fields)).toBe(true);
  });

  it('each field in the schema has required properties', async () => {
    const uploadRes = await request(app)
      .post('/api/forms/upload')
      .attach('file', VALID_PDF_BUFFER, {
        filename: 'test-form.pdf',
        contentType: 'application/pdf',
      });

    const { formId } = uploadRes.body;
    const res = await request(app).get(`/api/forms/${formId}/schema`);

    for (const field of res.body.fields) {
      expect(field).toHaveProperty('id');
      expect(field).toHaveProperty('label');
      expect(field).toHaveProperty('type');
      expect(field).toHaveProperty('required');
      expect(field).toHaveProperty('order');
      expect(field).toHaveProperty('a11yHints');
    }
  });

  it('returns 404 for an unknown formId', async () => {
    const res = await request(app).get('/api/forms/unknown-id/schema');
    expect(res.status).toBe(404);
    expect(res.body.error).toHaveProperty('code', 'FORM_NOT_FOUND');
  });
});

describe('404 for unknown routes', () => {
  it('returns 404 JSON error for unknown routes', async () => {
    const res = await request(app).get('/api/unknown-endpoint');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 404 for unknown sub-route under api/forms', async () => {
    const res = await request(app).get('/api/forms/unknownId/nonexistent-route');
    expect([404, 405]).toContain(res.status);
  });
});

describe('GET /api/forms/:formId/audit - errors', () => {
  it('returns 404 for unknown formId', async () => {
    const res = await request(app).get('/api/forms/ghost-id/audit');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('FORM_NOT_FOUND');
  });
});

describe('GET /api/forms/:formId/audit - success', () => {
  it('returns the audit log for a form', async () => {
    formStore.clear();
    schemaStore.clear();
    auditStore.clear();

    const uploadRes = await request(app)
      .post('/api/forms/upload')
      .attach('file', VALID_PDF_BUFFER, {
        filename: 'test-form.pdf',
        contentType: 'application/pdf',
      });

    const { formId } = uploadRes.body;
    const res = await request(app).get(`/api/forms/${formId}/audit`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('formId', formId);
    expect(res.body).toHaveProperty('auditLog');
    expect(Array.isArray(res.body.auditLog)).toBe(true);
    expect(res.body.auditLog.length).toBeGreaterThanOrEqual(1);
  });
});
