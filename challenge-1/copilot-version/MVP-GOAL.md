# MVP Goal: Government PDF-to-Digital Form Builder

## Goal
Build a reusable builder platform that accepts government PDF forms and produces a versioned, structured form definition that other applications can render dynamically for end users.

This MVP is designed for multiple departments, multiple form types, and continuous form maintenance by back-office teams without requiring code changes for every update.

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

## MVP Outcomes
1. A department can upload a PDF form to the builder.
2. The system extracts a draft field structure.
3. An internal form editor can review and correct the draft.
4. The form can be published as a versioned schema.
5. A consuming app can fetch the schema and render the journey dynamically.
6. Back-office teams can create updates and publish new versions safely.

## In Scope for MVP
- Input: digitally generated PDF forms (OCR fallback allowed, but limited)
- Field types: text, textarea, date, number, radio, checkbox, select
- Validation: required, min/max, pattern, date and number constraints
- Basic conditional logic: show/hide based on one previous answer
- Versioning: draft, review, published, rollback to prior version
- Runtime API: fetch active form schema and specific versions
- Governance: role-based access and audit trail for edits/publications

## Out of Scope for MVP
- Fully automated publish without human review
- Complex advanced branching and repeated dynamic sections
- Full multilingual authoring workflow
- Deep bespoke integration with every legacy casework platform

## Core Users
- Applicant: completes a dynamic digital form journey
- Form editor/policy owner: updates form content and rules
- Reviewer/publisher: quality checks and publishes new versions
- Consuming application team: renders form from schema
- Casework operations team: receives structured submission data

## High-Level Architecture
1. Ingestion service: receives uploaded PDF and stores source
2. Extraction engine: detects fields and creates draft form structure
3. Builder UI: allows humans to confirm labels, types, validation, logic
4. Schema registry: stores canonical definitions and versions
5. Publish pipeline: validates and publishes immutable versions
6. Runtime API: serves active or pinned schema versions

## Definition of Done for MVP
- At least 3 distinct PDF forms converted and published
- Each converted form is rendered end-to-end by a consuming app
- Back-office user can update an existing form and publish a new version
- Audit history shows who changed what and when
- Basic accessibility checks are embedded in form schema guidance

## Suggested Success Metrics
- Time to convert one PDF to first live schema: less than 2 hours
- Auto-extraction accuracy before manual edits: 70% or higher on supported forms
- Percentage of routine form updates done without developer support: 60% or higher
- Reduction in incomplete submissions versus PDF baseline

## Why This MVP Matters
A single platform approach enables departments to standardize form modernization, reduce duplicated delivery effort, and improve citizen experience while maintaining governance and policy control.