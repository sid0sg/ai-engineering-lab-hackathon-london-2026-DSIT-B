import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GovLayout from '../components/GovLayout';
import { uploadPdf } from '../api';

export default function UploadPage(): React.JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Upload PDF Form – GOV.UK Form Builder';
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setFileError(null);
    setGlobalError(null);
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();

    // Client-side validation
    if (!file) {
      setFileError('Select a PDF file to upload');
      fileInputRef.current?.focus();
      return;
    }
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setFileError('The selected file must be a PDF');
      fileInputRef.current?.focus();
      return;
    }

    setUploading(true);
    setGlobalError(null);

    try {
      const result = await uploadPdf(file);
      navigate(`/forms/${result.formId}/edit`);
    } catch (err: unknown) {
      setGlobalError((err as Error).message);
      setUploading(false);
    }
  }

  const hasError = !!fileError;

  return (
    <GovLayout backHref="/" backLabel="Back to dashboard">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">Upload a PDF form</h1>

          {globalError && (
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
                <ul className="govuk-list govuk-error-summary__list">
                  <li>
                    <a href="#file-upload">{globalError}</a>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {fileError && (
            <div
              className="govuk-error-summary"
              data-module="govuk-error-summary"
              role="alert"
              aria-labelledby="error-summary-title-file"
            >
              <h2 className="govuk-error-summary__title" id="error-summary-title-file">
                There is a problem
              </h2>
              <div className="govuk-error-summary__body">
                <ul className="govuk-list govuk-error-summary__list">
                  <li>
                    <a href="#file-upload">{fileError}</a>
                  </li>
                </ul>
              </div>
            </div>
          )}

          <form onSubmit={(e) => { void handleSubmit(e); }} noValidate>
            <div className={`govuk-form-group${hasError ? ' govuk-form-group--error' : ''}`}>
              <label className="govuk-label govuk-label--m" htmlFor="file-upload">
                Upload a PDF
              </label>
              <div className="govuk-hint" id="file-upload-hint">
                The file must be a PDF. Maximum size 10MB.
              </div>
              {fileError && (
                <p className="govuk-error-message" id="file-upload-error">
                  <span className="govuk-visually-hidden">Error:</span> {fileError}
                </p>
              )}
              <input
                className={`govuk-file-upload${hasError ? ' govuk-file-upload--error' : ''}`}
                id="file-upload"
                name="file"
                type="file"
                accept=".pdf,application/pdf"
                aria-describedby={`file-upload-hint${fileError ? ' file-upload-error' : ''}`}
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>

            <button
              type="submit"
              className="govuk-button"
              data-module="govuk-button"
              disabled={uploading}
              aria-disabled={uploading}
            >
              {uploading ? 'Uploading…' : 'Upload and extract fields'}
            </button>
          </form>
        </div>
      </div>
    </GovLayout>
  );
}
