/**
 * Global error handler middleware.
 * Ensures all unhandled errors produce a consistent GOV.UK-style error response.
 */

import type { Request, Response, NextFunction } from 'express';
import { buildErrorResponse } from '../utils/errors';

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[ERROR]', err.message, err.stack);
  res.status(500).json(buildErrorResponse('INTERNAL_SERVER_ERROR'));
}
