# Challenge 1: From PDF to digital service

Think about the last time you needed to do something official — apply for a permit, report an incident, claim expenses. In many parts of government, that process still looks like this: find the right form on a website, download a PDF, print it, fill it in by hand, scan it, and post or email it back. Then wait. You receive no confirmation it arrived. You have no idea where your application is. If something is missing, you find out weeks later by letter.

This is not a niche edge case. PDF-based processes are one of the most widespread patterns across government, used for everything from licence applications and regulatory reporting to internal HR requests and approval workflows.

## The experience today

A citizen needs to apply for a local licence. They find a page on a government website that links to a PDF. They download it. They do not have a printer. They find one at a library. They complete the form in pen, not sure whether they have answered every section correctly — there is no validation, no guidance for edge cases, no way to save progress. They scan it on their phone. The scan is slightly blurry. They email it to an address listed on the form.

A week later they have heard nothing. There is no reference number, no acknowledgement, no way to check status. They call the department to ask. The person who answers has to find the form in an email inbox shared by the team.

Internally, the receiving team manually reviews each submission, re-enters information into a case management system, and follows up by phone or post when something is missing. Every step is manual. Every error or omission adds days.

## The users

**The applicant** — a citizen or business trying to complete a government process. They may be on a mobile device. They may have a visual impairment or use assistive technology. They may be under time pressure. They may be anxious about getting it right. They want confidence that their submission has been received and is being processed.

**The caseworker or processing officer** — receives submissions and has to act on them. They deal with incomplete forms, illegible handwriting, and missing documents. They spend time on data entry that adds no value to the decision they eventually need to make.

**The service owner or team manager** — responsible for a process that generates complaints, backlogs, and avoidable contact. They know the PDF approach is not working but do not have the technical capacity to change it without help.

## Why this matters

PDF forms create real barriers. They exclude users who do not have a printer, who struggle with handwriting, or who rely on assistive technology that cannot interact with a PDF. They generate avoidable errors because they cannot validate input. They create processing overhead because every submission has to be handled manually.

A well-designed digital service removes most of these barriers. It works on any device. It validates as you go. It gives the user a reference number and a confirmation. It sends the receiving team structured, complete data rather than a scanned image.

Replacing a single high-volume PDF form with a working digital service can have a measurable impact on processing time, error rates, and the experience of everyone who interacts with it.

## Provided sample form for this challenge

For Challenge 1, start with the sample file in this repository:

`challenge-1/FORM-LIC-001-licence-application.pdf`

Use this as your baseline input when analysing the current journey and generating a digital replacement.

## Finding a form to work with

You already have a starter file for this challenge (`challenge-1/FORM-LIC-001-licence-application.pdf`), but you can also use one of the approaches below.

**Use a form from your own work.** If you work with a PDF-based process in your department, that is an ideal starting point. You already understand the user and the problem.

**Search GOV.UK.** Search for terms like "apply for a licence", "report an incident", "claim expenses government form", or "application form PDF site:gov.uk". Most policy areas have at least one PDF-based process still in use.

**Use one of the field descriptions below.** If you want to get straight into building, use your AI coding tool with one of these fictional form descriptions:

*Licence application* — fields: full name (required), date of birth (required, must be 18+), address (4 lines plus postcode, required), licence type (select one: personal, premises, event), previous licence number (optional), declaration checkbox (required).

*Incident report* — fields: reporter name (required), date of incident (required), location (required), incident type (select: near miss, injury, property damage, other), description (free text, required), severity (select: low, medium, high, critical), immediate action taken (free text), witnesses (optional).

*Expenses claim* — fields: claimant name (required), grade (required), claim period (date range, required), expense line items (up to 10 rows: date, description, category, amount), total (calculated), receipts attached (checkbox), manager approval name (required).

**Generate your own.** Use your AI coding tool to create a fictional form in a policy area that interests you or relates to your work:

```
Generate a realistic government PDF form description for a
[type of application] process. Include: a list of all fields
with their types (text, date, dropdown, checkbox), which fields
are required, any validation rules (character limits, age checks,
format requirements), and any conditional logic (e.g. field X
only appears if field Y is answered a certain way).
```

---

<details>
<summary><strong>Hint 1 — Explore the problem: who uses this form and what goes wrong?</strong></summary>

Before writing any code, use your AI coding tool to map out the current experience for both the person submitting and the person receiving.

```
I am designing a digital replacement for a government PDF form
for a licence application. Walk me through every step a user
takes today, from finding the form to receiving a response.
Where are the friction points? Where might someone give up?
```

```
What types of users might find this PDF form particularly
difficult to complete? Consider: people on mobile devices,
people with visual impairments, people whose first language is
not English, people without a printer. What specific barriers
does each face?
```

```
What does the experience look like for the person or team
receiving this form? What information do they need to process
it? What typically goes wrong with manual submissions?
```

</details>

<details>
<summary><strong>Hint 2 — Possible directions and design questions</strong></summary>

Once you understand the problem, you will have a better sense of what to build. Some directions teams have taken with this type of challenge:

**Make it work end to end.** The most important thing is that a user can start, complete, and submit the form — and receive meaningful confirmation that it has been received. A form that works end to end for a single journey is more valuable than one that partially covers several.

**Design for the user who will find it hardest.** If your form works well for a user with a visual impairment using a screen reader, it will work well for everyone. Accessibility is not a finishing step — it shapes how you structure the form from the start.

**Follow GOV.UK patterns.** The GOV.UK Design System has established patterns for every common form component: text inputs, dates, radios, checkboxes, error messages, confirmation pages. These patterns exist because they have been tested extensively with real users. Use them rather than inventing your own.

**Think about the "one thing per page" principle.** GOV.UK services typically ask one question per page. This makes it easier for users to focus, easier to handle errors, and easier to navigate back and change answers. It also makes the service easier to iterate on later.

**Consider what happens after submission.** Even a simple confirmation page with a reference number transforms the experience for the user. If you have time, think about what an acknowledgement email would say.

</details>

<details>
<summary><strong>Hint 3 — A starting point with specific prompts</strong></summary>

If your team wants a concrete direction to begin from, here is one approach.

Open `challenge-1/FORM-LIC-001-licence-application.pdf` and note the fields, their types, and any validation rules (required fields, age checks, format constraints).

Give your AI coding tool the form details and ask it to generate a starting point:

```
I have a government PDF form for a licence application. It has
these fields:
- Full name (required, text)
- Date of birth (required, date, must be 18 or over)
- Address (required, text — four lines plus postcode)
- Licence type (required, select one: personal, premises, event)
- Declaration checkbox (required, must be checked to submit)

Build a web-based form that follows the GOV.UK Design System.
Use the GOV.UK Frontend toolkit or replicate the styling. Include
client-side validation with GOV.UK-style error messages, and a
confirmation page at the end. Make it keyboard navigable.
```

From there, you might focus on:

- Making the error messages specific and helpful ("Enter your date of birth" not "This field is required")
- Converting to a multi-page flow with one question per page
- Adding a "check your answers" page before the confirmation
- Running an accessibility audit and documenting what you find

```
Audit this HTML form for WCAG 2.2 compliance. Check: all fields
have visible labels linked with for/id, error messages use
aria-describedby, the error summary is focused on submission,
colour contrast meets AA standards, and the form is fully
keyboard navigable. List any issues found.
```

The GOV.UK Prototype Kit is also available if your team would prefer a rapid prototyping environment over a custom build.

</details>

## What does a good outcome look like?

By the end of the day, you should be able to show a form that a real user could complete from start to finish, with a clear explanation of which process it replaces and why the digital version is better. A working journey with meaningful validation and a confirmation page is a complete demo. If you can also speak to the accessibility of what you built — what you checked, what you found, what you would fix — that is a strong outcome.

## Useful references

- GOV.UK Design System — https://design-system.service.gov.uk — component library, patterns, and styles
- GOV.UK Prototype Kit — https://prototype-kit.service.gov.uk — rapid prototyping tool for government services
- GOV.UK Frontend on npm — https://www.npmjs.com/package/govuk-frontend — the CSS and JavaScript toolkit
- WCAG 2.2 quick reference — https://www.w3.org/WAI/WCAG22/quickref/

---
Version: 1.1
Last updated: April 2026
