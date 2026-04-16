# 5-Sprint Build Orchestration - Execution Plan (Hackathon MVP)

**Start Date:** April 16, 2026  
**Project:** Government PDF-to-Digital Form Builder — Hackathon MVP  
**Target:** Demo-ready end-to-end flow in 5 sprints

## Orchestration Status

### Sprint Contracts Prepared ✅
- [x] Sprint 01: PDF Upload & Extraction
- [x] Sprint 02: Form Builder UI
- [x] Sprint 03: Save, Publish & Serve
- [x] Sprint 04: Dynamic Form Renderer
- [x] Sprint 05: E2E Integration & Demo Polish

### Scope Reduction Notes
- **F05 (Review & Publish Workflow):** Removed — "Publish" button in editor replaces enterprise approval flow
- **F08 (Auth/RBAC/Audit Trail):** Removed — Hardcoded mock user `demo-editor` for hackathon
- **F03 trimmed:** No drag-and-drop, no conditional logic, no advanced validation rules
- **F04 simplified:** No state machine, no rollback, no immutable versions
- **F06 simplified:** Single GET endpoint, no version pinning, no OpenAPI spec
- **F07 simplified:** Single-page form, no multi-page journey, no conditional logic, no server-side validation

### Execution Flow (Sequential)

1. **Sprint 01 Execution Phase**
   - Contract: `/sprints/sprint-01/contract.json`
   - Generator: Implement PDF upload, extraction engine, backend API
   - Expected output: Express API on :3000, POST /api/forms/upload working
   - Deliverable: `sprints/sprint-01/implementation-summary.json`

2. **Sprint 01 Evaluation Phase**
   - Evaluator: Run acceptance criteria against implementation
   - Check: File upload, extraction output, API response format
   - Output: `sprints/sprint-01/evaluation-01.json` (PASS/FAIL)

3. **Sprint 02–04 Repeat Pattern**
   - After Sprint N passes: Generator executes Sprint N+1
   - Evaluator validates Sprint N+1
   - Update `sprints/status.json` to reflect progress

4. **Sprint 05 Final Polish**
   - Wire full flow with 1 curated PDF
   - Fix styling issues
   - Ensure happy path works end-to-end
   - Basic accessibility check

## Key Assumptions

- Generator has access to all sprint contracts
- Hardcoded mock user — no authentication needed
- Demo flow uses 1 curated known-good PDF
- GOV.UK Design System compliance via govuk-frontend components
- Sprint numbering is monotonic (01–05) and never reset

## Success Criteria for Build System

✅ All 5 sprint contracts created with acceptance criteria  
✅ GOV.UK Design System compliance  
✅ Status.json initialized with all 5 sprints in 'pending' state  
✅ Orchestration structure ready for sequential execution  
✅ No blocker identified in sprint planning  

**Next Action:** Hand off to Generator for Sprint 01 execution
