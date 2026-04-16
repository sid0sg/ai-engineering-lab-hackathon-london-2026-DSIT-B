/**
 * Unit tests: filename sanitisation utilities
 */

import { sanitiseFilename, hasPdfExtension, hasPdfMagicBytes } from '../utils/sanitise';

describe('sanitiseFilename', () => {
  it('returns unchanged safe filenames', () => {
    expect(sanitiseFilename('my-form.pdf')).toBe('my-form.pdf');
  });

  it('strips directory traversal sequences', () => {
    expect(sanitiseFilename('../../../etc/passwd')).toBe('passwd');
    expect(sanitiseFilename('..\\windows\\system32\\file.pdf')).toBe('file.pdf');
  });

  it('removes null bytes from filenames', () => {
    // null byte between chars is removed (not replaced), so 'file\0.pdf' → 'file.pdf'
    expect(sanitiseFilename('file\0.pdf')).toBe('file.pdf');
  });

  it('removes null bytes that would alter the extension', () => {
    expect(sanitiseFilename('malicious\0.pdf.exe')).not.toContain('\0');
  });

  it('replaces consecutive dots', () => {
    expect(sanitiseFilename('file...pdf')).toBe('file.pdf');
    expect(sanitiseFilename('file....pdf')).toBe('file.pdf');
  });

  it('replaces unsafe characters with underscore', () => {
    expect(sanitiseFilename('form <script>.pdf')).toBe('form__script_.pdf');
    expect(sanitiseFilename('form & test.pdf')).toBe('form___test.pdf');
  });

  it('truncates long filenames to 255 characters', () => {
    const long = 'a'.repeat(300) + '.pdf';
    expect(sanitiseFilename(long).length).toBeLessThanOrEqual(255);
  });

  it('returns "upload" for empty or non-string input', () => {
    expect(sanitiseFilename('')).toBe('upload');
    expect(sanitiseFilename(null as unknown as string)).toBe('upload');
    expect(sanitiseFilename(undefined as unknown as string)).toBe('upload');
  });

  it('handles filenames with only unsafe characters', () => {
    const result = sanitiseFilename('<>|');
    expect(result).toBeTruthy();
  });
});

describe('hasPdfExtension', () => {
  it('returns true for .pdf extension (case-insensitive)', () => {
    expect(hasPdfExtension('form.pdf')).toBe(true);
    expect(hasPdfExtension('FORM.PDF')).toBe(true);
    expect(hasPdfExtension('Form.Pdf')).toBe(true);
  });

  it('returns false for non-pdf extensions', () => {
    expect(hasPdfExtension('form.docx')).toBe(false);
    expect(hasPdfExtension('form.exe')).toBe(false);
    expect(hasPdfExtension('form')).toBe(false);
    expect(hasPdfExtension('form.pdf.exe')).toBe(false);
  });
});

describe('hasPdfMagicBytes', () => {
  it('returns true for a buffer starting with %PDF-', () => {
    const buf = Buffer.from('%PDF-1.4 rest of file');
    expect(hasPdfMagicBytes(buf)).toBe(true);
  });

  it('returns false for HTML content masquerading as PDF', () => {
    expect(hasPdfMagicBytes(Buffer.from('<html>'))).toBe(false);
    expect(hasPdfMagicBytes(Buffer.from('<script>alert(1)</script>'))).toBe(false);
  });

  it('returns false for short buffers', () => {
    expect(hasPdfMagicBytes(Buffer.from('%PDF'))).toBe(false);
    expect(hasPdfMagicBytes(Buffer.alloc(0))).toBe(false);
  });

  it('returns false for binary non-PDF content', () => {
    expect(hasPdfMagicBytes(Buffer.from([0x89, 0x50, 0x4e, 0x47]))).toBe(false); // PNG
    expect(hasPdfMagicBytes(Buffer.from([0xff, 0xd8, 0xff]))).toBe(false); // JPEG
  });
});
