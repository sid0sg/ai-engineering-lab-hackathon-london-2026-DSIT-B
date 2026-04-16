/**
 * Form Schema types – canonical definitions used across the application.
 * Conforms to the Form Schema JSON specification in the product spec.
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'number'
  | 'radio'
  | 'checkbox'
  | 'select';

export type FormStatus = 'draft' | 'review' | 'published';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
}

export interface ConditionRule {
  fieldId: string;
  operator: 'equals' | 'notEquals' | 'contains';
  value: string | number | boolean;
}

/** Accessibility hints for front-end renderers */
export interface A11yHints {
  /** Human-readable hint shown below the field */
  hint?: string;
  /** ARIA live region behaviour on state change */
  ariaLive?: 'polite' | 'assertive';
  /** Maps to govuk-frontend error-message id pattern */
  errorMessageId?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  order: number;
  options?: string[];
  validation?: ValidationRule;
  condition?: ConditionRule;
  /** GOV.UK / WCAG 2.2 AA accessibility hints for the renderer */
  a11yHints?: A11yHints;
}

export interface FormSchema {
  formId: string;
  title: string;
  version: number;
  status: FormStatus;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
  /** Extraction metadata */
  extractionMeta?: {
    sourceFileName: string;
    extractedAt: string;
    fieldCount: number;
    accuracy?: number;
  };
}

export interface FormRecord {
  formId: string;
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  fileBuffer?: Buffer;
  createdAt: string;
  status: 'pending' | 'extraction-complete' | 'extraction-failed';
  draftSchemaId?: string;
}

export interface AuditLogEntry {
  id: string;
  formId: string;
  action: string;
  timestamp: string;
  userId?: string;
  details?: Record<string, unknown>;
  error?: string;
}

/** GOV.UK Design System error response shape */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    /** Field-level errors for front-end inline error rendering (GOV.UK DS) */
    fieldErrors?: Array<{
      field: string;
      message: string;
      /** govuk-frontend error-message id for aria-describedby association */
      errorMessageId: string;
    }>;
    /** Maps to govuk-frontend error-summary items */
    errorSummary?: Array<{
      text: string;
      href: string;
    }>;
  };
}
