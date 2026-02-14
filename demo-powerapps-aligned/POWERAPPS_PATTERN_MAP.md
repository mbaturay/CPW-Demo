# Power Apps Pattern Map

> Maps each React screen to a recommended Power Apps Canvas App implementation.

---

## Screen Map

### 1. `scrDashboard_DE` — Data Entry Dashboard

**React source:** `src/app/pages/DataEntryDashboard.tsx`
**Route:** `/` (when role = data-entry)

**Primary controls:**
- 4 × Card containers (summary stats)
- Gallery `galAssignedWaters` — table layout for assigned waters
- Gallery `galRecentSubmissions` — table layout for recent uploads
- Button `btnUploadSurvey` — navigates to `scrSurveyUpload`

**Key formulas:**
```
// Gallery source
galAssignedWaters.Items = Filter(cpw_Survey, cpw_Uploader = gblCurrentUser.DisplayName)

// Upload button
btnUploadSurvey.OnSelect = Navigate(scrSurveyUpload, ScreenTransition.None)
```

---

### 2. `scrDashboard_AB` — Area Biologist Dashboard

**React source:** `src/app/pages/Dashboard.tsx`
**Route:** `/` (when role = area-biologist)

**Primary controls:**
- 4 × Card containers (Waters Active, Pending, Flagged, Federal Reporting)
- Gallery `galReviewQueue` — review queue table with action buttons
- Image `imgStationMap` — static image replacing StationViz SVG
- Gallery `galWatersInRegion` — waters table

**Key formulas:**
```
// Review queue
galReviewQueue.Items = Filter(
    cpw_Survey,
    cpw_Water.cpw_Region = "Northeast",
    cpw_Status in ["Pending Validation", "Returned for Correction", "Pending Approval", "Flagged Suspect"]
)

// Action button in gallery template
btnReview.OnSelect = Navigate(scrValidation, ScreenTransition.None, {locSurveyId: ThisItem.cpw_SurveyId})
```

---

### 3. `scrDashboard_SR` — Senior Biologist Dashboard

**React source:** `src/app/pages/SeniorBiologistDashboard.tsx`
**Route:** `/` (when role = senior-biologist)

**Primary controls:**
- 4 × Card containers (statewide stats)
- Chart control `chtRegionalPerformance` or Power BI tile — regional bar chart
- Gallery `galCrossWaterTrends` — cross-water comparison list
- Gallery `galFederalReporting` — compliance tracking with progress bars

**Key formulas:**
```
// Regional chart data (if using PA Chart)
chtRegionalPerformance.Items = GroupBy(cpw_Survey, "cpw_Water.cpw_Region", "RegionGroup")

// Progress bar width (Rectangle inside Gallery template)
rectProgress.Width = Parent.Width * (ThisItem.Progress / 100)
```

**Notes:** Embed Power BI tile for regional chart if PA Chart control is insufficient.

---

### 4. `scrWaterSelect` — Water Select

**React source:** `src/app/pages/WaterSelect.tsx`
**Route:** `/water`

**Primary controls:**
- Dropdown `drpRegionFilter` — filter by region
- Gallery `galWaterList` — water body list with name, region, station count

**Key formulas:**
```
// Gallery source with filter
galWaterList.Items = If(
    drpRegionFilter.Selected.Value = "All",
    cpw_Water,
    Filter(cpw_Water, cpw_Region = drpRegionFilter.Selected.Value)
)

// Gallery item OnSelect
galWaterList.OnSelect = Navigate(scrWaterProfile, ScreenTransition.None, {locWaterId: ThisItem.cpw_WaterId})
```

---

### 5. `scrWaterProfile` — Water Profile

**React source:** `src/app/pages/WaterProfile.tsx`
**Route:** `/water/profile`

**Primary controls:**
- Container `cntWaterBanner` — water name, region, stats
- 4 × Card containers (population, primary species, last survey, status)
- Chart control `chtCPUETrend` or Power BI tile — CPUE line chart
- Gallery `galSpeciesComposition` — species bars with calculated widths
- Gallery `galRecentSurveys` — recent survey activity
- Container `cntStationsInBasin` — station button list

**Key formulas:**
```
// Data-entry vs. biologist view toggle
cntDataEntryView.Visible = gblCurrentRole = "Data Entry Assistant"
cntAnalyticsView.Visible = gblCurrentRole <> "Data Entry Assistant"

// CPUE chart (if using PA Chart)
chtCPUETrend.Items = Filter(cpw_TrendData, cpw_Water = locCurrentWater)

// Species composition bar width
rectSpeciesBar.Width = Parent.Width * (ThisItem.Count / Max(galSpeciesComposition.AllItems, Count))
```

---

### 6. `scrSurveyUpload` — Survey Upload

**React source:** `src/app/pages/SurveyUpload.tsx`
**Route:** `/upload`

**Primary controls:**
- Attachments control `attSurveyFile` — file upload (click-only)
- Container `cntPreUpload` — file select area (Visible when no file)
- Container `cntPostUpload` — metadata display (Visible after file selected)
- EditForm `frmSurveyMetadata` — auto-detected metadata fields
- Gallery `galValidationPreview` — validation summary items
- Button `btnSubmitUpload` — create survey record

**Key formulas:**
```
// Toggle pre/post upload views
cntPreUpload.Visible = IsEmpty(attSurveyFile.Attachments)
cntPostUpload.Visible = !IsEmpty(attSurveyFile.Attachments)

// Submit creates survey record
btnSubmitUpload.OnSelect = Patch(cpw_Survey, Defaults(cpw_Survey), {
    cpw_Water: drpUploadWater.Selected,
    cpw_Station: drpUploadStation.Selected,
    cpw_Protocol: drpProtocol.Selected,
    cpw_Status: {Value: "Pending Validation"},
    cpw_SurveyDate: dpSurveyDate.SelectedDate
})
```

---

### 7. `scrValidation` — Survey Validation

**React source:** `src/app/pages/Validation.tsx`
**Route:** `/validation`

**Primary controls:**
- Container `cntSurveyHeader` — station, date, protocol, uploader labels
- 4 × Card containers (valid count, warnings, errors, total records)
- Gallery `galFishRecords` — data grid with colored status strips
- Gallery `galValIssues` — validation issues panel
- Toggle `tglUnit` — mm/inches unit switch
- Button `btnApprove` / `btnRequestCorrection` / `btnRevalidate` / `btnSubmitForReview` / `btnFlagSuspect` / `btnPublish` — role-conditional action buttons

**Key formulas:**
```
// Fish records for current survey
galFishRecords.Items = Filter(cpw_FishRecord, cpw_Survey = locCurrentSurvey)

// Unit conversion in gallery template
lblLength.Text = If(tglUnit.Value, Text(ThisItem.cpw_LengthMm / 25.4, "#.0"), Text(ThisItem.cpw_LengthMm))

// Approve action
btnApprove.OnSelect = Patch(cpw_Survey, locCurrentSurvey, {cpw_Status: {Value: "Approved"}})
btnApprove.Visible = gblCurrentRole = "Area Biologist"
btnApprove.DisplayMode = If(
    locCurrentSurvey.cpw_Status.Value in ["Approved", "Published"] || CountRows(Filter(cpw_ValidationIssue, cpw_Survey = locCurrentSurvey, cpw_Severity = "Error")) > 0,
    DisplayMode.Disabled,
    DisplayMode.Edit
)

// Status strip color
rectStatusStrip.Fill = Switch(
    ThisItem.cpw_RecordStatus.Value,
    "Error", Color.Red,
    "Warning", Color.Orange,
    Transparent
)
```

---

### 8. `scrQueryBuilder` — Cross-Survey Analysis

**React source:** `src/app/pages/QueryBuilder.tsx`
**Route:** `/query`

**Primary controls:**
- Container `cntFilterPanel` — static dropdowns (water, species, region, date range, protocol)
- Gallery `galConditions` — dynamic condition rows (Field dropdown + Operator dropdown + Value input)
- Button `btnAddCondition` — adds row to `colConditions` collection
- Button `btnRemoveCondition` — removes row from Gallery template
- Container `cntLiveResults` — live match count and preview stats
- Button `btnRunQuery` — navigates to Insights with filter context
- Toggle `tglExcludeYOY` — exclude young-of-year
- Button group `btnMM` / `btnInches` — unit selection

**Key formulas:**
```
// Dynamic conditions collection
App.OnStart: ClearCollect(colConditions, {id: "1", field: "species", op: "equals", value: "Brown Trout"})

btnAddCondition.OnSelect = Collect(colConditions, {id: Text(Now()), field: "species", op: "equals", value: ""})

btnRemoveCondition.OnSelect = Remove(colConditions, ThisItem)

galConditions.Items = colConditions

// Live results count (delegable filter)
lblMatchCount.Text = CountRows(Filter(cpw_Survey, cpw_Water.cpw_Region = drpRegion.Selected.Value))
```

**Notes:** This is the highest-complexity screen. Consider simplifying to static dropdowns only (no add/remove) for MVP.

---

### 9. `scrInsights` — Ecological Trend Analysis

**React source:** `src/app/pages/Insights.tsx`
**Route:** `/insights`

**Primary controls:**
- Container `cntContextBanner` — survey count and date range summary
- 4 × Card containers (population, CPUE, biomass, relative weight)
- Chart control `chtPopTrend` or Power BI tile — single-series line chart
- Dropdown `drpInsMetric` — metric selector (Population / CPUE / Biomass)
- Chart control `chtLengthFreq` or Power BI tile — length-frequency histogram
- Card `cntStatSummary` — descriptive statistics

**Key formulas:**
```
// Metric selector drives chart data key
chtPopTrend.Items = AddColumns(
    Filter(cpw_TrendData, cpw_Water = locCurrentWater),
    "DisplayValue", Switch(drpInsMetric.Selected.Value,
        "Population", cpw_PopEstimate,
        "CPUE", cpw_CPUE,
        "Biomass", cpw_BiomassKg
    )
)

// Summary cards
lblInsPopulation.Text = Last(SortByColumns(Filter(cpw_TrendData, cpw_Water = locCurrentWater), "cpw_Year")).cpw_PopEstimate
```

**Notes:** Embed Power BI tile for best chart fidelity. PA Chart control works for single-series line but lacks axis customization.

---

### 10. `scrActivityFeed` — Survey Activity Feed

**React source:** `src/app/pages/ActivityFeed.tsx`
**Route:** `/activity-feed`

**Primary controls:**
- Card `cntFilters` — Water dropdown, Status dropdown, Date input
- Gallery `galActivityFeed` — grouped survey list with water headers

**Key formulas:**
```
// Filtered surveys
galActivityFeed.Items = SortByColumns(
    Filter(cpw_Survey,
        cpw_Water.cpw_Region = "Northeast",
        If(drpFeedWater.Selected.Value <> "all", cpw_Water.cpw_WaterId = drpFeedWater.Selected.Value, true),
        If(drpFeedStatus.Selected.Value <> "all",
            Switch(drpFeedStatus.Selected.Value,
                "pending", cpw_Status.Value in ["Pending Validation", "Pending Approval", "Returned for Correction"],
                "approved", cpw_Status.Value in ["Approved", "Published"],
                "flagged", cpw_Status.Value = "Flagged Suspect",
                true
            ),
            true
        )
    ),
    "cpw_SurveyDate", SortOrder.Descending
)
```

**Notes:** For collapsible water groups, use `GroupBy()` + nested Gallery, or simplify to a flat list with water name as a group header row.

---

## Navigation Map

```
scrDashboard (role-switched)
  ├── scrWaterSelect
  │     └── scrWaterProfile
  │           └── scrInsights
  ├── scrSurveyUpload
  │     └── scrValidation
  ├── scrQueryBuilder
  │     └── scrInsights
  └── scrActivityFeed
        └── scrValidation
```

**Left navigation:** Vertical container with icon buttons. Use `locNavExpanded` variable for collapse/expand. Highlight active screen with `Fill` conditional.

---

## Role Visibility Summary

| Control / Section | Data Entry | Area Biologist | Senior Biologist |
|---|---|---|---|
| Dashboard view | `scrDashboard_DE` | `scrDashboard_AB` | `scrDashboard_SR` |
| Query Builder nav item | Hidden | Visible | Visible |
| Insights nav item | Hidden | Visible | Visible |
| Upload: Step banner | Visible | Hidden | Hidden |
| Validation: Submit for Review | Visible | Hidden | Hidden |
| Validation: Approve / Request Correction | Hidden | Visible | Hidden |
| Validation: Flag / Publish | Hidden | Hidden | Visible |
| Insights: Export to Excel / Open in Tableau | Hidden | Hidden | Visible |
| Regional Scope banner | Hidden | Visible | Hidden |

**Implementation:** Use `gblCurrentRole` variable (set from `cpw_AppUser` at login) with `Visible` property on each control group.
