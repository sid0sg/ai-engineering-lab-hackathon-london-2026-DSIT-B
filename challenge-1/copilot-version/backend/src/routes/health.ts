/**
 * Health-check route.
 * GET /api/health → 200 OK
 *
 * Supports GOV.UK notification banner pattern for front-end status polling.
 */

import { Router, type Request, type Response } from 'express';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'pdf-to-digital-form-builder',
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] ?? '1.0.0',
  });
});

export default router;
