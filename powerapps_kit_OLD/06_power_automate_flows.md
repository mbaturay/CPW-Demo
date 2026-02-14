# 06 -- Power Automate Flows

> Part of the **ADAMAS Power Apps Build Kit**.
> Prerequisite reading: `00_README.md`, `02_dataverse_schema.md` (table definitions).

---

## Overview

Three Power Automate flows support the ADAMAS Canvas App. Only the first is **required** for demo operation; the other two are optional enhancements.

| # | Flow Name | Type | Priority | Purpose |
|---|-----------|------|----------|---------|
| 1 | **CPW -- Reset Demo Data** | Instant (from Power Apps) | **Required** | Restores all 15 survey statuses to their seed values and purges the StatusHistory audit log. Enables repeatable demos. |
| 2 | CPW -- Status Change Notification | Automated (on row modify) | Optional | Sends a Teams/email notification when a survey status changes. |
| 3 | CPW -- Survey Submission Processor | Automated (on row modify) | Optional | Auto-creates ValidationIssue rows when a survey enters "Pending Validation." In the demo, validation data is pre-seeded, so this flow is not needed for demo purposes. |

---

## Naming Convention

All flows use the prefix **`CPW --`** followed by a descriptive name. This groups them in the flow list and distinguishes them from unrelated flows in the same environment.

---

## Common References

### Dataverse Tables Used

| Logical Name | Display Name | Key Columns |
|---|---|---|
| `cpw_Survey` | Survey | `cpw_surveyid` (PK), `cpw_SurveyId` (alternate key, e.g., `SVY-2026-NE-0100`), `cpw_Status` (Choice) |
| `cpw_StatusHistory` | Status History | `cpw_statushistoryid` (PK), `cpw_Survey`, `cpw_FromStatus`, `cpw_ToStatus`, `cpw_ChangedBy`, `cpw_ChangedOn`, `cpw_Reason` |
| `cpw_FishRecord` | Fish Record | `cpw_fishrecordid` (PK), `cpw_Survey` |
| `cpw_ValidationIssue` | Validation Issue | `cpw_validationissueid` (PK), `cpw_Survey` |
| `cpw_Water` | Water | `cpw_waterid` (PK), `cpw_Name` |
| `cpw_Species` | Species | `cpw_speciesid` (PK), `cpw_Code`, `cpw_LengthMinMm`, `cpw_LengthMaxMm`, `cpw_WeightMinG`, `cpw_WeightMaxG` |

### cpw_SurveyStatus Choice Values

| Label | Value |
|---|---|
| Draft | 100000000 |
| Pending Validation | 100000001 |
| Returned for Correction | 100000002 |
| Pending Approval | 100000003 |
| Approved | 100000004 |
| Published | 100000005 |
| Flagged Suspect | 100000006 |

---

## Flow 1: CPW -- Reset Demo Data (REQUIRED)

### Purpose

Resets the demo environment to a pristine, known-good state so the ADAMAS demo can be run repeatedly with consistent starting data. This is the most important flow in the kit.

What it does:

1. Updates each of the 15 surveys to its original seed status (hardcoded mapping).
2. Deletes every row from `cpw_StatusHistory` (the audit trail table).
3. Returns a success/failure message to the calling Canvas App.

### Flow Configuration

| Property | Value |
|---|---|
| **Flow name** | `CPW -- Reset Demo Data` |
| **Type** | Instant cloud flow |
| **Trigger** | `PowerApps (V2)` |
| **Connections** | Microsoft Dataverse |
| **Timeout** | 10 minutes (default is sufficient) |
| **Concurrency** | Off (only one reset should run at a time) |

### Trigger: PowerApps (V2)

Use the **PowerApps (V2)** trigger (not the legacy `PowerApps` trigger) to support typed inputs and outputs.

**Input parameters:**

None required. The flow is self-contained; all survey-to-status mappings are hardcoded inside the flow.

> If you want an optional input for partial resets in the future, you can add a text input `ResetScope` with allowed values `"all"` or a comma-separated list of survey IDs. For the initial build, omit this and always reset everything.

### Step-by-Step Actions

#### Step 1: Initialize Variable -- `varResetResults`

| Property | Value |
|---|---|
| **Action** | `Initialize variable` (Built-in > Variable) |
| **Name** | `varResetResults` |
| **Type** | String |
| **Value** | `""` |

This variable accumulates success/error messages for the response.

---

#### Step 2: Initialize Variable -- `varErrorCount`

| Property | Value |
|---|---|
| **Action** | `Initialize variable` (Built-in > Variable) |
| **Name** | `varErrorCount` |
| **Type** | Integer |
| **Value** | `0` |

---

#### Step 3: Compose -- Survey Reset Mapping

| Property | Value |
|---|---|
| **Action** | `Compose` (Built-in > Data Operations) |
| **Inputs** | (JSON array -- see below) |

Paste this exact JSON as the **Inputs** value:

```json
[
  { "surveyIdText": "SVY-2026-NE-0100",  "statusValue": 100000003, "statusLabel": "Pending Approval" },
  { "surveyIdText": "SVY-2026-NE-0101",  "statusValue": 100000003, "statusLabel": "Pending Approval" },
  { "surveyIdText": "SVY-2026-NE-0102",  "statusValue": 100000001, "statusLabel": "Pending Validation" },
  { "surveyIdText": "SVY-2025-SP-0007",  "statusValue": 100000003, "statusLabel": "Pending Approval" },
  { "surveyIdText": "SVY-2025-SP-0006",  "statusValue": 100000002, "statusLabel": "Returned for Correction" },
  { "surveyIdText": "SVY-2025-SP-0005",  "statusValue": 100000004, "statusLabel": "Approved" },
  { "surveyIdText": "SVY-2025-PDR-0012", "statusValue": 100000001, "statusLabel": "Pending Validation" },
  { "surveyIdText": "SVY-2025-PDR-0011", "statusValue": 100000004, "statusLabel": "Approved" },
  { "surveyIdText": "SVY-2025-SV-0004",  "statusValue": 100000003, "statusLabel": "Pending Approval" },
  { "surveyIdText": "SVY-2025-SV-0003",  "statusValue": 100000004, "statusLabel": "Approved" },
  { "surveyIdText": "SVY-2025-BT-0009",  "statusValue": 100000006, "statusLabel": "Flagged Suspect" },
  { "surveyIdText": "SVY-2025-BT-0008",  "statusValue": 100000004, "statusLabel": "Approved" },
  { "surveyIdText": "SVY-2025-BL-0002",  "statusValue": 100000003, "statusLabel": "Pending Approval" },
  { "surveyIdText": "SVY-2025-BR-0015", "statusValue": 100000004, "statusLabel": "Approved" },
  { "surveyIdText": "SVY-2025-CR-0019",  "statusValue": 100000004, "statusLabel": "Approved" }
]
```

Reference the output of this step as `outputs('Compose_-_Survey_Reset_Mapping')` in later steps.

> **Why hardcode?** The demo has a fixed, small set of 15 surveys. A dynamic approach (storing seed statuses in a Dataverse column) is unnecessary complexity for a demo-reset flow. If the seed data changes, update this JSON array.

---

#### Step 4: Apply to Each -- Reset Survey Statuses

| Property | Value |
|---|---|
| **Action** | `Apply to each` (Built-in > Control) |
| **Select an output from previous steps** | `outputs('Compose_-_Survey_Reset_Mapping')` |
| **Concurrency Control** | **On**, Degree of Parallelism = **10** |

Enabling parallelism (up to 10) speeds up the reset from ~30 seconds to ~5 seconds for 15 surveys.

##### Step 4a (inside loop): List Rows -- Find Survey by SurveyIdText

| Property | Value |
|---|---|
| **Action** | `List rows` (Microsoft Dataverse) |
| **Table name** | `Surveys` (`cpw_Survey`) |
| **Filter rows (OData)** | `cpw_surveyid eq '@{items('Apply_to_each')?['surveyIdText']}'` |
| **Row count** | `1` |

This returns a single survey row matching the text ID. We query by the alternate key `cpw_SurveyId` rather than the GUID primary key so the mapping JSON remains human-readable.

**Expression for the OData filter:**

```
cpw_surveyid eq '@{items('Apply_to_each')?['surveyIdText']}'
```

##### Step 4b (inside loop): Condition -- Survey Found?

| Property | Value |
|---|---|
| **Action** | `Condition` (Built-in > Control) |
| **Left side** | `length(outputs('List_rows_-_Find_Survey')?['body/value'])` |
| **Operator** | `is greater than` |
| **Right side** | `0` |

**If Yes branch:**

##### Step 4c (inside If Yes): Update a Row -- Set Status

| Property | Value |
|---|---|
| **Action** | `Update a row` (Microsoft Dataverse) |
| **Table name** | `Surveys` (`cpw_Survey`) |
| **Row ID** | `first(outputs('List_rows_-_Find_Survey')?['body/value'])?['cpw_surveyid']` |
| **Status (cpw_Status)** | `items('Apply_to_each')?['statusValue']` |

The **Row ID** expression extracts the GUID from the first (and only) row returned by List Rows:

```
first(outputs('List_rows_-_Find_Survey')?['body/value'])?['cpw_surveyid']
```

The **Status** field must be set using the integer choice value:

```
items('Apply_to_each')?['statusValue']
```

> **Important:** In the Dataverse connector, the Choice field input expects the integer value, not the label string. The label is included in the mapping JSON only for human readability.

**If No branch (survey not found):**

##### Step 4d (inside If No): Increment Variable -- varErrorCount

| Property | Value |
|---|---|
| **Action** | `Increment variable` (Built-in > Variable) |
| **Name** | `varErrorCount` |
| **Value** | `1` |

##### Step 4e (inside If No): Append to String Variable -- varResetResults

| Property | Value |
|---|---|
| **Action** | `Append to string variable` (Built-in > Variable) |
| **Name** | `varResetResults` |
| **Value** | `Survey not found: @{items('Apply_to_each')?['surveyIdText']}; ` |

---

#### Step 5: Delete StatusHistory Records

This section runs **after** the Apply to Each completes (not inside it).

##### Step 5a: List Rows -- All StatusHistory

| Property | Value |
|---|---|
| **Action** | `List rows` (Microsoft Dataverse) |
| **Table name** | `Status Histories` (`cpw_StatusHistory`) |
| **Row count** | `5000` |

Set the row count to 5000 (the maximum) to ensure all audit records are retrieved. In a demo environment this will typically be under 100 rows.

> **Pagination note:** If the environment has accumulated more than 5000 StatusHistory rows (unlikely in demo), enable **Settings > Pagination** on this action and set the threshold to 100,000.

##### Step 5b: Apply to Each -- Delete StatusHistory

| Property | Value |
|---|---|
| **Action** | `Apply to each` (Built-in > Control) |
| **Select an output from previous steps** | `outputs('List_rows_-_All_StatusHistory')?['body/value']` |
| **Concurrency Control** | **On**, Degree of Parallelism = **20** |

Higher parallelism for deletes is safe and fast.

###### Step 5b-i (inside loop): Delete a Row

| Property | Value |
|---|---|
| **Action** | `Delete a row` (Microsoft Dataverse) |
| **Table name** | `Status Histories` (`cpw_StatusHistory`) |
| **Row ID** | `items('Apply_to_each_-_Delete_StatusHistory')?['cpw_statushistoryid']` |

---

#### Step 6: Compose -- Build Response Message

| Property | Value |
|---|---|
| **Action** | `Compose` (Built-in > Data Operations) |
| **Inputs** | (expression -- see below) |

Expression:

```
if(
  equals(variables('varErrorCount'), 0),
  'Demo reset complete. 15 surveys restored to seed status. All StatusHistory records deleted.',
  concat('Demo reset completed with ', string(variables('varErrorCount')), ' error(s). ', variables('varResetResults'))
)
```

---

#### Step 7: Respond to a PowerApp or Flow

| Property | Value |
|---|---|
| **Action** | `Respond to a PowerApp or flow` (Built-in > PowerApps (V2)) |
| **Output Name** | `ResetResult` |
| **Output Type** | Text |
| **Value** | `outputs('Compose_-_Build_Response_Message')` |

This sends a string back to the Canvas App that called the flow.

---

### Complete Flow Diagram (Text Representation)

```
[Trigger: PowerApps (V2)]
    |
    v
[Initialize variable: varResetResults = ""]
    |
    v
[Initialize variable: varErrorCount = 0]
    |
    v
[Compose: Survey Reset Mapping (15-item JSON array)]
    |
    v
[Apply to each: Reset Survey Statuses (parallel = 10)]
    |--- [List rows: Find Survey by cpw_surveyid]
    |--- [Condition: Survey found?]
    |       |-- YES --> [Update a row: Set cpw_Status to seed value]
    |       |-- NO  --> [Increment varErrorCount]
    |                   [Append to varResetResults]
    |
    v
[List rows: All StatusHistory records]
    |
    v
[Apply to each: Delete StatusHistory (parallel = 20)]
    |--- [Delete a row: cpw_StatusHistory]
    |
    v
[Compose: Build Response Message]
    |
    v
[Respond to a PowerApp or flow: ResetResult]
```

---

### Calling from the Canvas App

In the Canvas App, add a **Button** control on a settings or admin screen (visible only to the Senior Biologist role or an admin role).

**Button Properties:**

| Property | Value |
|---|---|
| **Text** | `"Reset Demo Data"` |
| **OnSelect** | (Power Fx formula below) |
| **Fill** | `Color.OrangeRed` (visual warning -- destructive action) |
| **Visible** | `varCurrentRole = "senior"` |

**OnSelect formula:**

```powerfx
UpdateContext({ locResetting: true });

Set(
    varResetResult,
    'CPW--ResetDemoData'.Run()
);

Notify(
    varResetResult.resetresult,
    If(
        StartsWith(varResetResult.resetresult, "Demo reset complete."),
        NotificationType.Success,
        NotificationType.Warning
    )
);

// Refresh the local data sources so screens reflect the reset
Refresh(cpw_Survey);
Refresh(cpw_StatusHistory);

// Force re-collect any cached gallery data
ClearCollect(
    colSurveys,
    Filter(cpw_Survey, true)
);

UpdateContext({ locResetting: false });
```

> **Note on the flow reference name:** When you add the flow to the Canvas App (via the Power Automate pane in the maker studio), it appears as `'CPW--ResetDemoData'` (spaces and special characters are stripped). The `.Run()` method invokes the flow synchronously from the app. The returned object contains a property matching the output name in lowercase: `resetresult`.

**Loading indicator:**

Set the button's `DisplayMode` property to:

```powerfx
If(locResetting, DisplayMode.Disabled, DisplayMode.Edit)
```

Add a **Spinner** or **Loading** label next to the button:

```powerfx
// Visible property
locResetting
// Text property
"Resetting demo data..."
```

---

### Error Handling

The flow includes built-in error handling via the survey-not-found condition. For additional robustness:

1. **Configure Run After on Step 5a (List rows -- All StatusHistory):** Set the `List rows` action to run after the Apply to Each even if it fails. Right-click the action, select **Configure run after**, and check both **is successful** and **has failed**. This ensures StatusHistory cleanup still runs even if one survey update fails.

2. **Scope wrapper (optional):** Wrap Steps 4 and 5 in a `Scope` action. Add a parallel branch after the Scope that runs only on failure (`Configure run after: has failed`). In the failure branch, use `Respond to a PowerApp or flow` to return an error message.

3. **Flow run history:** Each flow run is logged in the Power Automate portal under **My flows > CPW -- Reset Demo Data > Run history**. Failed runs show which action failed and the exact error message. Use this for troubleshooting.

---

### Seed Status Mapping Reference

For quick reference, here is the complete mapping with contextual information:

| Survey ID | Water | Station | Seed Status | Choice Value | Notes |
|---|---|---|---|---|---|
| SVY-2026-NE-0100 | South Platte Basin | Chatfield Reach (SP-04) | Pending Approval | 100000003 | Hero A: Clean survey (0 errors, 0 warnings). 18 fish records. |
| SVY-2026-NE-0101 | Cache la Poudre River | Mishawaka (PDR-01) | Pending Approval | 100000003 | Hero B: Warning-only survey (0 errors, 1 warning). 15 fish records. |
| SVY-2026-NE-0102 | South Platte Basin | Waterton Canyon (SP-03) | Pending Validation | 100000001 | Hero C: Error survey (2 errors, 1 warning). 20 fish records. |
| SVY-2025-SP-0007 | South Platte Basin | Chatfield Reach (SP-04) | Pending Approval | 100000003 | |
| SVY-2025-SP-0006 | South Platte Basin | Waterton Canyon (SP-03) | Returned for Correction | 100000002 | Has validation issues (2 errors, 1 warning). |
| SVY-2025-SP-0005 | South Platte Basin | Deckers (SP-01) | Approved | 100000004 | |
| SVY-2025-PDR-0012 | Cache la Poudre River | Gateway (PDR-02) | Pending Validation | 100000001 | Has validation issues (1 error, 2 warnings). |
| SVY-2025-PDR-0011 | Cache la Poudre River | Mishawaka (PDR-01) | Approved | 100000004 | |
| SVY-2025-SV-0004 | St. Vrain Creek | Lyons (SV-01) | Pending Approval | 100000003 | |
| SVY-2025-SV-0003 | St. Vrain Creek | Longmont Reach (SV-02) | Approved | 100000004 | |
| SVY-2025-BT-0009 | Big Thompson River | Drake (BT-01) | Flagged Suspect | 100000006 | Has validation issues (0 errors, 2 warnings). |
| SVY-2025-BT-0008 | Big Thompson River | Loveland Reach (BT-02) | Approved | 100000004 | |
| SVY-2025-BL-0002 | Boyd Lake (Reservoir) | Dam Area (BL-02) | Pending Approval | 100000003 | |
| SVY-2025-BR-0015 | Blue River | Green Mountain Reach (BR-02) | Approved | 100000004 | Comparison water. |
| SVY-2025-CR-0019 | Colorado River (Middle) | Kremmling (CR-01) | Approved | 100000004 | Comparison water. |

**Status distribution after reset:** 5 Pending Approval, 5 Approved, 2 Pending Validation, 1 Returned for Correction, 1 Flagged Suspect, 0 Draft, 0 Published.

---

## Flow 2: CPW -- Status Change Notification (OPTIONAL)

### Purpose

Sends a Microsoft Teams adaptive card (or email) to relevant users when a survey's status changes. This provides visibility into workflow progress without requiring users to poll the app.

### Flow Configuration

| Property | Value |
|---|---|
| **Flow name** | `CPW -- Status Change Notification` |
| **Type** | Automated cloud flow |
| **Trigger** | `When a row is added, modified or deleted` (Microsoft Dataverse) |
| **Connections** | Microsoft Dataverse, Microsoft Teams (or Office 365 Outlook) |

### Trigger Configuration

| Property | Value |
|---|---|
| **Change type** | Modified |
| **Table name** | `Surveys` (`cpw_Survey`) |
| **Scope** | Organization |
| **Select columns** | `cpw_status` |
| **Filter rows** | (leave blank -- we filter in the flow) |

Setting **Select columns** to `cpw_status` ensures the flow only triggers when the status column changes, not on every survey edit (e.g., editing the fish count or protocol).

### Step-by-Step Actions

#### Step 1: Get the Modified Survey

| Property | Value |
|---|---|
| **Action** | `Get a row by ID` (Microsoft Dataverse) |
| **Table name** | `Surveys` (`cpw_Survey`) |
| **Row ID** | `triggerOutputs()?['body/cpw_surveyid']` |
| **Expand Query** | `cpw_Water($select=cpw_name)` |

This retrieves the full survey row with the related Water name expanded.

#### Step 2: Compose -- Format Status Labels

| Property | Value |
|---|---|
| **Action** | `Compose` (Built-in > Data Operations) |
| **Inputs** | (expression) |

```
outputs('Get_a_row_by_ID')?['body/cpw_status@OData.Community.Display.V1.FormattedValue']
```

This expression extracts the human-readable label of the Choice field (e.g., "Pending Approval") rather than the integer value.

#### Step 3: Compose -- Build Notification Body

| Property | Value |
|---|---|
| **Action** | `Compose` (Built-in > Data Operations) |

Expression:

```
concat(
  'Survey ', outputs('Get_a_row_by_ID')?['body/cpw_surveyid'],
  ' on ', outputs('Get_a_row_by_ID')?['body/cpw_Water/cpw_name'],
  ' has been moved to status: ', outputs('Compose_-_Format_Status_Labels'), '.',
  ' Changed by: ', outputs('Get_a_row_by_ID')?['body/_modifiedby_value@OData.Community.Display.V1.FormattedValue'],
  ' at ', utcNow('yyyy-MM-dd HH:mm'), ' UTC.'
)
```

#### Step 4: Post Adaptive Card in a Chat or Channel (Microsoft Teams)

| Property | Value |
|---|---|
| **Action** | `Post adaptive card in a chat or channel` (Microsoft Teams) |
| **Post as** | Flow bot |
| **Post in** | Channel |
| **Team** | *(select the CPW Fisheries team)* |
| **Channel** | *(select a `#survey-notifications` channel)* |

**Adaptive Card JSON:**

```json
{
  "type": "AdaptiveCard",
  "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
  "version": "1.4",
  "body": [
    {
      "type": "TextBlock",
      "text": "Survey Status Change",
      "weight": "Bolder",
      "size": "Medium"
    },
    {
      "type": "FactSet",
      "facts": [
        {
          "title": "Survey ID",
          "value": "@{outputs('Get_a_row_by_ID')?['body/cpw_surveyid']}"
        },
        {
          "title": "Water",
          "value": "@{outputs('Get_a_row_by_ID')?['body/cpw_Water/cpw_name']}"
        },
        {
          "title": "New Status",
          "value": "@{outputs('Compose_-_Format_Status_Labels')}"
        },
        {
          "title": "Changed By",
          "value": "@{outputs('Get_a_row_by_ID')?['body/_modifiedby_value@OData.Community.Display.V1.FormattedValue']}"
        },
        {
          "title": "Changed At",
          "value": "@{utcNow('yyyy-MM-dd HH:mm')} UTC"
        }
      ]
    }
  ],
  "actions": [
    {
      "type": "Action.OpenUrl",
      "title": "Open in ADAMAS",
      "url": "https://apps.powerapps.com/play/e/{YOUR_APP_ID}?surveyId=@{outputs('Get_a_row_by_ID')?['body/cpw_surveyid']}"
    }
  ]
}
```

> Replace `{YOUR_APP_ID}` with the actual Power Apps app ID after publishing.

#### Alternative: Email Notification

If Teams is not available, replace Step 4 with:

| Property | Value |
|---|---|
| **Action** | `Send an email (V2)` (Office 365 Outlook) |
| **To** | *(dynamic -- see below)* |
| **Subject** | `ADAMAS: Survey @{outputs('Get_a_row_by_ID')?['body/cpw_surveyid']} moved to @{outputs('Compose_-_Format_Status_Labels')}` |
| **Body** | `outputs('Compose_-_Build_Notification_Body')` |

For the **To** field, you can look up the relevant user from `cpw_AppUser` based on the survey's water region, or hardcode a distribution list for the demo.

### Error Handling

1. **Trigger filter:** The `Select columns` filter on the trigger prevents unnecessary runs. If the flow still fires on non-status changes (due to Dataverse trigger behavior), add a `Condition` after Step 1 to verify the status actually changed by comparing `triggerOutputs()?['body/cpw_status']` to a stored previous value (requires adding a `cpw_PreviousStatus` column or checking StatusHistory).

2. **Configure run after on Teams action:** Set the Teams action to **Configure run after: is successful**. If the Teams post fails, the flow will show as failed in run history but will not affect survey data.

3. **Turn off during bulk reset:** The Reset Demo Data flow (Flow 1) updates 15 surveys, each of which could trigger this notification flow. To avoid 15 spurious notifications during a reset, either:
   - Turn off Flow 2 before running Flow 1 (manual approach).
   - Add a condition in Flow 2 that checks if the `_modifiedby_value` matches the service account running Flow 1 and skips the notification.
   - Add a `cpw_SuppressNotification` Boolean column to `cpw_Survey` that Flow 1 sets to `true` before updating statuses and `false` after. Flow 2 checks this flag and exits early if `true`.

---

## Flow 3: CPW -- Survey Submission Processor (OPTIONAL)

### Purpose

Automatically runs validation rules against `cpw_FishRecord` rows when a survey's status changes to "Pending Validation" (choice value 100000001). Creates `cpw_ValidationIssue` rows for any problems found. This simulates the validation engine from the React demo's `validationCases` data.

> **Note for demo builds:** The demo seed data already includes pre-populated `cpw_ValidationIssue` rows for the five surveys that have validation findings. This flow is only needed if you want live validation to run when new surveys are uploaded or when existing survey data is modified.

### Flow Configuration

| Property | Value |
|---|---|
| **Flow name** | `CPW -- Survey Submission Processor` |
| **Type** | Automated cloud flow |
| **Trigger** | `When a row is added, modified or deleted` (Microsoft Dataverse) |
| **Connections** | Microsoft Dataverse |

### Trigger Configuration

| Property | Value |
|---|---|
| **Change type** | Modified |
| **Table name** | `Surveys` (`cpw_Survey`) |
| **Scope** | Organization |
| **Select columns** | `cpw_status` |
| **Filter rows** | `cpw_status eq 100000001` |

The OData filter `cpw_status eq 100000001` ensures the flow only runs when the status is set to "Pending Validation" (value 100000001).

### Step-by-Step Actions

#### Step 1: Get the Survey

| Property | Value |
|---|---|
| **Action** | `Get a row by ID` (Microsoft Dataverse) |
| **Table name** | `Surveys` (`cpw_Survey`) |
| **Row ID** | `triggerOutputs()?['body/cpw_surveyid']` |

#### Step 2: List Rows -- Get Fish Records for This Survey

| Property | Value |
|---|---|
| **Action** | `List rows` (Microsoft Dataverse) |
| **Table name** | `Fish Records` (`cpw_FishRecord`) |
| **Filter rows** | `_cpw_survey_value eq '@{triggerOutputs()?['body/cpw_surveyid']}'` |
| **Row count** | `5000` |

#### Step 3: List Rows -- Get All Species (Reference)

| Property | Value |
|---|---|
| **Action** | `List rows` (Microsoft Dataverse) |
| **Table name** | `Species` (`cpw_Species`) |

This loads the full species reference table (7 rows) for code validation and range checks.

#### Step 4: Initialize Variables

Create three variables:

| Variable Name | Type | Initial Value |
|---|---|---|
| `varErrorCount` | Integer | `0` |
| `varWarningCount` | Integer | `0` |
| `varSpeciesCodes` | Array | `outputs('List_rows_-_Get_All_Species')?['body/value']` |

#### Step 5: Apply to Each -- Validate Fish Records

| Property | Value |
|---|---|
| **Select an output** | `outputs('List_rows_-_Get_Fish_Records')?['body/value']` |
| **Concurrency** | Off (sequential to keep error counts accurate) |

Inside the loop, run the following checks:

##### Check A: Species Code Valid?

| Property | Value |
|---|---|
| **Action** | `Filter array` (Built-in > Data Operations) |
| **From** | `variables('varSpeciesCodes')` |
| **Where (left)** | `item()?['cpw_code']` |
| **equals (right)** | `items('Apply_to_each_-_Validate')?['cpw_Species']` |

**Condition:** `length(body('Filter_array_-_Species_Check'))` equals `0`

If zero matches found, the species code is invalid:

| Property | Value |
|---|---|
| **Action** | `Add a new row` (Microsoft Dataverse) |
| **Table name** | `Validation Issues` (`cpw_ValidationIssue`) |
| **Survey (Lookup)** | `triggerOutputs()?['body/cpw_surveyid']` |
| **Severity** | `Error` |
| **Code** | `SPECIES_CODE_INVALID` |
| **Message** | `concat('Species code "', items('Apply_to_each_-_Validate')?['cpw_Species'], '" not recognized in CPW reference database.')` |
| **Row Number** | `items('Apply_to_each_-_Validate')?['cpw_Row']` |
| **Field** | `species_code` |

Then increment `varErrorCount`.

##### Check B: Length Within Range?

Use the matched species row from Check A (when it exists) to compare:

**Condition:**

```
or(
  less(items('Apply_to_each_-_Validate')?['cpw_LengthMm'], first(body('Filter_array_-_Species_Check'))?['cpw_LengthMinMm']),
  greater(items('Apply_to_each_-_Validate')?['cpw_LengthMm'], first(body('Filter_array_-_Species_Check'))?['cpw_LengthMaxMm'])
)
```

If true, create a `cpw_ValidationIssue` row:

| Field | Value |
|---|---|
| **Severity** | `Error` (if exceeds max by >10%) or `Warning` (if marginal) |
| **Code** | `LENGTH_OUT_OF_RANGE` |
| **Message** | `concat('Length ', string(items('Apply_to_each_-_Validate')?['cpw_LengthMm']), 'mm outside plausible range for ', first(body('Filter_array_-_Species_Check'))?['cpw_CommonName'], ' (', string(first(body('Filter_array_-_Species_Check'))?['cpw_LengthMinMm']), '-', string(first(body('Filter_array_-_Species_Check'))?['cpw_LengthMaxMm']), 'mm).')` |

Increment `varErrorCount` or `varWarningCount` accordingly.

##### Check C: Weight Within Range?

Same pattern as Check B but against `cpw_WeightMinG` / `cpw_WeightMaxG`.

#### Step 6: Update Survey with Validation Summary

| Property | Value |
|---|---|
| **Action** | `Update a row` (Microsoft Dataverse) |
| **Table name** | `Surveys` (`cpw_Survey`) |
| **Row ID** | `triggerOutputs()?['body/cpw_surveyid']` |
| **Validation Error Count** | `variables('varErrorCount')` |
| **Validation Warning Count** | `variables('varWarningCount')` |

> This requires optional `cpw_ValidationErrorCount` and `cpw_ValidationWarningCount` integer columns on `cpw_Survey`. Add them if implementing this flow.

### Error Handling

1. **Guard against re-triggers:** After updating the survey in Step 6, the status column is NOT changed (only the validation count columns are updated), so the flow will not re-trigger itself.

2. **Empty fish records:** Add a condition after Step 2: if the fish record count is 0, skip validation and add a single `cpw_ValidationIssue` with code `MISSING_REQUIRED_FIELD` and message "No fish records found for this survey."

3. **Timeout:** For surveys with hundreds of fish records, the sequential Apply to Each could take several minutes. Set the flow timeout to 30 minutes under **Settings > Timeout** (`PT30M`).

---

## Appendix A: Connection References

When importing these flows into a new environment (e.g., via a Solution), you will need to set up **Connection References** for each connector used.

| Connection Reference Name | Connector | Used By |
|---|---|---|
| `cpw_DataverseConnection` | Microsoft Dataverse | All three flows |
| `cpw_TeamsConnection` | Microsoft Teams | Flow 2 only |
| `cpw_OutlookConnection` | Office 365 Outlook | Flow 2 (email alternative) |

Create these connection references inside the Dataverse Solution that contains the flows. During import, map each reference to a live connection owned by a service account or shared connection.

---

## Appendix B: Testing Checklist

### Flow 1: CPW -- Reset Demo Data

- [ ] Run the flow from the Canvas App. Verify all 15 surveys show their seed status.
- [ ] Verify `cpw_StatusHistory` table has zero rows after reset.
- [ ] Change 3-4 survey statuses manually in the Canvas App, then run reset again. Confirm they revert.
- [ ] Remove one survey from Dataverse (simulating a missing row). Run reset. Verify the flow completes with an error count of 1 and names the missing survey in the result message.
- [ ] Check the flow run duration. Target: under 15 seconds for 15 surveys.

### Flow 2: CPW -- Status Change Notification

- [ ] Change a survey status in the Canvas App. Verify a Teams message (or email) arrives within 60 seconds.
- [ ] Verify the message contains the correct survey ID, water name, new status, and changed-by user.
- [ ] Run Flow 1 (Reset Demo Data). Verify either: (a) Flow 2 is turned off, or (b) Flow 2 suppresses notifications during reset.

### Flow 3: CPW -- Survey Submission Processor

- [ ] Change a survey status to "Pending Validation." Verify `cpw_ValidationIssue` rows are created.
- [ ] Add a fish record with an invalid species code (e.g., "ZZZ"). Trigger validation. Verify a `SPECIES_CODE_INVALID` issue is created.
- [ ] Add a fish record with length outside species range. Trigger validation. Verify a `LENGTH_OUT_OF_RANGE` issue is created.

---

## Appendix C: Alternative Approach -- Bulk Reset via Dataverse SDK

If the Apply to Each pattern in Flow 1 feels too slow for larger datasets in the future, consider replacing it with a **Dataverse custom API** or **plug-in** that performs the bulk update in a single transaction. For the 15-survey demo, the Apply to Each approach is perfectly adequate and requires no code deployment.

Another alternative is to use a **desktop flow** (Power Automate Desktop) with a direct SQL-like batch update, but this requires an on-premises data gateway and is overkill for demo purposes.

---

*End of file 06.*
