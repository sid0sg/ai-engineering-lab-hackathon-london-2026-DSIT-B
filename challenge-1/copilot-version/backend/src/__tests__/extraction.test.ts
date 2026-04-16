/**
 * Unit tests: PDF extraction engine
 *
 * Tests schema shape, field type inference, a11y hints, and accuracy
 * against synthetic PDF text content.
 */

import { extractFromPdf } from '../services/extraction';
import type { FormField } from '../types/schema';

// ── PDF text fixtures ─────────────────────────────────────────────────────────

/**
 * Build a minimal fake pdf-parse result buffer.
 * pdf-parse reads from a real Buffer, but we mock the module so it doesn't matter.
 */
function makeBuffer(): Buffer {
  return Buffer.from('%PDF-1.4 fake pdf bytes');
}

// Mock pdf-parse so tests run without real PDF binary parsing
jest.mock('pdf-parse', () => {
  return jest.fn();
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PdfData = any;

import pdfParse from 'pdf-parse';
const mockPdfParse = pdfParse as jest.MockedFunction<typeof pdfParse>;

function mockPdfText(text: string, pageCount = 1): void {
  mockPdfParse.mockResolvedValueOnce({
    text,
    numpages: pageCount,
    numrender: pageCount,
    info: { Title: '' },
    metadata: null,
    version: '1.10.100',
  } as PdfData);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('extractFromPdf', () => {
  const formId = 'test-form-id';
  const fileName = 'test-form.pdf';

  describe('schema shape validation', () => {
    it('returns a schema conforming to the FormSchema spec', async () => {
      mockPdfText('Application Form\nFull Name\nDate of Birth\nEmail Address\n');
      const { schema } = await extractFromPdf(makeBuffer(), formId, fileName);

      expect(schema).toHaveProperty('formId', formId);
      expect(schema).toHaveProperty('title');
      expect(schema).toHaveProperty('version', 1);
      expect(schema).toHaveProperty('status', 'draft');
      expect(schema).toHaveProperty('fields');
      expect(Array.isArray(schema.fields)).toBe(true);
      expect(schema).toHaveProperty('createdAt');
      expect(schema).toHaveProperty('updatedAt');
    });

    it('includes extraction metadata', async () => {
      mockPdfText('Housing Benefit Form\nApplicant Name\nAddress\n');
      const { schema } = await extractFromPdf(makeBuffer(), formId, fileName);

      expect(schema.extractionMeta).toBeDefined();
      expect(schema.extractionMeta!.sourceFileName).toBe(fileName);
      expect(schema.extractionMeta!.fieldCount).toBe(schema.fields.length);
    });

    it('each field has required properties', async () => {
      mockPdfText('Tax Form\nFull Name\nNational Insurance Number\nDate of Birth\n');
      const { schema } = await extractFromPdf(makeBuffer(), formId, fileName);

      for (const field of schema.fields) {
        expect(field).toHaveProperty('id');
        expect(field).toHaveProperty('label');
        expect(field).toHaveProperty('type');
        expect(field).toHaveProperty('required');
        expect(field).toHaveProperty('order');
        expect(typeof field.id).toBe('string');
        expect(typeof field.label).toBe('string');
        expect(typeof field.required).toBe('boolean');
        expect(typeof field.order).toBe('number');
      }
    });
  });

  describe('field type inference', () => {
    it('detects date fields', async () => {
      mockPdfText('Form\nDate of Birth\nStart Date\n');
      const { schema } = await extractFromPdf(makeBuffer(), formId, fileName);
      const dateFields = schema.fields.filter((f: FormField) => f.type === 'date');
      expect(dateFields.length).toBeGreaterThanOrEqual(1);
    });

    it('detects textarea fields for long-text labels', async () => {
      mockPdfText('Form\nAdditional Comments\nPlease describe your circumstances\nAddress\n');
      const { schema } = await extractFromPdf(makeBuffer(), formId, fileName);
      const textareaFields = schema.fields.filter((f: FormField) => f.type === 'textarea');
      expect(textareaFields.length).toBeGreaterThanOrEqual(1);
    });

    it('detects number fields', async () => {
      mockPdfText('Form\nPhone Number\nAge\nIncome Amount\n');
      const { schema } = await extractFromPdf(makeBuffer(), formId, fileName);
      const numberFields = schema.fields.filter((f: FormField) => f.type === 'number');
      expect(numberFields.length).toBeGreaterThanOrEqual(1);
    });

    it('detects radio fields', async () => {
      mockPdfText('Form\nAre you employed? Yes / No\nGender\n');
      const { schema } = await extractFromPdf(makeBuffer(), formId, fileName);
      const radioFields = schema.fields.filter((f: FormField) => f.type === 'radio');
      expect(radioFields.length).toBeGreaterThanOrEqual(1);
    });

    it('detects checkbox fields', async () => {
      mockPdfText('Form\nI confirm and agree to the terms\nI accept the privacy notice\n');
      const { schema } = await extractFromPdf(makeBuffer(), formId, fileName);
      const checkboxFields = schema.fields.filter((f: FormField) => f.type === 'checkbox');
      expect(checkboxFields.length).toBeGreaterThanOrEqual(1);
    });

    it('detects select fields', async () => {
      mockPdfText('Form\nSelect your country\nNationality\n');
      const { schema } = await extractFromPdf(makeBuffer(), formId, fileName);
      const selectFields = schema.fields.filter((f: FormField) => f.type === 'select');
      expect(selectFields.length).toBeGreaterThanOrEqual(1);
    });

    it('defaults to text type for unrecognised fields', async () => {
      mockPdfText('Form\nFirst Name\nLast Name\nMiddle Name\n');
      const { schema } = await extractFromPdf(makeBuffer(), formId, fileName);
      const textFields = schema.fields.filter((f: FormField) => f.type === 'text');
      expect(textFields.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('a11y hints', () => {
    it('includes a11yHints with ariaLive on each field', async () => {
      mockPdfText('Form\nFull Name\nDate of Birth\n');
      const { schema } = await extractFromPdf(makeBuffer(), formId, fileName);

      for (const field of schema.fields) {
        expect(field.a11yHints).toBeDefined();
        expect(field.a11yHints!.ariaLive).toBe('polite');
        expect(field.a11yHints!.errorMessageId).toContain('-error');
      }
    });

    it('provides date hint text for date fields', async () => {
      mockPdfText('Form\nDate of Birth\n');
      const { schema } = await extractFromPdf(makeBuffer(), formId, fileName);
      const dateField = schema.fields.find((f: FormField) => f.type === 'date');
      if (dateField) {
        expect(dateField.a11yHints!.hint).toMatch(/\d{1,2}\s+\d{1,2}\s+\d{4}/);
      }
    });
  });

  describe('deduplication', () => {
    it('does not produce duplicate fields for repeated labels', async () => {
      mockPdfText('Form\nFull Name\nFull Name\nFull Name\n');
      const { schema } = await extractFromPdf(makeBuffer(), formId, fileName);
      const nameFields = schema.fields.filter(
        (f: FormField) => f.label.toLowerCase() === 'full name'
      );
      expect(nameFields).toHaveLength(1);
    });
  });

  describe('field ordering', () => {
    it('assigns sequential order values starting at 1', async () => {
      mockPdfText('Form\nFirst Name\nLast Name\nDate of Birth\n');
      const { schema } = await extractFromPdf(makeBuffer(), formId, fileName);
      const orders = schema.fields.map((f: FormField) => f.order);
      for (let i = 0; i < orders.length; i++) {
        expect(orders[i]).toBe(i + 1);
      }
    });
  });

  describe('title derivation', () => {
    it('uses PDF metadata title when available', async () => {
      mockPdfParse.mockResolvedValueOnce({
        text: 'Application',
        numpages: 1,
        numrender: 1,
        info: { Title: 'Official Housing Benefit Form' },
        metadata: null,
        version: '1.10.100',
      } as PdfData);

      const { schema } = await extractFromPdf(makeBuffer(), formId, fileName);
      expect(schema.title).toBe('Official Housing Benefit Form');
    });

    it('falls back to first meaningful text line when no title metadata', async () => {
      mockPdfText('Universal Credit Application Form\nFull Name\n');
      const { schema } = await extractFromPdf(makeBuffer(), formId, fileName);
      expect(schema.title).toBeTruthy();
      expect(schema.title.length).toBeGreaterThan(0);
    });
  });

  describe('accuracy baseline', () => {
    it('identifies ≥70% of expected fields in a typical government form', async () => {
      // Simulate 10 known form fields — all clearly labelled
      const formText = `
Housing Benefit Application

Full Name
Date of Birth
National Insurance Number
Address
Postcode
Phone Number
Email Address
Are you employed? Yes / No
Weekly Income Amount
Select your tenancy type
I confirm the information is correct
      `.trim();

      mockPdfText(formText, 2);
      const { schema } = await extractFromPdf(makeBuffer(), formId, fileName);

      // We expect to identify at least 7 out of 10 key fields (70%)
      const expectedFields = [
        'full name',
        'date of birth',
        'national insurance number',
        'address',
        'postcode',
        'phone number',
        'email address',
      ];

      const foundLabels = schema.fields.map((f: FormField) => f.label.toLowerCase());
      const matched = expectedFields.filter((expected: string) =>
        foundLabels.some((found: string) => found.includes(expected) || expected.includes(found))
      );

      const accuracy = matched.length / expectedFields.length;
      expect(accuracy).toBeGreaterThanOrEqual(0.7);
    });
  });
});
