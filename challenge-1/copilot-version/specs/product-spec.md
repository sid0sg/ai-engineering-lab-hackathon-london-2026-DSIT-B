# Product Specification: Government PDF-to-Digital Form Builder (Hackathon MVP)

> GOV.UK Design System compliant · WCAG 2.2 AA · React + TypeScript + Vite (frontend) · Node.js + TypeScript + Express (backend) · In-memory DB (data layer)

---

## Product Overview

| Field | Value |
|---|---|
| **Product name** | Government PDF-to-Digital Form Builder |
| **GOV.UK compliant** | Yes |
| **WCAG 2.2 target** | AA (baseline via govuk-frontend components) |
| **Scope** | Hackathon MVP — 5 sprints, demo-ready end-to-end flow |

### Elevator pitch
A reusable platform that ingests government PDF forms, extracts a draft field structure, allows back-office editors to review and correct it, and publishes a schema definition that a consuming application renders as an accessible digital form journey.

### Target users
| Role | Description |
|---|---|
| **Applicant** | Citizen completing a digital form journey rendered by the reference app |
| **Form editor** | Reviews extracted draft, edits field labels, types, and required flags |

> **Scope note:** Reviewer/publisher, consuming application team, and casework ops roles are deferred to post-hackathon. A hardcoded mock user (`demo-editor`) is used in the MVP.

---

## Core Features (Reduced Scope)

### F01 · PDF Upload & Ingestion
Back-office users upload a PDF form. The ingestion service stores the file and triggers extraction.

**Acceptance criteria**
- User can upload a PDF via a GOV.UK-styled file-upload component
- Uploaded file is stored and associated with a unique form ID and timestamp
- Unsupported file types produce a clear, inline error message
- Upload page uses `govuk-frontend` components for baseline WCAG compliance

**Accessibility requirements**
- File upload uses `govuk-frontend` file-upload component with correct label association
- Error messages use `govuk-frontend` error-summary and inline error patterns

---

### F02 · Automated Field Extraction
After upload, the extraction engine analyses the PDF and produces a draft form schema containing detected field labels and inferred types.

**Acceptance criteria**
- Extraction runs automatically after successful upload
- Draft schema is produced containing: `id`, `label`, `type`, `required`, `order` per field
- Supported field types: text, textarea, date, number, radio, checkbox, select
- Extraction works reliably on at least 1 curated digitally generated test PDF

**Accessibility requirements**
- Status feedback uses `govuk-frontend` notification banner pattern

> **Cut from original:** 70% accuracy SLA, 60-second SLA, auditable error records, failure notification UX. Demo uses a known-good PDF.

---

### F03 · Form Builder UI – Field Editor (Trimmed)
An editor can view the extracted draft, correct field labels and types, toggle required, and add/remove fields.

**Acceptance criteria**
- Editor can rename field labels and change field types (all 7 types selectable)
- Editor can toggle the `required` flag per field
- Editor can add new fields and delete existing fields
- All form controls use `govuk-frontend` components with associated labels
- Editor UI is keyboard-operable

**Accessibility requirements**
- All inputs have visible, programmatically associated labels (WCAG 1.3.1)
- Focus management maintained when adding/removing fields

> **Cut from original:** Drag-and-drop reorder, conditional show/hide logic authoring, validation rule config (regex, min/max), unsaved-changes warning.

---

### F04 · Schema Save & Publish (Simplified)
The editor can save the current schema and publish it, making it available to the renderer via the API.

**Acceptance criteria**
- Save persists the schema to the in-memory store with a version number
- "Publish" button marks the schema as `published` and sets it as the active version
- Version number increments on each save
- Schema is stored as canonical JSON conforming to the Form Schema specification

> **Cut from original:** Full state machine (draft→review→published), rollback, immutable versions, version list UI. Simplified to: save = draft, publish = active.

---

### F06 · Runtime API – Schema Serving (Simplified)
A single REST endpoint serves the active published schema for a form.

**Acceptance criteria**
- `GET /api/forms/:formId/schema` returns the active published schema as JSON
- 404 returned for unknown `formId`
- Response includes metadata: `formId`, `version`, `publishedAt`

> **Cut from original:** Version pinning query param, OpenAPI 3.0 spec, caching, <300ms SLA, a11yHints field.

---

### F07 · Dynamic Form Renderer (Simplified)
A reference page fetches a published form schema and renders a single-page GOV.UK-styled form with client-side required validation.

**Acceptance criteria**
- Renderer fetches schema from Runtime API on load
- Renders correct `govuk-frontend` field components for each field type
- Client-side required validation shows GOV.UK error summary on submit
- Submission produces a structured JSON payload
- Completion page uses GOV.UK panel component with reference number
- Full keyboard journey from start to submission works without mouse

**Accessibility requirements**
- All field components use `govuk-frontend`: input, textarea, radios, checkboxes, date-input, select
- Error summary links focus to the relevant field on activation (WCAG 2.4.3)

> **Cut from original:** Multi-page form journey, conditional logic evaluation, server-side validation, NVDA/VoiceOver testing.

---

### Features Removed for Hackathon MVP

| Feature | Reason |
|---|---|
| **F05 · Review & Publish Workflow** | Enterprise approval workflow — zero demo value. "Publish" button in editor replaces it. |
| **F08 · Role-Based Access Control & Audit Trail** | Auth, RBAC, audit log are enterprise concerns. Hardcoded mock user for hackathon. |

---

## UI Direction

- **Design System**: [GOV.UK Design System](https://design-system.service.gov.uk) — exclusive; no custom CSS frameworks
- **Frontend Kit**: [govuk-frontend npm](https://www.npmjs.com/package/govuk-frontend)
- **WCAG Reference**: [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)

**GOV.UK Design System patterns used across the product:**
File upload · Error summary · Summary list · Tables · Notification banner · Panel (confirmation) · Radios and checkboxes · Date input · Tags (status) · Back link · Phase banner (Beta)

**Key WCAG 2.2 AA criteria (baseline via govuk-frontend):**
1.3.1 · 1.4.3 · 2.1.1 · 2.4.2 · 2.4.3 · 2.4.6 · 3.3.1 · 3.3.2 · 4.1.2

---

## Sprint Breakdown

| Sprint | Features | Title |
|---|---|---|
| 01 | F01, F02 | PDF Upload & Extraction |
| 02 | F03 | Form Builder UI |
| 03 | F04, F06 | Save, Publish & Serve |
| 04 | F07 | Dynamic Form Renderer |
| 05 | All | E2E Integration & Demo Polish |

---

## Definition of Done (Hackathon MVP)

- At least 1 curated PDF form converted and published end-to-end
- Form rendered by the reference application with correct GOV.UK styling
- Editor can update field labels/types and re-publish
- Basic accessibility: correct labels, keyboard navigation, focus management
- Demo-ready happy path from upload to form submission

## Success Metrics

| Metric | Target |
|---|---|
| Time: PDF → first live schema | < 30 minutes |
| Demo flow works end-to-end | Yes |
| GOV.UK Design System compliance | Visual match |
| Keyboard-navigable | Full happy path |
