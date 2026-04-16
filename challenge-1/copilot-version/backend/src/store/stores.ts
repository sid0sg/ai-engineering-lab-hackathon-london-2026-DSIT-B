/**
 * Application-level stores: forms, schemas, and audit log.
 * Singleton instances used throughout the Express application.
 */

import { InMemoryRepository } from './repository';
import type { FormRecord, FormSchema, AuditLogEntry } from '../types/schema';

// ── Form-record store (uploaded PDFs + status) ────────────────────────────────
interface FormRecordStore extends FormRecord {
  id: string;
}

class FormRepository extends InMemoryRepository<FormRecordStore> {}

// ── Form-schema store (extracted / edited schemas) ─────────────────────────────
interface FormSchemaStore extends FormSchema {
  id: string;
}

class SchemaRepository extends InMemoryRepository<FormSchemaStore> {}

// ── Audit log store ────────────────────────────────────────────────────────────
interface AuditEntry extends AuditLogEntry {
  id: string;
}

class AuditRepository extends InMemoryRepository<AuditEntry> {
  /** Query entries for a specific formId */
  async findByFormId(formId: string): Promise<AuditEntry[]> {
    const all = await this.findAll();
    return all.filter((e) => e.formId === formId);
  }
}

// Singletons ──────────────────────────────────────────────────────────────────
export const formStore = new FormRepository();
export const schemaStore = new SchemaRepository();
export const auditStore = new AuditRepository();
