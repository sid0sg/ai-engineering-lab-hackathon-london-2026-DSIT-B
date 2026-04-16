# Government PDF-to-Digital Form Builder – 5-Sprint Build Orchestration (Hackathon MVP)

## Executive Summary

**Build Status:** ✅ **Orchestration Complete & Ready for Execution**  
**Planning Date:** April 16, 2026  
**Target Delivery:** 5 Sprints (Hackathon day)  
**Scope:** Demo-ready end-to-end flow — Upload PDF → Extract → Edit → Publish → Render

### What's Ready

✅ Product specification reduced for hackathon scope (`specs/product-spec.json`)  
✅ All 5 sprint contracts prepared with acceptance criteria  
✅ Orchestration framework established (`sprints/status.json`)  
✅ Architecture decisions documented (React + TypeScript + Vite frontend, Express backend, GOV.UK Frontend styling)  
✅ Features F05 (Review Workflow) and F08 (Auth/RBAC/Audit) removed  
✅ Remaining features trimmed to demo essentials

---

## Sprint Breakdown

| Sprint | Feature(s) | Title | Estimated Output |
|--------|-----------|-------|------------------|
| **01** | F01, F02 | PDF Upload & Extraction | Express API, PDF upload endpoint, draft schema extraction |
| **02** | F03 | Form Builder UI | React field editor: edit label/type/required, add/remove fields |
| **03** | F04, F06 | Save, Publish & Serve | Schema persistence, publish button, GET API endpoint |
| **04** | F07 | Dynamic Form Renderer | Single-page GOV.UK form from schema, client-side validation |
| **05** | All | E2E Integration & Demo Polish | Wire full flow, fix styling, ensure happy path works |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  Government PDF-to-Digital Form Builder (Hackathon) │
└─────────────────────────────────────────────────────┘

┌─────────────────┐         ┌──────────────────┐
│    Backend      │         │  Frontend        │
│  (Express)      │◄────────│  (React/Vite)    │
│  :3000          │         │   :5173          │
│                 │         │                  │
│ • PDF Upload    │         │ • Upload Page    │
│ • Extraction    │         │ • Field Editor   │
│ • Schema Store  │         │ • Publish Button │
│ • Schema API    │         │ • Form Renderer  │
└─────────────────┘         └──────────────────┘
        │                            │
        └────────────────────────────┘
                    │
             ┌──────▼──────┐
             │  Data Layer │
             │ (In-memory) │
             │             │
             │ • Forms     │
             │ • Versions  │
             └─────────────┘
```

**Note:** No auth layer, no audit log, no separate renderer app. Mock user `demo-editor` hardcoded.

---

## Sprint Details

### Sprint 01 – PDF Upload & Extraction

**Contract:** [`sprints/sprint-01/contract.json`](sprints/sprint-01/contract.json)

**Deliverables:**
- Express API running on port 3000
- POST `/api/forms/upload` accepting PDF files
- Automated field extraction producing draft schema JSON
- In-memory data store with form and schema tables
- Unit tests for upload and extraction
- README with local setup instructions

---

### Sprint 02 – Form Builder UI

**Contract:** [`sprints/sprint-02/contract.json`](sprints/sprint-02/contract.json)

**Deliverables:**
- React + Vite frontend under /frontend
- Form dashboard listing all uploaded forms
- Field editor: edit label, type, required flag
- Add/remove field buttons
- All using govuk-frontend components
- Save edits back to API

---

### Sprint 03 – Save, Publish & Serve

**Contract:** [`sprints/sprint-03/contract.json`](sprints/sprint-03/contract.json)

**Deliverables:**
- Schema persistence with version numbering
- "Publish" button that marks schema as active
- GET `/api/forms/:formId/schema` returns published schema
- Backend tests for save/publish/serve flow

---

### Sprint 04 – Dynamic Form Renderer

**Contract:** [`sprints/sprint-04/contract.json`](sprints/sprint-04/contract.json)

**Deliverables:**
- Route/page that fetches published schema
- Renders single-page GOV.UK form with correct field components
- Client-side required validation with GOV.UK error summary
- Submit shows confirmation panel with reference number

---

### Sprint 05 – E2E Integration & Demo Polish

**Contract:** [`sprints/sprint-05/contract.json`](sprints/sprint-05/contract.json)

**Deliverables:**
- Full flow working with 1 curated PDF
- Styling fixes and visual polish
- Happy path tested end-to-end
- Basic accessibility: labels, keyboard nav, focus management

---

## Execution Flow

1. **Generator** reads `sprints/sprint-01/contract.json` and implements
2. **Evaluator** validates against acceptance criteria → PASS/FAIL
3. **Repeat** for Sprints 02–05 sequentially
4. **Sprint 05** is the demo-readiness sprint

---

## Repository Structure

```
challenge-1/copilot-version/
├── specs/
│   ├── product-spec.json
│   └── product-spec.md
├── sprints/
│   ├── status.json
│   ├── sprint-01/contract.json
│   ├── sprint-02/contract.json
│   ├── sprint-03/contract.json
│   ├── sprint-04/contract.json
│   └── sprint-05/contract.json
├── BUILD-ORCHESTRATION.md
├── ORCHESTRATION-STATUS.md
├── MVP-GOAL.md
├── backend/
│   ├── src/
│   └── test-fixtures/
└── frontend/
    └── src/
```

---

## GOV.UK Design System Compliance

All UI components from `govuk-frontend` npm package:
- File upload, Text input, Textarea, Date input
- Radio buttons, Checkboxes, Select dropdowns
- Tables, Summary lists, Buttons, Back links
- Error summary, Notification banners, Panel (confirmation)
- Phase banner (Beta)

**No custom CSS frameworks.** All styling from GOV.UK Frontend.

---

**Build Orchestration Ready for Execution** ✅  
Generated: April 16, 2026  
Planner: GitHub Copilot
