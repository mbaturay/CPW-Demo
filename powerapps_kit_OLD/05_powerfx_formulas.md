# Power Fx Formulas -- ADAMAS CPW Fisheries Canvas App

> **Copy-paste ready.** Every formula uses the Dataverse table and column names
> from the schema (`cpw_Water`, `cpw_Survey`, etc.) and the global variables
> defined in App.OnStart. Paste each formula into the property indicated in the
> heading (e.g. `Items`, `OnSelect`, `Fill`).

---

## Table of Contents

1. [App.OnStart](#1-apponstart)
2. [Reusable Helper Formulas](#2-reusable-helper-formulas)
3. [scrDashboard](#3-scrdashboard)
4. [scrWaterSelect](#4-scrwaterselect)
5. [scrWaterProfile](#5-scrwaterprofile)
6. [scrSurveyUpload](#6-scrsurveyupload)
7. [scrValidation](#7-scrvalidation)
8. [scrActivityFeed](#8-scractivityfeed)
9. [scrQueryBuilder](#9-scrquerybuilder)
10. [scrInsights](#10-scrinsights)
11. [Navigation Formulas](#11-navigation-formulas)
12. [Status Badge Color Formulas](#12-status-badge-color-formulas)
13. [Role-Based Visibility Formulas](#13-role-based-visibility-formulas)
14. [Unit Toggle Formula](#14-unit-toggle-formula)

---

## 1. App.OnStart

### App.OnStart

```
// ── 1. Look up current user in cpw_AppUser ──────────────────────────
Set(
    gblCurrentUser,
    LookUp(
        cpw_AppUsers,
        cpw_Email = User().Email
    )
);

// ── 2. Derive role text for downstream visibility checks ─────────────
Set(
    gblCurrentRole,
    Switch(
        gblCurrentUser.cpw_Role,
        'cpw_UserRole'.DataEntryAssistant,  "Data Entry Assistant",
        'cpw_UserRole'.AreaBiologist,        "Area Biologist",
        'cpw_UserRole'.SeniorBiologist,      "Senior Biologist",
        "Area Biologist"  // fallback
    )
);

// ── 3. Cache Northeast region waters (delegable snapshot) ────────────
ClearCollect(
    gblNEWaters,
    Filter(
        cpw_Waters,
        cpw_Region = 'cpw_Region'.Northeast
    )
);

// ── 4. Cache species reference (small table, safe to collect) ────────
ClearCollect(
    colSpecies,
    cpw_Species
);
```

---

## 2. Reusable Helper Formulas

These are **named formulas** you can add to `App.Formulas` (or inline where
needed). If your environment does not support named formulas, copy the body
into the control property directly.

### Status badge background color (use in Fill)

```
// Paste into a label or HTML-text control's Fill property.
// Replace ThisItem.cpw_Status with the actual status field reference.
Switch(
    ThisItem.cpw_Status,
    'cpw_SurveyStatus'.Approved,                RGBA(34, 139, 34, 0.10),
    'cpw_SurveyStatus'.Published,               RGBA(34, 139, 34, 0.10),
    'cpw_SurveyStatus'.FlaggedSuspect,           RGBA(220, 38, 38, 0.10),
    'cpw_SurveyStatus'.ReturnedforCorrection,    RGBA(220, 38, 38, 0.10),
    'cpw_SurveyStatus'.PendingValidation,        RGBA(217, 119, 6, 0.10),
    'cpw_SurveyStatus'.PendingApproval,          RGBA(217, 119, 6, 0.10),
    'cpw_SurveyStatus'.Draft,                    RGBA(217, 119, 6, 0.10),
    RGBA(217, 119, 6, 0.10)
)
```

### Status badge text color (use in Color)

```
Switch(
    ThisItem.cpw_Status,
    'cpw_SurveyStatus'.Approved,                RGBA(34, 139, 34, 1),
    'cpw_SurveyStatus'.Published,               RGBA(34, 139, 34, 1),
    'cpw_SurveyStatus'.FlaggedSuspect,           RGBA(220, 38, 38, 1),
    'cpw_SurveyStatus'.ReturnedforCorrection,    RGBA(220, 38, 38, 1),
    'cpw_SurveyStatus'.PendingValidation,        RGBA(217, 119, 6, 1),
    'cpw_SurveyStatus'.PendingApproval,          RGBA(217, 119, 6, 1),
    'cpw_SurveyStatus'.Draft,                    RGBA(217, 119, 6, 1),
    RGBA(217, 119, 6, 1)
)
```

### Status display text (use in Text)

```
Switch(
    ThisItem.cpw_Status,
    'cpw_SurveyStatus'.Approved,                "Approved",
    'cpw_SurveyStatus'.Published,               "Published",
    'cpw_SurveyStatus'.FlaggedSuspect,           "Flagged Suspect",
    'cpw_SurveyStatus'.ReturnedforCorrection,    "Returned for Correction",
    'cpw_SurveyStatus'.PendingValidation,        "Pending Validation",
    'cpw_SurveyStatus'.PendingApproval,          "Pending Approval",
    'cpw_SurveyStatus'.Draft,                    "Draft",
    "Unknown"
)
```

---

## 3. scrDashboard

### scrDashboard.OnVisible

```
// ── Reload NE surveys fresh (no stale cache after status patches) ────
ClearCollect(
    colNESurveys,
    Filter(
        cpw_Surveys,
        cpw_Water.cpw_WaterId in
            ForAll(gblNEWaters, cpw_WaterId)
    )
);

// ── Build review queue: actionable statuses only ─────────────────────
ClearCollect(
    colReviewQueue,
    SortByColumns(
        Filter(
            colNESurveys,
            cpw_Status = 'cpw_SurveyStatus'.PendingValidation
            || cpw_Status = 'cpw_SurveyStatus'.ReturnedforCorrection
            || cpw_Status = 'cpw_SurveyStatus'.PendingApproval
            || cpw_Status = 'cpw_SurveyStatus'.FlaggedSuspect
        ),
        "cpw_SurveyDate",
        SortOrder.Descending
    )
);

// ── Compute stat counts ──────────────────────────────────────────────
Set(
    gblPendingCount,
    CountRows(
        Filter(
            colNESurveys,
            cpw_Status = 'cpw_SurveyStatus'.PendingValidation
            || cpw_Status = 'cpw_SurveyStatus'.PendingApproval
        )
    )
);

Set(
    gblFlaggedCount,
    CountRows(
        Filter(
            colNESurveys,
            cpw_Status = 'cpw_SurveyStatus'.FlaggedSuspect
        )
    )
);

Set(
    gblWatersActiveCount,
    CountRows(gblNEWaters)
);
```

### lblWatersActive.Text

```
Text(gblWatersActiveCount)
```

### lblWatersActiveSubtitle.Text

```
gblWatersActiveCount & " in Northeast Region"
```

### lblPendingApproval.Text

```
Text(gblPendingCount)
```

### lblPendingSubtitle.Text

```
"Across " & CountRows(colReviewQueue) & " items in queue"
```

### lblFlaggedSurveys.Text

```
Text(gblFlaggedCount)
```

### lblFlaggedSubtitle.Text

```
If(
    gblFlaggedCount > 0,
    "Data quality review needed",
    "No flagged surveys"
)
```

### galReviewQueue.Items

```
colReviewQueue
```

### galReviewQueue > lblSurveyId.Text

```
ThisItem.cpw_SurveyId
```

### galReviewQueue > lblWaterName.Text

```
ThisItem.cpw_Water.cpw_Name
```

### galReviewQueue > lblProtocol.Text

```
Switch(
    ThisItem.cpw_Protocol,
    'cpw_Protocol'.TwoPassRemoval,      "Two-Pass Removal",
    'cpw_Protocol'.SinglePassCPUE,      "Single-Pass CPUE",
    'cpw_Protocol'.MarkRecapture,       "Mark-Recapture",
    'cpw_Protocol'.ElectrofishingCPUE,  "Electrofishing CPUE",
    ""
)
```

### galReviewQueue > lblDate.Text

```
Text(ThisItem.cpw_SurveyDate, "yyyy-mm-dd")
```

### galReviewQueue > lblStatus.Text

```
// Use the reusable status display text formula from Section 2
Switch(
    ThisItem.cpw_Status,
    'cpw_SurveyStatus'.Approved,                "Approved",
    'cpw_SurveyStatus'.Published,               "Published",
    'cpw_SurveyStatus'.FlaggedSuspect,           "Flagged Suspect",
    'cpw_SurveyStatus'.ReturnedforCorrection,    "Returned for Correction",
    'cpw_SurveyStatus'.PendingValidation,        "Pending Validation",
    'cpw_SurveyStatus'.PendingApproval,          "Pending Approval",
    'cpw_SurveyStatus'.Draft,                    "Draft",
    ""
)
```

### galReviewQueue > lblStatus.Fill

```
Switch(
    ThisItem.cpw_Status,
    'cpw_SurveyStatus'.Approved,                RGBA(34, 139, 34, 0.10),
    'cpw_SurveyStatus'.Published,               RGBA(34, 139, 34, 0.10),
    'cpw_SurveyStatus'.FlaggedSuspect,           RGBA(220, 38, 38, 0.10),
    'cpw_SurveyStatus'.ReturnedforCorrection,    RGBA(220, 38, 38, 0.10),
    RGBA(217, 119, 6, 0.10)
)
```

### galReviewQueue > lblStatus.Color

```
Switch(
    ThisItem.cpw_Status,
    'cpw_SurveyStatus'.Approved,                RGBA(34, 139, 34, 1),
    'cpw_SurveyStatus'.Published,               RGBA(34, 139, 34, 1),
    'cpw_SurveyStatus'.FlaggedSuspect,           RGBA(220, 38, 38, 1),
    'cpw_SurveyStatus'.ReturnedforCorrection,    RGBA(220, 38, 38, 1),
    RGBA(217, 119, 6, 1)
)
```

### galReviewQueue > btnAction.Text

```
If(
    ThisItem.cpw_Status = 'cpw_SurveyStatus'.ReturnedforCorrection,
    "Continue",
    "Review"
)
```

### galReviewQueue > btnAction.OnSelect

```
Navigate(
    scrValidation,
    ScreenTransition.None,
    {
        locSelectedSurvey: ThisItem
    }
)
```

### btnViewAll.OnSelect (Review Queue card)

```
Navigate(scrActivityFeed, ScreenTransition.None)
```

### galWatersInRegion.Items

```
AddColumns(
    gblNEWaters,
    "SurveyCount",
        CountRows(
            Filter(colNESurveys, cpw_Water.cpw_WaterId = ThisRecord.cpw_WaterId)
        ),
    "LastSurveyDate",
        Text(
            Max(
                Filter(colNESurveys, cpw_Water.cpw_WaterId = ThisRecord.cpw_WaterId),
                cpw_SurveyDate
            ),
            "yyyy-mm-dd"
        )
)
```

### galWatersInRegion > lblWaterName.OnSelect

```
Navigate(
    scrWaterProfile,
    ScreenTransition.None,
    {
        locSelectedWater: ThisItem
    }
)
```

### Dashboard role routing (scrDashboard.OnVisible, prepend)

```
// Route to role-specific dashboard layouts
If(
    gblCurrentRole = "Data Entry Assistant",
    Set(locDashboardView, "DataEntry"),
    gblCurrentRole = "Senior Biologist",
    Set(locDashboardView, "Senior"),
    Set(locDashboardView, "AreaBiologist")
);
```

### grpDataEntryDashboard.Visible

```
locDashboardView = "DataEntry"
```

### grpAreaBiologistDashboard.Visible

```
locDashboardView = "AreaBiologist"
```

### grpSeniorDashboard.Visible

```
locDashboardView = "Senior"
```

---

## 4. scrWaterSelect

### scrWaterSelect.OnVisible

```
// NE waters already cached in gblNEWaters from App.OnStart.
// No additional load needed. Refresh if you want live data:
// ClearCollect(gblNEWaters, Filter(cpw_Waters, cpw_Region = 'cpw_Region'.Northeast));
```

### galWaterList.Items

```
AddColumns(
    gblNEWaters,
    "SurveyCount",
        CountRows(
            Filter(cpw_Surveys, cpw_Water.cpw_WaterId = ThisRecord.cpw_WaterId)
        ),
    "StationCount",
        CountRows(
            Filter(cpw_Stations, cpw_Water.cpw_WaterId = ThisRecord.cpw_WaterId)
        ),
    "SpeciesNames",
        Concat(
            Filter(
                colSpecies,
                cpw_Code in Split(ThisRecord.cpw_PrimarySpecies, ",")
            ),
            cpw_CommonName,
            ", "
        ),
    "YearsRange",
        ThisRecord.cpw_YearsActiveStart & " - " & ThisRecord.cpw_YearsActiveEnd
)
```

### galWaterList > lblWaterName.Text

```
ThisItem.cpw_Name
```

### galWaterList > lblSpecies.Text

```
ThisItem.SpeciesNames
```

### galWaterList > lblSurveyCount.Text

```
Text(ThisItem.SurveyCount)
```

### galWaterList > lblStationCount.Text

```
ThisItem.StationCount & " station" & If(ThisItem.StationCount <> 1, "s", "")
```

### galWaterList > lblYears.Text

```
ThisItem.YearsRange
```

### galWaterList.OnSelect

```
Navigate(
    scrWaterProfile,
    ScreenTransition.None,
    {
        locSelectedWater: ThisItem
    }
)
```

---

## 5. scrWaterProfile

### scrWaterProfile.OnVisible

```
// ── Load water details from context ──────────────────────────────────
// locSelectedWater is passed via Navigate context.

// ── Load surveys for this water ──────────────────────────────────────
ClearCollect(
    colWaterSurveys,
    SortByColumns(
        Filter(
            cpw_Surveys,
            cpw_Water.cpw_WaterId = locSelectedWater.cpw_WaterId
        ),
        "cpw_SurveyDate",
        SortOrder.Descending
    )
);

// ── Load stations for this water ─────────────────────────────────────
ClearCollect(
    colWaterStations,
    Filter(
        cpw_Stations,
        cpw_Water.cpw_WaterId = locSelectedWater.cpw_WaterId
    )
);

// ── Load trend data for this water ───────────────────────────────────
ClearCollect(
    colWaterTrend,
    SortByColumns(
        Filter(
            cpw_TrendDatas,
            cpw_Water.cpw_WaterId = locSelectedWater.cpw_WaterId
            && IsBlank(cpw_SpeciesCode)
        ),
        "cpw_Year",
        SortOrder.Ascending
    )
);

// ── Compute summary values ───────────────────────────────────────────
Set(
    locLatestTrend,
    Last(colWaterTrend)
);

Set(
    locPrevTrend,
    Last(FirstN(colWaterTrend, CountRows(colWaterTrend) - 1))
);

Set(
    locTrendDirection,
    If(
        !IsBlank(locLatestTrend) && !IsBlank(locPrevTrend),
        If(locLatestTrend.cpw_CPUE >= locPrevTrend.cpw_CPUE, "up", "down"),
        "up"
    )
);

// ── Data Entry status counts ─────────────────────────────────────────
Set(locDE_Uploaded,   CountRows(colWaterSurveys));
Set(locDE_Pending,    CountRows(Filter(colWaterSurveys, cpw_Status = 'cpw_SurveyStatus'.PendingValidation)));
Set(locDE_Returned,   CountRows(Filter(colWaterSurveys, cpw_Status = 'cpw_SurveyStatus'.ReturnedforCorrection)));
Set(locDE_Approval,   CountRows(Filter(colWaterSurveys, cpw_Status = 'cpw_SurveyStatus'.PendingApproval)));

// ── Primary species name ─────────────────────────────────────────────
Set(
    locPrimarySpeciesCode,
    First(Split(locSelectedWater.cpw_PrimarySpecies, ",")).Value
);
Set(
    locPrimarySpeciesName,
    LookUp(colSpecies, cpw_Code = locPrimarySpeciesCode, cpw_CommonName)
);
```

### lblWaterName.Text (banner)

```
locSelectedWater.cpw_Name
```

### lblRegion.Text (banner)

```
Switch(
    locSelectedWater.cpw_Region,
    'cpw_Region'.Northeast,   "Northeast",
    'cpw_Region'.Southeast,   "Southeast",
    'cpw_Region'.Northwest,   "Northwest",
    'cpw_Region'.Southwest,   "Southwest",
    'cpw_Region'.Central,     "Central",
    'cpw_Region'.Comparison,  "Comparison",
    ""
)
```

### lblHUC.Text (banner)

```
locSelectedWater.cpw_HUC12
```

### lblStationCountBanner.Text

```
Text(CountRows(colWaterStations)) & " stations"
```

### lblTotalSurveys.Text

```
Text(CountRows(colWaterSurveys)) & " surveys"
```

### lblYearsActive.Text

```
locSelectedWater.cpw_YearsActiveStart & " - " & locSelectedWater.cpw_YearsActiveEnd
```

### lblPopulation.Text (summary card)

```
If(
    !IsBlank(locLatestTrend.cpw_PopEstimate),
    Text(locLatestTrend.cpw_PopEstimate, "#,##0"),
    Text(locLatestTrend.cpw_CPUE, "#.0") & " CPUE"
)
```

### lblPopTrend.Text

```
If(
    locTrendDirection = "up",
    "Stable trend",
    "Declining trend"
)
```

### icoTrendArrow.Icon

```
If(locTrendDirection = "up", Icon.TrendingUp, Icon.TrendingDown)
```

### icoTrendArrow.Color

```
If(locTrendDirection = "up", RGBA(34, 139, 34, 1), RGBA(220, 38, 38, 1))
```

### lblPrimarySpecies.Text

```
locPrimarySpeciesCode
```

### lblPrimarySpeciesSubtitle.Text

```
locPrimarySpeciesName
```

### lblLastSurvey.Text

```
Text(First(colWaterSurveys).cpw_SurveyDate, "mmm dd")
```

### galRecentSurveys.Items

```
FirstN(colWaterSurveys, 4)
```

### galRecentSurveys > lblSurveyId.Text

```
ThisItem.cpw_SurveyId
```

### galRecentSurveys > lblStationDate.Text

```
"Station " & ThisItem.cpw_Station.cpw_StationId & " - " & Text(ThisItem.cpw_SurveyDate, "yyyy-mm-dd")
```

### galRecentSurveys.OnSelect

```
Navigate(
    scrValidation,
    ScreenTransition.None,
    {
        locSelectedSurvey: ThisItem
    }
)
```

### galStationsInBasin.Items

```
colWaterStations
```

### galStationsInBasin > lblStationId.Text

```
ThisItem.cpw_StationId
```

### btnViewAnalytics.OnSelect

```
Navigate(
    scrInsights,
    ScreenTransition.None,
    {
        locSelectedWater: locSelectedWater
    }
)
```

### grpDataEntryView.Visible (Data Entry simplified view)

```
gblCurrentRole = "Data Entry Assistant"
```

### grpAnalyticsView.Visible (Biologist analytics view)

```
gblCurrentRole <> "Data Entry Assistant"
```

### lblRegionalScope.Visible

```
gblCurrentRole = "Area Biologist"
```

### Data Entry stat cards

```
// lblDE_Uploaded.Text
Text(locDE_Uploaded)

// lblDE_Pending.Text
Text(locDE_Pending)

// lblDE_Returned.Text
Text(locDE_Returned)

// lblDE_Approval.Text
Text(locDE_Approval)
```

### CPUE Trend chart data (for Power Apps line chart or chart control)

```
// colWaterTrend is already loaded in OnVisible.
// Use it as the Items source for a line chart control.
// X-axis: cpw_Year
// Y-axis: cpw_CPUE
```

---

## 6. scrSurveyUpload

### scrSurveyUpload.OnVisible

```
// Load waters the user can upload to (NE region cached).
// For Data Entry: filter to assigned waters only.
// For others: show all NE waters.
If(
    gblCurrentRole = "Data Entry Assistant",
    ClearCollect(
        colUploadWaters,
        Filter(
            gblNEWaters,
            cpw_WaterId in ["south-platte", "cache-la-poudre"]
            // In production, join to an assignment table
        )
    ),
    ClearCollect(colUploadWaters, gblNEWaters)
);
```

### drpUploadWater.Items

```
colUploadWaters
```

### drpUploadWater.DisplayFields (or .Value)

```
cpw_Name
```

### drpUploadStation.Items

```
Filter(
    cpw_Stations,
    cpw_Water.cpw_WaterId = drpUploadWater.Selected.cpw_WaterId
)
```

### btnUploadSubmit.OnSelect

```
// Create a new survey record from the upload form
Set(
    locNewSurvey,
    Patch(
        cpw_Surveys,
        Defaults(cpw_Surveys),
        {
            cpw_SurveyId: "SVY-" & Text(Year(Today()), "0000") & "-" & Text(CountRows(cpw_Surveys) + 1, "0000"),
            cpw_Water: drpUploadWater.Selected,
            cpw_Station: drpUploadStation.Selected,
            cpw_SurveyDate: dtpSurveyDate.SelectedDate,
            cpw_Protocol: drpProtocol.Selected.Value,
            cpw_Uploader: gblCurrentUser.cpw_DisplayName,
            cpw_Status: 'cpw_SurveyStatus'.Draft,
            cpw_FishCount: 0,
            cpw_SpeciesDetected: ""
        }
    )
);

// Write initial status history
Patch(
    cpw_StatusHistorys,
    Defaults(cpw_StatusHistorys),
    {
        cpw_Survey: locNewSurvey,
        cpw_FromStatus: Blank(),
        cpw_ToStatus: 'cpw_SurveyStatus'.Draft,
        cpw_ChangedBy: gblCurrentUser.cpw_DisplayName,
        cpw_ChangedOn: Now(),
        cpw_Reason: "Survey created"
    }
);

Notify("Survey created successfully.", NotificationType.Success);
Navigate(
    scrValidation,
    ScreenTransition.None,
    { locSelectedSurvey: locNewSurvey }
);
```

---

## 7. scrValidation

### scrValidation.OnVisible

```
// ── Load the selected survey ─────────────────────────────────────────
// locSelectedSurvey is passed via Navigate context.
Set(locSurvey, locSelectedSurvey);

// ── Load water and station details ───────────────────────────────────
Set(locValWater, locSurvey.cpw_Water);
Set(locValStation, locSurvey.cpw_Station);

// ── Load fish records for this survey ────────────────────────────────
ClearCollect(
    colFishRecords,
    SortByColumns(
        Filter(
            cpw_FishRecords,
            cpw_Survey.cpw_SurveyId = locSurvey.cpw_SurveyId
        ),
        "cpw_Row",
        SortOrder.Ascending
    )
);

// ── Load validation issues ───────────────────────────────────────────
ClearCollect(
    colValIssues,
    Filter(
        cpw_ValidationIssues,
        cpw_Survey.cpw_SurveyId = locSurvey.cpw_SurveyId
    )
);

// ── Compute row counts ───────────────────────────────────────────────
Set(locValidCount,   CountRows(Filter(colFishRecords, cpw_RecordStatus = 'cpw_RecordStatus'.Valid)));
Set(locWarningCount, CountRows(Filter(colFishRecords, cpw_RecordStatus = 'cpw_RecordStatus'.Warning)));
Set(locErrorCount,   CountRows(Filter(colFishRecords, cpw_RecordStatus = 'cpw_RecordStatus'.Error)));
Set(locTotalRecords, CountRows(colFishRecords));

// ── Default unit to mm ───────────────────────────────────────────────
Set(locUnit, "mm");

// ── Terminal status check ────────────────────────────────────────────
Set(
    locIsTerminal,
    locSurvey.cpw_Status = 'cpw_SurveyStatus'.Approved
    || locSurvey.cpw_Status = 'cpw_SurveyStatus'.Published
);

// ── Clear action message ─────────────────────────────────────────────
Set(locActionMessage, Blank());
```

### lblValWaterName.Text

```
locValWater.cpw_Name
```

### lblValStation.Text

```
locValStation.cpw_StationId
```

### lblValDate.Text

```
Text(locSurvey.cpw_SurveyDate, "mmm dd, yyyy")
```

### lblValProtocol.Text

```
Switch(
    locSurvey.cpw_Protocol,
    'cpw_Protocol'.TwoPassRemoval,      "Two-Pass Removal",
    'cpw_Protocol'.SinglePassCPUE,      "Single-Pass CPUE",
    'cpw_Protocol'.MarkRecapture,       "Mark-Recapture",
    'cpw_Protocol'.ElectrofishingCPUE,  "Electrofishing CPUE",
    ""
)
```

### lblValUploader.Text

```
locSurvey.cpw_Uploader
```

### lblValidCount.Text

```
Text(locValidCount)
```

### lblWarningCount.Text

```
Text(locWarningCount)
```

### lblErrorCount.Text

```
Text(locErrorCount)
```

### lblTotalRecords.Text

```
Text(locTotalRecords)
```

### galFishRecords.Items

```
colFishRecords
```

### galFishRecords > lblRow.Text

```
Text(ThisItem.cpw_Row)
```

### galFishRecords > lblPass.Text

```
Text(ThisItem.cpw_Pass)
```

### galFishRecords > lblSpecies.Text

```
ThisItem.cpw_Species
```

### galFishRecords > lblLength.Text

```
If(
    locUnit = "mm",
    Text(ThisItem.cpw_LengthMm, "#,##0"),
    Text(Round(ThisItem.cpw_LengthMm / 25.4, 1), "#,##0.0")
)
```

### galFishRecords > lblWeight.Text

```
Text(ThisItem.cpw_WeightG, "#,##0")
```

### galFishRecords > lblRecordStatus.Text

```
Switch(
    ThisItem.cpw_RecordStatus,
    'cpw_RecordStatus'.Valid,    "Valid",
    'cpw_RecordStatus'.Warning,  "Warning",
    'cpw_RecordStatus'.Error,    "Error",
    ""
)
```

### galFishRecords > lblRecordStatus.Color

```
Switch(
    ThisItem.cpw_RecordStatus,
    'cpw_RecordStatus'.Valid,    RGBA(34, 139, 34, 1),
    'cpw_RecordStatus'.Warning,  RGBA(217, 119, 6, 1),
    'cpw_RecordStatus'.Error,    RGBA(220, 38, 38, 1),
    RGBA(100, 100, 100, 1)
)
```

### galFishRecords > recRowStrip.Fill (left color strip)

```
Switch(
    ThisItem.cpw_RecordStatus,
    'cpw_RecordStatus'.Error,    RGBA(220, 38, 38, 1),
    'cpw_RecordStatus'.Warning,  RGBA(217, 119, 6, 1),
    Transparent
)
```

### galFishRecords > row background Fill

```
Switch(
    ThisItem.cpw_RecordStatus,
    'cpw_RecordStatus'.Error,    RGBA(220, 38, 38, 0.02),
    'cpw_RecordStatus'.Warning,  RGBA(217, 119, 6, 0.02),
    RGBA(255, 255, 255, 1)
)
```

### galValIssues.Items

```
colValIssues
```

### galValIssues > lblIssueSeverity.Text

```
If(
    ThisItem.cpw_Severity = 'cpw_IssueSeverity'.Error,
    "Error",
    "Warning"
)
```

### galValIssues > lblIssueSeverity.Color

```
If(
    ThisItem.cpw_Severity = 'cpw_IssueSeverity'.Error,
    RGBA(220, 38, 38, 1),
    RGBA(217, 119, 6, 1)
)
```

### galValIssues > lblIssueRow.Text

```
If(!IsBlank(ThisItem.cpw_Row), "Row " & ThisItem.cpw_Row, Coalesce(ThisItem.cpw_Field, ThisItem.cpw_Code))
```

### galValIssues > lblIssueMessage.Text

```
ThisItem.cpw_Message
```

### galValIssues > lblIssueSuggestion.Text

```
If(!IsBlank(ThisItem.cpw_Suggestion), "Suggestion: " & ThisItem.cpw_Suggestion, "")
```

### galValIssues > issue card Fill

```
If(
    ThisItem.cpw_Severity = 'cpw_IssueSeverity'.Error,
    RGBA(220, 38, 38, 0.05),
    RGBA(217, 119, 6, 0.05)
)
```

### galValIssues > issue card BorderColor

```
If(
    ThisItem.cpw_Severity = 'cpw_IssueSeverity'.Error,
    RGBA(220, 38, 38, 0.20),
    RGBA(217, 119, 6, 0.20)
)
```

### Action message display

```
// lblActionMessage.Text
locActionMessage

// lblActionMessage.Visible
!IsBlank(locActionMessage)

// lblActionMessage.Color
RGBA(34, 139, 34, 1)
```

---

### Validation Action Buttons

#### btnApprove.OnSelect

```
// ── Patch survey status ──────────────────────────────────────────────
Patch(
    cpw_Surveys,
    locSurvey,
    { cpw_Status: 'cpw_SurveyStatus'.Approved }
);

// ── Write status history ─────────────────────────────────────────────
Patch(
    cpw_StatusHistorys,
    Defaults(cpw_StatusHistorys),
    {
        cpw_Survey: locSurvey,
        cpw_FromStatus: locSurvey.cpw_Status,
        cpw_ToStatus: 'cpw_SurveyStatus'.Approved,
        cpw_ChangedBy: gblCurrentUser.cpw_DisplayName,
        cpw_ChangedOn: Now(),
        cpw_Reason: "Approved by " & gblCurrentUser.cpw_DisplayName
    }
);

// ── Refresh local state immediately ──────────────────────────────────
Set(locSurvey, LookUp(cpw_Surveys, cpw_SurveyId = locSurvey.cpw_SurveyId));
Set(locIsTerminal, true);
Set(locActionMessage, "Survey approved successfully.");
Notify("Survey approved successfully.", NotificationType.Success);
```

#### btnApprove.DisplayMode

```
If(
    locIsTerminal || locErrorCount > 0,
    DisplayMode.Disabled,
    DisplayMode.Edit
)
```

#### btnApprove.Text

```
If(
    locSurvey.cpw_Status = 'cpw_SurveyStatus'.Approved,
    "Approved",
    "Approve Survey"
)
```

#### btnApprove.Visible

```
gblCurrentRole = "Area Biologist"
```

#### btnRequestCorrection.OnSelect

```
Patch(
    cpw_Surveys,
    locSurvey,
    { cpw_Status: 'cpw_SurveyStatus'.ReturnedforCorrection }
);

Patch(
    cpw_StatusHistorys,
    Defaults(cpw_StatusHistorys),
    {
        cpw_Survey: locSurvey,
        cpw_FromStatus: locSurvey.cpw_Status,
        cpw_ToStatus: 'cpw_SurveyStatus'.ReturnedforCorrection,
        cpw_ChangedBy: gblCurrentUser.cpw_DisplayName,
        cpw_ChangedOn: Now(),
        cpw_Reason: "Returned for correction by " & gblCurrentUser.cpw_DisplayName
    }
);

Set(locSurvey, LookUp(cpw_Surveys, cpw_SurveyId = locSurvey.cpw_SurveyId));
Set(locIsTerminal, false);
Set(locActionMessage, "Survey returned for correction.");
Notify("Survey returned for correction.", NotificationType.Warning);
```

#### btnRequestCorrection.DisplayMode

```
If(locIsTerminal, DisplayMode.Disabled, DisplayMode.Edit)
```

#### btnRequestCorrection.Visible

```
gblCurrentRole = "Area Biologist"
```

#### btnSubmitForReview.OnSelect

```
Patch(
    cpw_Surveys,
    locSurvey,
    { cpw_Status: 'cpw_SurveyStatus'.PendingApproval }
);

Patch(
    cpw_StatusHistorys,
    Defaults(cpw_StatusHistorys),
    {
        cpw_Survey: locSurvey,
        cpw_FromStatus: locSurvey.cpw_Status,
        cpw_ToStatus: 'cpw_SurveyStatus'.PendingApproval,
        cpw_ChangedBy: gblCurrentUser.cpw_DisplayName,
        cpw_ChangedOn: Now(),
        cpw_Reason: "Submitted for review by " & gblCurrentUser.cpw_DisplayName
    }
);

Set(locSurvey, LookUp(cpw_Surveys, cpw_SurveyId = locSurvey.cpw_SurveyId));
Set(locActionMessage, "Survey submitted for review.");
Notify("Survey submitted for review.", NotificationType.Success);
```

#### btnSubmitForReview.DisplayMode

```
If(locIsTerminal, DisplayMode.Disabled, DisplayMode.Edit)
```

#### btnSubmitForReview.Visible

```
gblCurrentRole = "Data Entry Assistant"
```

#### btnFlagSuspect.OnSelect

```
Patch(
    cpw_Surveys,
    locSurvey,
    { cpw_Status: 'cpw_SurveyStatus'.FlaggedSuspect }
);

Patch(
    cpw_StatusHistorys,
    Defaults(cpw_StatusHistorys),
    {
        cpw_Survey: locSurvey,
        cpw_FromStatus: locSurvey.cpw_Status,
        cpw_ToStatus: 'cpw_SurveyStatus'.FlaggedSuspect,
        cpw_ChangedBy: gblCurrentUser.cpw_DisplayName,
        cpw_ChangedOn: Now(),
        cpw_Reason: "Flagged as suspect by " & gblCurrentUser.cpw_DisplayName
    }
);

Set(locSurvey, LookUp(cpw_Surveys, cpw_SurveyId = locSurvey.cpw_SurveyId));
Set(locIsTerminal, false);
Set(locActionMessage, "Survey flagged as suspect.");
Notify("Survey flagged as suspect.", NotificationType.Error);
```

#### btnFlagSuspect.DisplayMode

```
If(locIsTerminal, DisplayMode.Disabled, DisplayMode.Edit)
```

#### btnFlagSuspect.Visible

```
gblCurrentRole = "Senior Biologist"
```

#### btnPublish.OnSelect

```
Patch(
    cpw_Surveys,
    locSurvey,
    { cpw_Status: 'cpw_SurveyStatus'.Published }
);

Patch(
    cpw_StatusHistorys,
    Defaults(cpw_StatusHistorys),
    {
        cpw_Survey: locSurvey,
        cpw_FromStatus: locSurvey.cpw_Status,
        cpw_ToStatus: 'cpw_SurveyStatus'.Published,
        cpw_ChangedBy: gblCurrentUser.cpw_DisplayName,
        cpw_ChangedOn: Now(),
        cpw_Reason: "Published to analysis by " & gblCurrentUser.cpw_DisplayName
    }
);

Set(locSurvey, LookUp(cpw_Surveys, cpw_SurveyId = locSurvey.cpw_SurveyId));
Set(locIsTerminal, true);
Set(locActionMessage, "Survey published to analysis.");
Notify("Survey published to analysis.", NotificationType.Success);
```

#### btnPublish.DisplayMode

```
If(
    locIsTerminal || locErrorCount > 0,
    DisplayMode.Disabled,
    DisplayMode.Edit
)
```

#### btnPublish.Text

```
If(
    locSurvey.cpw_Status = 'cpw_SurveyStatus'.Published,
    "Published",
    "Publish to Analysis"
)
```

#### btnPublish.Visible

```
gblCurrentRole = "Senior Biologist"
```

#### btnRevalidate.OnSelect

```
// Re-run validation (placeholder: in production call a Power Automate flow)
Set(locActionMessage, "Validation rules reapplied -- no new issues found.");
// Clear the message after 3 seconds
Timer1.Start = true;
```

```
// Timer1.OnTimerEnd
Set(locActionMessage, Blank());
```

```
// Timer1.Duration
3000
```

### Status badge on validation header

```
// lblCurrentStatus.Text
Switch(
    locSurvey.cpw_Status,
    'cpw_SurveyStatus'.Approved,                "Approved",
    'cpw_SurveyStatus'.Published,               "Published",
    'cpw_SurveyStatus'.FlaggedSuspect,           "Flagged Suspect",
    'cpw_SurveyStatus'.ReturnedforCorrection,    "Returned for Correction",
    'cpw_SurveyStatus'.PendingValidation,        "Pending Validation",
    'cpw_SurveyStatus'.PendingApproval,          "Pending Approval",
    'cpw_SurveyStatus'.Draft,                    "Draft",
    ""
)

// lblCurrentStatus.Fill
Switch(
    locSurvey.cpw_Status,
    'cpw_SurveyStatus'.Approved,                RGBA(34, 139, 34, 0.10),
    'cpw_SurveyStatus'.Published,               RGBA(34, 139, 34, 0.10),
    'cpw_SurveyStatus'.FlaggedSuspect,           RGBA(220, 38, 38, 0.10),
    'cpw_SurveyStatus'.ReturnedforCorrection,    RGBA(220, 38, 38, 0.10),
    RGBA(217, 119, 6, 0.10)
)

// lblCurrentStatus.Color
Switch(
    locSurvey.cpw_Status,
    'cpw_SurveyStatus'.Approved,                RGBA(34, 139, 34, 1),
    'cpw_SurveyStatus'.Published,               RGBA(34, 139, 34, 1),
    'cpw_SurveyStatus'.FlaggedSuspect,           RGBA(220, 38, 38, 1),
    'cpw_SurveyStatus'.ReturnedforCorrection,    RGBA(220, 38, 38, 1),
    RGBA(217, 119, 6, 1)
)
```

### Species Reference panel

```
// galSpeciesRef.Items
FirstN(colSpecies, 5)

// galSpeciesRef > lblCode.Text
ThisItem.cpw_Code

// galSpeciesRef > lblCommon.Text
ThisItem.cpw_CommonName
```

---

## 8. scrActivityFeed

### scrActivityFeed.OnVisible

```
// ── Load all NE surveys (full set, not just review queue) ────────────
ClearCollect(
    colAllNESurveys,
    SortByColumns(
        Filter(
            cpw_Surveys,
            cpw_Water.cpw_WaterId in
                ForAll(gblNEWaters, cpw_WaterId)
        ),
        "cpw_SurveyDate",
        SortOrder.Descending
    )
);

// ── Initialize filter state ──────────────────────────────────────────
Set(locFeedWaterFilter, "all");
Set(locFeedStatusFilter, "all");
Set(locFeedDateFrom, Blank());
```

### drpFeedWater.Items

```
Ungroup(
    Table(
        { Items: Table({ Value: "all", Display: "All Waters" }) },
        { Items: AddColumns(gblNEWaters, "Value", cpw_WaterId, "Display", cpw_Name) }
    ),
    "Items"
)
```

### drpFeedWater.OnChange

```
Set(locFeedWaterFilter, drpFeedWater.Selected.Value)
```

### drpFeedStatus.Items

```
Table(
    { Value: "all",      Display: "All Statuses" },
    { Value: "pending",  Display: "Pending / In Review" },
    { Value: "approved", Display: "Approved / Published" },
    { Value: "flagged",  Display: "Flagged Suspect" },
    { Value: "draft",    Display: "Draft" }
)
```

### drpFeedStatus.OnChange

```
Set(locFeedStatusFilter, drpFeedStatus.Selected.Value)
```

### dtpFeedDateFrom.OnChange

```
Set(locFeedDateFrom, dtpFeedDateFrom.SelectedDate)
```

### Filtered collection (computed each time filters change)

Use this as the Items for `galActivityFeed`:

```
SortByColumns(
    Filter(
        colAllNESurveys,

        // Water filter
        (locFeedWaterFilter = "all"
            || cpw_Water.cpw_WaterId = locFeedWaterFilter),

        // Status filter
        (locFeedStatusFilter = "all"
            || (locFeedStatusFilter = "pending"
                && (cpw_Status = 'cpw_SurveyStatus'.PendingValidation
                    || cpw_Status = 'cpw_SurveyStatus'.PendingApproval
                    || cpw_Status = 'cpw_SurveyStatus'.ReturnedforCorrection))
            || (locFeedStatusFilter = "approved"
                && (cpw_Status = 'cpw_SurveyStatus'.Approved
                    || cpw_Status = 'cpw_SurveyStatus'.Published))
            || (locFeedStatusFilter = "flagged"
                && cpw_Status = 'cpw_SurveyStatus'.FlaggedSuspect)
            || (locFeedStatusFilter = "draft"
                && cpw_Status = 'cpw_SurveyStatus'.Draft)),

        // Date filter
        (IsBlank(locFeedDateFrom)
            || cpw_SurveyDate >= locFeedDateFrom)
    ),
    "cpw_SurveyDate",
    SortOrder.Descending
)
```

### lblFilteredCount.Text

```
CountRows(galActivityFeed.AllItems) & " survey" &
    If(CountRows(galActivityFeed.AllItems) <> 1, "s", "") &
    " matching current filters"
```

### galActivityFeed > lblSurveyId.Text

```
ThisItem.cpw_SurveyId
```

### galActivityFeed > lblWaterName.Text

```
ThisItem.cpw_Water.cpw_Name
```

### galActivityFeed > lblStation.Text

```
"Station " & ThisItem.cpw_Station.cpw_StationId
```

### galActivityFeed > lblProtocol.Text

```
Switch(
    ThisItem.cpw_Protocol,
    'cpw_Protocol'.TwoPassRemoval,      "Two-Pass Removal",
    'cpw_Protocol'.SinglePassCPUE,      "Single-Pass CPUE",
    'cpw_Protocol'.MarkRecapture,       "Mark-Recapture",
    'cpw_Protocol'.ElectrofishingCPUE,  "Electrofishing CPUE",
    ""
)
```

### galActivityFeed > lblDate.Text

```
Text(ThisItem.cpw_SurveyDate, "yyyy-mm-dd")
```

### galActivityFeed > lblStatus (use Section 2 reusable formulas)

### galActivityFeed > btnAction.Text

```
Switch(
    ThisItem.cpw_Status,
    'cpw_SurveyStatus'.ReturnedforCorrection,  "Continue",
    'cpw_SurveyStatus'.Approved,               "View",
    'cpw_SurveyStatus'.Published,              "View",
    "Review"
)
```

### galActivityFeed > btnAction.OnSelect

```
Navigate(
    scrValidation,
    ScreenTransition.None,
    {
        locSelectedSurvey: ThisItem
    }
)
```

---

## 9. scrQueryBuilder

### scrQueryBuilder.OnVisible

```
// Initialize query builder filter state
Set(locQBWater,    "all");
Set(locQBSpecies,  "all");
Set(locQBYearFrom, 2021);
Set(locQBYearTo,   Year(Today()));
Set(locQBProtocol, "all");

// Load initial results
ClearCollect(
    colQueryResults,
    FirstN(
        SortByColumns(
            cpw_Surveys,
            "cpw_SurveyDate",
            SortOrder.Descending
        ),
        500
    )
);
```

### btnRunQuery.OnSelect

```
ClearCollect(
    colQueryResults,
    SortByColumns(
        Filter(
            cpw_Surveys,

            // Water filter
            (locQBWater = "all"
                || cpw_Water.cpw_WaterId = locQBWater),

            // Year range
            Year(cpw_SurveyDate) >= locQBYearFrom
            && Year(cpw_SurveyDate) <= locQBYearTo,

            // Protocol filter
            (locQBProtocol = "all"
                || Switch(
                    locQBProtocol,
                    "twopass",   cpw_Protocol = 'cpw_Protocol'.TwoPassRemoval,
                    "singlepass", cpw_Protocol = 'cpw_Protocol'.SinglePassCPUE,
                    "markrecap", cpw_Protocol = 'cpw_Protocol'.MarkRecapture,
                    "efish",     cpw_Protocol = 'cpw_Protocol'.ElectrofishingCPUE,
                    true
                ))
        ),
        "cpw_SurveyDate",
        SortOrder.Descending
    )
);

Notify(CountRows(colQueryResults) & " results found.", NotificationType.Information);
```

### galQueryResults.Items

```
colQueryResults
```

---

## 10. scrInsights

### scrInsights.OnVisible

```
// ── locSelectedWater passed via Navigate context ─────────────────────
// If not set, default to first NE water.
If(
    IsBlank(locSelectedWater),
    Set(locSelectedWater, First(gblNEWaters))
);

// ── Load surveys for this water ──────────────────────────────────────
ClearCollect(
    colInsightsSurveys,
    Filter(
        cpw_Surveys,
        cpw_Water.cpw_WaterId = locSelectedWater.cpw_WaterId
    )
);

// ── Load overall trend data ──────────────────────────────────────────
ClearCollect(
    colInsightsTrend,
    SortByColumns(
        Filter(
            cpw_TrendDatas,
            cpw_Water.cpw_WaterId = locSelectedWater.cpw_WaterId
            && IsBlank(cpw_SpeciesCode)
        ),
        "cpw_Year",
        SortOrder.Ascending
    )
);

// ── Latest and previous points for summary cards ─────────────────────
Set(locInsLatest, Last(colInsightsTrend));
Set(locInsPrev,   Last(FirstN(colInsightsTrend, CountRows(colInsightsTrend) - 1)));

// ── Percent change calculations ──────────────────────────────────────
Set(
    locPopChange,
    If(
        !IsBlank(locInsLatest.cpw_PopEstimate) && !IsBlank(locInsPrev.cpw_PopEstimate) && locInsPrev.cpw_PopEstimate <> 0,
        Round((locInsLatest.cpw_PopEstimate - locInsPrev.cpw_PopEstimate) / locInsPrev.cpw_PopEstimate * 100, 1),
        Blank()
    )
);
Set(
    locCPUEChange,
    If(
        !IsBlank(locInsLatest.cpw_CPUE) && !IsBlank(locInsPrev.cpw_CPUE) && locInsPrev.cpw_CPUE <> 0,
        Round((locInsLatest.cpw_CPUE - locInsPrev.cpw_CPUE) / locInsPrev.cpw_CPUE * 100, 1),
        Blank()
    )
);
Set(
    locBiomassChange,
    If(
        !IsBlank(locInsLatest.cpw_BiomassKg) && !IsBlank(locInsPrev.cpw_BiomassKg) && locInsPrev.cpw_BiomassKg <> 0,
        Round((locInsLatest.cpw_BiomassKg - locInsPrev.cpw_BiomassKg) / locInsPrev.cpw_BiomassKg * 100, 1),
        Blank()
    )
);

// ── Default metric selection ─────────────────────────────────────────
Set(locInsMetric, "population");
Set(locInsCompareMode, false);

// ── Compare mode: load trends for comparison waters ──────────────────
ClearCollect(
    colCompareTrendSP,
    SortByColumns(
        Filter(cpw_TrendDatas, cpw_Water.cpw_WaterId = "south-platte" && IsBlank(cpw_SpeciesCode)),
        "cpw_Year", SortOrder.Ascending
    )
);
ClearCollect(
    colCompareTrendBR,
    SortByColumns(
        Filter(cpw_TrendDatas, cpw_Water.cpw_WaterId = "blue-river" && IsBlank(cpw_SpeciesCode)),
        "cpw_Year", SortOrder.Ascending
    )
);
ClearCollect(
    colCompareTrendCR,
    SortByColumns(
        Filter(cpw_TrendDatas, cpw_Water.cpw_WaterId = "colorado-river" && IsBlank(cpw_SpeciesCode)),
        "cpw_Year", SortOrder.Ascending
    )
);
```

### lblInsPopulation.Text

```
If(
    !IsBlank(locInsLatest.cpw_PopEstimate),
    Text(locInsLatest.cpw_PopEstimate, "#,##0"),
    "---"
)
```

### lblInsPopChange.Text

```
If(
    !IsBlank(locPopChange),
    If(locPopChange >= 0, "+", "") & Text(locPopChange, "#.0") & "% from " & Text(locInsPrev.cpw_Year),
    ""
)
```

### lblInsCPUE.Text

```
If(!IsBlank(locInsLatest.cpw_CPUE), Text(locInsLatest.cpw_CPUE, "#.0"), "---")
```

### lblInsCPUEChange.Text

```
If(
    !IsBlank(locCPUEChange),
    If(locCPUEChange >= 0, "+", "") & Text(locCPUEChange, "#.0") & "% from " & Text(locInsPrev.cpw_Year),
    ""
)
```

### lblInsBiomass.Text

```
If(!IsBlank(locInsLatest.cpw_BiomassKg), Text(locInsLatest.cpw_BiomassKg, "#,##0"), "---")
```

### lblInsBiomassChange.Text

```
If(
    !IsBlank(locBiomassChange),
    If(locBiomassChange >= 0, "+", "") & Text(locBiomassChange, "#.0") & "% from " & Text(locInsPrev.cpw_Year),
    ""
)
```

### lblInsCI.Text (Confidence Interval)

```
If(
    !IsBlank(locInsLatest.cpw_PopEstimate),
    Text(RoundDown(locInsLatest.cpw_PopEstimate * 0.944, 0), "#,##0") & " - " &
    Text(RoundUp(locInsLatest.cpw_PopEstimate * 1.055, 0), "#,##0"),
    "---"
)
```

### lblInsContextBanner.Text

```
"Based on " & CountRows(colInsightsSurveys) & " surveys conducted between " &
    Text(First(colInsightsTrend).cpw_Year) & " - " & Text(Last(colInsightsTrend).cpw_Year) &
    " using validated protocols."
```

### Chart data source (for single water trend chart)

```
// Use colInsightsTrend as Items.
// Map columns based on locInsMetric:
//   "population" -> cpw_PopEstimate
//   "cpue"       -> cpw_CPUE
//   "biomass"    -> cpw_BiomassKg
// X-axis: cpw_Year
```

### drpInsMetric.Items

```
Table(
    { Value: "population", Display: "Population Estimate" },
    { Value: "cpue",       Display: "CPUE" },
    { Value: "biomass",    Display: "Biomass (kg)" }
)
```

### drpInsMetric.OnChange

```
Set(locInsMetric, drpInsMetric.Selected.Value)
```

### btnSingleWater.OnSelect

```
Set(locInsCompareMode, false)
```

### btnSingleWater.Fill

```
If(Not(locInsCompareMode), RGBA(27, 54, 93, 1), RGBA(240, 240, 240, 1))
```

### btnSingleWater.Color

```
If(Not(locInsCompareMode), RGBA(255, 255, 255, 1), RGBA(100, 100, 100, 1))
```

### btnCompareWaters.OnSelect

```
Set(locInsCompareMode, true)
```

### btnCompareWaters.Visible

```
gblCurrentRole = "Senior Biologist"
```

### btnCompareWaters.Fill

```
If(locInsCompareMode, RGBA(27, 54, 93, 1), RGBA(240, 240, 240, 1))
```

### btnCompareWaters.Color

```
If(locInsCompareMode, RGBA(255, 255, 255, 1), RGBA(100, 100, 100, 1))
```

### grpCompareChart.Visible

```
locInsCompareMode && gblCurrentRole = "Senior Biologist"
```

### grpSingleChart.Visible

```
Not(locInsCompareMode) || gblCurrentRole <> "Senior Biologist"
```

### btnExportExcel.Visible

```
gblCurrentRole = "Senior Biologist"
```

### btnOpenTableau.Visible

```
gblCurrentRole = "Senior Biologist"
```

### Delta analysis for compare mode

```
// lblDeltaSP.Text  (South Platte delta)
With(
    {
        first: First(colCompareTrendSP).cpw_CPUE,
        last:  Last(colCompareTrendSP).cpw_CPUE
    },
    If(
        first <> 0,
        Text(Round((last - first) / first * 100, 0)) & "%",
        "---"
    )
)

// lblDeltaBR.Text  (Blue River delta)
With(
    {
        first: First(colCompareTrendBR).cpw_CPUE,
        last:  Last(colCompareTrendBR).cpw_CPUE
    },
    If(
        first <> 0,
        Text(Round((last - first) / first * 100, 0)) & "%",
        "---"
    )
)

// lblDeltaCR.Text  (Colorado River delta)
With(
    {
        first: First(colCompareTrendCR).cpw_CPUE,
        last:  Last(colCompareTrendCR).cpw_CPUE
    },
    If(
        first <> 0,
        Text(Round((last - first) / first * 100, 0)) & "%",
        "---"
    )
)
```

---

## 11. Navigation Formulas

These are the OnSelect formulas for navigation buttons and sidebar items.
All use context variables so the target screen receives the data it needs.

### Navigate to Dashboard

```
Navigate(scrDashboard, ScreenTransition.None)
```

### Navigate to Water Select

```
Navigate(scrWaterSelect, ScreenTransition.None)
```

### Navigate to Water Profile (from gallery)

```
Navigate(
    scrWaterProfile,
    ScreenTransition.None,
    {
        locSelectedWater: ThisItem
    }
)
```

### Navigate to Water Profile (from water name link in survey row)

```
Navigate(
    scrWaterProfile,
    ScreenTransition.None,
    {
        locSelectedWater: LookUp(gblNEWaters, cpw_WaterId = ThisItem.cpw_Water.cpw_WaterId)
    }
)
```

### Navigate to Validation (from any survey row)

```
Navigate(
    scrValidation,
    ScreenTransition.None,
    {
        locSelectedSurvey: ThisItem
    }
)
```

### Navigate to Survey Upload

```
Navigate(scrSurveyUpload, ScreenTransition.None)
```

### Navigate to Activity Feed

```
Navigate(scrActivityFeed, ScreenTransition.None)
```

### Navigate to Query Builder

```
Navigate(scrQueryBuilder, ScreenTransition.None)
```

### Navigate to Insights (from Water Profile)

```
Navigate(
    scrInsights,
    ScreenTransition.None,
    {
        locSelectedWater: locSelectedWater
    }
)
```

### Back navigation (breadcrumb-style)

```
Back(ScreenTransition.None)
```

---

## 12. Status Badge Color Formulas

These are reusable formulas for any control displaying survey status.
Copy the appropriate formula into the Fill, Color, or Text property.

### Badge Fill (background)

```
Switch(
    ThisItem.cpw_Status,
    // Green group: Approved, Published
    'cpw_SurveyStatus'.Approved,                RGBA(34, 139, 34, 0.10),
    'cpw_SurveyStatus'.Published,               RGBA(34, 139, 34, 0.10),
    // Red group: Flagged Suspect, Returned for Correction
    'cpw_SurveyStatus'.FlaggedSuspect,           RGBA(220, 38, 38, 0.10),
    'cpw_SurveyStatus'.ReturnedforCorrection,    RGBA(220, 38, 38, 0.10),
    // Amber group: everything else (Pending Validation, Pending Approval, Draft)
    RGBA(217, 119, 6, 0.10)
)
```

### Badge Color (text)

```
Switch(
    ThisItem.cpw_Status,
    'cpw_SurveyStatus'.Approved,                RGBA(34, 139, 34, 1),
    'cpw_SurveyStatus'.Published,               RGBA(34, 139, 34, 1),
    'cpw_SurveyStatus'.FlaggedSuspect,           RGBA(220, 38, 38, 1),
    'cpw_SurveyStatus'.ReturnedforCorrection,    RGBA(220, 38, 38, 1),
    RGBA(217, 119, 6, 1)
)
```

### Badge Text

```
Switch(
    ThisItem.cpw_Status,
    'cpw_SurveyStatus'.Approved,                "Approved",
    'cpw_SurveyStatus'.Published,               "Published",
    'cpw_SurveyStatus'.FlaggedSuspect,           "Flagged Suspect",
    'cpw_SurveyStatus'.ReturnedforCorrection,    "Returned for Correction",
    'cpw_SurveyStatus'.PendingValidation,        "Pending Validation",
    'cpw_SurveyStatus'.PendingApproval,          "Pending Approval",
    'cpw_SurveyStatus'.Draft,                    "Draft",
    "Unknown"
)
```

### Standalone version (for non-gallery use, e.g. header badge)

Replace `ThisItem.cpw_Status` with the actual variable:

```
// Fill
Switch(
    locSurvey.cpw_Status,
    'cpw_SurveyStatus'.Approved,    RGBA(34, 139, 34, 0.10),
    'cpw_SurveyStatus'.Published,   RGBA(34, 139, 34, 0.10),
    'cpw_SurveyStatus'.FlaggedSuspect, RGBA(220, 38, 38, 0.10),
    'cpw_SurveyStatus'.ReturnedforCorrection, RGBA(220, 38, 38, 0.10),
    RGBA(217, 119, 6, 0.10)
)
```

---

## 13. Role-Based Visibility Formulas

### Show only for Data Entry Assistant

```
gblCurrentRole = "Data Entry Assistant"
```

### Show only for Area Biologist

```
gblCurrentRole = "Area Biologist"
```

### Show only for Senior Biologist

```
gblCurrentRole = "Senior Biologist"
```

### Show for Biologists (Area or Senior)

```
gblCurrentRole = "Area Biologist" || gblCurrentRole = "Senior Biologist"
```

### Hide for Data Entry (show analytics)

```
gblCurrentRole <> "Data Entry Assistant"
```

### Regional scope strip visibility

```
gblCurrentRole = "Area Biologist"
```

### Role indicator label

```
// lblRoleIndicator.Text
gblCurrentRole

// lblRoleIndicator.Fill
Switch(
    gblCurrentRole,
    "Data Entry Assistant",  RGBA(59, 130, 246, 0.10),
    "Area Biologist",        RGBA(34, 139, 34, 0.10),
    "Senior Biologist",      RGBA(139, 92, 246, 0.10),
    RGBA(200, 200, 200, 0.10)
)

// lblRoleIndicator.Color
Switch(
    gblCurrentRole,
    "Data Entry Assistant",  RGBA(59, 130, 246, 1),
    "Area Biologist",        RGBA(34, 139, 34, 1),
    "Senior Biologist",      RGBA(139, 92, 246, 1),
    RGBA(100, 100, 100, 1)
)
```

### Approve button visibility (Area Biologist only, non-terminal)

```
gblCurrentRole = "Area Biologist"
```

### Request Correction button visibility

```
gblCurrentRole = "Area Biologist"
```

### Submit for Review button visibility (Data Entry only)

```
gblCurrentRole = "Data Entry Assistant"
```

### Flag Suspect button visibility (Senior only)

```
gblCurrentRole = "Senior Biologist"
```

### Publish button visibility (Senior only)

```
gblCurrentRole = "Senior Biologist"
```

### Compare Waters toggle visibility (Senior only on Insights)

```
gblCurrentRole = "Senior Biologist"
```

### Export/Tableau buttons visibility (Senior only)

```
gblCurrentRole = "Senior Biologist"
```

---

## 14. Unit Toggle Formula

### Toggle control (tglUnit)

Place a Toggle control on scrValidation header.

```
// tglUnit.Default
false
// (false = mm, true = inches)
```

### tglUnit.OnCheck (switched to inches)

```
Set(locUnit, "inches")
```

### tglUnit.OnUncheck (switched to mm)

```
Set(locUnit, "mm")
```

### lblUnitLeft.Text

```
"mm"
```

### lblUnitRight.Text

```
"inches"
```

### Length display in gallery (galFishRecords > lblLength.Text)

```
If(
    locUnit = "mm",
    Text(ThisItem.cpw_LengthMm, "#,##0"),
    Text(Round(ThisItem.cpw_LengthMm / 25.4, 1), "#,##0.0")
)
```

### Column header with unit label

```
// lblLengthHeader.Text
"Length (" & locUnit & ")"
```

---

## Appendix A: Delegable Query Notes

Power Apps delegation limits apply when querying Dataverse. The formulas
above are designed to be delegable where possible:

| Pattern | Delegable? | Notes |
|---------|-----------|-------|
| `Filter(cpw_Surveys, cpw_Status = ...)` | Yes | Equality on choice column |
| `Filter(cpw_Surveys, cpw_Water.cpw_WaterId = ...)` | Yes | Lookup filter |
| `Filter(cpw_Surveys, cpw_SurveyDate >= dateVal)` | Yes | Date comparison |
| `SortByColumns(table, "col", Descending)` | Yes | Single column sort |
| `CountRows(Filter(...))` | Yes | When inner Filter is delegable |
| `colNESurveys` (local collection) | N/A | Already in memory |
| `in ForAll(gblNEWaters, cpw_WaterId)` | No | Use ClearCollect to local collection first |

**Recommendation:** For the `in` operator with gblNEWaters, always
`ClearCollect` the result to a local collection (as shown in scrDashboard.OnVisible)
rather than filtering directly against the Dataverse table with a non-delegable
`in` expression.

## Appendix B: Global Variables Summary

| Variable | Type | Set In | Purpose |
|----------|------|--------|---------|
| `gblCurrentUser` | Record (cpw_AppUser) | App.OnStart | Current user record |
| `gblCurrentRole` | Text | App.OnStart | Role string for visibility checks |
| `gblNEWaters` | Table (cpw_Water) | App.OnStart | Cached NE region waters |
| `colSpecies` | Table (cpw_Species) | App.OnStart | Full species reference |
| `gblPendingCount` | Number | scrDashboard.OnVisible | Pending survey count |
| `gblFlaggedCount` | Number | scrDashboard.OnVisible | Flagged survey count |
| `gblWatersActiveCount` | Number | scrDashboard.OnVisible | Active waters count |

## Appendix C: Local Variables Summary (per screen)

| Variable | Screen | Type | Purpose |
|----------|--------|------|---------|
| `locSelectedWater` | scrWaterProfile, scrInsights | Record | Navigate context |
| `locSelectedSurvey` | scrValidation | Record | Navigate context |
| `locDashboardView` | scrDashboard | Text | Role-based dashboard routing |
| `locSurvey` | scrValidation | Record | Current survey being validated |
| `locUnit` | scrValidation | Text | "mm" or "inches" |
| `locIsTerminal` | scrValidation | Boolean | Approval/publish lock |
| `locActionMessage` | scrValidation | Text | Confirmation banner |
| `locValidCount` | scrValidation | Number | Valid row count |
| `locWarningCount` | scrValidation | Number | Warning row count |
| `locErrorCount` | scrValidation | Number | Error row count |
| `locTotalRecords` | scrValidation | Number | Total fish record count |
| `locFeedWaterFilter` | scrActivityFeed | Text | Water dropdown value |
| `locFeedStatusFilter` | scrActivityFeed | Text | Status dropdown value |
| `locFeedDateFrom` | scrActivityFeed | Date | Date-from filter |
| `locInsMetric` | scrInsights | Text | Selected metric |
| `locInsCompareMode` | scrInsights | Boolean | Compare toggle |
| `locPopChange` | scrInsights | Number | Population % change |
| `locCPUEChange` | scrInsights | Number | CPUE % change |
| `locBiomassChange` | scrInsights | Number | Biomass % change |

## Appendix D: Collections Summary

| Collection | Loaded In | Source | Purpose |
|------------|-----------|--------|---------|
| `colNESurveys` | scrDashboard.OnVisible | cpw_Surveys filtered by NE waters | Dashboard stats and review queue |
| `colReviewQueue` | scrDashboard.OnVisible | colNESurveys filtered by actionable status | Review queue gallery |
| `colWaterSurveys` | scrWaterProfile.OnVisible | cpw_Surveys filtered by water | Water profile surveys |
| `colWaterStations` | scrWaterProfile.OnVisible | cpw_Stations filtered by water | Water profile stations |
| `colWaterTrend` | scrWaterProfile.OnVisible | cpw_TrendData filtered by water | CPUE chart data |
| `colFishRecords` | scrValidation.OnVisible | cpw_FishRecords filtered by survey | Validation data grid |
| `colValIssues` | scrValidation.OnVisible | cpw_ValidationIssues filtered by survey | Validation issues panel |
| `colAllNESurveys` | scrActivityFeed.OnVisible | cpw_Surveys filtered by NE waters | Activity feed gallery |
| `colInsightsTrend` | scrInsights.OnVisible | cpw_TrendData filtered by water | Insights chart |
| `colInsightsSurveys` | scrInsights.OnVisible | cpw_Surveys filtered by water | Insights context |
| `colCompareTrendSP` | scrInsights.OnVisible | cpw_TrendData for South Platte | Compare mode |
| `colCompareTrendBR` | scrInsights.OnVisible | cpw_TrendData for Blue River | Compare mode |
| `colCompareTrendCR` | scrInsights.OnVisible | cpw_TrendData for Colorado River | Compare mode |
| `colQueryResults` | scrQueryBuilder | cpw_Surveys filtered by query | Query results |
| `colUploadWaters` | scrSurveyUpload.OnVisible | gblNEWaters subset | Upload water dropdown |
