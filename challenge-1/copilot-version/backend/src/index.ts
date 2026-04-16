/**
 * HTTP server entry-point.
 * Starts the Express application on PORT (default 3000).
 */

import { createApp } from './app';

const PORT = parseInt(process.env['PORT'] ?? '3000', 10);

// Prevent pdf-parse / PDF.js background async errors from crashing the process.
// pdf-parse uses pdfjs-dist internally; some malformed PDFs fire promise
// rejections in internal async callbacks AFTER the outer await resolves.
// We log and suppress those to keep the server alive.
process.on('unhandledRejection', (reason: unknown) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  // Only swallow known PDF.js parse errors; re-throw everything else.
  if (/FormatError|XRef|XObject|InvalidPDF/i.test(message)) {
    console.warn(`[server] Suppressed pdf-parse background rejection: ${message}`);
    return;
  }
  // For unexpected rejections, log and allow Node's default behaviour.
  console.error(`[server] Unhandled rejection:`, reason);
});

const app = createApp();

app.listen(PORT, () => {
  console.log(`[server] PDF-to-Digital Form Builder API running on port ${PORT}`);
  console.log(`[server] Health check: http://localhost:${PORT}/api/health`);
});

export default app;
