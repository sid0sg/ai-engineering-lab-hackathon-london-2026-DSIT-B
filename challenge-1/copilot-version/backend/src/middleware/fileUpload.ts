/**
 * File validation middleware and helpers.
 * Validates: MIME type, file extension, and size.
 * OWASP A03 – server-side validation, no reliance on client-supplied MIME only.
 */

import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { sendError } from '../utils/errors';
import { sanitiseFilename, hasPdfExtension } from '../utils/sanitise';

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

/** Multer – uses memory storage so we never write un-validated files to disk */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    const sanitised = sanitiseFilename(file.originalname);

    // Server-side MIME check (OWASP A03: server-side validation)
    if (
      file.mimetype !== 'application/pdf' &&
      file.mimetype !== 'application/x-pdf'
    ) {
      cb(new InvalidFileTypeError('Only PDF files are accepted.'));
      return;
    }

    // Extension cross-check
    if (!hasPdfExtension(sanitised)) {
      cb(new InvalidFileTypeError('Only PDF files are accepted.'));
      return;
    }

    cb(null, true);
  },
});

/** Custom error classes to distinguish from generic Multer errors */
export class InvalidFileTypeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidFileTypeError';
  }
}

/** Express error-handling middleware for Multer and validation errors */
export function fileUploadErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      sendError(res, 413, 'FILE_TOO_LARGE');
      return;
    }
    sendError(res, 400, 'VALIDATION_ERROR', err.message);
    return;
  }

  if (err instanceof InvalidFileTypeError) {
    sendError(res, 400, 'INVALID_FILE_TYPE');
    return;
  }

  next(err);
}
