# AI Engineering Lab Hackathon: participant reference

Keep this open throughout the day.

---

## The day at a glance

| Time | What happens |
|------|--------------|
| 08:30 | Arrival, registration and breakfast |
| 09:00 | Welcome and kick-off |
| 09:15 | Problem selection and team planning |
| 09:45 | Lightning talk: Version 1 (theme TBC) |
| 09:55 | Build phase |
| 11:00 | Morning break |
| 11:30 | Lightning talk: AWS (theme TBC) |
| 11:40 | Build phase (continued) |
| 12:30 | Lunch break (optional working break) |
| 13:45 | Lightning talk: Anthropic (theme TBC) |
| 13:55 | Build phase (resumed) |
| 14:30 | Afternoon break |
| 14:45 | Lightning talk: Google (theme TBC) |
| 14:55 | Build phase (final stretch) |
| 15:30 | Final review — judges return to teams for rubric scoring |
| 16:15 | Lightning talk: Microsoft (theme TBC; during results tabulation) |
| 16:30 | Winners announced and wrap-up |
| 16:40 | Hard finish |

---

## The challenges

The four challenges below are provided as examples. You are not required to use them. If your team has a problem from your own work that you would rather tackle, bring it — teams are actively encouraged to do this.

To propose an open brief, speak to a facilitator before 10:00. Your problem must be achievable as a working prototype in one day and use open or synthetic data. See `open-brief.md` for guidance on framing your problem and prompts to help you get started. If you are unsure whether your idea is suitable, speak to your FDE.

You are using AI coding tools to build your prototype. The event does not provide access to AI models for use within your application. If you have your own model access or want to mock AI capabilities, that is fine.

Challenge 1: From PDF to digital service — citizens downloading, printing, filling in by hand, and posting forms back. No confirmation, no status updates, manual processing at every step. This challenge is about what a genuinely better experience looks like for the person submitting and the person receiving. A good starting point if your team is newer to AI coding tools. Use `challenge-1/FORM-LIC-001-licence-application.pdf` as the default sample form.

Challenge 2: Unlocking the dark data — government guidance and policy exists but is not findable. Citizens cannot get a direct answer. Officials locate the right paragraph by opening dozens of documents. The GOV.UK App is building chat capabilities that depend on this content being structured. This challenge is about making that possible.

Challenge 3: Supporting casework decisions — caseworkers spend a significant part of their day on information-gathering that follows predictable patterns, leaving less time for the judgement and decision-making that genuinely requires a person. This challenge is about giving caseworkers the right information at the right moment, and giving team leaders visibility of where cases are at risk.

Challenge 4: Knowing your own organisation — workforce and operational data exists but is scattered across systems that do not talk to each other. Leaders make decisions without a clear picture. Operational teams know where the pressure is but cannot surface it in a form that anyone can act on. This challenge is about making that picture visible.

You may change your challenge before 11:00. Speak to your FDE.

---

## Judging

Scoring runs throughout the day via a live dashboard. Your team earns points for reaching milestones during the build phase, such as setting up your repository, producing a first working prototype, and demonstrating a complete user journey.

After the build phase closes, judge pairs visit every team at your table. Each pair asks a consistent set of questions about what you built, how you used AI tools, and what you would do next. They score against a simple rubric.

Your final score combines your milestone points with the judge review. There are no stage presentations. Judges want honesty. A clear explanation of what you tried and what failed scores better than a polished story that glosses over the hard parts.

---

## Getting the most from your AI tool

The [AI Engineering Lab repository](https://github.com/govuk-digital-backbone/aiengineeringlab) has resources and guidance on AI coding tools. The prompts below are starting points — adapt them to your tool and your challenge.

### Prompting for planning

Before writing any code, use your AI tool to help scope the problem:

- `We are building [description]. What are the core components we need to build in one day?`
- `What is the simplest version of this that would work as a demo?`
- `What open data sources could we use for [problem area]?`

### Prompting for building

Give your tool context before asking it to write code:

- `We are building a [description] using [language/framework]. Here is the structure so far: [paste relevant code or file list]. Now help me implement [specific feature].`
- `Write a function that [specific behaviour]. It should handle the case where [edge case].`
- `Explain what this code does and suggest how to simplify it.`

### Prompting for testing

Use prompts such as:

- `Write a test for this function that covers the happy path and the case where [input is invalid].`
- `What could go wrong with this code? What would you test?`

### Prompting for your judge review

Use prompts such as:

- `Summarise what this prototype does in two sentences for a non-technical audience.`
- `What are the limitations of this approach that I should be honest about?`

### When your tool gives you something wrong

Refine rather than restart:

- `That is not quite right. The issue is [specific problem]. Try again with [constraint].`
- `This uses [pattern I do not want]. Rewrite it using [preferred approach] instead.`

---

## During the build phase

Your assigned Forward Deployed Engineer (FDE) from Version 1 checks in with your team regularly throughout the day. FDEs are experienced engineers who can help you scope your approach, unblock technical problems, and point you to the hints in your challenge brief. They will not write your code for you, but they can help you make decisions when you are stuck. There is an optional informal check-in at lunch to surface blockers. If you are stuck at any point, speak to your FDE — they are your first point of contact.

---

## Build phase closes at 15:00

At 15:00, stop building. Share your work with your FDE — send a zip file by email or Microsoft Teams, or share a GitHub repository URL if you have access to github.com. GitHub access is not required. Prepare a brief summary of what you have built.

You will not be able to update your submission after 15:00. Judge pairs begin visiting teams at 15:30.

---

## If you get stuck

Your assigned FDE is your first point of contact. You can also ask at the support desk.

Common situations:

- stuck on a technical problem — describe what you are trying to do and what is not working. An FDE can help you unblock or rescope
- AI tool not working — go to the support desk. Vendors are present and can help
- team disagreement on direction — speak to your FDE. Rescoping by 14:30 is better than presenting something half-finished
- running out of time — cut scope, not quality. A small thing that works is better than a large thing that does not

---

## Useful data sources

Some starting points:

- GOV.UK open data — https://data.gov.uk
- Office for National Statistics — https://www.ons.gov.uk
- local authority open data portals
- synthetic data is acceptable if real data raises security concerns

---

## Feedback survey

Please complete the feedback survey before you leave. It takes about five minutes. Your responses help us improve future events and report outcomes to DSIT.

The survey link and QR code will be displayed on screen at the close of the event. You can also access it here:

[AI Engineering Lab hackathon feedback survey](insert-survey-url)

---
Version: 1.0
Last updated: April 2026
