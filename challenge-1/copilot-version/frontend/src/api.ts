import type { FormField, FormListItem, FormRecord } from './types';

const BASE = '/api';

export async function listForms(): Promise<FormListItem[]> {
  const res = await fetch(`${BASE}/forms`);
  if (!res.ok) throw new Error(`Failed to load forms: ${res.status}`);
  const data = await res.json() as { forms: FormListItem[] };
  return data.forms;
}

export async function getForm(formId: string): Promise<FormRecord> {
  const res = await fetch(`${BASE}/forms/${formId}`);
  if (!res.ok) throw new Error(`Failed to load form ${formId}: ${res.status}`);
  return res.json() as Promise<FormRecord>;
}

export async function uploadPdf(file: File): Promise<{ formId: string; status: string; draftSchemaId: string }> {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch(`${BASE}/forms/upload`, { method: 'POST', body });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: 'Upload failed' } })) as { error: { message: string } };
    throw new Error(err.error?.message ?? 'Upload failed');
  }
  return res.json() as Promise<{ formId: string; status: string; draftSchemaId: string }>;
}

export async function saveFields(formId: string, fields: FormField[]): Promise<void> {
  const res = await fetch(`${BASE}/forms/${formId}/fields`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: 'Save failed' } })) as { error: { message: string } };
    throw new Error(err.error?.message ?? 'Save failed');
  }
}
