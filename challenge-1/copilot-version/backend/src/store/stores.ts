/**
 * Application-level stores: forms, schemas, published schema snapshots, and audit log.
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

// ── Published-schema store (immutable published snapshots) ─────────────────────
/**
 * Each publish creates a new snapshot entry here.
 * The key is the publishedSchemaId stored on the FormRecord.
 */
interface PublishedSchemaStore extends FormSchema {
  id: string;
  /** Back-reference so we can look up by formId if needed */
  publishedAt: string;
}

class PublishedSchemaRepository extends InMemoryRepository<PublishedSchemaStore> {
  async findLatestByFormId(formId: string): Promise<PublishedSchemaStore | null> {
    const all = await this.findAll();
    const forForm = all
      .filter((s) => s.formId === formId)
      .sort((a, b) => b.version - a.version);
    return forForm[0] ?? null;
  }
}

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
export const publishedSchemaStore = new PublishedSchemaRepository();
export const auditStore = new AuditRepository();
