/**
 * Filename sanitisation utilities.
 * Prevents path traversal and removes dangerous characters from uploaded filenames.
 * Addresses OWASP A03 (Injection) and A01 (Broken Access Control / path traversal).
 */

const ALLOWED_CHARS = /[^a-zA-Z0-9._\-]/g;
const CONSECUTIVE_DOTS = /\.{2,}/g;
const MAX_FILENAME_LENGTH = 255;

/**
 * Sanitises a user-supplied filename.
 * - Strips directory separators to prevent path traversal
 * - Removes all characters not in the safe allowlist
 * - Truncates to 255 characters
 * - Ensures the result is not empty (falls back to 'upload')
 */
export function sanitiseFilename(raw: string): string {
  if (!raw || typeof raw !== 'string') return 'upload';

  // Strip path components (OWASP path traversal prevention)
  const basename = raw.split(/[/\\]/).pop() ?? 'upload';

  // Remove null bytes (OWASP A03)
  const noNull = basename.replace(/\0/g, '');

  // Remove consecutive dots (prevent hidden files and relative path tricks)
  const noDots = noNull.replace(CONSECUTIVE_DOTS, '.');

  // Keep only safe characters
  const safe = noDots.replace(ALLOWED_CHARS, '_');

  // Truncate
  const truncated = safe.slice(0, MAX_FILENAME_LENGTH);

  return truncated || 'upload';
}

/**
 * Returns true if the filename has a .pdf extension (case-insensitive).
 * This is supplementary to MIME-type checking — both must pass.
 */
export function hasPdfExtension(filename: string): boolean {
  return /\.pdf$/i.test(filename);
}

/**
 * Validates PDF magic bytes: `%PDF-` (0x25 0x50 0x44 0x46 0x2D).
 * Server-side check; does NOT rely on client-supplied Content-Type.
 * Addresses OWASP A03 (Injection) – block files masquerading as PDFs.
 */
export function hasPdfMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 5) return false;
  // %PDF-
  return (
    buffer[0] === 0x25 && // %
    buffer[1] === 0x50 && // P
    buffer[2] === 0x44 && // D
    buffer[3] === 0x46 && // F
    buffer[4] === 0x2d    // -
  );
}
