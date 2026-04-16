# Requirements Document

## Introduction

We are building a reusable platform that transforms legacy PDF and paper government forms into accessible, GOV.UK-compliant digital services — for applicants who deserve a modern experience and caseworkers who need structured data instead of scanned images.

The platform has two sides: a Form Builder that automatically translates legacy PDF and paper forms into structured form schemas, and a Form Renderer that takes those schemas and programmatically generates multi-page "one thing per page" journeys following GOV.UK Design System patterns. The first form to be digitised is FORM-LIC-001 (licence application), which serves as the reference implementation and proves the platform's capabilities.

This service aligns with the GOV.UK Service Standard and the Technology Code of Practice (TCoP), within the constraints of a prototype. Key principles applied: define user needs (SS1, TCoP1), solve a whole problem (SS2), make the service simple (SS4), ensure everyone can use it (SS5, TCoP2), be open and use open source (TCoP3, SS12), use open standards (TCoP4), make things secure (TCoP6), make privacy integral (TCoP7), share and reuse (TCoP8), and operate reliably (SS14).

## Glossary

- **Form_Platform**: The complete platform comprising the Form_Builder and the Form_Renderer
- **Form_Builder**: The backend tool that analyses legacy PDF or paper forms and generates a draft Form_Schema
- **Form_Renderer**: The engine that renders digital services from form schemas
- **Form_Schema**: A structured definition of a form including fields, types, validation rules, page groupings, and flow logic
- **Source_Document**: A legacy PDF, scanned image, or textual description of a form to be digitised
- **Form_Instance**: A specific form rendered by the Form_Platform from a Form_Schema (e.g. the licence application)
- **Flow_Logic**: Conditional rules within a Form_Schema that determine which pages are shown based on previous answers (e.g. show "Previous licence number" only if the Applicant selects "Yes")
- **Field_Definition**: A single field within a Form_Schema, specifying its type, label, hint text, validation rules, and whether it is required
- **Page_Definition**: A grouping of one or more Field_Definitions that are displayed together on a single page, following the "one thing per page" principle
- **Applicant**: A citizen or business completing a form
- **Caseworker**: A government officer who receives and processes form submissions
- **Service_Owner**: The person responsible for a form-based process who configures the Form_Schema
- **Form_Page**: A single rendered page in the multi-page form flow
- **Error_Summary**: A GOV.UK-pattern component displayed at the top of a page listing all validation errors
- **Check_Answers_Page**: A summary page displaying all entered answers for the Applicant to review before submission
- **Confirmation_Page**: The final page displayed after successful submission, showing a reference number
- **Reference_Number**: A unique identifier generated for each submitted form
- **Start_Page**: The initial page explaining the service, eligibility, and what the Applicant will need
- **Session_State**: The store holding the Applicant's answers during a single form journey
- **GOV.UK_Design_System**: The government's design framework providing tested, accessible UI components and patterns
- **Address_Lookup**: A postcode-based lookup that returns a list of matching addresses for the Applicant to select from
- **Licence_Type**: One of three categories of licence: personal, premises, or event (specific to FORM-LIC-001)
- **Postcode**: A UK postal code in standard format (e.g. SW1A 1AA)
- **Acknowledgement_Notification**: An email or message sent to the Applicant confirming receipt of their submission
- **Submission_Status**: The current state of a submitted form (e.g. Received, In Review, Approved, Rejected, Requires Information)
- **Case_Dashboard**: The interface used by Caseworkers to view, search, and manage submitted applications
- **Status_Tracker**: The Applicant-facing page where they can check the current Submission_Status using their Reference_Number

---

## Part A: Platform Vision

The platform comprises three layers:
1. **Form Builder (Part B)** — Ingests legacy PDF/paper forms and automatically generates a draft Form_Schema, with intelligent field type detection, validation rule inference, and page flow generation. The Service_Owner reviews and refines the output.
2. **Form Renderer (Part C)** — Takes a Form_Schema and renders a complete, accessible, GOV.UK-compliant multi-page digital service with no custom code per form.
3. **Reference Implementation (Part D)** — FORM-LIC-001 (licence application) as the first form digitised end-to-end, proving the platform works.

---

## Part B: Form Builder — PDF-to-Schema Conversion

### Requirement 1: PDF and Legacy Form Ingestion

**User Story:** As a Service_Owner, I want to upload a legacy PDF form and have the platform automatically extract its structure, so that I do not have to manually recreate every field and rule.

#### Acceptance Criteria

1. THE Form_Builder SHALL accept a Source_Document in PDF format as input.
2. THE Form_Builder SHALL accept a plain-text or markdown description of a form as an alternative input.
3. WHEN a Source_Document is provided, THE Form_Builder SHALL extract field names, field types, groupings, and any visible validation hints (e.g. "required", "must be 18 or over") from the document.
4. THE Form_Builder SHALL generate a draft Form_Schema in JSON format from the extracted information.
5. IF the Form_Builder cannot determine the type of a field, THEN THE Form_Builder SHALL default to "text" and flag the field for review.

### Requirement 2: Intelligent Field Type Detection

**User Story:** As a Service_Owner, I want the builder to correctly identify field types from the PDF, so that the generated schema uses the right GOV.UK components (date inputs, radios, checkboxes) without manual correction.

#### Acceptance Criteria

1. THE Form_Builder SHALL detect date fields (e.g. "Date of birth", fields with DD/MM/YYYY placeholders) and map them to the date field type with day/month/year inputs.
2. THE Form_Builder SHALL detect selection fields (e.g. "Select one:", checkboxes, tick boxes) and map them to radio or checkbox field types.
3. THE Form_Builder SHALL detect address blocks (e.g. grouped address lines with a postcode field) and map them to the address field type.
4. THE Form_Builder SHALL detect required/optional indicators (e.g. asterisks, "(required)", "(optional)") and set the appropriate validation rules.
5. THE Form_Builder SHALL detect free-text areas and map them to the textarea field type.

### Requirement 3: Validation Rule Inference

**User Story:** As a Service_Owner, I want the builder to infer validation rules from the PDF's instructions and labels, so that the generated form catches errors early without manual rule configuration.

#### Acceptance Criteria

1. WHEN a Source_Document contains age-related instructions (e.g. "must be 18 or over"), THE Form_Builder SHALL generate an age-based validation rule for the corresponding date field.
2. WHEN a Source_Document marks a field as required, THE Form_Builder SHALL generate a required validation rule with a GOV.UK-style error message (e.g. "Enter your full name").
3. THE Form_Builder SHALL generate GOV.UK-compliant error messages for each inferred validation rule, using the field label to create specific messages.
4. THE Form_Builder SHALL flag inferred rules with a confidence indicator so the Service_Owner can prioritise review.

### Requirement 4: Page Flow Generation

**User Story:** As a Service_Owner, I want the builder to suggest a sensible page-by-page flow from the PDF's sections, so that the digital form follows the "one thing per page" principle without manual restructuring.

#### Acceptance Criteria

1. THE Form_Builder SHALL group extracted fields into Page_Definitions following the "one thing per page" principle, placing closely related fields (e.g. address lines) on the same page.
2. THE Form_Builder SHALL order pages in a logical sequence based on the Source_Document's layout.
3. WHEN the Source_Document contains conditional sections (e.g. "If yes, provide details"), THE Form_Builder SHALL generate Flow_Logic rules to conditionally show or skip the corresponding page.
4. THE Form_Builder SHALL generate Start_Page metadata (service name, description, eligibility, what you will need) from the Source_Document's title and introductory text.

### Requirement 5: Schema Review and Editing

**User Story:** As a Service_Owner, I want to review and edit the generated schema before publishing, so that I can correct any mistakes the builder made and refine the user journey.

#### Acceptance Criteria

1. THE Form_Builder SHALL present the generated Form_Schema to the Service_Owner for review before it is used by the Form_Renderer.
2. THE Form_Builder SHALL highlight fields and rules that were inferred with low confidence, so the Service_Owner can prioritise review.
3. THE Form_Builder SHALL allow the Service_Owner to edit field labels, types, validation rules, page groupings, and flow logic in the generated Form_Schema.
4. THE Form_Builder SHALL validate the edited Form_Schema against the platform's schema specification and report any errors before saving.
5. WHEN the Service_Owner confirms the schema, THE Form_Builder SHALL save it in the format accepted by the Form_Renderer.

### Requirement 6: Round-Trip Schema Fidelity

**User Story:** As a Service_Owner, I want confidence that the generated schema accurately represents the original form, so that no fields or rules are lost in translation.

#### Acceptance Criteria

1. FOR ALL fields present in the Source_Document, THE Form_Builder SHALL include a corresponding Field_Definition in the generated Form_Schema.
2. THE Form_Builder SHALL produce a mapping report listing each Source_Document field alongside its corresponding Field_Definition, field type, and any inferred validation rules.
3. THE Form_Builder SHALL flag any Source_Document fields that could not be mapped to a supported field type.

---

## Part C: Form Renderer — Platform Requirements

### Requirement 7: Schema-Driven Form Rendering

**User Story:** As a Service_Owner, I want to define a form as a structured schema, so that the platform can generate a complete digital service without custom code for each form.

#### Acceptance Criteria

1. THE Form_Platform SHALL accept a Form_Schema defined in a structured, open format (JSON).
2. THE Form_Platform SHALL render a complete multi-page form journey from a valid Form_Schema, including Start_Page, Form_Pages, Check_Answers_Page, and Confirmation_Page.
3. THE Form_Schema SHALL support the following field types: text, textarea, number, date (day/month/year), radio, checkbox, select, and address.
4. WHEN a Form_Schema contains an invalid or missing required property, THE Form_Platform SHALL report a descriptive error identifying the problem.

### Requirement 8: Page Flow and Conditional Logic

**User Story:** As a Service_Owner, I want to define conditional page flows in the schema, so that applicants only see questions relevant to their situation.

#### Acceptance Criteria

1. THE Form_Schema SHALL support Page_Definitions that group one or more Field_Definitions into a single page.
2. THE Form_Schema SHALL support Flow_Logic rules that conditionally show or skip pages based on the Applicant's previous answers.
3. WHEN a page is skipped due to Flow_Logic, THE Form_Platform SHALL not display that page and SHALL not require its fields to be completed.
4. WHEN the Applicant navigates back through the form, THE Form_Platform SHALL respect Flow_Logic and skip pages that are not applicable based on current answers.
5. THE Form_Platform SHALL present pages in the order defined in the Form_Schema, subject to Flow_Logic conditions.

### Requirement 9: Validation Rules Engine

**User Story:** As a Service_Owner, I want to define validation rules in the schema, so that applicants receive clear feedback without custom validation code.

#### Acceptance Criteria

1. THE Form_Schema SHALL support the following validation rule types per field: required, minLength, maxLength, pattern (regex), min, max, minDate, maxDate, and custom error messages.
2. WHEN a Field_Definition includes a "required" rule, THE Form_Platform SHALL validate that the field has a value before allowing the Applicant to continue.
3. WHEN a Field_Definition includes a custom error message, THE Form_Platform SHALL display that message instead of a generic default.
4. THE Form_Platform SHALL support age-based validation for date fields (e.g. "must be 18 or over") as a configurable rule in the Form_Schema.
5. THE Form_Platform SHALL validate inputs on the client side to provide immediate feedback, while not relying solely on client-side validation for data integrity.

### Requirement 10: Start Page Generation

**User Story:** As an Applicant, I want to understand what the service is and what I will need before I start, so that I do not waste time on a form I cannot complete.

#### Acceptance Criteria

1. THE Form_Platform SHALL generate a Start_Page from metadata in the Form_Schema, including: service name, description, eligibility criteria, and a list of what the Applicant will need.
2. THE Start_Page SHALL display a "Start now" button that navigates to the first Form_Page.
3. THE Start_Page SHALL follow the GOV.UK_Design_System start page pattern.

### Requirement 11: Check Your Answers Generation

**User Story:** As an Applicant, I want to review all my answers before submitting, so that I can correct any mistakes.

#### Acceptance Criteria

1. THE Form_Platform SHALL automatically generate a Check_Answers_Page from the Form_Schema, showing all answers the Applicant has entered.
2. THE Check_Answers_Page SHALL group answers by page with labels matching the original Form_Page questions.
3. WHEN the Applicant selects a "Change" link next to an answer, THE Form_Platform SHALL navigate to the corresponding Form_Page with the existing value pre-filled.
4. WHEN the Applicant changes an answer and continues from a Form_Page reached via the Check_Answers_Page, THE Form_Platform SHALL return the Applicant to the Check_Answers_Page.
5. THE Check_Answers_Page SHALL display a "Submit" button with a label configurable in the Form_Schema (e.g. "Submit application", "Send report").
6. WHEN Flow_Logic has caused pages to be skipped, THE Check_Answers_Page SHALL not display answers for skipped pages.

### Requirement 12: Submission and Confirmation

**User Story:** As an Applicant, I want to receive confirmation that my form has been submitted, so that I have confidence it was received.

#### Acceptance Criteria

1. WHEN the Applicant selects the submit button on the Check_Answers_Page, THE Form_Platform SHALL generate a unique Reference_Number for the submission.
2. WHEN submission is complete, THE Form_Platform SHALL display the Confirmation_Page with the Reference_Number in a GOV.UK-style confirmation banner.
3. THE Form_Schema SHALL support configurable confirmation page content, including "what happens next" guidance text.
4. THE Confirmation_Page SHALL advise the Applicant to save or note the Reference_Number.
5. THE Form_Platform SHALL store the submitted data as a structured JSON record.

### Requirement 13: Client-Side Validation and Error Display

**User Story:** As an Applicant, I want to see clear, specific error messages when I make a mistake, so that I can correct my answers without confusion.

#### Acceptance Criteria

1. WHEN the Applicant submits a Form_Page with one or more validation errors, THE Form_Platform SHALL display an Error_Summary at the top of the page listing each error as a link to the corresponding field.
2. WHEN the Applicant submits a Form_Page with one or more validation errors, THE Form_Platform SHALL display an inline error message next to each field that has an error.
3. WHEN a Form_Page contains validation errors, THE Form_Platform SHALL prefix the page title with "Error: " to ensure screen readers announce the error state.
4. THE Form_Platform SHALL associate each inline error message with its corresponding input using aria-describedby attributes.

### Requirement 14: Accessibility

**User Story:** As an Applicant who uses assistive technology, I want the service to be fully accessible, so that I can complete the form independently.

#### Acceptance Criteria

1. THE Form_Platform SHALL render all pages navigable using only a keyboard, with a visible focus indicator on all interactive elements.
2. THE Form_Platform SHALL associate every form input with a visible label using matching for and id attributes.
3. THE Form_Platform SHALL meet WCAG 2.2 Level AA colour contrast requirements for all text and interactive elements.
4. WHEN the Error_Summary is displayed, THE Form_Platform SHALL move keyboard focus to the Error_Summary so that screen readers announce the errors immediately.
5. THE Form_Platform SHALL use semantic HTML elements (headings, fieldsets, legends) to convey page structure to assistive technology.
6. THE Form_Platform SHALL not rely on colour alone to convey information (e.g. error states shall use text labels in addition to colour).
7. THE Form_Platform SHALL ensure all pages have a unique, descriptive page title that reflects the current step and the service name.

### Requirement 15: Responsive Design

**User Story:** As an Applicant on a mobile device, I want the service to work well on any screen size, so that I can complete the form on my phone.

#### Acceptance Criteria

1. THE Form_Platform SHALL render all pages correctly on viewport widths from 320px to 1200px.
2. THE Form_Platform SHALL use GOV.UK_Design_System responsive typography and spacing classes.
3. THE Form_Platform SHALL ensure all touch targets are at least 44px by 44px on mobile viewports.

### Requirement 16: Structured Data Output for Caseworkers

**User Story:** As a Caseworker, I want to receive form submissions in a structured format, so that I can process them efficiently without manual data entry.

#### Acceptance Criteria

1. THE Form_Platform SHALL store each submission as a structured JSON record containing all field values, the reference number, and a submission timestamp.
2. THE Form_Platform SHALL make submitted data retrievable by Reference_Number.
3. THE Form_Platform SHALL store data in an open, non-proprietary format to support interoperability, in line with TCoP point 4 (open standards).

### Requirement 17: Security and Privacy

**User Story:** As an Applicant, I want my personal data to be handled securely, so that I can trust the service with my information.

#### Acceptance Criteria

1. THE Form_Platform SHALL not store personal data in client-side storage (localStorage, cookies) beyond the active session.
2. THE Form_Platform SHALL clear Session_State data after the Applicant completes submission or after a period of inactivity.
3. THE Form_Platform SHALL transmit all data over HTTPS.
4. THE Form_Platform SHALL not expose personal data in URL parameters.
5. THE Form_Platform SHALL collect only the data defined in the Form_Schema, in line with data minimisation principles (TCoP7).

### Requirement 18: Open Source and Open Standards

**User Story:** As a Service_Owner, I want the platform to use open source technology and open standards, so that it can be reused, adapted, and maintained without vendor lock-in.

#### Acceptance Criteria

1. THE Form_Platform SHALL be built using open source frameworks and libraries.
2. THE Form_Platform SHALL use the GOV.UK Frontend toolkit (govuk-frontend) for all UI components and styles.
3. THE Form_Platform SHALL use semantic, standards-compliant HTML5.
4. THE Form_Platform SHALL structure its codebase so that it can be published as open source, with no embedded secrets or credentials.

### Requirement 19: Acknowledgement Notification

**User Story:** As an Applicant, I want to receive an acknowledgement after submitting my form, so that I have a record of my submission outside the browser.

#### Acceptance Criteria

1. WHEN a submission is complete, THE Form_Platform SHALL send an Acknowledgement_Notification to the Applicant containing the Reference_Number, the service name, and a summary of what happens next.
2. THE Form_Schema SHALL support a configurable email address field that the Form_Platform uses as the notification destination.
3. THE Acknowledgement_Notification SHALL not include the full submitted data, to minimise exposure of personal information in transit.
4. THE Acknowledgement_Notification SHALL include a link to the Status_Tracker where the Applicant can check progress.

### Requirement 20: Application Status Tracking

**User Story:** As an Applicant, I want to check the status of my submission using my reference number, so that I do not need to phone or email the department for updates.

#### Acceptance Criteria

1. THE Form_Platform SHALL provide a Status_Tracker page where the Applicant can enter a Reference_Number to view the current Submission_Status.
2. THE Status_Tracker SHALL display the current Submission_Status, the date of submission, and the date of the most recent status change.
3. THE Status_Tracker SHALL not display the full submitted data, only the status and key dates.
4. IF the Applicant enters an invalid or unrecognised Reference_Number, THEN THE Status_Tracker SHALL display the message "Reference number not found. Check the number and try again."

### Requirement 21: Caseworker Dashboard

**User Story:** As a Caseworker, I want a dashboard to view and manage submitted applications, so that I can process them efficiently and track my workload.

#### Acceptance Criteria

1. THE Form_Platform SHALL provide a Case_Dashboard that lists all submissions for a given Form_Schema.
2. THE Case_Dashboard SHALL display each submission's Reference_Number, Applicant name, submission date, and current Submission_Status.
3. THE Case_Dashboard SHALL allow the Caseworker to filter submissions by Submission_Status.
4. THE Case_Dashboard SHALL allow the Caseworker to search submissions by Reference_Number or Applicant name.
5. WHEN the Caseworker selects a submission, THE Case_Dashboard SHALL display the full structured data for that submission.

### Requirement 22: Caseworker Status Management

**User Story:** As a Caseworker, I want to update the status of an application, so that the Applicant can track progress and I can manage my caseload.

#### Acceptance Criteria

1. THE Case_Dashboard SHALL allow the Caseworker to update the Submission_Status of a submission to one of: Received, In Review, Approved, Rejected, or Requires Information.
2. WHEN the Caseworker updates a Submission_Status, THE Form_Platform SHALL record the new status, the timestamp, and the Caseworker's identity.
3. WHEN the Submission_Status changes, THE Form_Platform SHALL send a notification to the Applicant informing them of the new status.
4. WHEN the Caseworker sets the status to "Requires Information", THE Case_Dashboard SHALL allow the Caseworker to enter a message describing what additional information is needed.

---

## Part D: FORM-LIC-001 — Licence Application (Reference Implementation)

The following requirements define the specific Form_Schema for the licence application, serving as the first form digitised by the platform.

### Requirement 23: Licence Application Start Page

**User Story:** As an Applicant, I want to understand the licence application process before I begin, so that I know what to expect and what I need.

#### Acceptance Criteria

1. THE Form_Instance for FORM-LIC-001 SHALL display a Start_Page with the service name "Apply for a licence".
2. THE Start_Page SHALL list what the Applicant will need: licence type, previous licence number (if applicable), full name, date of birth, and address.
3. THE Start_Page SHALL state that the Applicant must be 18 or over to apply.

### Requirement 24: Licence Type Selection

**User Story:** As an Applicant, I want to select the type of licence I am applying for first, so that the service can tailor subsequent questions to my application type.

#### Acceptance Criteria

1. THE Form_Instance SHALL display three radio button options on the licence type Form_Page: "Personal", "Premises", and "Event".
2. WHEN the Applicant submits the licence type Form_Page without selecting a Licence_Type, THE Form_Instance SHALL display the error message "Select a licence type".
3. THE Form_Instance SHALL display hint text on the licence type Form_Page explaining each option.

### Requirement 25: Previous Licence Number (Conditional)

**User Story:** As an Applicant who holds an existing licence, I want to provide my previous licence number, so that the caseworker can link my application to existing records.

#### Acceptance Criteria

1. THE Form_Instance SHALL ask the Applicant "Do you have a previous licence number?" with radio options "Yes" and "No".
2. WHEN the Applicant selects "Yes", THE Form_Instance SHALL display a text input labelled "Previous licence number".
3. WHEN the Applicant selects "Yes" and submits without entering a licence number, THE Form_Instance SHALL display the error message "Enter your previous licence number".
4. WHEN the Applicant submits without selecting either option, THE Form_Instance SHALL display the error message "Select whether you have a previous licence number".
5. WHEN the Applicant selects "No" and continues, THE Form_Instance SHALL navigate to the next Form_Page without requiring a licence number.

### Requirement 26: Full Name

**User Story:** As an Applicant, I want to enter my full name, so that my licence application is associated with my identity.

#### Acceptance Criteria

1. THE Form_Instance SHALL display a text input labelled "Full name" on the full name Form_Page.
2. WHEN the Applicant submits the full name Form_Page without entering a value, THE Form_Instance SHALL display the error message "Enter your full name".

### Requirement 27: Date of Birth with Age Check

**User Story:** As an Applicant, I want to enter my date of birth, so that the service can verify I meet the minimum age requirement.

#### Acceptance Criteria

1. THE Form_Instance SHALL display three separate inputs for day, month, and year, following the GOV.UK_Design_System date input pattern.
2. THE Form_Instance SHALL display hint text "For example, 27 3 2000" below the date of birth label.
3. WHEN the Applicant submits without entering any date fields, THE Form_Instance SHALL display the error message "Enter your date of birth".
4. WHEN the Applicant enters a date that is not a valid calendar date, THE Form_Instance SHALL display the error message "Date of birth must be a real date".
5. WHEN the Applicant enters a date in the future, THE Form_Instance SHALL display the error message "Date of birth must be in the past".
6. WHEN the Applicant enters a date indicating the Applicant is under 18, THE Form_Instance SHALL display the error message "You must be 18 or over to apply for this licence".

### Requirement 28: Address with Postcode Lookup

**User Story:** As an Applicant, I want to find my address by entering my postcode, so that I can complete the address section quickly and accurately.

#### Acceptance Criteria

1. THE Form_Instance SHALL display a postcode input and a "Find address" button on the address Form_Page.
2. WHEN the Applicant enters a valid Postcode and selects "Find address", THE Form_Instance SHALL display a dropdown of matching addresses.
3. WHEN the Applicant selects an address from the dropdown, THE Form_Instance SHALL populate the address fields with the selected address.
4. THE Form_Instance SHALL display an "Enter address manually" link that reveals five text inputs: "Address line 1", "Address line 2", "Town or city", "County", and "Postcode".
5. WHEN the Applicant submits without Address line 1, THE Form_Instance SHALL display the error message "Enter address line 1, typically the building and street".
6. WHEN the Applicant submits without Town or city, THE Form_Instance SHALL display the error message "Enter town or city".
7. WHEN the Applicant submits without Postcode, THE Form_Instance SHALL display the error message "Enter postcode".
8. THE Form_Instance SHALL treat Address line 2 and County as optional fields.
9. IF the Address_Lookup service is unavailable, THEN THE Form_Instance SHALL display the manual address entry fields with the message "Address lookup is currently unavailable. Please enter your address manually."

### Requirement 29: Declaration

**User Story:** As an Applicant, I want to confirm that the information I have provided is correct, so that I can formally declare the accuracy of my application.

#### Acceptance Criteria

1. THE Form_Instance SHALL display a checkbox labelled "I confirm that the information I have provided is correct to the best of my knowledge".
2. WHEN the Applicant submits without checking the Declaration checkbox, THE Form_Instance SHALL display the error message "You must confirm that the information you have provided is correct".

### Requirement 30: Licence Application Confirmation

**User Story:** As an Applicant, I want to see confirmation of my licence application with clear next steps.

#### Acceptance Criteria

1. THE Form_Instance SHALL display a Confirmation_Page with the heading "Application submitted" and the Reference_Number.
2. THE Confirmation_Page SHALL state that the licensing authority will process the application within 10 working days.
3. THE Confirmation_Page SHALL provide contact details for the licensing authority for enquiries.


### Requirement 31: Licence Application Acknowledgement Email

**User Story:** As an Applicant, I want to receive an email confirming my licence application was received, so that I have a record I can refer back to.

#### Acceptance Criteria

1. WHEN the licence application is submitted, THE Form_Instance SHALL send an Acknowledgement_Notification to the Applicant's email address.
2. THE Acknowledgement_Notification SHALL include: the Reference_Number, the text "Apply for a licence — application received", the date of submission, and a link to the Status_Tracker.
3. THE Acknowledgement_Notification SHALL state that the licensing authority aims to process applications within 10 working days.

### Requirement 32: Licence Application Email Collection

**User Story:** As an Applicant, I want to provide my email address during the application, so that I can receive acknowledgement and status updates.

#### Acceptance Criteria

1. THE Form_Instance SHALL include an email address Form_Page after the address page and before the declaration page.
2. THE Form_Instance SHALL display a text input labelled "Email address" with hint text "We will use this to send you updates about your application".
3. WHEN the Applicant submits the email Form_Page without entering a value, THE Form_Instance SHALL display the error message "Enter your email address".
4. WHEN the Applicant enters a value that is not a valid email format, THE Form_Instance SHALL display the error message "Enter an email address in the correct format, like name@example.com".
