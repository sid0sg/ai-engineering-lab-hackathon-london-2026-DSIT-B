/**
 * PDF Extraction Engine
 *
 * Uses pdf-parse to extract raw text from a PDF buffer, then applies
 * heuristic pattern matching to detect form fields and infer their types.
 *
 * Target accuracy: ≥70% on digitally generated, text-layer PDFs.
 */

import pdfParse from 'pdf-parse';
import { v4 as uuidv4 } from 'uuid';
import type { FormField, FormSchema, FieldType, A11yHints } from '../types/schema';

// ── Heuristic patterns ─────────────────────────────────────────────────────────

/** Patterns that suggest a field label on a line */
const FIELD_LABEL_PATTERN =
  /^(.{3,80}?)[\s:_\-]{0,3}(?:_{3,}|\[.*?\]|\(.*?\)|\s*$)/im;

/** Patterns for detecting specific field types by label keywords */
const TYPE_PATTERNS: Array<{ pattern: RegExp; type: FieldType }> = [
  { pattern: /\b(date|dob|d\.o\.b|day|month|year|born)\b/i, type: 'date' },
  { pattern: /\b(description|details|comments?|notes?|additional|address|reason)\b/i, type: 'textarea' },
  { pattern: /\b(number|no\.|count|quantity|age|phone|tel|mobile|postcode|amount|salary|income)\b/i, type: 'number' },
  { pattern: /\b(yes|no|gender|sex|married|single|employed|full.?time|part.?time)\b/i, type: 'radio' },
  { pattern: /\b(select|choose|country|nationality|title|mr|mrs|ms|dr)\b/i, type: 'select' },
  { pattern: /\b(agree|accept|confirm|tick|check)\b/i, type: 'checkbox' },
];

/** Lines that are NOT field labels (headers, instructions, footings) */
const NON_FIELD_PATTERNS = [
  /^page\s+\d+/i,
  /^section\s+\d+/i,
  /^official\s+use/i,
  /^for\s+office\s+use/i,
  /^please\s+(read|note|complete|fill)/i,
  /^\s*$/,
  /^[*•\-–—]/,        // bullet points
  /^\d+\.\s+[A-Z]/,  // numbered paragraphs that look like instructions
];

/** Minimum label length to be considered a field */
const MIN_LABEL_LENGTH = 3;
/** Maximum label length */
const MAX_LABEL_LENGTH = 120;

// ── A11y hints generator ───────────────────────────────────────────────────────

function buildA11yHints(label: string, type: FieldType, _order: number): A11yHints {
  const sanitisedId = label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  return {
    hint: buildHintText(label, type),
    ariaLive: 'polite',
    errorMessageId: `${sanitisedId}-error`,
  };
}

function buildHintText(label: string, type: FieldType): string | undefined {
  switch (type) {
    case 'date':
      return 'For example, 27 3 2007';
    case 'number':
      if (/phone|tel|mobile/i.test(label)) return 'Enter your telephone number including area code';
      if (/postcode/i.test(label)) return 'For example, SW1A 1AA';
      return undefined;
    case 'textarea':
      return 'Do not include personal or financial information';
    case 'radio':
      return 'Select one option';
    case 'checkbox':
      return 'Select all that apply';
    case 'select':
      return 'Select one option from the list';
    default:
      return undefined;
  }
}

// ── Field-type inference ───────────────────────────────────────────────────────

function inferFieldType(label: string): FieldType {
  for (const { pattern, type } of TYPE_PATTERNS) {
    if (pattern.test(label)) return type;
  }
  return 'text';
}

// ── Required flag heuristic ────────────────────────────────────────────────────

function inferRequired(label: string): boolean {
  return /\*|required|mandatory/i.test(label);
}

// ── Line cleaner ───────────────────────────────────────────────────────────────

function cleanLabel(raw: string): string {
  return raw
    .replace(/[*:_\-]+$/, '')   // trailing punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Main extraction function ───────────────────────────────────────────────────

export interface ExtractionResult {
  schema: FormSchema;
  rawText: string;
  pageCount: number;
}

export async function extractFromPdf(
  buffer: Buffer,
  formId: string,
  sourceFileName: string
): Promise<ExtractionResult> {
  let rawText: string;
  let pageCount: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pdfInfo: any;
  try {
    const data = await pdfParse(buffer);
    rawText = data.text;
    pageCount = data.numpages;
    pdfInfo = data.info;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`PDF parsing failed: ${message}`);
  }

  const lines = rawText.split('\n');

  const fields: FormField[] = [];
  const seenLabels = new Set<string>();
  let order = 1;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip non-field lines
    if (trimmed.length < MIN_LABEL_LENGTH || trimmed.length > MAX_LABEL_LENGTH) continue;
    if (NON_FIELD_PATTERNS.some((p) => p.test(trimmed))) continue;

    // Try to extract a candidate label
    const match = FIELD_LABEL_PATTERN.exec(trimmed);
    if (!match) continue;

    const rawLabel = cleanLabel(match[1] ?? trimmed);
    if (rawLabel.length < MIN_LABEL_LENGTH) continue;

    // Deduplicate
    const normLabel = rawLabel.toLowerCase();
    if (seenLabels.has(normLabel)) continue;
    seenLabels.add(normLabel);

    const type = inferFieldType(rawLabel);
    const required = inferRequired(rawLabel);
    const id = `field_${uuidv4().replace(/-/g, '').slice(0, 8)}`;

    const field: FormField = {
      id,
      label: rawLabel,
      type,
      required,
      order: order++,
      a11yHints: buildA11yHints(rawLabel, type, order),
    };

    // Add options placeholder for radio/checkbox/select
    if (type === 'radio' || type === 'checkbox') {
      field.options = ['Yes', 'No'];
    } else if (type === 'select') {
      field.options = [];
    }

    fields.push(field);
  }

  // Derive a human-readable title from the PDF metadata or first meaningful line
  const title = deriveTitle(pdfInfo, lines, sourceFileName);

  const now = new Date().toISOString();
  const schema: FormSchema = {
    formId,
    title,
    version: 1,
    status: 'draft',
    fields,
    createdAt: now,
    updatedAt: now,
    extractionMeta: {
      sourceFileName,
      extractedAt: now,
      fieldCount: fields.length,
    },
  };

  return { schema, rawText, pageCount };
}

// ── Title derivation ───────────────────────────────────────────────────────────

function deriveTitle(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: any,
  lines: string[],
  fallback: string
): string {
  // Check PDF metadata
  if (info?.Title && typeof info.Title === 'string' && info.Title.trim().length > 3) {
    return info.Title.trim();
  }

  // Use the first non-empty line that looks like a title
  for (const line of lines.slice(0, 20)) {
    const trimmed = line.trim();
    if (
      trimmed.length > 5 &&
      trimmed.length < 120 &&
      !/^\d+$/.test(trimmed) &&
      !NON_FIELD_PATTERNS.some((p) => p.test(trimmed))
    ) {
      return trimmed;
    }
  }

  // Fallback to sanitised filename (without extension)
  return fallback.replace(/\.pdf$/i, '').replace(/[_\-]/g, ' ');
}
