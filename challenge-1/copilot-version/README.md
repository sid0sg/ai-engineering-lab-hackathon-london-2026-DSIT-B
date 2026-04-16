# GOV.UK Form Builder — Challenge 1

A full-stack application that converts PDF government forms into accessible digital services, following the GOV.UK Design System.

## Prerequisites

- Node.js 18+
- npm 9+

## Installation

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## Running the Application

### Start the backend (port 3000)

```bash
cd backend
npm run dev
```

### Start the frontend (port 5173)

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Demo Walkthrough

The full demo script takes approximately 3–5 minutes.

### Step 1 — Upload a PDF

1. Click **"Upload a new PDF form"** on the Dashboard.
2. Choose one of the sample PDFs from `backend/test-fixtures/`:
   - `business-registration.pdf`
   - `housing-benefit-application.pdf`
   - `universal-credit-change.pdf`
3. Click **"Upload and extract fields"**.
4. You will be redirected to the Form Editor.

### Step 2 — Edit the extracted form

1. The editor shows all fields extracted from the PDF.
2. Edit a field label (e.g. change "Full name" to "Full legal name").
3. Change a field type using the dropdown (e.g. change `text` to `textarea`).
4. Click **"Save changes"** — a green success banner confirms the save.

### Step 3 — Publish the form

1. Click **"Publish form"** in the editor.
2. A green notification banner confirms the form has been published.
3. Navigate back to the Dashboard — the form now shows a **"Published"** blue tag.

### Step 4 — Fill in the digital form (citizen view)

1. Click **"View published form"** on the Dashboard row (or **"Preview"** in the editor).
2. The renderer shows a fully accessible GOV.UK form.
3. Try submitting without filling in required fields — a GOV.UK error summary appears.
4. Fill in all required fields and click **"Submit"**.
5. A GOV.UK confirmation panel appears with a reference number.

## Running Tests

```bash
cd backend
npm test
```

## Project Structure

```
challenge-1/copilot-version/
├── backend/
│   ├── src/
│   │   ├── routes/        # Express route handlers
│   │   ├── store/         # In-memory data stores
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Shared utilities
│   └── test-fixtures/     # Sample PDFs for demo
├── frontend/
│   └── src/
│       ├── components/    # Shared GOV.UK layout components
│       ├── pages/         # React page components
│       ├── api.ts         # Backend API client
│       └── types.ts       # Shared TypeScript types
└── sprints/               # Sprint contracts and evaluations
```

## Known Limitations

- **In-memory storage only** — all data is lost when the backend restarts. A production version would use a database.
- **PDF extraction is heuristic** — complex multi-column PDFs or scanned images may not extract perfectly.
- **No authentication** — the form builder has no login. A production version would require GOV.UK Sign In.
- **Single-page forms only** — the renderer shows all fields on one page. A production version would implement a "one question per page" GOV.UK pattern.
- **Mock submission** — form submissions are stored in memory and not forwarded to any case management system.
