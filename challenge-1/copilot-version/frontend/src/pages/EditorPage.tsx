import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import GovLayout from '../components/GovLayout';
import { getForm, saveFields, publishForm } from '../api';
import type { FieldType, FormField, FormRecord } from '../types';

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Text area' },
  { value: 'date', label: 'Date' },
  { value: 'number', label: 'Number' },
  { value: 'radio', label: 'Radio buttons' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'select', label: 'Select (dropdown)' },
];

interface FieldRowProps {
  field: FormField;
  index: number;
  onChange: (id: string, patch: Partial<FormField>) => void;
  onDelete: (id: string) => void;
  labelError?: string;
}

function FieldRow({ field, index, onChange, onDelete, labelError }: FieldRowProps): React.JSX.Element {
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const fieldNum = index + 1;
  const labelId = `field-label-${field.id}`;
  const typeId = `field-type-${field.id}`;
  const requiredId = `field-required-${field.id}`;

  function handleDelete(): void {
    if (window.confirm(`Remove field "${field.label || `Field ${fieldNum}`}"?`)) {
      onDelete(field.id);
    }
  }

  return (
    <div
      className="govuk-summary-card"
      style={{ marginBottom: '1rem' }}
      aria-label={`Field ${fieldNum}: ${field.label || 'Untitled field'}`}
    >
      <div className="govuk-summary-card__title-wrapper">
        <h3 className="govuk-summary-card__title">Field {fieldNum}</h3>
        <ul className="govuk-summary-card__actions">
          <li className="govuk-summary-card__action">
            <button
              type="button"
              className="govuk-button govuk-button--warning govuk-!-margin-bottom-0"
              ref={deleteButtonRef}
              onClick={handleDelete}
              aria-label={`Remove field ${fieldNum}`}
            >
              Remove
            </button>
          </li>
        </ul>
      </div>
      <div className="govuk-summary-card__content">
        <div className={`govuk-form-group${labelError ? ' govuk-form-group--error' : ''}`}>
          <label className="govuk-label" htmlFor={labelId}>
            Label
          </label>
          {labelError && (
            <p className="govuk-error-message" id={`${labelId}-error`}>
              <span className="govuk-visually-hidden">Error:</span> {labelError}
            </p>
          )}
          <input
            className={`govuk-input${labelError ? ' govuk-input--error' : ''}`}
            id={labelId}
            name={labelId}
            type="text"
            value={field.label}
            aria-describedby={labelError ? `${labelId}-error` : undefined}
            onChange={(e) => onChange(field.id, { label: e.target.value })}
          />
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor={typeId}>
            Field type
          </label>
          <select
            className="govuk-select"
            id={typeId}
            name={typeId}
            value={field.type}
            onChange={(e) => onChange(field.id, { type: e.target.value as FieldType })}
          >
            {FIELD_TYPES.map((ft) => (
              <option key={ft.value} value={ft.value}>
                {ft.label}
              </option>
            ))}
          </select>
        </div>

        <div className="govuk-form-group">
          <fieldset className="govuk-fieldset">
            <legend className="govuk-fieldset__legend">Required</legend>
            <div className="govuk-checkboxes govuk-checkboxes--small">
              <div className="govuk-checkboxes__item">
                <input
                  className="govuk-checkboxes__input"
                  id={requiredId}
                  name={requiredId}
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => onChange(field.id, { required: e.target.checked })}
                />
                <label className="govuk-label govuk-checkboxes__label" htmlFor={requiredId}>
                  This field is required
                </label>
              </div>
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
}

export default function EditorPage(): React.JSX.Element {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();

  const [formRecord, setFormRecord] = useState<FormRecord | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishedVersion, setPublishedVersion] = useState<number | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const addButtonRef = useRef<HTMLButtonElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!formId) return;
    document.title = 'Edit Form – GOV.UK Form Builder';
    getForm(formId)
      .then((record) => {
        setFormRecord(record);
        if (record.schema?.fields) {
          setFields([...record.schema.fields].sort((a, b) => a.order - b.order));
        }
      })
      .catch((err: unknown) => setLoadError((err as Error).message))
      .finally(() => setLoading(false));
  }, [formId]);

  const handleFieldChange = useCallback((id: string, patch: Partial<FormField>): void => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    // Clear label error on edit
    if ('label' in patch) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
    setSaveSuccess(false);
  }, []);

  const handleDelete = useCallback((id: string): void => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setSaveSuccess(false);
    // Return focus to add button after deletion
    setTimeout(() => addButtonRef.current?.focus(), 50);
  }, []);

  function handleAddField(): void {
    const newField: FormField = {
      id: uuidv4(),
      label: '',
      type: 'text',
      required: false,
      order: fields.length,
    };
    setFields((prev) => [...prev, newField]);
    setSaveSuccess(false);
    // Focus the new field's label input after render
    setTimeout(() => {
      const inputs = document.querySelectorAll<HTMLInputElement>(`[id^="field-label-"]`);
      const last = inputs[inputs.length - 1];
      last?.focus();
    }, 50);
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    fields.forEach((f) => {
      if (!f.label.trim()) {
        errors[f.id] = 'Enter a label for this field';
      }
    });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setTimeout(() => errorSummaryRef.current?.focus(), 50);
      return false;
    }
    return true;
  }

  async function handleSave(): Promise<void> {
    setSaveSuccess(false);
    setSaveError(null);
    setPublishSuccess(false);
    if (!validate()) return;
    if (!formId) return;
    setSaving(true);
    try {
      const ordered = fields.map((f, i) => ({ ...f, order: i }));
      await saveFields(formId, ordered);
      setSaveSuccess(true);
    } catch (err: unknown) {
      setSaveError((err as Error).message);
      setTimeout(() => errorSummaryRef.current?.focus(), 50);
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(): Promise<void> {
    setPublishSuccess(false);
    setPublishError(null);
    setSaveSuccess(false);
    if (!validate()) return;
    if (!formId) return;
    setPublishing(true);
    try {
      // Save the latest fields first, then publish
      const ordered = fields.map((f, i) => ({ ...f, order: i }));
      await saveFields(formId, ordered);
      const result = await publishForm(formId);
      setPublishedVersion(result.version);
      setPublishSuccess(true);
      // Refresh form record to show updated status
      const updated = await getForm(formId);
      setFormRecord(updated);
    } catch (err: unknown) {
      setPublishError((err as Error).message);
      setTimeout(() => errorSummaryRef.current?.focus(), 50);
    } finally {
      setPublishing(false);
    }
  }

  if (loading) {
    return (
      <GovLayout backHref="/" backLabel="Back to dashboard">
        <p className="govuk-body" aria-live="polite" aria-busy="true">
          Loading form…
        </p>
      </GovLayout>
    );
  }

  if (loadError || !formRecord) {
    return (
      <GovLayout backHref="/" backLabel="Back to dashboard">
        <div
          className="govuk-error-summary"
          data-module="govuk-error-summary"
          role="alert"
          aria-labelledby="load-error-title"
        >
          <h2 className="govuk-error-summary__title" id="load-error-title">
            There is a problem
          </h2>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">{loadError ?? 'Form not found'}</p>
          </div>
        </div>
      </GovLayout>
    );
  }

  const title = formRecord.schema?.title ?? formRecord.originalFileName;
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  return (
    <GovLayout backHref="/" backLabel="Back to dashboard">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">Edit form: {title}</h1>

          <dl className="govuk-summary-list govuk-summary-list--no-border" style={{ marginBottom: '2rem' }}>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Status</dt>
              <dd className="govuk-summary-list__value">{formRecord.status}</dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Fields extracted</dt>
              <dd className="govuk-summary-list__value">{fields.length}</dd>
            </div>
          </dl>

          {/* Error summary */}
          {(hasFieldErrors || saveError || publishError) && (
            <div
              className="govuk-error-summary"
              data-module="govuk-error-summary"
              role="alert"
              aria-labelledby="error-summary-title"
              tabIndex={-1}
              ref={errorSummaryRef}
            >
              <h2 className="govuk-error-summary__title" id="error-summary-title">
                There is a problem
              </h2>
              <div className="govuk-error-summary__body">
                <ul className="govuk-list govuk-error-summary__list">
                  {saveError && (
                    <li>
                      <a href="#save-button">{saveError}</a>
                    </li>
                  )}
                  {publishError && (
                    <li>
                      <a href="#publish-button">{publishError}</a>
                    </li>
                  )}
                  {Object.entries(fieldErrors).map(([id, msg]) => (
                    <li key={id}>
                      <a href={`#field-label-${id}`}>{msg}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Save success notification */}
          {saveSuccess && (
            <div
              className="govuk-notification-banner govuk-notification-banner--success"
              role="alert"
              aria-labelledby="govuk-notification-banner-title"
              data-module="govuk-notification-banner"
            >
              <div className="govuk-notification-banner__header">
                <h2
                  className="govuk-notification-banner__title"
                  id="govuk-notification-banner-title"
                >
                  Success
                </h2>
              </div>
              <div className="govuk-notification-banner__content">
                <p className="govuk-body">Form fields saved successfully.</p>
              </div>
            </div>
          )}

          {/* Publish success notification */}
          {publishSuccess && (
            <div
              className="govuk-notification-banner govuk-notification-banner--success"
              role="alert"
              aria-labelledby="govuk-publish-banner-title"
              data-module="govuk-notification-banner"
            >
              <div className="govuk-notification-banner__header">
                <h2
                  className="govuk-notification-banner__title"
                  id="govuk-publish-banner-title"
                >
                  Success
                </h2>
              </div>
              <div className="govuk-notification-banner__content">
                <h3 className="govuk-notification-banner__heading">
                  Form published successfully
                </h3>
                <p className="govuk-body">
                  Version {publishedVersion} of this form is now live.
                  External services can access it via the published schema endpoint.
                </p>
              </div>
            </div>
          )}

          {/* Field list */}
          {fields.length === 0 ? (
            <p className="govuk-body">No fields yet. Use the button below to add one.</p>
          ) : (
            <div aria-label="Form fields" role="list">
              {fields.map((field, index) => (
                <div role="listitem" key={field.id}>
                  <FieldRow
                    field={field}
                    index={index}
                    onChange={handleFieldChange}
                    onDelete={handleDelete}
                    labelError={fieldErrors[field.id]}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Add field button */}
          <button
            type="button"
            className="govuk-button govuk-button--secondary"
            data-module="govuk-button"
            ref={addButtonRef}
            onClick={handleAddField}
          >
            Add field
          </button>

          {/* Save and Publish buttons */}
          <div style={{ marginTop: '1.5rem' }}>
            <button
              id="save-button"
              type="button"
              className="govuk-button"
              data-module="govuk-button"
              disabled={saving || publishing}
              aria-disabled={saving || publishing}
              onClick={() => { void handleSave(); }}
            >
              {saving ? 'Saving…' : 'Save fields'}
            </button>

            <button
              id="publish-button"
              type="button"
              className="govuk-button govuk-button--secondary"
              data-module="govuk-button"
              style={{ marginLeft: '1rem' }}
              disabled={saving || publishing}
              aria-disabled={saving || publishing}
              onClick={() => { void handlePublish(); }}
            >
              {publishing ? 'Publishing…' : 'Publish form'}
            </button>

            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              style={{ marginLeft: '1rem' }}
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </GovLayout>
  );
}
