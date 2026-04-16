/**
 * Express application factory.
 * Separated from the HTTP server entry-point for testability.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import healthRouter from './routes/health';
import formsRouter from './routes/forms';
import { globalErrorHandler } from './middleware/errorHandler';
import { buildErrorResponse } from './utils/errors';

export function createApp(): express.Application {
  const app = express();

  // ── Security middleware (OWASP hardening) ─────────────────────────────────
  app.use(
    helmet({
      // Content-Security-Policy – restrict sources for API responses
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          scriptSrc: ["'none'"],
          objectSrc: ["'none'"],
        },
      },
    })
  );

  // CORS – restrict to known origins in production; open for dev/MVP
  app.use(
    cors({
      origin: process.env['ALLOWED_ORIGIN'] ?? '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ── Body parsers ─────────────────────────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));

  // ── Routes ───────────────────────────────────────────────────────────────
  app.use('/api/health', healthRouter);
  app.use('/api/forms', formsRouter);

  // ── 404 handler ─────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json(buildErrorResponse('FORM_NOT_FOUND', 'The requested resource was not found.'));
  });

  // ── Global error handler ─────────────────────────────────────────────────
  app.use(globalErrorHandler);

  return app;
}
