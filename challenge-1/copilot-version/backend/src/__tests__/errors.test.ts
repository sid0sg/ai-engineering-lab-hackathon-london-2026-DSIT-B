/**
 * Unit tests: GOV.UK error utilities
 */

import { buildErrorResponse, getGovUkErrorMessage, sendError } from '../utils/errors';
import type { Response } from 'express';

describe('getGovUkErrorMessage', () => {
  it('returns the correct GOV.UK copy for known codes', () => {
    expect(getGovUkErrorMessage('INVALID_FILE_TYPE')).toMatch(/must be a PDF/i);
    expect(getGovUkErrorMessage('FILE_TOO_LARGE')).toMatch(/smaller than 20MB/i);
    expect(getGovUkErrorMessage('NO_FILE_UPLOADED')).toMatch(/Select a PDF/i);
    expect(getGovUkErrorMessage('EXTRACTION_FAILED')).toMatch(/problem extracting/i);
    expect(getGovUkErrorMessage('FORM_NOT_FOUND')).toMatch(/not found/i);
  });

  it('falls back to internal server error message for unknown codes', () => {
    const msg = getGovUkErrorMessage('COMPLETELY_UNKNOWN_CODE');
    expect(msg).toMatch(/problem with this service/i);
  });
});

describe('buildErrorResponse', () => {
  it('returns the correct structure', () => {
    const response = buildErrorResponse('INVALID_FILE_TYPE');
    expect(response).toHaveProperty('error');
    expect(response.error).toHaveProperty('code', 'INVALID_FILE_TYPE');
    expect(response.error).toHaveProperty('message');
    expect(typeof response.error.message).toBe('string');
  });

  it('allows override message', () => {
    const response = buildErrorResponse('INVALID_FILE_TYPE', 'Custom message');
    expect(response.error.message).toBe('Custom message');
  });

  it('includes errorSummary for govuk-frontend error-summary component', () => {
    const response = buildErrorResponse('NO_FILE_UPLOADED');
    expect(response.error.errorSummary).toBeDefined();
    expect(Array.isArray(response.error.errorSummary)).toBe(true);
    expect(response.error.errorSummary![0]).toHaveProperty('text');
    expect(response.error.errorSummary![0]).toHaveProperty('href');
  });
});

describe('sendError', () => {
  it('calls res.status().json() with correct error shape', () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const res = { status } as unknown as Response;

    sendError(res, 400, 'INVALID_FILE_TYPE');

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'INVALID_FILE_TYPE',
        }),
      })
    );
  });
});
