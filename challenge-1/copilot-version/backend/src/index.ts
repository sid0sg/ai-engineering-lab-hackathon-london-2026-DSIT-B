/**
 * HTTP server entry-point.
 * Starts the Express application on PORT (default 3000).
 */

import { createApp } from './app';

const PORT = parseInt(process.env['PORT'] ?? '3000', 10);

const app = createApp();

app.listen(PORT, () => {
  console.log(`[server] PDF-to-Digital Form Builder API running on port ${PORT}`);
  console.log(`[server] Health check: http://localhost:${PORT}/api/health`);
});

export default app;
