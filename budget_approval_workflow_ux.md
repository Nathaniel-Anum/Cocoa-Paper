# Budget Approval Workflow UX

## Overview

This document defines a five-step budget approval workflow for budgets tied to a financial year. The workflow is designed to make the current status, required actions, review history, and approval path easy to identify.

The five main steps are:

1. Draft
2. Submitted
3. Committee Review
4. Recommended
5. Approved

Each budget must retain its original submission, committee revisions, recommendation, approval decision, comments, and audit history.

---

## Recommended Status Colours

| Status | Colour | Meaning |
|---|---|---|
| Not started | Grey | The workflow step has not started |
| Current / In progress | Blue | The budget is currently at this step |
| Completed | Green | The workflow step has been completed |
| Returned for correction | Amber | The budget requires changes before continuing |
| Rejected | Red | The budget has been rejected |

Recommended UI indicators:

- Completed step: green checkmark
- Current step: blue filled circle or highlighted card
- Future step: grey outline
- Returned state: amber warning icon
- Rejected state: red error icon

---

# Workflow Progress Tracker

Display this tracker at the top of every budget page:

```text
✓ Draft ── ✓ Submitted ── ● Committee Review ── ○ Recommended ── ○ Approved
```

Legend:

```text
✓ Completed
● Current step
○ Not started
```

Each completed step should be clickable so users can view its historical version without changing the current workflow state.

Example:

```text
✓ Submitted
20 July 2026
By Nathaniel Mensah
```

Current step example:

```text
● Committee Review
In progress
3 committee members reviewing
```

---

# Step 1 — Draft

## Purpose

The budget preparer creates, uploads, validates, and reviews the budget before submitting it.

## Page Header

```text
Step 1 of 5
Draft Budget

Prepare and validate the budget before submitting it for committee review.
```

## Information Displayed

- Budget name
- Financial year
- Organisation or department
- Budget preparer
- Budget lines
- Proposed budget total
- Previous approved budget total
- Supporting documents
- Validation status
- Last saved date

## Budget Information Example

```text
Budget Name: 2027 Annual Budget
Financial Year: 2027
Department: Finance Department
Prepared By: Nathaniel Mensah
```

## Budget Line Table

| Account | Description | Previous Budget | Proposed Amount | Difference |
|---|---|---:|---:|---:|
| 10101 | Salaries | GHS 1,000,000 | GHS 1,200,000 | +GHS 200,000 |
| 20204 | Training | GHS 100,000 | GHS 125,000 | +GHS 25,000 |

## Available Actions

The preparer can:

- Create or upload a budget
- Select the financial year
- Add budget lines
- Edit budget lines
- Remove budget lines
- Import budget lines from a file
- Copy the previous approved budget
- Compare the current proposal with the previous approved budget
- Upload supporting documents
- Save the draft
- Preview the budget
- Submit the budget for review

## Validation Checklist

```text
✓ Financial year selected
✓ Required budget lines completed
✓ Budget total calculated
✓ Supporting document uploaded
✕ Two budget lines are missing account codes
```

The Submit for Review action should remain disabled while mandatory validation errors exist.

## Main Actions

```text
[Save Draft] [Preview Budget] [Submit for Review]
```

## Submission Confirmation

```text
Submit budget for review?

After submission, this version will be locked and sent to the committee.
You will not be able to edit it unless it is returned for correction.

[Cancel] [Confirm Submission]
```

---

# Step 2 — Submitted

## Purpose

The original submitted budget is locked and waits for committee review.

## Page Header

```text
Step 2 of 5
Budget Submitted

The budget was submitted successfully and is awaiting committee review.
```

## Information Displayed

```text
Submitted by: Nathaniel Mensah
Submitted on: 20 July 2026, 10:45 AM
Submitted total: GHS 5,000,000
Version: Submitted Version 1
Review status: Awaiting committee review
```

## Locked Submission Notice

```text
This submitted version is locked.

Committee changes will be made in a separate revision.
The original submission will remain available for audit purposes.
```

## Budget Preparer Actions

```text
[View Submitted Budget]
[Download Submission]
[View Previous-Year Comparison]
```

A withdrawal action may be available before committee review starts:

```text
[Withdraw Submission]
```

Once committee review begins, withdrawal should be disabled.

## Committee Action

```text
[Start Committee Review]
```

Starting committee review creates a separate version:

```text
Submitted Version 1
        ↓ copied into
Committee Revision Version 2
```

The submitted version must never be overwritten.

---

# Step 3 — Committee Review

## Purpose

Committee members review the submitted budget, revise budget lines, request information, and record reasons for all changes.

## Page Header

```text
Step 3 of 5
Committee Review

The committee is reviewing the submitted budget and preparing its recommended version.
```

## Budget Summary

```text
-------------------------------------------------------
| Budget Summary                                     |
-------------------------------------------------------
| Submitted Total          GHS 5,000,000             |
| Committee Revision       GHS 4,650,000             |
| Previous Year Approved   GHS 4,400,000             |
| Change from Submission   -GHS 350,000 (-7%)        |
-------------------------------------------------------
```

## Recommended Tabs

```text
[Submitted Budget]
[Committee Revision]
[Previous-Year Comparison]
[Comments]
[Documents]
[Change History]
```

## Comparison Table

| Account | Previous Year | Submitted | Committee Revision | Change |
|---|---:|---:|---:|---:|
| Salaries | GHS 1,000,000 | GHS 1,200,000 | GHS 1,150,000 | -GHS 50,000 |
| Training | GHS 100,000 | GHS 150,000 | GHS 100,000 | -GHS 50,000 |
| Equipment | GHS 0 | GHS 200,000 | GHS 150,000 | -GHS 50,000 |

Changed values should be visually highlighted.

## Edit Budget Line Panel

```text
Account: 20204 — Staff Training

Submitted Amount:
GHS 150,000

Committee Amount:
[GHS 100,000]

Reason for Change:
[Reduced because the proposed programme was rescheduled.]

[Cancel] [Save Change]
```

The Reason for Change field must be mandatory when a committee member:

- Changes an amount
- Adds a budget line
- Removes a budget line
- Changes a description
- Changes an account code or category

## Committee Comments

Comments may be:

- General budget comments
- Comments attached to a budget line
- Internal committee comments
- Comments visible to the budget preparer
- Requests for supporting documents
- Clarification requests

Example:

```text
Ama Boateng
20 July 2026, 2:15 PM

Please provide the procurement breakdown for the equipment allocation.
```

## Change History

```text
Staff Training changed

Previous amount: GHS 150,000
New amount: GHS 100,000
Difference: -GHS 50,000

Reason: Programme rescheduled.
Changed by: Ama Boateng
Date: 20 July 2026, 2:35 PM
```

## Committee Actions

```text
[Save Review]
[Request Information]
[Return for Correction]
[Complete Committee Review]
```

## Completion Checklist

```text
✓ All budget lines reviewed
✓ Reasons provided for all changes
✓ Required documents reviewed
✓ Committee comments resolved
```

The committee should not complete the review until all mandatory checks pass.

---

# Step 4 — Recommended

## Purpose

The committee finalises and locks its revised budget, then sends it for final approval.

## Page Header

```text
Step 4 of 5
Committee Recommendation

The committee has completed its review and recommended the revised budget for final approval.
```

## Summary

```text
Original Submitted Total: GHS 5,000,000
Recommended Total:        GHS 4,650,000
Total Reduction:          GHS 350,000
Percentage Change:        -7%
```

## Recommendation Note

```text
Committee Recommendation

The committee recommends approval of the revised budget, subject to the
procurement limits and implementation conditions recorded below.
```

## Information Displayed

- Committee recommendation note
- Committee chair
- Committee members involved
- Recommendation date
- Recommended budget total
- Number of changed budget lines
- Total additions
- Total reductions
- Added budget lines
- Removed budget lines
- Supporting documents
- Committee meeting reference
- Outstanding comments or risks

## Change Summary

| Change Type | Number of Lines | Amount |
|---|---:|---:|
| Increased | 4 | +GHS 120,000 |
| Reduced | 7 | -GHS 470,000 |
| Added | 2 | +GHS 80,000 |
| Removed | 1 | -GHS 80,000 |

## Locked Recommendation Notice

```text
This committee-recommended version is locked.

Further changes require the budget to be returned to committee review.
```

## Final Approver Actions

```text
[Review Recommended Budget]
[Compare with Submission]
[View Committee Changes]
[Download Recommendation]
[Proceed to Final Decision]
```

The final approver should not edit the recommended budget directly.

The available decisions should be:

- Approve
- Return to committee
- Reject

---

# Step 5 — Approved

## Purpose

The authorised approver makes the final decision and the approved version becomes the official budget for the financial year.

## Final Decision Screen

```text
Final Budget Decision

Recommended Total: GHS 4,650,000
Financial Year: 2027
Recommended By: Budget Committee
Recommendation Date: 22 July 2026
```

## Information Displayed Before Approval

- Original submitted total
- Committee-recommended total
- Previous approved budget total
- Major increases
- Major reductions
- Committee recommendation
- Outstanding risks
- Supporting documents
- Complete change history
- Approval authority

## Decision Actions

```text
[Return to Committee]
[Reject Budget]
[Approve Budget]
```

## Approval Confirmation

```text
Approve this budget?

The recommended version will become the official approved budget for
the 2027 financial year. It will be locked and cannot be edited directly.

Approval comment:
[Enter an optional approval note]

[Cancel] [Confirm Approval]
```

## Approved State

```text
Step 5 of 5
Budget Approved ✓

This is the official approved budget for the 2027 financial year.
```

## Approval Information

```text
Approved Total: GHS 4,650,000
Approved By: Finance Director
Approved On: 24 July 2026, 11:30 AM
Approved Version: Version 2
Financial Year: 2027
```

## Available Actions

```text
[View Approved Budget]
[Download PDF]
[Export Excel]
[Compare Versions]
[View Audit Trail]
[Create Amendment Request]
```

The approved budget must remain read-only.

---

# Returned for Correction Flow

Returned for Correction should not be a sixth workflow step. It should appear as a state attached to the step that returned the budget.

Example:

```text
1. Draft
2. Submitted
3. Committee Review — Returned for Correction
4. Recommended
5. Approved
```

## Returned Budget Notice

```text
Budget Returned for Correction

The committee requested changes before continuing the review.

Reason:
Provide supporting documentation for the equipment allocation.

Returned by: Committee Chair
Returned on: 21 July 2026
```

## Actions

```text
[View Committee Comments]
[Create Corrected Version]
```

When corrected and resubmitted, all previous versions must be retained:

```text
Submitted Version 1
Corrected Submission Version 2
Committee Revision Version 3
```

---

# Rejected Flow

A rejected budget should remain available for audit purposes.

## Rejected Budget Notice

```text
Budget Rejected

The final approver declined the budget.

Reason:
The proposed expenditure exceeds the approved financial ceiling.

Rejected by: Finance Director
Rejected on: 24 July 2026
```

## Actions

```text
[View Rejection Reason]
[View Budget]
[Download Audit Trail]
[Create New Draft]
```

A rejected budget must not be edited directly. A new draft or revision process should be created.

---

# Amendment Flow

An approved budget must never be unlocked for editing.

When changes are required after approval, the system should create an amendment request.

```text
Approved Budget
      ↓
Amendment Request
      ↓
Committee Review
      ↓
Recommended Amendment
      ↓
Approved Amendment
```

The system should retain:

- Original approved budget
- Amendment request
- Committee amendment revision
- Recommended amendment
- Approved amendment
- Full audit history

The latest approved amendment becomes the operational budget while the original approval remains unchanged.

---

# Versioning Logic

Recommended version sequence:

```text
Draft Version
      ↓
Submitted Version 1
      ↓
Committee Revision Version 2
      ↓
Recommended Version
      ↓
Approved Version
```

If returned for correction:

```text
Submitted Version 1
      ↓
Corrected Submission Version 2
      ↓
Committee Revision Version 3
      ↓
Recommended Version
      ↓
Approved Version
```

Rules:

1. A submitted version must be immutable.
2. Committee changes must occur in a separate version.
3. A recommended version must be immutable.
4. An approved version must be immutable.
5. Every version must record who created it and when.
6. Every line-level change must record the previous and new values.
7. Reasons must be mandatory for committee changes.
8. Approved budgets must only be changed through amendments.

---

# Main Budget Page Layout

```text
---------------------------------------------------------
2027 Annual Budget                         Under Review
Finance Department                        GHS 4,650,000
---------------------------------------------------------

✓ Draft ── ✓ Submitted ── ● Committee Review ── ○ Recommended ── ○ Approved

---------------------------------------------------------
Current Step: Committee Review
The committee is reviewing and revising the submitted budget.
---------------------------------------------------------

[Summary]
[Budget Lines]
[Comparison]
[Comments]
[Documents]
[Change History]

Main content area

---------------------------------------------------------
[Return for Correction]       [Complete Committee Review]
---------------------------------------------------------
```

The main page must make three things immediately clear:

1. Where the budget currently is
2. What is happening at the current stage
3. What action is required next

---

# Role-Based Actions

## Budget Preparer

Can:

- Create a draft
- Upload a budget
- Edit a draft
- Compare with previous budgets
- Upload documents
- Submit the budget
- Respond to comments
- Correct and resubmit a returned budget

Cannot:

- Edit a locked submission
- Approve their own budget
- Edit committee revisions
- Edit an approved budget

## Committee Member

Can:

- View submitted budgets
- Compare with previous budgets
- Add comments
- Request information
- Propose changes
- Provide reasons for changes
- View change history

## Committee Chair or Secretary

Can:

- Start committee review
- Finalise the committee revision
- Return a budget for correction
- Complete the committee review
- Recommend the budget for approval

## Final Approver

Can:

- Review the recommendation
- Compare all versions
- Return the budget to committee
- Reject the budget
- Approve the budget

## System Administrator

Can:

- Configure permissions
- Manage financial years
- Manage workflow settings
- View audit records

The system administrator should not automatically receive business approval authority unless that permission is explicitly granted.

---

# Financial Year Rules

Each budget must belong to a financial year.

Example financial-year fields:

```text
id
name
start_date
end_date
status: upcoming | open | closed
```

Rules:

- Drafts may only be created for an open or upcoming financial year.
- Submissions should be blocked for a closed financial year.
- Approved budgets should remain visible after the year is closed.
- The system should define whether one or several approved budgets are allowed per financial year.
- A recommended uniqueness rule is one approved budget per organisation or department per financial year.

---

# Budget Comparison Requirements

The system should support:

1. Current proposed budget vs previous approved budget
2. Submitted budget vs committee revision
3. Submitted budget vs recommended budget
4. Recommended budget vs approved budget
5. Approved budgets across several financial years

The comparison should identify:

- Increased lines
- Reduced lines
- Unchanged lines
- New lines
- Removed lines
- Amount variance
- Percentage variance
- Total budget variance

Percentage variance:

```text
(Current Amount - Previous Amount) / Previous Amount × 100
```

When the previous amount is zero, display:

```text
New budget line
```

Do not calculate a misleading percentage.

---

# Audit Trail Requirements

The audit trail should record:

- Budget creation
- Financial year
- Every submission
- Every version
- Every budget-line change
- Previous value
- New value
- Reason for change
- User who made the change
- Timestamp
- Comments
- Document uploads
- Return decisions
- Recommendation decisions
- Approval decisions
- Rejection decisions
- Amendment requests

Approved, rejected, and returned budgets must remain available for audit purposes.

---

# Recommended MVP Delivery Order

1. Financial year management
2. Five-step workflow tracker
3. Budget status transitions
4. Budget versioning
5. Draft validation
6. Submission locking
7. Committee revision screen
8. Mandatory change reasons
9. Committee comments
10. Recommendation locking
11. Final approval
12. Previous-year comparison
13. Audit trail
14. Rejection and return flows
15. Amendment workflow
16. Notifications
17. Reports and dashboards

The foundation should be workflow state, versioning, permissions, and auditability. Charts and advanced analytics should be added after those controls are stable.
