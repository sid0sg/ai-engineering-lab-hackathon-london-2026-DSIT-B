import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import GovLayout from '../components/GovLayout';
import { getFormSchema, submitForm } from '../api';
import type { FormField, FormSchema } from '../types';

// ── Types ──────────────────────────────────────────────────────────────────────

type DateValue = { day: string; month: string; year: string };
type FieldValue = string | string[] | DateValue;

function isDateValue(v: FieldValue): v is DateValue {
  return typeof v === 'object' && !Array.isArray(v);
}

// ── Field component helpers ────────────────────────────────────────────────────

interface FieldProps {
  field: FormField;
  value: FieldValue;
  error?: string;
  onChange: (id: string, value: FieldValue) => void;
}

function TextInput({ field, value, error, onChange }: FieldProps): React.JSX.Element {
  const fieldId = `field-${field.id}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy = [field.required ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
      <label className="govuk-label" htmlFor={fieldId}>
        {field.label}
        {field.required && (
          <span className="govuk-hint govuk-!-margin-top-1" id={hintId}>
            (required)
          </span>
        )}
      </label>
      {error && (
        <p className="govuk-error-message" id={errorId}>
          <span className="govuk-visually-hidden">Error:</span> {error}
        </p>
      )}
      <input
        className={`govuk-input${error ? ' govuk-input--error' : ''}`}
        id={fieldId}
        name={fieldId}
        type="text"
        value={typeof value === 'string' ? value : ''}
        aria-describedby={describedBy}
        onChange={(e) => onChange(field.id, e.target.value)}
        autoComplete="off"
      />
    </div>
  );
}

function NumberInput({ field, value, error, onChange }: FieldProps): React.JSX.Element {
  const fieldId = `field-${field.id}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy = [field.required ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
      <label className="govuk-label" htmlFor={fieldId}>
        {field.label}
        {field.required && (
          <span className="govuk-hint govuk-!-margin-top-1" id={hintId}>
            (required)
          </span>
        )}
      </label>
      {error && (
        <p className="govuk-error-message" id={errorId}>
          <span className="govuk-visually-hidden">Error:</span> {error}
        </p>
      )}
      <input
        className={`govuk-input govuk-input--width-10${error ? ' govuk-input--error' : ''}`}
        id={fieldId}
        name={fieldId}
        type="text"
        inputMode="numeric"
        value={typeof value === 'string' ? value : ''}
        aria-describedby={describedBy}
        onChange={(e) => onChange(field.id, e.target.value)}
        autoComplete="off"
      />
    </div>
  );
}

function TextareaInput({ field, value, error, onChange }: FieldProps): React.JSX.Element {
  const fieldId = `field-${field.id}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy = [field.required ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
      <label className="govuk-label" htmlFor={fieldId}>
        {field.label}
        {field.required && (
          <span className="govuk-hint govuk-!-margin-top-1" id={hintId}>
            (required)
          </span>
        )}
      </label>
      {error && (
        <p className="govuk-error-message" id={errorId}>
          <span className="govuk-visually-hidden">Error:</span> {error}
        </p>
      )}
      <textarea
        className={`govuk-textarea${error ? ' govuk-textarea--error' : ''}`}
        id={fieldId}
        name={fieldId}
        rows={5}
        value={typeof value === 'string' ? value : ''}
        aria-describedby={describedBy}
        onChange={(e) => onChange(field.id, e.target.value)}
      />
    </div>
  );
}

function DateInput({ field, value, error, onChange }: FieldProps): React.JSX.Element {
  const fieldsetId = `field-${field.id}`;
  const errorId = `${fieldsetId}-error`;
  const hintId = `${fieldsetId}-hint`;
  const dayId = `${fieldsetId}-day`;
  const monthId = `${fieldsetId}-month`;
  const yearId = `${fieldsetId}-year`;

  const dateVal: DateValue = isDateValue(value) ? value : { day: '', month: '', year: '' };

  const describedBy = [
    field.required ? hintId : '',
    error ? errorId : '',
  ].filter(Boolean).join(' ') || undefined;

  function handlePartChange(part: keyof DateValue, val: string): void {
    onChange(field.id, { ...dateVal, [part]: val });
  }

  return (
    <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
      <fieldset
        className="govuk-fieldset"
        role="group"
        aria-describedby={describedBy}
        id={fieldsetId}
      >
        <legend className="govuk-fieldset__legend">
          {field.label}
          {field.required && (
            <span className="govuk-hint govuk-!-margin-top-1" id={hintId}>
              (required)
            </span>
          )}
        </legend>
        {error && (
          <p className="govuk-error-message" id={errorId}>
            <span className="govuk-visually-hidden">Error:</span> {error}
          </p>
        )}
        <div className="govuk-date-input" id={`${fieldsetId}-date`}>
          <div className="govuk-date-input__item">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-date-input__label" htmlFor={dayId}>
                Day
              </label>
              <input
                className={`govuk-input govuk-date-input__input govuk-input--width-2${error ? ' govuk-input--error' : ''}`}
                id={dayId}
                name={dayId}
                type="text"
                inputMode="numeric"
                value={dateVal.day}
                onChange={(e) => handlePartChange('day', e.target.value)}
                autoComplete="bday-day"
              />
            </div>
          </div>
          <div className="govuk-date-input__item">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-date-input__label" htmlFor={monthId}>
                Month
              </label>
              <input
                className={`govuk-input govuk-date-input__input govuk-input--width-2${error ? ' govuk-input--error' : ''}`}
                id={monthId}
                name={monthId}
                type="text"
                inputMode="numeric"
                value={dateVal.month}
                onChange={(e) => handlePartChange('month', e.target.value)}
                autoComplete="bday-month"
              />
            </div>
          </div>
          <div className="govuk-date-input__item">
            <div className="govuk-form-group">
              <label className="govuk-label govuk-date-input__label" htmlFor={yearId}>
                Year
              </label>
              <input
                className={`govuk-input govuk-date-input__input govuk-input--width-4${error ? ' govuk-input--error' : ''}`}
                id={yearId}
                name={yearId}
                type="text"
                inputMode="numeric"
                value={dateVal.year}
                onChange={(e) => handlePartChange('year', e.target.value)}
                autoComplete="bday-year"
              />
            </div>
          </div>
        </div>
      </fieldset>
    </div>
  );
}

function RadioInput({ field, value, error, onChange }: FieldProps): React.JSX.Element {
  const fieldsetId = `field-${field.id}`;
  const errorId = `${fieldsetId}-error`;
  const hintId = `${fieldsetId}-hint`;

  const describedBy = [
    field.required ? hintId : '',
    error ? errorId : '',
  ].filter(Boolean).join(' ') || undefined;

  const options = field.options ?? [];

  return (
    <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
      <fieldset
        className="govuk-fieldset"
        aria-describedby={describedBy}
        id={fieldsetId}
      >
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
          {field.label}
          {field.required && (
            <span className="govuk-hint govuk-!-margin-top-1" id={hintId}>
              (required)
            </span>
          )}
        </legend>
        {error && (
          <p className="govuk-error-message" id={errorId}>
            <span className="govuk-visually-hidden">Error:</span> {error}
          </p>
        )}
        <div className="govuk-radios">
          {options.length === 0 && (
            <p className="govuk-body govuk-hint">No options defined for this field.</p>
          )}
          {options.map((opt, idx) => {
            const optId = `${fieldsetId}-${idx}`;
            return (
              <div className="govuk-radios__item" key={opt}>
                <input
                  className="govuk-radios__input"
                  id={optId}
                  name={fieldsetId}
                  type="radio"
                  value={opt}
                  checked={value === opt}
                  onChange={() => onChange(field.id, opt)}
                />
                <label className="govuk-label govuk-radios__label" htmlFor={optId}>
                  {opt}
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

function CheckboxInput({ field, value, error, onChange }: FieldProps): React.JSX.Element {
  const fieldsetId = `field-${field.id}`;
  const errorId = `${fieldsetId}-error`;
  const hintId = `${fieldsetId}-hint`;

  const describedBy = [
    field.required ? hintId : '',
    error ? errorId : '',
  ].filter(Boolean).join(' ') || undefined;

  const options = field.options ?? [];
  const selected: string[] = Array.isArray(value) ? (value as string[]) : [];

  function handleChange(opt: string, checked: boolean): void {
    const next = checked
      ? [...selected, opt]
      : selected.filter((s) => s !== opt);
    onChange(field.id, next);
  }

  return (
    <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
      <fieldset
        className="govuk-fieldset"
        aria-describedby={describedBy}
        id={fieldsetId}
      >
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
          {field.label}
          {field.required && (
            <span className="govuk-hint govuk-!-margin-top-1" id={hintId}>
              (required)
            </span>
          )}
        </legend>
        {error && (
          <p className="govuk-error-message" id={errorId}>
            <span className="govuk-visually-hidden">Error:</span> {error}
          </p>
        )}
        <div className="govuk-checkboxes">
          {options.length === 0 && (
            <p className="govuk-body govuk-hint">No options defined for this field.</p>
          )}
          {options.map((opt, idx) => {
            const optId = `${fieldsetId}-${idx}`;
            return (
              <div className="govuk-checkboxes__item" key={opt}>
                <input
                  className="govuk-checkboxes__input"
                  id={optId}
                  name={fieldsetId}
                  type="checkbox"
                  value={opt}
                  checked={selected.includes(opt)}
                  onChange={(e) => handleChange(opt, e.target.checked)}
                />
                <label className="govuk-label govuk-checkboxes__label" htmlFor={optId}>
                  {opt}
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}

function SelectInput({ field, value, error, onChange }: FieldProps): React.JSX.Element {
  const fieldId = `field-${field.id}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy = [field.required ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ') || undefined;

  const options = field.options ?? [];

  return (
    <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
      <label className="govuk-label" htmlFor={fieldId}>
        {field.label}
        {field.required && (
          <span className="govuk-hint govuk-!-margin-top-1" id={hintId}>
            (required)
          </span>
        )}
      </label>
      {error && (
        <p className="govuk-error-message" id={errorId}>
          <span className="govuk-visually-hidden">Error:</span> {error}
        </p>
      )}
      <select
        className={`govuk-select${error ? ' govuk-select--error' : ''}`}
        id={fieldId}
        name={fieldId}
        value={typeof value === 'string' ? value : ''}
        aria-describedby={describedBy}
        onChange={(e) => onChange(field.id, e.target.value)}
      >
        <option value="">Please select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function FormFieldRenderer({ field, value, error, onChange }: FieldProps): React.JSX.Element {
  switch (field.type) {
    case 'textarea':
      return <TextareaInput field={field} value={value} error={error} onChange={onChange} />;
    case 'date':
      return <DateInput field={field} value={value} error={error} onChange={onChange} />;
    case 'number':
      return <NumberInput field={field} value={value} error={error} onChange={onChange} />;
    case 'radio':
      return <RadioInput field={field} value={value} error={error} onChange={onChange} />;
    case 'checkbox':
      return <CheckboxInput field={field} value={value} error={error} onChange={onChange} />;
    case 'select':
      return <SelectInput field={field} value={value} error={error} onChange={onChange} />;
    case 'text':
    default:
      return <TextInput field={field} value={value} error={error} onChange={onChange} />;
  }
}

// ── Confirmation Panel ─────────────────────────────────────────────────────────

interface ConfirmationPanelProps {
  referenceNumber: string;
  formTitle: string;
}

function ConfirmationPanel({ referenceNumber, formTitle }: ConfirmationPanelProps): React.JSX.Element {
  return (
    <div>
      <div className="govuk-panel govuk-panel--confirmation">
        <h1 className="govuk-panel__title">Form submitted</h1>
        <div className="govuk-panel__body">
          Your reference number
          <br />
          <strong>{referenceNumber}</strong>
        </div>
      </div>

      <h2 className="govuk-heading-m govuk-!-margin-top-6">What happens next</h2>
      <p className="govuk-body">
        We have received your submission for <strong>{formTitle}</strong>.
      </p>
      <p className="govuk-body">
        Please keep your reference number <strong>{referenceNumber}</strong> for your records.
      </p>
      <p className="govuk-body">
        <a className="govuk-link" href="/">
          Return to dashboard
        </a>
      </p>
    </div>
  );
}

// ── Error anchor helper ────────────────────────────────────────────────────────

/** Returns the anchor href for the error summary link based on field type */
function getFieldErrorAnchor(field: FormField): string {
  // For date inputs, link to the first sub-input (day)
  if (field.type === 'date') return `#field-${field.id}-day`;
  // For radio and checkbox, link to the fieldset (group element)
  if (field.type === 'radio' || field.type === 'checkbox') return `#field-${field.id}`;
  return `#field-${field.id}`;
}

// ── Validation ─────────────────────────────────────────────────────────────────

function validateFields(
  fields: FormField[],
  values: Record<string, FieldValue>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    if (!field.required) continue;
    const value = values[field.id];

    if (field.type === 'checkbox') {
      const arr = Array.isArray(value) ? (value as string[]) : [];
      if (arr.length === 0) {
        errors[field.id] = `Select at least one option for "${field.label}"`;
      }
    } else if (field.type === 'date') {
      const dv = isDateValue(value) ? value : { day: '', month: '', year: '' };
      if (!dv.day.trim() || !dv.month.trim() || !dv.year.trim()) {
        errors[field.id] = `Enter a complete date for "${field.label}"`;
      }
    } else {
      const str = typeof value === 'string' ? value.trim() : '';
      if (!str) {
        errors[field.id] = `Enter ${field.label.toLowerCase()}`;
      }
    }
  }

  return errors;
}

// ── Default values ─────────────────────────────────────────────────────────────

function getDefaultValue(field: FormField): FieldValue {
  if (field.type === 'checkbox') return [];
  if (field.type === 'date') return { day: '', month: '', year: '' };
  return '';
}

function buildInitialValues(fields: FormField[]): Record<string, FieldValue> {
  return Object.fromEntries(fields.map((f) => [f.id, getDefaultValue(f)]));
}

// ── Build submission payload ───────────────────────────────────────────────────

function buildPayload(
  fields: FormField[],
  values: Record<string, FieldValue>
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    const val = values[field.id];
    if (isDateValue(val)) {
      payload[field.id] = {
        label: field.label,
        type: field.type,
        value: `${val.year}-${val.month.padStart(2, '0')}-${val.day.padStart(2, '0')}`,
      };
    } else {
      payload[field.id] = {
        label: field.label,
        type: field.type,
        value: val,
      };
    }
  }
  return payload;
}

// ── Main Renderer Page ─────────────────────────────────────────────────────────

export default function FormRendererPage(): React.JSX.Element {
  const { formId } = useParams<{ formId: string }>();

  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [values, setValues] = useState<Record<string, FieldValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);

  const errorSummaryRef = useRef<HTMLDivElement>(null);

  // Generate a stable client-side session ID for this submission session
  const sessionIdRef = useRef<string>(uuidv4());

  useEffect(() => {
    if (!formId) {
      setLoadError('No form ID provided in URL');
      setLoading(false);
      return;
    }

    getFormSchema(formId)
      .then((s) => {
        setSchema(s);
        const sorted = [...s.fields].sort((a, b) => a.order - b.order);
        setValues(buildInitialValues(sorted));
      })
      .catch((err: unknown) => {
        setLoadError((err as Error).message);
      })
      .finally(() => setLoading(false));
  }, [formId]);

  const handleChange = useCallback((id: string, value: FieldValue): void => {
    setValues((prev) => ({ ...prev, [id]: value }));
    // Clear error as user types
    setErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!schema || !formId) return;

    setSubmitError(null);

    const sorted = [...schema.fields].sort((a, b) => a.order - b.order);
    const validationErrors = validateFields(sorted, values);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Focus the error summary after render
      requestAnimationFrame(() => {
        errorSummaryRef.current?.focus();
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildPayload(sorted, values);
      // Include session reference
      const enrichedPayload = {
        ...payload,
        _meta: {
          sessionId: sessionIdRef.current,
          formId,
          formTitle: schema.title,
          formVersion: schema.version,
          submittedAt: new Date().toISOString(),
        },
      };

      const result = await submitForm(formId, enrichedPayload);
      setReferenceNumber(result.referenceNumber);
    } catch (err: unknown) {
      setSubmitError((err as Error).message);
      requestAnimationFrame(() => {
        errorSummaryRef.current?.focus();
        errorSummaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <GovLayout>
        <p className="govuk-body" aria-live="polite" aria-busy="true">
          Loading form…
        </p>
      </GovLayout>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (loadError || !schema) {
    return (
      <GovLayout>
        <div
          className="govuk-error-summary"
          data-module="govuk-error-summary"
          role="alert"
          aria-labelledby="load-error-title"
          tabIndex={-1}
          ref={errorSummaryRef}
        >
          <h2 className="govuk-error-summary__title" id="load-error-title">
            There is a problem loading this form
          </h2>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">
              {loadError ?? 'The form could not be found. It may not have been published yet.'}
            </p>
            <p className="govuk-body">
              <a className="govuk-link" href="/">
                Return to dashboard
              </a>
            </p>
          </div>
        </div>
      </GovLayout>
    );
  }

  // ── Confirmation state ────────────────────────────────────────────────────────
  if (referenceNumber) {
    return (
      <GovLayout>
        <ConfirmationPanel referenceNumber={referenceNumber} formTitle={schema.title} />
      </GovLayout>
    );
  }

  // ── Form render state ─────────────────────────────────────────────────────────
  const sortedFields = [...schema.fields].sort((a, b) => a.order - b.order);
  const hasErrors = Object.keys(errors).length > 0 || Boolean(submitError);

  return (
    <GovLayout backHref="/" backLabel="Back to dashboard">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">{schema.title}</h1>

          {/* Error summary — shown when validation fails */}
          {hasErrors && (
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
                  {submitError && (
                    <li>
                      <a href="#form-submit">{submitError}</a>
                    </li>
                  )}
                  {sortedFields
                    .filter((f) => errors[f.id])
                    .map((f) => (
                      <li key={f.id}>
                        <a
                          href={getFieldErrorAnchor(f)}
                          onClick={(e) => {
                            e.preventDefault();
                            const target = document.querySelector<HTMLElement>(getFieldErrorAnchor(f));
                            if (target) {
                              target.focus();
                              target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }}
                        >
                          {errors[f.id]}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}

          {/* Form */}
          <form
            noValidate
            onSubmit={(e) => { void handleSubmit(e); }}
          >
            {sortedFields.map((field) => (
              <FormFieldRenderer
                key={field.id}
                field={field}
                value={values[field.id] ?? getDefaultValue(field)}
                error={errors[field.id]}
                onChange={handleChange}
              />
            ))}

            <div className="govuk-button-group govuk-!-margin-top-6">
              <button
                id="form-submit"
                type="submit"
                className="govuk-button"
                data-module="govuk-button"
                disabled={submitting}
                aria-disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Submit form'}
              </button>
              <a className="govuk-link" href="/">
                Cancel
              </a>
            </div>
          </form>
        </div>
      </div>
    </GovLayout>
  );
}
