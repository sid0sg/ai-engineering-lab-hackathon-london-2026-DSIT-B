import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import GovLayout from '../components/GovLayout';
import { listForms } from '../api';
import type { FormListItem } from '../types';

function statusTag(status: string): React.JSX.Element {
  const classMap: Record<string, string> = {
    'extraction-complete': 'govuk-tag--green',
    'pending': 'govuk-tag--yellow',
    'extraction-failed': 'govuk-tag--red',
  };
  const labelMap: Record<string, string> = {
    'extraction-complete': 'Ready',
    'pending': 'Processing',
    'extraction-failed': 'Failed',
  };
  const cls = classMap[status] ?? '';
  const label = labelMap[status] ?? status;
  return <strong className={`govuk-tag ${cls}`}>{label}</strong>;
}

export default function DashboardPage(): React.JSX.Element {
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listForms()
      .then(setForms)
      .catch((err: unknown) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <GovLayout>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h1 className="govuk-heading-xl">Form Builder Dashboard</h1>

          <p className="govuk-body">
            Upload a PDF government form to extract its fields and edit the digital version.
          </p>

          <Link to="/upload" className="govuk-button govuk-button--start" role="button">
            Upload new form
            <svg
              className="govuk-button__start-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="17.5"
              height="19"
              viewBox="0 0 33 40"
              aria-hidden="true"
              focusable="false"
            >
              <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
            </svg>
          </Link>

          <h2 className="govuk-heading-l">Uploaded forms</h2>

          {loading && (
            <p className="govuk-body" aria-live="polite" aria-busy="true">
              Loading forms…
            </p>
          )}

          {error && (
            <div
              className="govuk-error-summary"
              data-module="govuk-error-summary"
              role="alert"
              aria-labelledby="error-summary-title"
            >
              <h2 className="govuk-error-summary__title" id="error-summary-title">
                There is a problem
              </h2>
              <div className="govuk-error-summary__body">
                <p className="govuk-body">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && forms.length === 0 && (
            <p className="govuk-body">No forms uploaded yet.</p>
          )}

          {!loading && !error && forms.length > 0 && (
            <table className="govuk-table">
              <caption className="govuk-table__caption govuk-visually-hidden">
                List of uploaded forms
              </caption>
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">
                    Title
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Status
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Uploaded
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {forms.map((form) => (
                  <tr key={form.formId} className="govuk-table__row">
                    <td className="govuk-table__cell">{form.title}</td>
                    <td className="govuk-table__cell">{statusTag(form.status)}</td>
                    <td className="govuk-table__cell">
                      {new Date(form.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="govuk-table__cell">
                      {form.status === 'extraction-complete' ? (
                        <Link to={`/forms/${form.formId}/edit`} className="govuk-link">
                          Edit
                        </Link>
                      ) : (
                        <span className="govuk-body govuk-!-colour-secondary">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </GovLayout>
  );
}
