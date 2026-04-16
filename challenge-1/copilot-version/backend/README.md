# PDF-to-Digital Form Builder — Backend Service

## Overview

Express.js + TypeScript REST API that accepts PDF form uploads, extracts field structure using text heuristics, and returns a draft form schema conforming to the GOV.UK Design System accessibility standards (WCAG 2.2 AA).

---

## Prerequisites

- Node.js 20+
- npm 9+
- Python 3 (for regenerating test fixtures only)

---

## Local Setup

```bash
# Install dependencies
cd backend
npm install

# Start development server (port 3000, auto-restart on file changes)
npm run dev

# Build TypeScript to ./dist
npm run build

# Start production server
npm start
```

The API runs on **http://localhost:3000** by default. Set `PORT` environment variable to override.

---

## Running Tests

```bash
# Run all tests with coverage report
npm test

# Watch mode during development
npm run test:watch
```

Coverage threshold: **80%** on branches, functions, lines, and statements.

---

## Regenerating Test Fixtures

```bash
python3 scripts/generate-fixtures.py
```

This creates three sample PDF forms in `test-fixtures/`:
- `housing-benefit-application.pdf` — 35 form fields
- `universal-credit-change.pdf` — 38 form fields  
- `business-registration.pdf` — 32 form fields

---

## API Reference

### Health Check

```
GET /api/health
```

**Response 200:**
```json
{
  "status": "ok",
  "service": "pdf-to-digital-form-builder",
  "timestamp": "2026-04-16T10:00:00.000Z",
  "version": "1.0.0"
}
```

---

### Upload a PDF Form

```
POST /api/forms/upload
Content-Type: multipart/form-data
```

**Field:** `file` — PDF file (≤ 20 MB)

**Example (curl):**
```bash
curl -X POST http://localhost:3000/api/forms/upload \
  -F "file=@test-fixtures/housing-benefit-application.pdf"
```

**Response 201:**
```json
{
  "formId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "extraction-complete",
  "draftSchemaId": "f9e8d7c6-b5a4-3210-fedc-ba9876543210"
}
```

**Error Responses:**

| Status | Code | Reason |
|--------|------|--------|
| 400 | `INVALID_FILE_TYPE` | Non-PDF file |
| 400 | `NO_FILE_UPLOADED` | No file in request |
| 413 | `FILE_TOO_LARGE` | File exceeds 20 MB |
| 422 | `EXTRACTION_FAILED` | PDF could not be parsed |

All errors follow GOV.UK Design System error shape:
```json
{
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "The selected file must be a PDF. Choose a file with a .pdf extension.",
    "errorSummary": [
      { "text": "The selected file must be a PDF.", "href": "#file-upload" }
    ]
  }
}
```

---

### Get Form Record

```
GET /api/forms/:formId
```

Returns the form record (without binary file data).

```bash
curl http://localhost:3000/api/forms/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

---

### Get Draft Schema

```
GET /api/forms/:formId/schema
```

Returns the extracted draft form schema.

```bash
curl http://localhost:3000/api/forms/a1b2c3d4-e5f6-7890-abcd-ef1234567890/schema
```

**Response 200:**
```json
{
  "formId": "a1b2c3d4-...",
  "title": "Housing Benefit Application Form",
  "version": 1,
  "status": "draft",
  "fields": [
    {
      "id": "field_abc12345",
      "label": "Full Name",
      "type": "text",
      "required": false,
      "order": 1,
      "a11yHints": {
        "ariaLive": "polite",
        "errorMessageId": "full-name-error"
      }
    },
    {
      "id": "field_def67890",
      "label": "Date of Birth",
      "type": "date",
      "required": false,
      "order": 2,
      "a11yHints": {
        "hint": "For example, 27 3 2007",
        "ariaLive": "polite",
        "errorMessageId": "date-of-birth-error"
      }
    }
  ],
  "createdAt": "2026-04-16T10:00:00.000Z",
  "updatedAt": "2026-04-16T10:00:00.000Z",
  "extractionMeta": {
    "sourceFileName": "housing-benefit-application.pdf",
    "extractedAt": "2026-04-16T10:00:00.000Z",
    "fieldCount": 18
  }
}
```

---

### Get Audit Log

```
GET /api/forms/:formId/audit
```

Returns the immutable audit trail for a form.

---

### List All Forms

```
GET /api/forms
```

---

## Form Schema Specification

All extracted schemas conform to the Form Schema JSON specification:

```typescript
{
  formId: string;           // UUID
  title: string;            // Derived from PDF metadata or first line
  version: number;          // Starts at 1, increments with each save
  status: 'draft' | 'review' | 'published';
  fields: FormField[];
  createdAt: string;        // ISO 8601
  updatedAt: string;        // ISO 8601
  extractionMeta?: {
    sourceFileName: string;
    extractedAt: string;
    fieldCount: number;
    accuracy?: number;
  };
}
```

### Field Schema

```typescript
{
  id: string;               // Unique UUID-based identifier
  label: string;            // Human-readable field label
  type: 'text' | 'textarea' | 'date' | 'number' | 'radio' | 'checkbox' | 'select';
  required: boolean;        // Inferred from "required" / "*" in label
  order: number;            // 1-based sequential position
  options?: string[];       // For radio, checkbox, select fields
  validation?: {            // Optional validation rules
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  condition?: {             // Conditional show/hide
    fieldId: string;
    operator: 'equals' | 'notEquals' | 'contains';
    value: string | number | boolean;
  };
  a11yHints?: {             // WCAG 2.2 AA accessibility guidance
    hint?: string;          // GOV.UK hint text for the renderer
    ariaLive?: 'polite' | 'assertive';
    errorMessageId?: string; // For aria-describedby association
  };
}
```

---

## Security

This service addresses OWASP Top 10:

| OWASP | Control |
|-------|---------|
| A01 Broken Access Control | Filename sanitisation, no path traversal; no authenticated routes yet (Sprint 02) |
| A02 Cryptographic Failures | No secrets stored; file buffers cleared from responses |
| A03 Injection | Server-side file type validation (MIME + extension); no SQL |
| A04 Insecure Design | Abstracted data layer; audit trail for all actions |
| A05 Security Misconfiguration | Helmet.js CSP headers; CORS configured |
| A06 Vulnerable Components | Dependencies pinned; no known CVEs at time of writing |
| A09 SLFI / Logging | Immutable in-memory audit log per form |

---

## Accessibility (WCAG 2.2 AA)

The API is designed to support accessible front-end rendering:

- **1.3.1 Info and Relationships**: All extracted fields include human-readable labels
- **4.1.3 Status Messages**: Extraction status communicated via API status field for ARIA live region rendering
- **3.3.1 / 3.3.2 Error Identification**: Error responses include field-level detail for inline error message rendering
- **GOV.UK Error Summary**: `errorSummary` array in error responses maps directly to `govuk-frontend` error-summary component
- **a11yHints**: Each field includes `hint` text and `errorMessageId` for `aria-describedby` association

---

## Project Structure

```
backend/
├── src/
│   ├── app.ts              # Express app factory
│   ├── index.ts            # HTTP server entry-point
│   ├── types/
│   │   └── schema.ts       # TypeScript type definitions
│   ├── store/
│   │   ├── repository.ts   # Generic in-memory repository (IRepository<T>)
│   │   └── stores.ts       # Singleton form, schema, and audit stores
│   ├── services/
│   │   └── extraction.ts   # PDF extraction engine
│   ├── routes/
│   │   ├── health.ts       # GET /api/health
│   │   └── forms.ts        # POST/GET /api/forms/*
│   ├── middleware/
│   │   ├── fileUpload.ts   # Multer config + validation
│   │   └── errorHandler.ts # Global error handler
│   ├── utils/
│   │   ├── sanitise.ts     # Filename sanitisation
│   │   └── errors.ts       # GOV.UK error helpers
│   └── __tests__/
│       ├── sanitise.test.ts
│       ├── errors.test.ts
│       ├── repository.test.ts
│       ├── extraction.test.ts
│       └── api.test.ts
├── test-fixtures/
│   ├── housing-benefit-application.pdf
│   ├── universal-credit-change.pdf
│   └── business-registration.pdf
├── scripts/
│   └── generate-fixtures.py
├── package.json
├── tsconfig.json
└── jest.config.json
```
