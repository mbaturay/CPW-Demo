# 02 - Workflow and Status Model

> ADAMAS CPW Fisheries - Power Apps Build Kit
> Document version: 1.0 | Date: 2026-02-13

---

## 1. Overview

Every survey record in the ADAMAS system follows a deterministic lifecycle governed by a single **Status** choice column (`cpw_SurveyStatus`) on the `cpw_Survey` table. Status transitions are role-gated — only specific roles may move a survey from one status to another, and those transitions are enforced both in the Canvas App UI (button visibility/disabled rules) and in Dataverse business rules or Power Automate cloud flows.

This document is the authoritative reference for:

- The seven statuses and their meaning
- Every legal state transition, the role that triggers it, and the UI element involved
- Review Queue inclusion rules
- Activity Feed filter mapping
- The fix for the "approve and disappear" bug observed in the React prototype

---

## 2. Survey Status Choice Set

**Global Choice Name:** `cpw_SurveyStatus`

| Value | Label                     | Numeric Value | Color (suggested) |
|-------|---------------------------|---------------|-------------------|
| 1     | Draft                     | 100000000     | Gray (#8E8E93)    |
| 2     | Pending Validation        | 100000001     | Blue (#007AFF)    |
| 3     | Returned for Correction   | 100000002     | Orange (#FF9500)  |
| 4     | Pending Approval          | 100000003     | Blue (#5856D6)    |
| 5     | Approved                  | 100000004     | Green (#34C759)   |
| 6     | Published                 | 100000005     | Green (#30B050)   |
| 7     | Flagged Suspect           | 100000006     | Red (#FF3B30)     |

> **Implementation note:** When creating the global choice in Dataverse, set the integer values explicitly (starting at 100000000 as shown) so that formulas referencing `cpw_SurveyStatus.'Pending Approval'` resolve correctly. The suggested colors are used for status badges/pills in the Canvas App.

---

## 3. Status Definitions

### 3.1 Draft

- **Meaning:** Survey has been created but not yet submitted for any review.
- **Who can set it:** System (automatic on record creation).
- **Visible in:** Activity Feed under the "draft" filter. NOT visible in the Review Queue.
- **Editable:** Fully editable by the Data Entry Assistant who owns it.

### 3.2 Pending Validation

- **Meaning:** Survey has been submitted by the Data Entry Assistant and is waiting for initial data-quality review.
- **Who can set it:** Data Entry Assistant (by clicking "Submit for Review" on a Draft survey — see transition T1).
- **Visible in:** Review Queue. Activity Feed under the "pending" filter.
- **Editable:** Read-only for Data Entry Assistant. Area Biologist can review and act.

### 3.3 Returned for Correction

- **Meaning:** An Area Biologist has reviewed the survey and found issues that the Data Entry Assistant must fix before re-submission.
- **Who can set it:** Area Biologist (by clicking "Request Correction").
- **Visible in:** Review Queue. Activity Feed under the "pending" filter.
- **Editable:** Fully editable by Data Entry Assistant (corrections expected).

### 3.4 Pending Approval

- **Meaning:** Survey has passed initial review by the Data Entry Assistant (or re-submitted after correction) and is awaiting formal approval by the Area Biologist.
- **Who can set it:** Data Entry Assistant (by clicking "Submit for Review" on a Returned for Correction survey — see T3 — or the initial submit from Draft also goes here per the Validation page logic).
- **Visible in:** Review Queue. Activity Feed under the "pending" filter.
- **Editable:** Read-only for Data Entry Assistant. Area Biologist can review and act.

> **Clarification — Draft vs. Pending Validation vs. Pending Approval:** In the React prototype, the "Submit for Review" button on the Validation page sets status directly to `Pending Approval`. There is no separate "Pending Validation" step triggered by the Data Entry Assistant. The `Pending Validation` status exists in the type system and in the Review Queue filter list. For the Power Apps rebuild, we preserve both statuses to allow a two-stage workflow:
>
> - **Draft -> Pending Validation:** Automatic when the Data Entry Assistant clicks "Submit for Review" AND validation errors exist (the system flags it for Area Biologist review).
> - **Draft -> Pending Approval:** Automatic when the Data Entry Assistant clicks "Submit for Review" AND zero validation errors exist (ready for direct approval).
>
> If the team prefers a simpler single-step flow matching the prototype exactly (Draft -> Pending Approval always), collapse transitions T1 and T2 and remove `Pending Validation` from the workflow. Both approaches are supported by the schema.

### 3.5 Approved

- **Meaning:** Area Biologist has formally approved the survey data. The survey is considered valid and complete.
- **Who can set it:** Area Biologist (by clicking "Approve Survey").
- **Visible in:** Activity Feed under the "approved" filter. NOT visible in the Review Queue (this is correct and intentional).
- **Editable:** Locked. No further edits by any role.

### 3.6 Published

- **Meaning:** Senior Biologist has promoted the approved survey into the analysis/reporting dataset.
- **Who can set it:** Senior Biologist (by clicking "Publish to Analysis").
- **Visible in:** Activity Feed under the "approved" filter. NOT visible in the Review Queue.
- **Editable:** Locked. No further edits by any role. This is a terminal state.

### 3.7 Flagged Suspect

- **Meaning:** Senior Biologist has identified a concern with the survey data that requires further investigation.
- **Who can set it:** Senior Biologist (by clicking "Flag as Suspect").
- **Visible in:** Review Queue. Activity Feed under the "flagged" filter.
- **Editable:** Read-only. Requires Senior Biologist or Area Biologist intervention to resolve.

---

## 4. State Transition Table

Every legal transition is listed below. Any transition NOT listed is **illegal** and must be blocked by both the UI (button not shown) and a Dataverse business rule or Power Automate validation.

| ID  | From Status               | To Status                 | Allowed Role(s)        | Trigger / Action               | UI Location                     | Preconditions                                                                                      |
|-----|---------------------------|---------------------------|------------------------|---------------------------------|---------------------------------|----------------------------------------------------------------------------------------------------|
| T1  | Draft                     | Pending Validation        | Data Entry Assistant   | Click "Submit for Review"       | Validation Page - action bar    | Survey has at least one fish record. Validation errors MAY exist (flagged for review).              |
| T2  | Draft                     | Pending Approval          | Data Entry Assistant   | Click "Submit for Review"       | Validation Page - action bar    | Survey has at least one fish record AND zero validation errors.                                     |
| T3  | Returned for Correction   | Pending Approval          | Data Entry Assistant   | Click "Submit for Review"       | Validation Page - action bar    | Corrections have been made. Button label changes to "Re-submit for Review".                         |
| T4  | Pending Validation        | Returned for Correction   | Area Biologist         | Click "Request Correction"      | Validation Page - action bar    | Area Biologist has reviewed and identified issues.                                                  |
| T5  | Pending Validation        | Pending Approval          | Area Biologist         | Click "Advance to Approval"     | Validation Page - action bar    | Area Biologist confirms data quality is acceptable.                                                 |
| T6  | Pending Approval          | Returned for Correction   | Area Biologist         | Click "Request Correction"      | Validation Page - action bar    | Area Biologist found issues during approval review.                                                 |
| T7  | Pending Approval          | Approved                  | Area Biologist         | Click "Approve Survey"          | Validation Page - action bar    | Zero validation errors. Status is NOT Approved or Published (terminal guard).                       |
| T8  | Approved                  | Published                 | Senior Biologist       | Click "Publish to Analysis"     | Validation Page - action bar    | Zero validation errors. Status is NOT already Published (terminal guard).                           |
| T9  | Approved                  | Flagged Suspect           | Senior Biologist       | Click "Flag as Suspect"         | Validation Page - action bar    | Senior Biologist identifies data concern.                                                          |
| T10 | Pending Approval          | Flagged Suspect           | Senior Biologist       | Click "Flag as Suspect"         | Validation Page - action bar    | Senior Biologist can flag at any pre-terminal stage.                                                |
| T11 | Flagged Suspect           | Returned for Correction   | Area Biologist         | Click "Request Correction"      | Validation Page - action bar    | After investigation, Area Biologist sends back for correction.                                     |
| T12 | Flagged Suspect           | Approved                  | Senior Biologist       | Click "Clear Flag and Approve"  | Validation Page - action bar    | Senior Biologist resolves flag and confirms data is valid. Zero validation errors.                  |

### Transition Diagram (text)

```
                          +-----------------------+
                          |        Draft          |
                          +-----------+-----------+
                                      |
                     T1 (errors exist) | T2 (no errors)
                          +-----+     |     +-----+
                          |     v     |     v     |
                  +-------+-----+     |  +--+-----+-------+
                  | Pending     |     |  | Pending        |
                  | Validation  +--+  |  | Approval       |
                  +------+------+  |  |  +---+---+---+----+
                         |         |  |      |   |   |
                    T4   |    T5   |  |  T7  | T6|   | T10
                         v         v  |      v   v   v
              +----------+---+     |  | +----++ ++---------+
              | Returned for |<----+--+-+    || ||         |
              | Correction   |<---T11-+      || |v         |
              +------+-------+        | +----+v ++-------+ |
                     |                | |Approved| Flagged| |
                T3   |               | +---+----+ Suspect| |
                     |               |     |     +---+---+ |
                     +------->-------+  T8 |   T12   |     |
                     (to Pending          v    |      |
                      Approval)      +----+----v+     |
                                     | Published |     |
                                     +-----------+     |
                                                       |
                            T9  (Approved -> Flagged)--+
```

---

## 5. Role-by-Role Action Reference

### 5.1 Data Entry Assistant

| Action              | Available When Status Is             | Button Label           | Result Status            | Disabled When                                   |
|---------------------|--------------------------------------|------------------------|--------------------------|-------------------------------------------------|
| Submit for Review   | Draft                                | Submit for Review      | Pending Validation or Pending Approval (see T1/T2) | Status is Approved or Published            |
| Re-submit           | Returned for Correction              | Re-submit for Review   | Pending Approval         | Status is Approved or Published                 |

**UI Rules:**
- The "Submit for Review" / "Re-submit for Review" button is **hidden** (not just disabled) when the current user's role is not Data Entry Assistant.
- The button is **disabled** (visible but grayed out) when the survey status is `Approved` or `Published`.
- The button is **enabled** only when status is `Draft` or `Returned for Correction`.

### 5.2 Area Biologist

| Action              | Available When Status Is                              | Button Label           | Result Status            | Disabled When                                     |
|---------------------|-------------------------------------------------------|------------------------|--------------------------|----------------------------------------------------|
| Request Correction  | Pending Validation, Pending Approval, Flagged Suspect | Request Correction     | Returned for Correction  | Status is Approved, Published, or Draft            |
| Approve Survey      | Pending Approval                                      | Approve Survey         | Approved                 | Validation errors > 0, or status is Approved/Published |
| Advance to Approval | Pending Validation                                    | Advance to Approval    | Pending Approval         | Validation errors > 0                              |

**UI Rules:**
- Buttons are **hidden** when the current user's role is not Area Biologist.
- "Approve Survey" is **disabled** when `CountRows(Filter(cpw_ValidationIssues, Survey = ThisItem, Severity = 'Error')) > 0` or when status is already `Approved` or `Published`.
- "Request Correction" is **disabled** when status is `Draft`, `Approved`, or `Published`.

### 5.3 Senior Biologist

| Action              | Available When Status Is             | Button Label           | Result Status            | Disabled When                                     |
|---------------------|--------------------------------------|------------------------|--------------------------|----------------------------------------------------|
| Flag as Suspect     | Pending Approval, Approved           | Flag as Suspect        | Flagged Suspect          | Status is Published or already Flagged Suspect    |
| Publish to Analysis | Approved                             | Publish to Analysis    | Published                | Validation errors > 0, or status is already Published |
| Clear and Approve   | Flagged Suspect                      | Clear Flag and Approve | Approved                 | Validation errors > 0                              |

**UI Rules:**
- Buttons are **hidden** when the current user's role is not Senior Biologist.
- "Publish to Analysis" is **disabled** when `CountRows(Filter(cpw_ValidationIssues, Survey = ThisItem, Severity = 'Error')) > 0` or when status is already `Published`.
- "Flag as Suspect" is **disabled** when status is `Published` or `Flagged Suspect`.

---

## 6. Review Queue Rules

The **Review Queue** appears on the Dashboard screen. It shows surveys that require attention from a reviewer (Area Biologist or Senior Biologist).

### 6.1 Inclusion Criteria

A survey appears in the Review Queue if and only if its status is one of:

```
cpw_SurveyStatus in {
    "Pending Validation",
    "Returned for Correction",
    "Pending Approval",
    "Flagged Suspect"
}
```

### 6.2 Exclusion Criteria

A survey is **excluded** from the Review Queue when its status is:

- `Draft` — not yet submitted, only visible to the owner
- `Approved` — review complete, no further action needed
- `Published` — terminal state, no further action needed

### 6.3 Power Fx Formula

```
Filter(
    cpw_Surveys,
    cpw_Status = cpw_SurveyStatus.'Pending Validation'
    || cpw_Status = cpw_SurveyStatus.'Returned for Correction'
    || cpw_Status = cpw_SurveyStatus.'Pending Approval'
    || cpw_Status = cpw_SurveyStatus.'Flagged Suspect'
)
```

### 6.4 Sort Order

The Review Queue should be sorted by `cpw_ModifiedOn` descending (most recently changed first), so that surveys that just had a status change appear at the top.

### 6.5 Role-Based Filtering (Optional Enhancement)

For better UX, the Review Queue can be further filtered by role:

- **Area Biologist view:** Show `Pending Validation`, `Pending Approval`, `Flagged Suspect` (items they can act on)
- **Senior Biologist view:** Show `Approved` (ready to publish), `Pending Approval`, `Flagged Suspect` (items they can act on)
- **Data Entry Assistant view:** Show `Returned for Correction` (items they need to fix)

---

## 7. Activity Feed Filter Mapping

The **Activity Feed** is a filterable list of recent survey activity shown on the Dashboard. It supports a status filter dropdown plus water body and date filters.

### 7.1 Status Filter Dropdown

**Choice Name (local):** `StatusFilter`

| Filter Value | Label    | Included Statuses                                                    |
|-------------|----------|----------------------------------------------------------------------|
| all         | All      | All 7 statuses (no filter applied)                                   |
| pending     | Pending  | Pending Validation, Pending Approval, Returned for Correction        |
| approved    | Approved | Approved, Published                                                  |
| flagged     | Flagged  | Flagged Suspect                                                      |
| draft       | Draft    | Draft                                                                |

### 7.2 Power Fx Formulas for Each Filter

```
// "all" — no status filter
Filter(cpw_Surveys, true)

// "pending"
Filter(
    cpw_Surveys,
    cpw_Status = cpw_SurveyStatus.'Pending Validation'
    || cpw_Status = cpw_SurveyStatus.'Pending Approval'
    || cpw_Status = cpw_SurveyStatus.'Returned for Correction'
)

// "approved"
Filter(
    cpw_Surveys,
    cpw_Status = cpw_SurveyStatus.'Approved'
    || cpw_Status = cpw_SurveyStatus.'Published'
)

// "flagged"
Filter(
    cpw_Surveys,
    cpw_Status = cpw_SurveyStatus.'Flagged Suspect'
)

// "draft"
Filter(
    cpw_Surveys,
    cpw_Status = cpw_SurveyStatus.'Draft'
)
```

### 7.3 Combined Filter with Water Body and Date

```
With(
    {
        filteredByStatus: <status filter from above>,
        selectedWater: drpWaterFilter.Selected.cpw_WaterId,
        startDate: dpStartDate.SelectedDate,
        endDate: dpEndDate.SelectedDate
    },
    Filter(
        filteredByStatus,
        (IsBlank(selectedWater) || cpw_Water.cpw_WaterId = selectedWater)
        && (IsBlank(startDate) || cpw_SurveyDate >= startDate)
        && (IsBlank(endDate) || cpw_SurveyDate <= endDate)
    )
)
```

---

## 8. The "Approve and Disappear" Bug — Root Cause and Fix

### 8.1 Bug Description (React Prototype)

In the React prototype, when an Area Biologist approves a survey:

1. The status changes to `Approved` in the React DemoContext.
2. The status override is stored in **sessionStorage** (browser-local, ephemeral).
3. The Review Queue correctly removes the survey (Approved is excluded from the queue — this is intended behavior).
4. The Activity Feed with the "approved" filter correctly shows the survey.
5. **However**, on page refresh or new browser session, sessionStorage is cleared and the survey **reverts to its original seed status** (e.g., "Pending Approval"), making it reappear in the Review Queue as if it was never approved.

### 8.2 Root Cause

The React prototype uses `sessionStorage` for status overrides instead of a persistent data store. The seed data in `world.ts` always returns the original status, and the override layer is ephemeral.

### 8.3 Fix in Power Apps + Dataverse

**The fix is architectural — Dataverse provides persistence by default.**

- Status changes are written directly to the `cpw_Status` column on the `cpw_Survey` row in Dataverse via `Patch()`.
- There is no client-side override layer. The Dataverse row IS the source of truth.
- On any page load or refresh, the app reads the current `cpw_Status` from Dataverse, which reflects the last transition.
- The Review Queue filter naturally excludes `Approved` and `Published` surveys because the Dataverse column value has permanently changed.

**Implementation checklist:**

1. Every status transition button calls `Patch(cpw_Surveys, ThisItem, { cpw_Status: cpw_SurveyStatus.'Approved' })` (or the appropriate target status).
2. After the Patch, call `Refresh(cpw_Surveys)` to update the local data cache.
3. Write a row to `cpw_StatusHistory` to maintain an audit trail of every transition (see Section 9).
4. No use of `Set()` or `UpdateContext()` for status values that must survive navigation or refresh. The Dataverse column is the single source of truth.

### 8.4 Status Change Pattern (Power Fx)

```
// Example: Area Biologist clicks "Approve Survey"
// varCurrentSurvey is the survey record in context

// 1. Validate preconditions
If(
    CountRows(
        Filter(
            cpw_ValidationIssues,
            cpw_Survey.cpw_SurveyId = varCurrentSurvey.cpw_SurveyId,
            cpw_Severity = cpw_IssueSeverity.'Error'
        )
    ) > 0,
    Notify("Cannot approve: unresolved validation errors exist.", NotificationType.Error),

    // 2. Patch the survey status
    Patch(
        cpw_Surveys,
        varCurrentSurvey,
        {
            cpw_Status: cpw_SurveyStatus.'Approved'
        }
    );

    // 3. Write audit trail
    Patch(
        cpw_StatusHistories,
        Defaults(cpw_StatusHistories),
        {
            cpw_Survey: varCurrentSurvey,
            cpw_FromStatus: varCurrentSurvey.cpw_Status,
            cpw_ToStatus: cpw_SurveyStatus.'Approved',
            cpw_ChangedBy: LookUp(cpw_AppUsers, cpw_Email = User().Email),
            cpw_ChangedOn: Now(),
            cpw_Reason: "Approved by Area Biologist"
        }
    );

    // 4. Refresh cache
    Refresh(cpw_Surveys);

    // 5. Navigate back to dashboard
    Notify("Survey approved successfully.", NotificationType.Success);
    Navigate(scrDashboard, ScreenTransition.None)
)
```

---

## 9. Status History / Audit Trail

Every status change must produce a row in `cpw_StatusHistory`. This serves as:

- An audit log for compliance
- The data source for the Activity Feed timeline
- A debugging aid for workflow issues

### 9.1 Fields Captured Per Transition

| Field            | Value                                      |
|------------------|--------------------------------------------|
| cpw_Survey       | Lookup to the survey that changed           |
| cpw_FromStatus   | The status BEFORE the change               |
| cpw_ToStatus     | The status AFTER the change                |
| cpw_ChangedBy    | Lookup to cpw_AppUser (or User().Email)     |
| cpw_ChangedOn    | Now() at the time of the transition        |
| cpw_Reason       | Free-text reason or system-generated label |

### 9.2 Querying the Timeline

```
// Show status history for a specific survey, newest first
SortByColumns(
    Filter(
        cpw_StatusHistories,
        cpw_Survey.cpw_SurveyId = varCurrentSurvey.cpw_SurveyId
    ),
    "cpw_ChangedOn",
    SortOrder.Descending
)
```

---

## 10. Terminal State Guards

Two statuses are considered **terminal**: `Approved` and `Published`.

### 10.1 What "Terminal" Means

- **Approved:** Data is validated and locked. The only forward transition is to `Published` (Senior Biologist) or `Flagged Suspect` (Senior Biologist). The Data Entry Assistant and Area Biologist cannot make further changes.
- **Published:** Data is in the analysis dataset. No transitions are allowed out of this state. It is fully terminal.

### 10.2 Enforcement

**Canvas App UI:**
```
// Disable action buttons for terminal states
Set(
    varIsTerminal,
    varCurrentSurvey.cpw_Status = cpw_SurveyStatus.'Published'
);

// For Data Entry Assistant buttons:
Set(
    varIsDeaDisabled,
    varCurrentSurvey.cpw_Status = cpw_SurveyStatus.'Approved'
    || varCurrentSurvey.cpw_Status = cpw_SurveyStatus.'Published'
);
```

**Dataverse Business Rule (backup enforcement):**
Create a business rule on `cpw_Survey` that locks the `cpw_Status` field when the current value is `Published`. This prevents any API-level or bulk-update bypass of the UI guard.

---

## 11. Button Visibility Matrix

This matrix shows which buttons are visible and enabled for each role-status combination. Use this as the definitive reference when building the Validation screen.

**Legend:** V = Visible & Enabled | D = Visible & Disabled | H = Hidden

### Data Entry Assistant Buttons

| Status                  | Submit for Review | Re-submit for Review |
|-------------------------|:-:|:-:|
| Draft                   | V | H |
| Pending Validation      | H | H |
| Returned for Correction | H | V |
| Pending Approval        | H | H |
| Approved                | D | D |
| Published               | D | D |
| Flagged Suspect         | H | H |

### Area Biologist Buttons

| Status                  | Request Correction | Approve Survey | Advance to Approval |
|-------------------------|:-:|:-:|:-:|
| Draft                   | H | H | H |
| Pending Validation      | V | H | V (if errors=0) / D (if errors>0) |
| Returned for Correction | H | H | H |
| Pending Approval        | V | V (if errors=0) / D (if errors>0) | H |
| Approved                | H | D | H |
| Published               | H | D | H |
| Flagged Suspect         | V | H | H |

### Senior Biologist Buttons

| Status                  | Flag as Suspect | Publish to Analysis | Clear Flag and Approve |
|-------------------------|:-:|:-:|:-:|
| Draft                   | H | H | H |
| Pending Validation      | H | H | H |
| Returned for Correction | H | H | H |
| Pending Approval        | V | H | H |
| Approved                | V | V (if errors=0) / D (if errors>0) | H |
| Published               | D | D | H |
| Flagged Suspect         | D | H | V (if errors=0) / D (if errors>0) |

---

## 12. Notification Rules (Optional Enhancement)

When a status transition occurs, the system can send notifications to the relevant party:

| Transition                              | Notify                    | Method                     |
|-----------------------------------------|---------------------------|----------------------------|
| Draft -> Pending Validation/Approval    | Area Biologist            | In-app notification banner |
| Returned for Correction                 | Data Entry Assistant      | In-app + email (optional)  |
| Pending Approval -> Approved            | Data Entry Assistant      | In-app notification        |
| Approved -> Published                   | All roles                 | In-app notification        |
| Any -> Flagged Suspect                  | Area Biologist + DEA      | In-app + email (optional)  |

Implementation: Use a Power Automate flow triggered by update of `cpw_Status` on `cpw_Survey`. The flow reads the new status, determines the recipient(s), and sends a push notification or email.

---

## 13. Summary of Key Design Decisions

1. **Dataverse is the single source of truth.** No client-side status caching. Every `Patch()` writes directly to the `cpw_Survey` row.
2. **The Review Queue excludes Approved and Published.** This is correct behavior, not a bug. The Activity Feed "approved" filter shows these surveys.
3. **Status history is mandatory.** Every transition writes to `cpw_StatusHistory` for auditability.
4. **Terminal state enforcement is dual-layer.** Canvas App disables buttons AND Dataverse business rules lock the field.
5. **Published is fully terminal.** No transitions out. Approved allows forward to Published or backward to Flagged Suspect (Senior Biologist only).
6. **Button visibility is role-gated.** Buttons for other roles are hidden (not disabled) to reduce UI clutter.
7. **Validation error count gates approval.** No survey with `Error`-severity validation issues can be approved or published.
