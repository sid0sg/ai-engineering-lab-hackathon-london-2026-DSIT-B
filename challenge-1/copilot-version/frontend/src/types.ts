export type FieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'number'
  | 'radio'
  | 'checkbox'
  | 'select';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  order: number;
  options?: string[];
}

export interface FormSchema {
  formId: string;
  title: string;
  version: number;
  status: string;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

export interface FormListItem {
  formId: string;
  title: string;
  status: string;
  createdAt: string;
}

export interface FormRecord {
  formId: string;
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  createdAt: string;
  status: string;
  draftSchemaId?: string;
  schema?: FormSchema;
}
