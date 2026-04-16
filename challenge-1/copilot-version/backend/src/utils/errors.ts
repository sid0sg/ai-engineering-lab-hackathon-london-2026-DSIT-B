/**
 * Structured error helpers.
 * All error responses follow the GOV.UK Design System error pattern:
 * { error: { code, message, fieldErrors?, errorSummary? } }
 *
 * Error copy follows GOV.UK content design standards (plain English, active voice).
 */

import type { Response } from 'express';
import type { ApiErrorResponse } from '../types/schema';

// ── GOV.UK Design System error code → copy map ────────────────────────────────
const GOV_UK_ERROR_MESSAGES: Record<string, string> = {
  INVALID_FILE_TYPE:
    'The selected file must be a PDF. Choose a file with a .pdf extension.',
  FILE_TOO_LARGE:
    'The selected file must be smaller than 20MB. Reduce the file size and try again.',
  NO_FILE_UPLOADED:
    'Select a PDF to upload.',
  EXTRACTION_FAILED:
    'There was a problem extracting fields from the PDF. Check the file is a valid PDF form and try again.',
  FORM_NOT_FOUND:
    'The form was not found. It may have been deleted.',
  INTERNAL_SERVER_ERROR:
    'Sorry, there is a problem with this service. Try again later.',
  SCHEMA_NOT_FOUND:
    'The form schema was not found.',
  SCHEMA_NOT_PUBLISHED:
    'This form has not been published yet. Publish the form before accessing the schema endpoint.',
  INVALID_FIELDS:
    'The fields provided are invalid. Provide a valid array of field objects.',
  VALIDATION_ERROR:
    'Enter a valid value.',
};

export function getGovUkErrorMessage(code: string): string {
  return GOV_UK_ERROR_MESSAGES[code] ?? GOV_UK_ERROR_MESSAGES['INTERNAL_SERVER_ERROR'];
}

export function buildErrorResponse(
  code: string,
  overrideMessage?: string
): ApiErrorResponse {
  const message = overrideMessage ?? getGovUkErrorMessage(code);
  return {
    error: {
      code,
      message,
      // Provide govuk-frontend error-summary compatible items
      errorSummary: [
        {
          text: message,
          href: '#file-upload',
        },
      ],
    },
  };
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  overrideMessage?: string
): void {
  res.status(statusCode).json(buildErrorResponse(code, overrideMessage));
}
