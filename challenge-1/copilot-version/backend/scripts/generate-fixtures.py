#!/usr/bin/env python3
"""
Generate minimal but valid PDF test fixtures for the extraction engine.
These PDFs contain text layers (digitally generated) to support ≥70% field extraction.
"""

import struct


def encode_text(text):
    """Encode text as PDF string, escaping special characters."""
    result = []
    for ch in text:
        if ch == '(':
            result.append('\\(')
        elif ch == ')':
            result.append('\\)')
        elif ch == '\\':
            result.append('\\\\')
        else:
            result.append(ch)
    return ''.join(result)


def make_pdf(title, lines):
    """
    Build a minimal valid PDF with a single text page.
    Each item in lines is a string to be shown on that line.
    Returns bytes.
    """
    # Build the page stream content
    y = 780
    stream_parts = []
    stream_parts.append("BT")
    stream_parts.append("/F1 12 Tf")

    # Title in bold-ish (bigger font)
    stream_parts.append(f"50 {y} Td")
    stream_parts.append("14 TL")
    encoded_title = encode_text(title)
    stream_parts.append(f"({encoded_title}) Tj")
    y -= 30
    stream_parts.append(f"50 {y} Td")

    stream_parts.append("12 TL")
    for line in lines:
        encoded = encode_text(line)
        y -= 18
        stream_parts.append(f"0 -18 Td")
        stream_parts.append(f"({encoded}) Tj")

    stream_parts.append("ET")
    content_stream = "\n".join(stream_parts)
    stream_bytes = content_stream.encode("latin-1")
    stream_len = len(stream_bytes)

    # PDF cross-reference offsets
    offsets = []
    buf = []

    def write(s):
        buf.append(s)
        return len(s)

    header = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
    buf.append(header)
    pos = len(header)

    # Object 1: Catalog
    offsets.append(pos)
    obj1 = b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
    buf.append(obj1)
    pos += len(obj1)

    # Object 2: Pages
    offsets.append(pos)
    obj2 = b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
    buf.append(obj2)
    pos += len(obj2)

    # Object 3: Page
    offsets.append(pos)
    page_title_enc = title.encode("latin-1", errors="replace")
    obj3 = (
        b"3 0 obj\n"
        b"<< /Type /Page /Parent 2 0 R\n"
        b"   /MediaBox [0 0 595 842]\n"
        b"   /Contents 4 0 R\n"
        b"   /Resources << /Font << /F1 5 0 R >> >>\n"
        b"   /Info << /Title (" + page_title_enc + b") >>\n"
        b">>\nendobj\n"
    )
    buf.append(obj3)
    pos += len(obj3)

    # Object 4: Content stream
    offsets.append(pos)
    obj4_header = f"4 0 obj\n<< /Length {stream_len} >>\nstream\n".encode("latin-1")
    obj4_footer = b"\nendstream\nendobj\n"
    buf.append(obj4_header)
    buf.append(stream_bytes)
    buf.append(obj4_footer)
    pos += len(obj4_header) + len(stream_bytes) + len(obj4_footer)

    # Object 5: Font
    offsets.append(pos)
    obj5 = (
        b"5 0 obj\n"
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica\n"
        b"   /Encoding /WinAnsiEncoding >>\n"
        b"endobj\n"
    )
    buf.append(obj5)
    pos += len(obj5)

    # Object 6: Document info
    offsets.append(pos)
    title_enc = title.encode("latin-1", errors="replace")
    obj6 = b"6 0 obj\n<< /Title (" + title_enc + b") /Creator (PDF Form Fixture Generator) >>\nendobj\n"
    buf.append(obj6)
    pos += len(obj6)

    # Cross-reference table
    xref_pos = pos
    xref = b"xref\n"
    xref += f"0 {len(offsets) + 1}\n".encode()
    xref += b"0000000000 65535 f \n"
    for off in offsets:
        xref += f"{off:010d} 00000 n \n".encode()
    buf.append(xref)

    # Trailer
    trailer = (
        f"trailer\n"
        f"<< /Size {len(offsets) + 1} /Root 1 0 R /Info 6 0 R >>\n"
        f"startxref\n"
        f"{xref_pos}\n"
        f"%%EOF\n"
    ).encode()
    buf.append(trailer)

    return b"".join(buf)


# ── Fixture 1: Housing Benefit Application ────────────────────────────────────

housing_benefit_lines = [
    "Please complete all sections in BLOCK CAPITALS",
    "",
    "Section 1: Personal Details",
    "",
    "Full Name",
    "Date of Birth",
    "National Insurance Number",
    "Email Address",
    "Phone Number",
    "",
    "Section 2: Address",
    "",
    "Current Address",
    "Postcode",
    "How long have you lived at this address?",
    "",
    "Section 3: Employment",
    "",
    "Are you employed? Yes / No",
    "Employer Name",
    "Weekly Income Amount",
    "",
    "Section 4: Housing",
    "",
    "Select your tenancy type",
    "Monthly Rent Amount",
    "Landlord Name",
    "Landlord Address",
    "",
    "Section 5: Declaration",
    "",
    "I confirm the information is correct",
    "I accept the terms and conditions",
    "Signature",
    "Date",
]

# ── Fixture 2: Universal Credit Change of Circumstances ──────────────────────

universal_credit_lines = [
    "Use this form to notify us of a change in your circumstances.",
    "",
    "Section 1: Your Details",
    "",
    "First Name",
    "Last Name",
    "Date of Birth",
    "National Insurance Number",
    "Claim Reference Number",
    "",
    "Section 2: Change Details",
    "",
    "Please describe the change",
    "Date of change",
    "Reason for change",
    "",
    "Section 3: Employment",
    "",
    "Have you started work? Yes / No",
    "Employer Name",
    "Start Date",
    "Weekly Hours",
    "Annual Salary",
    "",
    "Section 4: Housing",
    "",
    "Have you moved address? Yes / No",
    "New Address",
    "New Postcode",
    "",
    "Section 5: Bank Details",
    "",
    "Bank or Building Society name",
    "Sort Code",
    "Account Number",
    "",
    "I confirm I have read and understood the declaration",
]

# ── Fixture 3: Business Registration Form ─────────────────────────────────────

business_reg_lines = [
    "Register your business with the Local Authority",
    "",
    "Section 1: Business Information",
    "",
    "Business Name",
    "Trading Name (if different)",
    "Company Registration Number",
    "VAT Registration Number",
    "Select business type",
    "Date business started",
    "",
    "Section 2: Business Address",
    "",
    "Registered Address",
    "Town or City",
    "County",
    "Postcode",
    "Phone Number",
    "Email Address",
    "Website (optional)",
    "",
    "Section 3: Responsible Person",
    "",
    "Full Name",
    "Job Title",
    "Date of Birth",
    "National Insurance Number",
    "Home Address",
    "",
    "Section 4: Declaration",
    "",
    "I confirm this information is accurate and complete",
    "I agree to notify the council of any changes",
    "Signature",
    "Date",
]

import os

fixtures_dir = os.path.join(os.path.dirname(__file__), "..", "test-fixtures")
os.makedirs(fixtures_dir, exist_ok=True)

fixtures = [
    ("housing-benefit-application.pdf", "Housing Benefit Application Form", housing_benefit_lines),
    ("universal-credit-change.pdf", "Universal Credit - Change of Circumstances", universal_credit_lines),
    ("business-registration.pdf", "Business Registration Form", business_reg_lines),
]

for filename, title, lines in fixtures:
    pdf_bytes = make_pdf(title, lines)
    filepath = os.path.join(fixtures_dir, filename)
    with open(filepath, "wb") as f:
        f.write(pdf_bytes)
    print(f"Generated: {filepath} ({len(pdf_bytes)} bytes)")

print("\nAll test fixtures generated successfully.")
