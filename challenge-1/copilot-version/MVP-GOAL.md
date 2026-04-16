# MVP Goal: Government PDF-to-Digital Form Builder (Hackathon MVP)

## Goal
Build a demo-ready platform that accepts a government PDF form and produces a published form schema that a reference application renders as an accessible GOV.UK digital form journey.

This hackathon MVP proves the core pipeline: Upload PDF → Extract fields → Edit fields → Publish schema → Render form.

## Problem We Are Solving
Government services still rely on printable PDF forms that are hard to complete, inaccessible for many users, and expensive to process manually.

The MVP should move teams from:
- download and print PDFs
- manual completion and scanning
- manual data entry by caseworkers

to:
- digital form journeys
- structured data capture
- faster updates through a controlled builder workflow

## MVP Outcomes (Hackathon Scope)
1. Upload a PDF form to the builder.
2. The system extracts a draft field structure.
3. An editor can correct field labels, types, and required flags.
4. The editor can publish the schema.
5. A reference app fetches the schema and renders a GOV.UK form.
6. The citizen can fill in and submit the form.

## In Scope for Hackathon MVP
- Input: 1 curated digitally generated PDF form (known-good)
- Field types: text, textarea, date, number, radio, checkbox, select
- Field editing: rename label, change type, toggle required, add/remove fields
- Save & Publish: save schema, publish with one click
- Runtime API: single GET endpoint to serve active published schema
- Renderer: single-page GOV.UK form with client-side required validation
- GOV.UK Design System: all UI components from govuk-frontend

## Out of Scope for Hackathon MVP (Deferred)
- Authentication, RBAC, and audit trail (hardcoded mock user)
- Review & approval workflow (publish button replaces it)
- Drag-and-drop field reorder
- Conditional show/hide logic (authoring and rendering)
- Validation rule config (regex, min/max, date/number ranges)
- Multi-page form journey
- Server-side validation in renderer
- Version pinning, rollback, immutable versions
- OpenAPI documentation
- Unsaved changes warning
- Multiple PDF forms end-to-end
- Comprehensive WCAG audit (baseline via govuk-frontend components)

## Core Users (Hackathon)
- Applicant: completes a dynamic digital form journey
- Form editor: edits field labels, types, and required flags

## High-Level Architecture
1. Backend (Express): PDF upload, extraction, schema store, publish, serve API
2. Frontend (React/Vite): Builder UI for editing extracted fields and publishing
3. Renderer (React/Vite or same frontend): Fetches schema and renders GOV.UK form

## Definition of Done for Hackathon MVP
- 1 curated PDF form uploaded, extracted, edited, published, and rendered end-to-end
- GOV.UK Design System styling throughout
- Editor can update field labels/types and re-publish
- Basic accessibility: correct labels, keyboard navigation, focus management
- Demo-ready happy path from upload to form submission

## Demo Script (What Judges See)
1. Open Builder UI → Upload a PDF form
2. See extracted fields appear automatically
3. Edit a field label, change a type, mark one as required
4. Click "Publish"
5. Open Renderer → See a live GOV.UK form built from that schema
6. Fill it in, submit, see confirmation

## Why This MVP Matters
A single platform approach enables departments to standardize form modernization, reduce duplicated delivery effort, and improve citizen experience while maintaining governance and policy control.