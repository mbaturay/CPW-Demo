# 04 - Canvas App Screen Specification

> ADAMAS - Aquatic Data & Monitoring Analysis System
> Power Apps Canvas App Build Blueprint
> Dataverse-backed, role-driven, 10 screens

---

## Table of Contents

1. [Global Architecture](#1-global-architecture)
2. [App.OnStart & Global Variables](#2-apponstart--global-variables)
3. [Shared Components](#3-shared-components)
4. [Screen 1: scrDashboard](#4-screen-1-scrdashboard)
5. [Screen 2: scrWaterSelect](#5-screen-2-scrwaterselect)
6. [Screen 3: scrWaterProfile](#6-screen-3-scrwaterprofile)
7. [Screen 4: scrSurveyUpload](#7-screen-4-scrsurveyupload)
8. [Screen 5: scrValidation](#8-screen-5-scrvalidation)
9. [Screen 6: scrActivityFeed](#9-screen-6-scractivityfeed)
10. [Screen 7: scrQueryBuilder](#10-screen-7-scrquerybuilder)
11. [Screen 8: scrInsights](#11-screen-8-scrinsights)
12. [Status Badge Reference](#12-status-badge-reference)
13. [Navigation Map](#13-navigation-map)

---

## 1. Global Architecture

### App Dimensions
- Design width: **1366**
- Design height: **768**
- Scale to fit: **On**
- Lock aspect ratio: **Off**

### Color Tokens (set as named formulas or App.Formulas)

| Token | Hex | Usage |
|---|---|---|
| `clrPrimary` | `#1B365D` | Navy - headers, primary buttons, active nav |
| `clrSecondary` | `#2F6F73` | Teal - secondary accents, chart line 2 |
| `clrAccent` | `#5B7C99` | Slate blue - tertiary chart, muted elements |
| `clrSuccess` | `#16A34A` | Green - Approved, Published, valid rows |
| `clrWarning` | `#D97706` | Amber - Pending, warnings |
| `clrDestructive` | `#DC2626` | Red - Flagged, errors, returned |
| `clrBackground` | `#F8FAFC` | Screen background |
| `clrSurface` | `#FFFFFF` | Card/container backgrounds |
| `clrBorder` | `#E2E8F0` | Border lines |
| `clrTextPrimary` | `#0F172A` | Primary text |
| `clrTextMuted` | `#64748B` | Secondary/muted text |

### Font Tokens

| Token | Size | Weight | Usage |
|---|---|---|---|
| `fntPageTitle` | 22 | Semibold | Screen header titles |
| `fntSectionTitle` | 16-18 | Semibold | Card headers, section titles |
| `fntBody` | 13 | Regular | Body text, table cells |
| `fntCaption` | 11-12 | Regular | Captions, subtitles, labels |
| `fntUpperLabel` | 11 | Semibold | Uppercase tracking labels above metric values |
| `fntMetricLarge` | 28-32 | Semibold | Large KPI numbers |
| `fntMono` | 13 | Regular | Survey IDs, station codes, numeric values (use `"Courier New"`) |

### Dataverse Tables (referenced throughout)

| Table | Prefix | Purpose |
|---|---|---|
| `cpw_Water` | `cpw_` | Water bodies (South Platte, Cache la Poudre, etc.) |
| `cpw_Station` | `cpw_` | Survey stations within waters |
| `cpw_Species` | `cpw_` | Species reference (BNT, RBT, CTT, etc.) |
| `cpw_Survey` | `cpw_` | Survey records with status lifecycle |
| `cpw_FishRecord` | `cpw_` | Individual fish measurement rows |
| `cpw_ValidationIssue` | `cpw_` | Validation errors/warnings per survey |
| `cpw_TrendData` | `cpw_` | Year-over-year trend points per water |
| `cpw_StatusHistory` | `cpw_` | Audit trail of status changes |
| `cpw_AppUser` | `cpw_` | User profiles with role assignments |

---

## 2. App.OnStart & Global Variables

### App.OnStart Formula

```
// Lookup current user
Set(gblCurrentUser,
    LookUp(cpw_AppUser, cpw_Email = User().Email)
);

// Set role from user record (or default for demo)
Set(gblCurrentRole,
    If(
        IsBlank(gblCurrentUser),
        "Area Biologist",
        gblCurrentUser.cpw_Role
    )
);

// Preload NE waters for gallery performance
ClearCollect(colNEWaters,
    Filter(cpw_Water, cpw_Region = "Northeast")
);

// Preload species reference
ClearCollect(colSpecies, cpw_Species);
```

### Global Variables Summary

| Variable | Type | Set Where | Purpose |
|---|---|---|---|
| `gblCurrentRole` | Text | App.OnStart, cmpRoleIndicator | `"Data Entry Assistant"` / `"Area Biologist"` / `"Senior Biologist"` |
| `gblCurrentUser` | Record | App.OnStart | Current user record from cpw_AppUser |
| `colNEWaters` | Collection | App.OnStart | Pre-cached Northeast water records |
| `colSpecies` | Collection | App.OnStart | Pre-cached species reference |

### Context Variables Summary (per-screen)

| Variable | Type | Screens | Purpose |
|---|---|---|---|
| `locSelectedWaterId` | Text/GUID | scrWaterProfile, scrInsights | Active water body ID |
| `locSelectedSurveyId` | Text | scrValidation | Active survey ID |
| `locStatusFilter` | Text | scrActivityFeed | Status filter selection |
| `locWaterFilter` | Text | scrActivityFeed, scrQueryBuilder | Water filter selection |
| `locUnit` | Text | scrValidation, scrQueryBuilder | `"mm"` or `"inches"` |
| `locUploaded` | Boolean | scrSurveyUpload | Toggle pre-upload vs. post-upload state |
| `locCompareMode` | Boolean | scrInsights | Toggle single-water vs. compare-waters chart |
| `locMetricSelector` | Text | scrInsights | `"population"` / `"cpue"` / `"biomass"` |
| `locAdvancedMode` | Boolean | scrQueryBuilder | Toggle standard vs. advanced mode |
| `locActionMessage` | Text | scrValidation | Confirmation message after status action |

---

## 3. Shared Components

### 3.1 cmpRoleIndicator (Component)

**Purpose:** Dropdown to switch the active role; displayed in every screen header.

**Controls:**
| Control | Type | Notes |
|---|---|---|
| `drpRoleSelector` | Dropdown | Items: `["Data Entry Assistant","Area Biologist","Senior Biologist"]` |
| `lblRolePrefix` | Label | Text: `"Role:"`, font 12, muted color |
| `lblDemoMode` | Label | Text: `"(Demo mode)"`, font 10, muted color |

**Behavior:**
```
// drpRoleSelector.OnChange
Set(gblCurrentRole, drpRoleSelector.Selected.Value);
```

**Layout:** Horizontal container, 220px wide, 32px tall, right-aligned in screen headers.

---

### 3.2 cmpWaterBanner (Component)

**Purpose:** Full-width contextual banner showing water name, region, watershed, station count, survey count, years active, and a mini station map.

**Input Properties:**
| Property | Type |
|---|---|
| `WaterName` | Text |
| `Region` | Text |
| `Watershed` | Text |
| `StationCount` | Number |
| `TotalSurveys` | Number |
| `YearsActive` | Text |
| `Stations` | Table |

**Controls:**
| Control | Type | Notes |
|---|---|---|
| `recBannerBg` | Rectangle | Fill: White, border-bottom 1px clrBorder |
| `recAccentBar` | Rectangle | 4px wide, Fill: clrPrimary, left edge |
| `lblBannerWaterName` | Label | Font 24, semibold |
| `lblBannerMeta` | Label | "Region: {Region} | Watershed: {Watershed} | Stations: {StationCount} | Total Surveys: {TotalSurveys} | Years Active: {YearsActive}" |
| `imgStationMap` | Image / HTML | 256x160 mini station visualization (placeholder image or HTML control) |

**Used on:** scrWaterProfile, scrValidation, scrInsights

---

### 3.3 cmpBreadcrumb (Component)

**Purpose:** Breadcrumb navigation trail.

**Input Properties:**
| Property | Type |
|---|---|
| `Items` | Table `{Label: Text, ScreenTarget: Screen, Param: Text}` |

**Controls:**
| Control | Type | Notes |
|---|---|---|
| `galBreadcrumb` | Horizontal Gallery | Items: component input table |
| `lblBcText` | Label (in gallery template) | Click navigates if ScreenTarget is populated |
| `icoChevron` | Icon (ChevronRight) | Visible: `ThisItem <> Last(Self.Items)` |

**Behavior:**
```
// lblBcText.OnSelect
If(!IsBlank(ThisItem.ScreenTarget),
    Navigate(ThisItem.ScreenTarget, ScreenTransition.None)
)
```

**Used on:** scrWaterProfile, scrValidation

---

### 3.4 cmpRegionalScopeStrip (Component)

**Purpose:** Thin strip shown for Area Biologist: "Regional Scope Active -- Northeast Basin".

**Controls:**
| Control | Type | Notes |
|---|---|---|
| `recStripBg` | Rectangle | Fill: `RGBA(248,250,252,1)`, Height: 36, border-bottom |
| `lblScopeText` | Label | `"Regional Scope Active -- Northeast Basin"`, bold prefix |

**Visibility:** `gblCurrentRole = "Area Biologist"`

**Used on:** scrDashboard (Area Biologist variant), scrWaterSelect, scrWaterProfile, scrSurveyUpload, scrValidation, scrActivityFeed, scrQueryBuilder, scrInsights

---

### 3.5 Sidebar Navigation (cmpSidebar)

**Purpose:** Left-side collapsible navigation rail. Collapsed width: 64px (icons only). Expands on hover to 288px showing labels.

**Controls:**
| Control | Type | Notes |
|---|---|---|
| `recSidebarBg` | Rectangle | Fill: clrPrimary, Width: 64 (collapsed) / 288 (expanded) |
| `lblAppTitle` | Label | "ADAMAS", white text, visible when expanded |
| `lblAppSubtitle` | Label | "Aquatic Data & Monitoring", white text |
| `galNavItems` | Vertical Gallery | Items: colNavItems (filtered by role) |
| `icoNavIcon` | Icon (in template) | Home, Waves, Upload, CheckSquare, Search, BarChart3 |
| `lblNavLabel` | Label (in template) | Visible when expanded |
| `recNavActive` | Rectangle (in template) | `Fill: RGBA(255,255,255,0.2)` when active route |
| `lblVersion` | Label | "Version 1.0.2" in footer |

**Nav Items Collection (set in App.OnStart):**
```
ClearCollect(colNavItems,
    {Key: "dashboard", Label: "Dashboard", DataEntryLabel: "My Waters",
     Icon: Icon.Home, Target: scrDashboard,
     Roles: "Data Entry Assistant,Area Biologist,Senior Biologist"},
    {Key: "water", Label: "Water Profile", DataEntryLabel: "Water Profile",
     Icon: Icon.Waypoint, Target: scrWaterSelect,
     Roles: "Data Entry Assistant,Area Biologist,Senior Biologist"},
    {Key: "upload", Label: "Upload Survey", DataEntryLabel: "Upload Survey",
     Icon: Icon.Upload, Target: scrSurveyUpload,
     Roles: "Data Entry Assistant,Area Biologist,Senior Biologist"},
    {Key: "validation", Label: "Validation", DataEntryLabel: "Validation Queue",
     Icon: Icon.DocumentWithCheckmark, Target: scrValidation,
     Roles: "Data Entry Assistant,Area Biologist,Senior Biologist"},
    {Key: "query", Label: "Query Builder", DataEntryLabel: "",
     Icon: Icon.Search, Target: scrQueryBuilder,
     Roles: "Area Biologist,Senior Biologist"},
    {Key: "insights", Label: "Insights", DataEntryLabel: "",
     Icon: Icon.TrendingUp, Target: scrInsights,
     Roles: "Area Biologist,Senior Biologist"}
);
```

**Filtering logic:**
```
// galNavItems.Items
Filter(colNavItems, gblCurrentRole in Roles)
```

**Label display logic:**
```
// lblNavLabel.Text
If(gblCurrentRole = "Data Entry Assistant" && !IsBlank(ThisItem.DataEntryLabel),
    ThisItem.DataEntryLabel,
    ThisItem.Label
)
```

---

## 4. Screen 1: scrDashboard

### Overview
The dashboard is **role-dependent** -- it renders completely different layouts based on `gblCurrentRole`. This is implemented using three container groups with visibility toggled by role.

### Screen.OnVisible
```
// Refresh NE waters and surveys for dashboard
ClearCollect(colNEWaters, Filter(cpw_Water, cpw_Region = "Northeast"));

ClearCollect(colNESurveys,
    AddColumns(
        Filter(cpw_Survey, cpw_WaterId in colNEWaters.cpw_WaterId),
        "WaterName", LookUp(colNEWaters, cpw_WaterId = cpw_Survey[@cpw_WaterId]).cpw_Name
    )
);
```

---

### 4A. Data Entry Assistant Dashboard

**Visible when:** `gblCurrentRole = "Data Entry Assistant"`

**Container:** `conDashboardDataEntry`

#### Layout (top to bottom)

**Header Row:**
| Control | Type | Properties |
|---|---|---|
| `lblDETitle` | Label | Text: `"Assigned Waters -- Data Entry View"`, Font: 22, FontWeight: Semibold, Color: clrPrimary |
| `lblDESubtitle` | Label | Text: `"Upload and manage survey data for your supervising biologist"`, Font: 13, Color: clrTextMuted |
| `cmpRoleIndicator_DE` | Component instance | Right-aligned |

**Role Scope Banner:**
| Control | Type | Properties |
|---|---|---|
| `recDEScopeBanner` | Rectangle | Fill: `RGBA(248,250,252,1)`, Border: clrBorder, BorderRadius: 4, Height: 72 |
| `icoInfoDE` | Icon (Info) | Color: clrPrimary, Size: 16 |
| `lblDEScopeTitle` | Label | Text: `"Your Data Entry Scope"`, Font: 13, Bold |
| `lblDEScopeBody` | Label | Text: `"You can upload and edit surveys for waters assigned to your supervising biologist (J. Martinez, Area Biologist -- Northeast Region). Contact your supervisor to request access to additional waters."`, Font: 12, Color: clrTextMuted, AutoHeight: true |

**Row 1: Quick Action + Stats (4 columns)**

| Control | Type | Properties |
|---|---|---|
| `crdDEQuickAction` | Container (Card) | Col 1. Border: 2px clrPrimary/20, Background: clrPrimary/2% |
| `lblDEQuickActionTitle` | Label | `"Quick Action"`, Font: 13 |
| `btnUploadSurvey` | Button | Text: `"Upload Survey Data"`, Icon: Upload, Fill: clrPrimary, OnSelect: `Navigate(scrSurveyUpload, ScreenTransition.None)` |
| `lblDEQuickActionCaption` | Label | `"Start data entry workflow"`, Font: 11, Color: clrTextMuted |
| `crdDEStatAssigned` | Container (Card) | Col 2. Value: `"2"`, Label: `"Assigned Waters"`, Detail: `"South Platte Basin, Cache la Poudre"` |
| `crdDEStatPending` | Container (Card) | Col 3. Value: `CountRows(Filter(colNESurveys, cpw_Status="Pending Validation"))`, Label: `"Pending Upload"` |
| `crdDEStatAwaiting` | Container (Card) | Col 4. Value: `CountRows(Filter(colNESurveys, cpw_Status="Pending Approval"))`, Label: `"Awaiting Review"` |

**Row 2: Assigned Waters Status Table**

| Control | Type | Properties |
|---|---|---|
| `crdDEAssignedTable` | Container (Card) | Full width |
| `lblDEAssignedTitle` | Label | `"Assigned Waters Status"`, Font: 16 |
| `lblDEAssignedSub` | Label | `"Survey stations you manage for data entry"`, Font: 12 |
| `galDEAssignedWaters` | Gallery (Vertical) | TemplateHeight: 48 |

**galDEAssignedWaters.Items:**
```
// Hardcoded for demo or filtered from cpw_Station + cpw_Survey
SortByColumns(
    AddColumns(
        Filter(cpw_Station, cpw_WaterId in colNEWaters.cpw_WaterId),
        "WaterName", LookUp(colNEWaters, cpw_WaterId = cpw_Station[@cpw_WaterId]).cpw_Name,
        "LastUpload", Text(
            Max(Filter(cpw_Survey, cpw_StationId = cpw_Station[@cpw_StationId]), cpw_Date),
            "yyyy-mm-dd"
        ),
        "SurveysThisYear", CountRows(
            Filter(cpw_Survey,
                cpw_StationId = cpw_Station[@cpw_StationId] &&
                Year(cpw_Date) = Year(Today())
            )
        )
    ),
    "LastUpload", SortOrder.Descending
)
```

**Gallery template columns:**
| Control | Type | Content |
|---|---|---|
| `lblDEGalWater` | Label | `ThisItem.WaterName` |
| `lblDEGalStation` | Label | `ThisItem.cpw_StationId`, Font: Mono, Color: clrPrimary |
| `lblDEGalLastUpload` | Label | `ThisItem.LastUpload`, Font: 12, Color: clrTextMuted |
| `lblDEGalStatus` | Label | Status badge (see badge reference). Color-coded: green if complete, amber if "Needs Upload" |
| `lblDEGalCount` | Label | `ThisItem.SurveysThisYear`, Font: Mono |
| `btnDEGalUpload` | Button | Text: `"Upload"`, Variant: Outline, OnSelect: `Navigate(scrSurveyUpload, ScreenTransition.None)` |

**Row 3: Recent Submissions Table**

| Control | Type | Properties |
|---|---|---|
| `crdDERecentSubs` | Container (Card) | Full width |
| `lblDERecentTitle` | Label | `"Your Recent Submissions"` |
| `galDERecentSubs` | Gallery (Vertical) | TemplateHeight: 48 |

**galDERecentSubs.Items:**
```
FirstN(
    SortByColumns(
        Filter(cpw_Survey,
            cpw_Uploader = gblCurrentUser.cpw_Name &&
            cpw_WaterId in colNEWaters.cpw_WaterId
        ),
        "cpw_Date", SortOrder.Descending
    ),
    4
)
```

**Gallery template columns:**
| Control | Type | Content |
|---|---|---|
| `lblDERSId` | Label | `ThisItem.cpw_SurveyId`, Font: Mono, Color: clrPrimary |
| `lblDERSWater` | Label | `ThisItem.WaterName` |
| `lblDERSStation` | Label | `ThisItem.cpw_StationId`, Font: Mono |
| `lblDERSDate` | Label | `Text(ThisItem.cpw_Date, "yyyy-mm-dd")` |
| `lblDERSStatus` | Label | Status badge |
| `lblDERSReviewer` | Label | `ThisItem.cpw_Reviewer`, Color: clrTextMuted |

---

### 4B. Area Biologist Dashboard

**Visible when:** `gblCurrentRole = "Area Biologist"`

**Container:** `conDashboardAreaBio`

#### Layout (top to bottom)

**Header Row:**
| Control | Type | Properties |
|---|---|---|
| `lblABTitle` | Label | Text: `"Waters Overview"`, Font: 22, Color: clrPrimary |
| `lblABSubtitle` | Label | `"Statewide Operational Status"`, Font: 13 |
| `cmpRoleIndicator_AB` | Component instance | Right-aligned |

**Row 1: Stats Grid (4 columns)**

| Control | Card Title | Subtitle | Value | Icon Color |
|---|---|---|---|---|
| `crdABStatWaters` | `"Waters Active"` | `"Current Season"` | `CountRows(colNEWaters)` | clrPrimary |
| `crdABStatPending` | `"Pending Approval"` | `"Surveys Requiring Review"` | `CountRows(Filter(colNESurveys, cpw_Status in ["Pending Validation","Pending Approval"]))` | clrWarning |
| `crdABStatFlagged` | `"Flagged Surveys"` | `"Data Quality Review"` | `CountRows(Filter(colNESurveys, cpw_Status = "Flagged Suspect"))` | clrDestructive |
| `crdABStatFederal` | `"Federal Reporting"` | `"Annual Compliance"` | `"87%"` | clrSuccess |

Each stat card follows this template:
| Control | Type | Notes |
|---|---|---|
| `lblStatSubtitle` | Label | Font: 11, uppercase, tracking-wide, Color: clrTextMuted |
| `lblStatTitle` | Label | Font: 13, FontWeight: Medium |
| `icoStatIcon` | Icon | 16px, right-aligned, color per card |
| `lblStatValue` | Label | Font: 28, FontWeight: Semibold |
| `lblStatTrend` | Label | Font: 11, Color: clrTextMuted |

**Row 2: Review Queue (2/3) + Active Survey Stations (1/3)**

##### Left: Review Queue Table
| Control | Type | Properties |
|---|---|---|
| `crdABReviewQueue` | Container (Card) | Spans 2/3 width |
| `lblABRQTitle` | Label | `"Review Queue"`, Font: 16 |
| `lblABRQSub` | Label | `"Surveys requiring attention within Northeast Region"` |
| `btnABRQViewAll` | Button | Text: `"View All"`, Variant: Outline, OnSelect: `Navigate(scrActivityFeed, ScreenTransition.None)` |
| `galABReviewQueue` | Gallery (Vertical) | TemplateHeight: 48, WrapCount: 1 |

**galABReviewQueue.Items:**
```
SortByColumns(
    Filter(colNESurveys,
        cpw_Status in ["Pending Validation", "Returned for Correction",
                        "Pending Approval", "Flagged Suspect"]
    ),
    "cpw_Date", SortOrder.Descending
)
```

**Gallery template columns:**
| Control | Type | Content |
|---|---|---|
| `lblRQId` | Label | `ThisItem.cpw_SurveyId`, Font: Mono, Color: clrPrimary |
| `lblRQWater` | Label | `ThisItem.WaterName`, underline, OnSelect: `Navigate(scrWaterProfile, ..., {locSelectedWaterId: ThisItem.cpw_WaterId})` |
| `lblRQProtocol` | Label | `ThisItem.cpw_Protocol`, Font: 12, Color: clrTextMuted |
| `lblRQDate` | Label | `Text(ThisItem.cpw_Date, "yyyy-mm-dd")`, Font: 12 |
| `lblRQStatus` | Label | Status badge (see Section 12) |
| `btnRQAction` | Button | Text: `If(ThisItem.cpw_Status = "Returned for Correction", "Continue", "Review")`, Variant: Outline, OnSelect: `Navigate(scrValidation, ScreenTransition.None, {locSelectedSurveyId: ThisItem.cpw_SurveyId})` |

##### Right: Active Survey Stations
| Control | Type | Properties |
|---|---|---|
| `crdABStationMap` | Container (Card) | Spans 1/3 width |
| `lblABMapTitle` | Label | `"Active Survey Stations"` |
| `lblABMapSub` | Label | `"Current field season locations"` |
| `imgABStationViz` | Image / HTML | Placeholder station visualization (SVG or static image) |
| `lblABMapRegions` | Label | `"Active Regions: 1"` |
| `lblABMapWaters` | Label | `"Water Bodies: " & CountRows(colNEWaters)` |
| `lblABMapStations` | Label | `"Survey Stations: " & Sum(colNEWaters, CountRows(cpw_Stations))` |

**Row 3: Waters in Northeast Region Table**

| Control | Type | Properties |
|---|---|---|
| `crdABWatersTable` | Container (Card) | Full width |
| `lblABWatersTitle` | Label | `"Waters in Northeast Region"` |
| `galABWaters` | Gallery (Vertical) | TemplateHeight: 44 |

**galABWaters.Items:**
```
AddColumns(
    colNEWaters,
    "ActiveSurveys", CountRows(Filter(cpw_Survey, cpw_WaterId = cpw_Water[@cpw_WaterId])),
    "LastSurveyDate", Text(
        Max(Filter(cpw_Survey, cpw_WaterId = cpw_Water[@cpw_WaterId]), cpw_Date),
        "yyyy-mm-dd"
    )
)
```

**Gallery template columns:**
| Control | Type | Content |
|---|---|---|
| `lblWTWater` | Label | `ThisItem.cpw_Name`, underline link, OnSelect: `Navigate(scrWaterProfile, ..., {locSelectedWaterId: ThisItem.cpw_WaterId})` |
| `lblWTCount` | Label | `ThisItem.ActiveSurveys`, Font: Mono |
| `lblWTLastDate` | Label | `ThisItem.LastSurveyDate` |
| `lblWTStatusBadge` | Label | `"Active"`, green badge |

**Row 4: Species of Concern Activity Panel**

| Control | Type | Properties |
|---|---|---|
| `crdABSpeciesConcern` | Container (Card) | Full width, Border: clrDestructive/20, Fill: clrDestructive/2% |
| `icoABSpeciesWarn` | Icon (Warning) | Color: clrDestructive |
| `lblABSpeciesTitle` | Label | `"Species of Concern Activity"`, Font: 16 |
| `lblABSpeciesSub` | Label | `"Population trends requiring monitoring attention"` |
| `btnABSpeciesViewAnalysis` | Button | `"View Analysis"`, OnSelect: `Navigate(scrQueryBuilder, ScreenTransition.None)` |
| `conABSpeciesGrid` | Container | 3-column grid |

Each of the 3 species-concern items:
| Control | Type | Content |
|---|---|---|
| `lblSpeciesName` | Label | e.g. `"Cutthroat Trout (CTT)"`, Font: 13, bold |
| `lblSpeciesBadge` | Label | e.g. `"-25% decline"`, destructive badge OR `"Monitoring"`, warning badge |
| `lblSpeciesDetail` | Label | e.g. `"Cache la Poudre -- CPUE declining since 2021"`, Font: 12 |

---

### 4C. Senior Biologist Dashboard

**Visible when:** `gblCurrentRole = "Senior Biologist"`

**Container:** `conDashboardSenior`

#### Layout (top to bottom)

**Header Row:**
| Control | Type | Properties |
|---|---|---|
| `lblSBTitle` | Label | `"Statewide Water Intelligence Overview"`, Font: 22, Color: clrPrimary |
| `lblSBSubtitle` | Label | `"Strategic cross-water analysis and federal reporting dashboard"` |
| `cmpRoleIndicator_SB` | Component instance | Right-aligned |

**Regional Filter Bar:**
| Control | Type | Properties |
|---|---|---|
| `recSBFilterBar` | Rectangle | Fill: `RGBA(248,250,252,1)`, border, rounded |
| `lblSBFilterLabel` | Label | `"Analysis Scope:"`, Font: 13, bold |
| `drpSBRegionFilter` | Dropdown | Items: `["Statewide","Northeast Region","Southeast Region","Northwest Region","Southwest Region","Central Region"]`, Default: `"Statewide"`, Width: 200 |
| `btnSBExport` | Button | `"Export Statewide Report"`, Icon: FileSpreadsheet, Variant: Outline |
| `btnSBTableau` | Button | `"Open in Tableau"`, Icon: BarChart3, Variant: Outline |

**Row 1: Statewide Summary Cards (4 columns)**

| Control | Card Label | Value | Detail |
|---|---|---|---|
| `crdSBTotalWaters` | `"Total Waters Monitored"` | `"118"` | `"Across 5 regions, 702 surveys YTD"` |
| `crdSBFlagged` | `"Waters Flagged for Review"` | `"7"` | `"Population declines require analysis"` (clrDestructive) |
| `crdSBFederal` | `"Federal Reporting Readiness"` | `"82%"` | `"Avg. completion across 4 requirements"` |
| `crdSBQuality` | `"Data Quality Score"` | `"96%"` | `"Validation rate across all surveys"` (clrSuccess) |

**Row 2: Regional Performance Bar Chart**

| Control | Type | Properties |
|---|---|---|
| `crdSBRegionalChart` | Container (Card) | Full width |
| `lblSBChartTitle` | Label | `"Regional Performance Comparison"`, Font: 16 |
| `lblSBChartSub` | Label | `"Survey activity and compliance metrics by region"` |
| `chtSBRegionalBar` | BarChart (Power Apps chart control) | Items: `Table({Region:"Northeast",Surveys:147},{Region:"Southeast",Surveys:112},{Region:"Northwest",Surveys:189},{Region:"Southwest",Surveys:156},{Region:"Central",Surveys:98})`, Series: Surveys, Labels: Region, Height: 280, Color: clrPrimary |

**Row 3: Cross-Water Trends (1/2) + Federal Reporting (1/2)**

##### Left: Cross-Water Population Trends
| Control | Type | Properties |
|---|---|---|
| `crdSBCrossWater` | Container (Card) | 1/2 width |
| `lblSBCWTitle` | Label | `"Cross-Water Population Trends"`, Font: 16 |
| `btnSBCWAdvancedQuery` | Button | `"Advanced Query"`, Variant: Outline, OnSelect: `Navigate(scrQueryBuilder, ScreenTransition.None)` |
| `galSBCrossWater` | Gallery (Vertical) | TemplateHeight: 56 |

**galSBCrossWater.Items:**
```
Table(
    {Water: "South Platte Basin", Region: "Northeast", Trend: "+8%", Population: 3812, Status: "Stable"},
    {Water: "Arkansas River", Region: "Southeast", Trend: "-4%", Population: 2456, Status: "Declining"},
    {Water: "Blue River", Region: "Northwest", Trend: "-12%", Population: 1834, Status: "Concern"},
    {Water: "Colorado River", Region: "Northwest", Trend: "+3%", Population: 4123, Status: "Stable"},
    {Water: "Cache la Poudre", Region: "Northeast", Trend: "+6%", Population: 2987, Status: "Stable"}
)
```

**Gallery template:**
| Control | Type | Content |
|---|---|---|
| `lblCWWater` | Label | `ThisItem.Water`, Font: 13, bold |
| `lblCWRegionPop` | Label | `ThisItem.Region & " - Pop: " & Text(ThisItem.Population, "#,##0")`, Font: 11 |
| `lblCWTrend` | Label | `ThisItem.Trend`, Color: `If(Left(ThisItem.Trend,1)="+", clrSuccess, clrDestructive)` |
| `icoCWTrend` | Icon | TrendingUp or TrendingDown based on `Left(ThisItem.Trend,1)` |
| `lblCWStatusBadge` | Label | Status badge: Stable=green, Declining=amber, Concern=red |

##### Right: Federal Reporting Compliance
| Control | Type | Properties |
|---|---|---|
| `crdSBFederalReport` | Container (Card) | 1/2 width |
| `lblSBFRTitle` | Label | `"Federal Reporting Compliance"`, Font: 16 |
| `lblSBFRSub` | Label | `"2026 mandated deliverables status"` |
| `galSBFederal` | Gallery (Vertical) | TemplateHeight: 72 |

**galSBFederal.Items:**
```
Table(
    {Requirement: "Annual Species Inventory", Deadline: "Mar 31, 2026", Progress: 87, Status: "On Track"},
    {Requirement: "Endangered Species Monitoring", Deadline: "Apr 15, 2026", Progress: 94, Status: "On Track"},
    {Requirement: "Water Quality Impact Assessment", Deadline: "May 1, 2026", Progress: 67, Status: "Needs Attention"},
    {Requirement: "Population Trend Analysis", Deadline: "Jun 30, 2026", Progress: 45, Status: "In Progress"}
)
```

**Gallery template:**
| Control | Type | Content |
|---|---|---|
| `lblFRReq` | Label | `ThisItem.Requirement`, Font: 12, bold |
| `lblFRDeadline` | Label | `"Due: " & ThisItem.Deadline`, Font: 11 |
| `lblFRStatusBadge` | Label | Status badge |
| `recFRProgressBg` | Rectangle | Full width, Height: 8, Fill: clrBorder, RadiusTopLeft/etc: 4 |
| `recFRProgressFill` | Rectangle | Width: `Parent.Width * ThisItem.Progress / 100`, Fill: `If(ThisItem.Progress >= 85, clrSuccess, ThisItem.Progress >= 70, clrWarning, clrDestructive)` |
| `lblFRPercent` | Label | `ThisItem.Progress & "%"`, Font: Mono, right-aligned |

**Row 4: Waters Requiring Strategic Attention**

| Control | Type | Properties |
|---|---|---|
| `crdSBAttention` | Container (Card) | Full width, Border: clrDestructive/20, Fill: clrDestructive/2% |
| `icoSBAttentionWarn` | Icon (Warning) | Color: clrDestructive |
| `lblSBAttentionTitle` | Label | `"Waters Requiring Strategic Attention"`, Font: 16 |
| `btnSBAttentionIntel` | Button | `"View Intelligence"`, OnSelect: `Navigate(scrInsights, ScreenTransition.None)` |
| `conSBAttentionGrid` | Container | 3-column grid |

Items (3 hardcoded attention cards):
1. Blue River -- Northwest: `-12% decline`, "Cutthroat population showing significant decrease across 8 surveys"
2. Arkansas River -- SE: `Data Quality` (warning), "3 recent surveys flagged for protocol compliance review"
3. Gunnison River -- SW: `Range Shift` (warning), "Non-native species expanding -- management action may be required"

---

### Dashboard Data Sources
| Source | Used For |
|---|---|
| `cpw_Water` | NE waters list, station counts |
| `cpw_Survey` | Review queue, status counts, recent submissions |
| `cpw_Station` | Assigned waters (Data Entry) |
| `cpw_TrendData` | Species of concern CPUE derivation |
| `cpw_AppUser` | Current user info |

### Dashboard Navigation Targets
| From Control | Target | Parameters |
|---|---|---|
| `btnUploadSurvey` | `scrSurveyUpload` | none |
| `btnDEGalUpload` | `scrSurveyUpload` | none |
| `lblRQWater` (link) | `scrWaterProfile` | `{locSelectedWaterId: ThisItem.cpw_WaterId}` |
| `btnRQAction` | `scrValidation` | `{locSelectedSurveyId: ThisItem.cpw_SurveyId}` |
| `btnABRQViewAll` | `scrActivityFeed` | none |
| `btnABSpeciesViewAnalysis` | `scrQueryBuilder` | none |
| `btnSBCWAdvancedQuery` | `scrQueryBuilder` | none |
| `btnSBAttentionIntel` | `scrInsights` | none |

---

## 5. Screen 2: scrWaterSelect

### Screen Name: `scrWaterSelect`
### Purpose: List of NE region waters as clickable rows. Links to Water Profile.

### Screen.OnVisible
```
ClearCollect(colNEWaters, Filter(cpw_Water, cpw_Region = "Northeast"));
```

### Layout (top to bottom)

**Header:**
| Control | Type | Properties |
|---|---|---|
| `lblWSTitle` | Label | `"Select Water Body"`, Font: 18, Color: clrPrimary |
| `lblWSSubtitle` | Label | `"Choose a water to view survey history and status"`, Font: 13 |
| `cmpRoleIndicator_WS` | Component | Right-aligned |

**Regional Scope Strip:**
`cmpRegionalScopeStrip` -- Visible: `gblCurrentRole = "Area Biologist"`

**Main Content: Waters List Card**

| Control | Type | Properties |
|---|---|---|
| `crdWSWatersList` | Container (Card) | Full width, padded |
| `lblWSCardTitle` | Label | `"Waters in Northeast Region"`, Font: 16 |
| `galWSWaters` | Gallery (Vertical) | TemplateHeight: 64, TemplatePadding: 0 |

**galWSWaters.Items:**
```
AddColumns(
    colNEWaters,
    "SurveyCount", CountRows(Filter(cpw_Survey, cpw_WaterId = cpw_Water[@cpw_WaterId])),
    "StationCount", CountRows(Filter(cpw_Station, cpw_WaterId = cpw_Water[@cpw_WaterId])),
    "SpeciesNames", Concat(
        ForAll(
            Split(ThisItem.cpw_PrimarySpecies, ","),
            LookUp(colSpecies, cpw_Code = Result).cpw_CommonName
        ),
        Result, ", "
    )
)
```

**Gallery template:**
| Control | Type | Content |
|---|---|---|
| `recWSGalHover` | Rectangle | Fill on hover: `RGBA(248,250,252,1)`, rounded |
| `icoWSWaves` | Icon (Waves) | 36x36 container with clrPrimary/10 bg, icon clrPrimary |
| `lblWSGalName` | Label | `ThisItem.cpw_Name`, Font: 14, bold |
| `lblWSGalSpecies` | Label | `ThisItem.SpeciesNames`, Font: 12, Color: clrTextMuted |
| `lblWSGalSurveyCount` | Label | `ThisItem.SurveyCount`, Font: 13, bold |
| `lblWSGalSurveyLabel` | Label | `"surveys"`, Font: 11, Color: clrTextMuted |
| `icoWSGalPin` | Icon (MapPin) | Size: 12 |
| `lblWSGalStations` | Label | `ThisItem.StationCount & " station" & If(ThisItem.StationCount<>1, "s", "")` |
| `lblWSGalYears` | Label | `ThisItem.cpw_YearsStart & "--" & ThisItem.cpw_YearsEnd`, Font: 11 |
| `icoWSGalChevron` | Icon (ChevronRight) | Size: 16, Color: clrTextMuted |

**Gallery OnSelect:**
```
Navigate(scrWaterProfile, ScreenTransition.None,
    {locSelectedWaterId: ThisItem.cpw_WaterId}
)
```

### Data Sources
| Source | Used For |
|---|---|
| `cpw_Water` | Water body list |
| `cpw_Survey` | Survey count per water |
| `cpw_Station` | Station count per water |
| `cpw_Species` | Species name lookup |

### Variables Used/Modified
| Variable | Action |
|---|---|
| `gblCurrentRole` | Read (visibility of scope strip) |
| `locSelectedWaterId` | Set on gallery select |

### Navigation Targets
| From | Target | Parameters |
|---|---|---|
| `galWSWaters.OnSelect` | `scrWaterProfile` | `{locSelectedWaterId: ThisItem.cpw_WaterId}` |

---

## 6. Screen 3: scrWaterProfile

### Screen Name: `scrWaterProfile`
### Purpose: Detailed water body view. **Role-dependent** layout.

### Screen.OnVisible
```
// locSelectedWaterId was passed via Navigate context
Set(locWater, LookUp(cpw_Water, cpw_WaterId = locSelectedWaterId));

ClearCollect(colWPSurveys,
    SortByColumns(
        Filter(cpw_Survey, cpw_WaterId = locSelectedWaterId),
        "cpw_Date", SortOrder.Descending
    )
);

// Load trend data for chart
ClearCollect(colWPTrend,
    SortByColumns(
        Filter(cpw_TrendData, cpw_WaterId = locSelectedWaterId),
        "cpw_Year", SortOrder.Ascending
    )
);
```

### Header
| Control | Type | Properties |
|---|---|---|
| `cmpBreadcrumbWP` | cmpBreadcrumb | Items: `[{Label: "Waters", ScreenTarget: scrWaterSelect}, {Label: locWater.cpw_Name}]` |
| `lblWPTitle` | Label | `"Water Profile"`, Font: 18, Color: clrPrimary |
| `lblWPSubtitle` | Label | `"Comprehensive water body intelligence and survey history"` |
| `cmpRoleIndicator_WP` | Component | Right-aligned |

### Shared Elements
| Control | Type | Properties |
|---|---|---|
| `cmpWaterBanner_WP` | cmpWaterBanner | Bound to `locWater` fields |
| `cmpRegionalScopeStrip_WP` | cmpRegionalScopeStrip | Visible: `gblCurrentRole = "Area Biologist"` |

---

### 6A. Data Entry View

**Visible when:** `gblCurrentRole = "Data Entry Assistant"`

**Container:** `conWPDataEntry`

**Helper text:**
| Control | Type | Properties |
|---|---|---|
| `lblWPDEHelper` | Label | `"This view is optimized for survey data entry and validation workflow."`, Font: 12, Color: clrTextMuted |

**Section: Survey Activity Status (2x2 grid of stat cards)**

| Card Control | Metric Label | Value Formula | Icon | Icon Color |
|---|---|---|---|---|
| `crdWPDEUploaded` | `"Uploaded"` | `CountRows(colWPSurveys)` | CheckCircle2 | clrSuccess |
| `crdWPDEPending` | `"Pending Validation"` | `CountRows(Filter(colWPSurveys, cpw_Status="Pending Validation"))` | Clock | clrWarning |
| `crdWPDEReturned` | `"Returned for Correction"` | `CountRows(Filter(colWPSurveys, cpw_Status="Returned for Correction"))` | AlertTriangle | clrDestructive |
| `crdWPDEApproval` | `"Awaiting Biologist Approval"` | `CountRows(Filter(colWPSurveys, cpw_Status="Pending Approval"))` | Clock | clrPrimary |

Each card: large number (Font: 32), subtitle below (Font: 12), icon top-right.

**Section: Recent Survey Activity**

| Control | Type | Properties |
|---|---|---|
| `crdWPDERecentActivity` | Container (Card) | Full width |
| `lblWPDERATitle` | Label | `"Recent Survey Activity"` |
| `galWPDERecent` | Gallery (Vertical) | TemplateHeight: 64 |

**galWPDERecent.Items:**
```
FirstN(colWPSurveys, 4)
```

**Gallery template:**
| Control | Type | Content |
|---|---|---|
| `icoWPDEDoc` | Icon (Document) | Size: 16, Color: clrTextMuted |
| `lblWPDEGalId` | Label | `ThisItem.cpw_SurveyId`, Font: Mono, Color: clrPrimary |
| `lblWPDEGalDetail` | Label | `"Station " & ThisItem.cpw_StationId & " - " & Text(ThisItem.cpw_Date, "yyyy-mm-dd")`, Font: 11 |
| `lblWPDEGalProtocol` | Label | `ThisItem.cpw_Protocol`, Font: 12 |
| `lblWPDEGalStatus` | Label | Status badge |

---

### 6B. Area Biologist / Senior Biologist View

**Visible when:** `gblCurrentRole <> "Data Entry Assistant"`

**Container:** `conWPBiologist`

**Row 1: Summary Cards (4 columns)**

| Card Control | Label | Value | Extra |
|---|---|---|---|
| `crdWPBioPopulation` | `"Current Population"` | `Last(colWPTrend).cpw_PopEstimate` or CPUE | Trend icon (up/down) + trend label |
| `crdWPBioSpecies` | `"Primary Species"` | Species code + common name from `locWater.cpw_PrimarySpecies` | -- |
| `crdWPBioLastSurvey` | `"Last Survey"` | `Text(First(colWPSurveys).cpw_Date, "mmm d")` + year below | -- |
| `crdWPBioStatus` | `"Water Status"` | `"Active Monitoring"` | Green badge |

**Row 2: CPUE Trend Chart (2/3) + Species Composition (1/3)**

##### Left: CPUE Trend
| Control | Type | Properties |
|---|---|---|
| `crdWPBioCpueChart` | Container (Card) | 2/3 width |
| `lblWPBioCpueTitle` | Label | `"CPUE Trend"`, Font: 16 |
| `chtWPBioCpue` | LineChart | Items: `colWPTrend`, Series: cpw_CPUE, Labels: cpw_Year, Height: 280, LineColor: clrPrimary, AreaFill: gradient clrPrimary 15% to 2% |

##### Right: Species Composition
| Control | Type | Properties |
|---|---|---|
| `crdWPBioSpeciesComp` | Container (Card) | 1/3 width |
| `lblWPBioSpecTitle` | Label | `"Species Composition"`, Font: 16 |
| `galWPBioSpecBars` | Gallery (Vertical) | TemplateHeight: 48 |

**galWPBioSpecBars.Items:**
```
ForAll(
    Split(locWater.cpw_PrimarySpecies, ",") As sp,
    {
        SpeciesName: LookUp(colSpecies, cpw_Code = sp.Result).cpw_CommonName,
        Count: CountRows(Filter(cpw_FishRecord,
            cpw_SurveyId in colWPSurveys.cpw_SurveyId &&
            cpw_SpeciesCode = sp.Result
        ))
    }
)
```

**Gallery template:**
| Control | Type | Content |
|---|---|---|
| `lblSpecBarName` | Label | `ThisItem.SpeciesName`, Font: 12 |
| `lblSpecBarCount` | Label | `Text(ThisItem.Count, "#,##0")`, Font: Mono |
| `recSpecBarBg` | Rectangle | Height: 8, Fill: clrBorder, full width |
| `recSpecBarFill` | Rectangle | Width proportional to max, Fill: `If(index=0, clrPrimary, index=1, clrSecondary, clrAccent)` |

**Row 3: Recent Survey Activity (2/3) + Stations in Basin (1/3)**

##### Left: Recent Survey Activity
| Control | Type | Properties |
|---|---|---|
| `crdWPBioRecentSurveys` | Container (Card) | 2/3 width |
| `lblWPBioRSTitle` | Label | `"Recent Survey Activity"` |
| `btnWPBioViewAnalytics` | Button | `"View All Analytics"`, Variant: Outline, OnSelect: `Navigate(scrInsights, ScreenTransition.None, {locSelectedWaterId: locSelectedWaterId})` |
| `galWPBioRecent` | Gallery (Vertical) | TemplateHeight: 64, OnSelect: navigates to validation |

**Gallery template columns:** Same as Data Entry recent gallery, plus clickable row navigating to validation.

```
// galWPBioRecent.OnSelect
Navigate(scrValidation, ScreenTransition.None,
    {locSelectedSurveyId: ThisItem.cpw_SurveyId}
)
```

##### Right: Stations in Basin
| Control | Type | Properties |
|---|---|---|
| `lblWPBioStationsTitle` | Label | `"Stations in Basin"`, Font: 14 |
| `galWPBioStations` | Gallery (Horizontal, wrap) | Items: `Filter(cpw_Station, cpw_WaterId = locSelectedWaterId)` |

**Gallery template:**
| Control | Type | Content |
|---|---|---|
| `btnStationChip` | Button | Text: `ThisItem.cpw_StationId`, Variant: Outline, Font: Mono, 13 |

**Row 4: Management Notes**

| Control | Type | Properties |
|---|---|---|
| `crdWPBioNotes` | Container (Card) | Full width, Border: clrWarning/20, Fill: clrWarning/2% |
| `icoWPBioNotesWarn` | Icon (Warning) | Color: clrWarning |
| `lblWPBioNotesTitle` | Label | `"Management Notes"`, Font: 16 |
| `lblWPBioNotesSub` | Label | `"Current monitoring priorities and observations"` |
| `lblWPBioNote1` | Label | Dynamic note based on trend direction |
| `lblWPBioNote2` | Label | Protocol continuation note |
| `lblWPBioNote3` | Label | `"Monitor young-of-year presence in fall surveys to assess spawning success"` |

### Data Sources
| Source | Used For |
|---|---|
| `cpw_Water` | Water record |
| `cpw_Survey` | Survey list for this water |
| `cpw_Station` | Station list for this water |
| `cpw_TrendData` | CPUE trend chart |
| `cpw_FishRecord` | Species composition counts |
| `cpw_Species` | Species name lookup |

### Variables Used/Modified
| Variable | Action |
|---|---|
| `locSelectedWaterId` | Read (passed from scrWaterSelect or scrDashboard) |
| `gblCurrentRole` | Read (role-dependent visibility) |

### Navigation Targets
| From | Target | Parameters |
|---|---|---|
| `galWPBioRecent.OnSelect` | `scrValidation` | `{locSelectedSurveyId: ThisItem.cpw_SurveyId}` |
| `btnWPBioViewAnalytics` | `scrInsights` | `{locSelectedWaterId: locSelectedWaterId}` |

---

## 7. Screen 4: scrSurveyUpload

### Screen Name: `scrSurveyUpload`
### Purpose: Two-state upload screen. Pre-upload shows drag-drop/file selector. Post-upload shows detected metadata + validation summary.

### Screen.OnVisible
```
UpdateContext({locUploaded: false});
```

### Header
| Control | Type | Properties |
|---|---|---|
| `lblSUTitle` | Label | `"Upload Survey Data"`, Font: 22, Color: clrPrimary |
| `lblSUSubtitle` | Label | `"Import field data for validation and analysis"` |
| `cmpRoleIndicator_SU` | Component | Right-aligned |

### Scope Strips
| Control | Visible | Content |
|---|---|---|
| `cmpRegionalScopeStrip_SU` | `gblCurrentRole = "Area Biologist"` | Regional scope strip |
| `recSUStepBanner` | `gblCurrentRole = "Data Entry Assistant"` | `"Step 1 of 3: Upload Survey Data -> Step 2: Validate -> Step 3: Submit for Biologist Review"` |

---

### 7A. Pre-Upload State

**Visible when:** `!locUploaded`

**Container:** `conSUPreUpload` (2-column grid)

##### Left Column: Upload Area
| Control | Type | Properties |
|---|---|---|
| `crdSUUploadArea` | Container (Card) | |
| `lblSUUploadCardTitle` | Label | `"Select Survey File"`, Font: 16 |
| `recSUDropZone` | Rectangle | Border: 2px dashed clrBorder (changes to clrPrimary on hover), Height: 240, RadiusTopLeft: 6 |
| `icoSUUploadIcon` | Icon (Upload) | Size: 48, Color: clrTextMuted, centered |
| `lblSUDropLabel` | Label | `"Drag & Drop Survey File"`, Font: 16 |
| `lblSUDropSub` | Label | `"or click to browse your files"`, Font: 13, Color: clrTextMuted |
| `btnSUSelectFile` | Button | Text: `"Select File"`, Icon: FileSpreadsheet, OnSelect: `UpdateContext({locUploaded: true})` |
| `lblSUFormats` | Label | `"Supported: .xlsx, .csv, .xls (Max 50MB)"`, Font: 11 |
| `recSUDataReqs` | Container | Bordered info box |
| `icoSUReqInfo` | Icon (Info) | |
| `lblSUReqTitle` | Label | `"Data Requirements"`, Font: 13, bold |
| `lblSUReqList` | Label | Bulleted list of 5 requirements, AutoHeight: true |

##### Right Column: Info Panel
**Card 1: Supported Protocol Types**

| Control | Type | Properties |
|---|---|---|
| `crdSUProtocols` | Container (Card) | |
| `lblSUProtTitle` | Label | `"Supported Protocol Types"`, Font: 16 |

3 protocol items displayed as stacked bordered rows:
| Protocol | Description |
|---|---|
| `"Two-Pass Removal"` | `"Population estimates via depletion methodology (Zippin's method)"` |
| `"Three-Pass Removal"` | `"Enhanced depletion estimates for higher precision"` |
| `"Single Pass Electrofish"` | `"CPUE and relative abundance metrics only"` |

**Card 2: Download Templates**

| Control | Type | Properties |
|---|---|---|
| `crdSUTemplates` | Container (Card) | |
| `lblSUTempTitle` | Label | `"Download Templates"`, Font: 16 |
| `btnSUTempRiver` | Button | `"CPW_River_Survey_2026.xlsx"`, Variant: Outline, Icon: FileSpreadsheet, full width |
| `btnSUTempLake` | Button | `"CPW_Lake_Survey_2026.xlsx"`, Variant: Outline, Icon: FileSpreadsheet, full width |

---

### 7B. Post-Upload State

**Visible when:** `locUploaded`

**Container:** `conSUPostUpload` (2-column grid)

##### Left Column: Auto-Detected Metadata
| Control | Type | Properties |
|---|---|---|
| `crdSUMetadata` | Container (Card) | |
| `icoSUCheckMeta` | Icon (CheckCircle) | Color: clrSuccess |
| `lblSUMetaTitle` | Label | `"File Detected & Analyzed"`, Font: 16 |
| `recSUFileInfo` | Container | Shows file name `"Colorado_River_Survey_Feb2026.xlsx"`, size `"284 KB"` |

**Auto-Detected Metadata rows (galSUMetadata):**

| Control | Type | Content |
|---|---|---|
| `galSUMetadataRows` | Gallery (Vertical) | TemplateHeight: 44 |

Items (hardcoded for demo):
```
Table(
    {Field: "Water", Value: "South Platte Basin", Highlight: true},
    {Field: "Station", Value: "SP-04"},
    {Field: "Region", Value: "Northeast"},
    {Field: "Template Type", Value: "River Survey"},
    {Field: "Protocol", Value: "Two-Pass Removal"},
    {Field: "Water Code", Value: "COCOL03"},
    {Field: "Water Body", Value: "Colorado River - Reach 3"},
    {Field: "Survey Date", Value: "February 10, 2026"}
)
```

**Gallery template:**
| Control | Type | Content |
|---|---|---|
| `lblSUMetaField` | Label | `ThisItem.Field`, Font: 12, Color: clrTextMuted |
| `lblSUMetaValue` | Label | `ThisItem.Value`, Font: 13, bold (Mono for codes) |
| `recSUMetaRow` | Rectangle | Fill: `If(ThisItem.Highlight, RGBA(27,54,93,0.05), White)`, Border: `If(ThisItem.Highlight, clrPrimary/30, clrBorder)` |

**Data Summary (2 boxes):**
| Control | Type | Content |
|---|---|---|
| `crdSUFishRecords` | Container | `"247"` + `"Fish Records"` |
| `crdSUSpeciesDetected` | Container | `"4"` + `"Species Detected"` |

##### Right Column: Validation Summary
| Control | Type | Properties |
|---|---|---|
| `crdSUValidation` | Container (Card) | |
| `lblSUValTitle` | Label | `"Validation Summary"`, Font: 16 |

**3 status boxes:**
| Control | Label | Value | Border/Fill |
|---|---|---|---|
| `recSUValValid` | `"Valid Records"` + `"All required fields present and within range"` | `"247"` | clrSuccess/30, clrSuccess/5 |
| `recSUValWarn` | `"Warnings"` + `"Minor issues -- can proceed with review"` | `"12"` | clrWarning/30, clrWarning/5 |
| `recSUValError` | `"Errors"` + `"Must be corrected before submission"` | `"3"` | clrDestructive/30, clrDestructive/5 |

**Issues List:**
| Control | Type | Properties |
|---|---|---|
| `lblSUIssuesTitle` | Label | `"Issues Requiring Attention"`, uppercase |
| `galSUIssues` | Gallery (Vertical) | 3 hardcoded error items |

Gallery template:
| Control | Type | Content |
|---|---|---|
| `icoSUIssue` | Icon (AlertCircle) | Color: clrDestructive |
| `lblSUIssueText` | Label | e.g. `"Row 34: Invalid species code 'RNTR'"` |

**Action Buttons:**
| Control | Type | Properties |
|---|---|---|
| `btnSUCancel` | Button | `"Cancel Upload"`, Variant: Outline, OnSelect: `UpdateContext({locUploaded: false})` |
| `btnSUReviewErrors` | Button | `"Review & Correct Errors"`, Fill: clrPrimary, OnSelect: `Navigate(scrValidation, ScreenTransition.None)` |

### Data Sources
| Source | Used For |
|---|---|
| `cpw_Water` | Auto-detect metadata (lookup) |
| `cpw_Station` | Auto-detect station |
| `cpw_Species` | Validate species codes |

### Variables Used/Modified
| Variable | Action |
|---|---|
| `locUploaded` | Set true on file select/drop, false on cancel |

### Navigation Targets
| From | Target | Parameters |
|---|---|---|
| `btnSUReviewErrors` | `scrValidation` | (optionally pass new survey ID) |

---

## 8. Screen 5: scrValidation

### Screen Name: `scrValidation`
### Purpose: Core data review screen. Fish record table with inline validation, issues panel, role-specific action buttons. This is the most complex screen.

### Screen.OnVisible
```
// locSelectedSurveyId passed via Navigate context
// If not passed, find first actionable survey
UpdateContext({
    locSelectedSurveyId: If(
        !IsBlank(locSelectedSurveyId),
        locSelectedSurveyId,
        First(
            SortByColumns(
                Filter(cpw_Survey,
                    cpw_Status in ["Pending Validation","Returned for Correction",
                                    "Pending Approval","Flagged Suspect"]
                ),
                "cpw_Date", SortOrder.Descending
            )
        ).cpw_SurveyId
    )
});

Set(locSurvey, LookUp(cpw_Survey, cpw_SurveyId = locSelectedSurveyId));
Set(locValWater, LookUp(cpw_Water, cpw_WaterId = locSurvey.cpw_WaterId));

ClearCollect(colFishRecords,
    SortByColumns(
        Filter(cpw_FishRecord, cpw_SurveyId = locSelectedSurveyId),
        "cpw_Row", SortOrder.Ascending
    )
);

ClearCollect(colValIssues,
    Filter(cpw_ValidationIssue, cpw_SurveyId = locSelectedSurveyId)
);

UpdateContext({locUnit: "mm", locActionMessage: ""});
```

### Header (complex -- contains breadcrumb, unit toggle, and role-specific actions)

| Control | Type | Properties |
|---|---|---|
| `cmpBreadcrumbVal` | cmpBreadcrumb | Items: `[{Label: "Waters", ScreenTarget: scrDashboard}, {Label: locValWater.cpw_Name, ScreenTarget: scrWaterProfile, Param: locValWater.cpw_WaterId}, {Label: "Survey Validation"}]` |
| `lblValTitle` | Label | `"Survey Validation"`, Font: 18, Color: clrPrimary |
| `lblValSubtitle` | Label | `"Designed to prevent protocol errors and preserve scientific integrity"` |
| `cmpRoleIndicator_Val` | Component | |

**Unit Toggle:**
| Control | Type | Properties |
|---|---|---|
| `lblUnitMM` | Label | `"mm"`, Font: 13 |
| `tglUnit` | Toggle | Default: false (mm), OnChange: `UpdateContext({locUnit: If(Self.Value, "inches", "mm")})` |
| `lblUnitInches` | Label | `"inches"`, Font: 13 |

**Action Buttons (role-specific):**

| Control | Visible | Text | OnSelect |
|---|---|---|---|
| `btnValRevalidate` | always | `"Revalidate"` | `UpdateContext({locActionMessage: "Validation rules reapplied -- no new issues found."})` |
| `btnValSubmitReview` | `gblCurrentRole = "Data Entry Assistant"` | `"Submit for Review"` | `Patch(cpw_Survey, locSurvey, {cpw_Status: "Pending Approval"}); UpdateContext({locActionMessage: "Survey submitted for review."})` |
| `btnValRequestCorrection` | `gblCurrentRole = "Area Biologist"` | `"Request Correction"` | `Patch(cpw_Survey, locSurvey, {cpw_Status: "Returned for Correction"}); UpdateContext({locActionMessage: "Survey returned for correction."})` |
| `btnValApprove` | `gblCurrentRole = "Area Biologist"` | `"Approve Survey"` | `Patch(cpw_Survey, locSurvey, {cpw_Status: "Approved"}); UpdateContext({locActionMessage: "Survey approved successfully."})` |
| `btnValFlagSuspect` | `gblCurrentRole = "Senior Biologist"` | `"Flag as Suspect"` | `Patch(cpw_Survey, locSurvey, {cpw_Status: "Flagged Suspect"}); UpdateContext({locActionMessage: "Survey flagged as suspect."})` |
| `btnValPublish` | `gblCurrentRole = "Senior Biologist"` | `"Publish to Analysis"` | `Patch(cpw_Survey, locSurvey, {cpw_Status: "Published"}); UpdateContext({locActionMessage: "Survey published to analysis."})` |

**Disable rules for Approve/Publish:**
```
// btnValApprove.DisplayMode
If(locSurvey.cpw_Status in ["Approved","Published"] || CountRows(Filter(colValIssues, cpw_Severity = "Error")) > 0,
    DisplayMode.Disabled,
    DisplayMode.Edit
)
```

**Action Confirmation Banner:**
| Control | Type | Properties |
|---|---|---|
| `recValActionMsg` | Container | Visible: `!IsBlank(locActionMessage)` |
| `icoValActionCheck` | Icon (CheckCircle) | Color: clrSuccess |
| `lblValActionMsg` | Label | `locActionMessage`, Color: clrSuccess |
| `lblValActionStatus` | Label | Status badge showing current `locSurvey.cpw_Status` |

### WaterBanner + Scope Strips

| Control | Type | Properties |
|---|---|---|
| `cmpWaterBanner_Val` | cmpWaterBanner | Bound to `locValWater` fields |
| `cmpRegionalScopeStrip_Val` | cmpRegionalScopeStrip | Visible: `gblCurrentRole = "Area Biologist"` |

### Contextual Survey Header
| Control | Type | Properties |
|---|---|---|
| `recValSurveyContext` | Rectangle | Fill: clrBackground/30, full width, Height: 56 |
| `lblValContextInfo` | Label | `"Validating data integrity and protocol compliance for " & locValWater.cpw_Name` |
| `lblValContextDetail` | Label | `"Station: " & locSurvey.cpw_StationId & " | Survey Date: " & Text(locSurvey.cpw_Date, "mmm d, yyyy") & " | Protocol: " & locSurvey.cpw_Protocol` |

### Protocol Banner
| Control | Type | Properties |
|---|---|---|
| `recValProtocolBanner` | Rectangle | Fill: clrPrimary/5, border-bottom clrPrimary/10 |
| `lblValProtocolBadge` | Label | `"Protocol: " & locSurvey.cpw_Protocol`, Font: 12, Fill: clrPrimary, Color: White, rounded |
| `icoValProtocolHelp` | Icon (QuestionCircle) | Tooltip: detailed protocol explanation |
| `lblValProtocolContext` | Label | `locValWater.cpw_Name & " -- " & locSurvey.cpw_StationId & " - " & Text(locSurvey.cpw_Date, "mmm d, yyyy")` |
| `lblValSurveyIdBanner` | Label | `"Survey ID: " & locSurvey.cpw_SurveyId`, Font: Mono |
| `lblValBiologistBanner` | Label | `"Biologist: " & locSurvey.cpw_Uploader` |

### Stats Cards (4 columns)

| Card Control | Icon | Value | Label |
|---|---|---|---|
| `crdValValid` | CheckCircle (clrSuccess) | `CountRows(Filter(colFishRecords, cpw_Status = "valid"))` | `"Valid Rows"` |
| `crdValWarnings` | AlertCircle (clrWarning) | `CountRows(Filter(colValIssues, cpw_Severity = "Warning"))` | `"Warnings"` |
| `crdValErrors` | AlertCircle (clrDestructive) | `CountRows(Filter(colValIssues, cpw_Severity = "Error"))` | `"Errors"` |
| `crdValTotal` | Info (clrTextMuted) | `CountRows(colFishRecords)` | `"Total Records"` |

### Main Content (3-column layout: 2/3 data table + 1/3 issues panel)

#### Left 2/3: Data Preview Table

| Control | Type | Properties |
|---|---|---|
| `crdValDataPreview` | Container (Card) | 2/3 width |
| `lblValDPTitle` | Label | `"Data Preview"`, Font: 16 |
| `lblValDPSub` | Label | `"Inline editing enabled - Click cells to modify values"` |
| `galValDataGrid` | Gallery (Vertical) | TemplateHeight: 40 |

**Column header controls (inside card, above gallery):**
| Control | Width | Text |
|---|---|---|
| `recValColStatus` | 4px | (color strip column) |
| `lblValColRow` | 60 | `"Row"` |
| `lblValColPass` | 60 | `"Pass"` |
| `lblValColSpecies` | 80 | `"Species"` |
| `lblValColLength` | 100 | `"Length (" & locUnit & ")"` |
| `lblValColWeight` | 100 | `"Weight (g)"` |
| `lblValColStatusH` | 80 | `"Status"` |

**galValDataGrid.Items:** `colFishRecords`

**Gallery template:**
| Control | Type | Content |
|---|---|---|
| `recValRowStrip` | Rectangle | Width: 4, Fill: `Switch(ThisItem.cpw_Status, "error", clrDestructive, "warning", clrWarning, Transparent)` |
| `lblValRow` | Label | `ThisItem.cpw_Row`, Font: Mono, 13 |
| `lblValPass` | Label | `ThisItem.cpw_Pass`, Font: 13, centered |
| `lblValSpecies` | Label | `ThisItem.cpw_SpeciesCode`, Font: Mono, 13 |
| `lblValLength` | Label | `If(locUnit = "mm", ThisItem.cpw_LengthMm, Text(ThisItem.cpw_LengthMm / 25.4, "#.0"))`, Font: 13 |
| `lblValWeight` | Label | `ThisItem.cpw_WeightG`, Font: 13 |
| `lblValRowStatus` | Label | Status text + icon. `Switch(ThisItem.cpw_Status, "valid", "Valid", "warning", "Warning", "error", "Error")` |
| `icoValRowStatus` | Icon | CheckCircle/AlertCircle, color per status |

**Row background color:**
```
// recValRowBg.Fill (gallery template background)
Switch(ThisItem.cpw_Status,
    "error", RGBA(220,38,38,0.02),
    "warning", RGBA(217,119,6,0.02),
    Transparent
)
```

**Population Estimation Note (below gallery):**
| Control | Type | Properties |
|---|---|---|
| `recValMethodNote` | Container | Bordered info box |
| `icoValMethodInfo` | Icon (Info) | |
| `lblValMethodTitle` | Label | `"Population Estimation Method: " & locSurvey.cpw_Protocol & " with Zippin's depletion formula"`, bold |
| `lblValMethodBody` | Label | `"Young of year (<150mm) can be excluded from population analysis..."` |

#### Right 1/3: Validation Issues Panel

| Control | Type | Properties |
|---|---|---|
| `crdValIssuesPanel` | Container (Card) | 1/3 width, sticky position (top: 24) |
| `lblValIssuesTitle` | Label | `"Validation Issues"`, Font: 16 |
| `lblValIssuesSummary` | Label | `CountRows(Filter(colValIssues, cpw_Severity="Error")) & " errors, " & CountRows(Filter(colValIssues, cpw_Severity="Warning")) & " warnings"` |

**galValIssues Gallery:**
| Control | Type | Properties |
|---|---|---|
| `galValIssues` | Gallery (Vertical) | Items: `colValIssues`, TemplateHeight: variable (AutoHeight) |

**Gallery template:**
| Control | Type | Content |
|---|---|---|
| `recValIssueCard` | Container | Border + bg based on severity |
| `icoValIssueIcon` | Icon (AlertCircle) | Color: `If(ThisItem.cpw_Severity = "Error", clrDestructive, clrWarning)` |
| `lblValIssueRow` | Label | `If(!IsBlank(ThisItem.cpw_Row), "Row " & ThisItem.cpw_Row, ThisItem.cpw_Field)`, Font: 13, bold |
| `lblValIssueMessage` | Label | `ThisItem.cpw_Message`, Font: 11, Color: clrTextMuted |
| `lblValIssueSuggestion` | Label | Visible: `!IsBlank(ThisItem.cpw_Suggestion)`, `"Suggestion: " & ThisItem.cpw_Suggestion`, Font: 11, italic |
| `btnValJumpToRow` | Button | Text: `"Jump to Row"`, Variant: Outline, Visible: `!IsBlank(ThisItem.cpw_Row)`, OnSelect: (scroll gallery to row - if feasible, or highlight) |

**No Issues state (visible when 0 errors and 0 warnings):**
| Control | Type | Content |
|---|---|---|
| `recValNoIssues` | Container | Green border/bg |
| `icoValNoIssuesCheck` | Icon (CheckCircle) | clrSuccess |
| `lblValNoIssuesTitle` | Label | `"No issues detected"` |
| `lblValNoIssuesSub` | Label | `"All records passed validation rules. This survey is ready for approval."` |

**CPW Species Reference (below issues):**
| Control | Type | Properties |
|---|---|---|
| `lblValSpecRefTitle` | Label | `"CPW Species Reference"`, uppercase, Font: 12 |
| `galValSpecRef` | Gallery (Vertical) | Items: `FirstN(colSpecies, 5)`, TemplateHeight: 24 |

**Gallery template:**
| Control | Type | Content |
|---|---|---|
| `lblSpecRefCode` | Label | `ThisItem.cpw_Code`, Font: Mono |
| `lblSpecRefName` | Label | `ThisItem.cpw_CommonName`, Font: 11, right-aligned |

### Data Sources
| Source | Used For |
|---|---|
| `cpw_Survey` | Survey record (status, metadata) |
| `cpw_Water` | Water context |
| `cpw_FishRecord` | Data grid rows |
| `cpw_ValidationIssue` | Issues panel |
| `cpw_Species` | Reference panel |
| `cpw_StatusHistory` | Audit trail (Patch on action) |

### Variables Used/Modified
| Variable | Action |
|---|---|
| `locSelectedSurveyId` | Read |
| `locUnit` | Set (toggle), Read (length display) |
| `locActionMessage` | Set (on button actions) |
| `gblCurrentRole` | Read (button visibility) |

### Navigation Targets
| From | Target | Parameters |
|---|---|---|
| Breadcrumb "Waters" | `scrDashboard` | none |
| Breadcrumb water name | `scrWaterProfile` | `{locSelectedWaterId: locValWater.cpw_WaterId}` |

---

## 9. Screen 6: scrActivityFeed

### Screen Name: `scrActivityFeed`
### Purpose: Full survey activity list with filters, grouped by water body, collapsible sections.

### Screen.OnVisible
```
UpdateContext({
    locWaterFilter: "all",
    locStatusFilter: "all",
    locDateFrom: Blank()
});

ClearCollect(colNEWaters, Filter(cpw_Water, cpw_Region = "Northeast"));

ClearCollect(colAFAllSurveys,
    SortByColumns(
        AddColumns(
            Filter(cpw_Survey, cpw_WaterId in colNEWaters.cpw_WaterId),
            "WaterName", LookUp(colNEWaters, cpw_WaterId = cpw_Survey[@cpw_WaterId]).cpw_Name
        ),
        "cpw_Date", SortOrder.Descending
    )
);

ClearCollect(colAFCollapsed, ForAll(colNEWaters, {WaterId: cpw_WaterId, IsCollapsed: false}));
```

### Header
| Control | Type | Properties |
|---|---|---|
| `lblAFTitle` | Label | `"All Survey Activity -- Northeast Region"`, Font: 22, Color: clrPrimary |
| `lblAFSubtitle` | Label | Dynamic count: `CountRows(colAFFiltered) & " surveys matching current filters"` |
| `cmpRoleIndicator_AF` | Component | |

### Regional Scope Strip
`cmpRegionalScopeStrip_AF` -- always visible (this screen is NE-scoped)

### Filters Card

| Control | Type | Properties |
|---|---|---|
| `crdAFFilters` | Container (Card) | Full width |
| `lblAFFiltersTitle` | Label | `"Filters"`, Font: 16 |

**Filter controls (3-column grid):**
| Control | Type | Properties |
|---|---|---|
| `lblAFFilterWater` | Label | `"Water"`, Font: 13 |
| `drpAFWater` | Dropdown | Items: `Ungroup(Table({Value:"All Waters",Key:"all"}, ForAll(colNEWaters, {Value:cpw_Name, Key:cpw_WaterId})), "Value")`, Default: `"All Waters"`, OnChange: `UpdateContext({locWaterFilter: Self.Selected.Key})` |
| `lblAFFilterStatus` | Label | `"Status"`, Font: 13 |
| `drpAFStatus` | Dropdown | Items: `["All Statuses","Pending / In Review","Approved / Published","Flagged Suspect","Draft"]`, OnChange: `UpdateContext({locStatusFilter: ...})` |
| `lblAFFilterDate` | Label | `"Date From"`, Font: 13 |
| `dtpAFDateFrom` | DatePicker | OnChange: `UpdateContext({locDateFrom: Self.SelectedDate})` |

**Derived filtered collection:**
```
// Set in each filter OnChange, or use named formula
ClearCollect(colAFFiltered,
    Filter(colAFAllSurveys,
        (locWaterFilter = "all" || cpw_WaterId = locWaterFilter) &&
        (locStatusFilter = "all" ||
            (locStatusFilter = "pending" && cpw_Status in ["Pending Validation","Pending Approval","Returned for Correction"]) ||
            (locStatusFilter = "approved" && cpw_Status in ["Approved","Published"]) ||
            (locStatusFilter = "flagged" && cpw_Status = "Flagged Suspect") ||
            (locStatusFilter = "draft" && cpw_Status = "Draft")
        ) &&
        (IsBlank(locDateFrom) || cpw_Date >= locDateFrom)
    )
);
```

### Water-Grouped Activity

**Approach:** Use a gallery of galleries pattern. Outer gallery iterates distinct waters. Inner gallery shows surveys for each water.

| Control | Type | Properties |
|---|---|---|
| `galAFWaterGroups` | Gallery (Vertical) | Items: `GroupBy(colAFFiltered, "cpw_WaterId", "WaterName", "Surveys")`, TemplateHeight: variable, AutoHeight: true |

**Outer gallery template:**

| Control | Type | Content |
|---|---|---|
| `recAFGroupCard` | Container | Border, rounded, full width |
| `recAFGroupHeader` | Container | Clickable header row, border-bottom |
| `icoAFChevron` | Icon | ChevronDown (expanded) / ChevronRight (collapsed) |
| `lblAFGroupName` | Label | `ThisItem.WaterName`, Font: 16, Color: clrPrimary, OnSelect: navigates to water profile |
| `lblAFGroupCount` | Label | `CountRows(ThisItem.Surveys) & " surveys"`, Font: 12 |
| `lblAFGroupPending` | Label | Pending count badge. Visible if > 0 |
| `galAFSurveyRows` | Gallery (Vertical) | Visible when expanded. Items: `ThisItem.Surveys` |

**Toggle collapsed:**
```
// recAFGroupHeader.OnSelect
Patch(colAFCollapsed,
    LookUp(colAFCollapsed, WaterId = ThisItem.cpw_WaterId),
    {IsCollapsed: !LookUp(colAFCollapsed, WaterId = ThisItem.cpw_WaterId).IsCollapsed}
)
```

**Inner gallery template (galAFSurveyRows):**
| Control | Type | Content |
|---|---|---|
| `recAFSurveyRow` | Container | Bordered row, hover bg |
| `lblAFSRId` | Label | `ThisItem.cpw_SurveyId`, Font: Mono, Color: clrPrimary |
| `lblAFSRStation` | Label | `"Station " & ThisItem.cpw_StationId`, Font: 11 |
| `lblAFSRProtocol` | Label | `ThisItem.cpw_Protocol`, Font: 12 |
| `lblAFSRDate` | Label | `Text(ThisItem.cpw_Date, "yyyy-mm-dd")`, Font: 12 |
| `lblAFSRStatus` | Label | Status badge |
| `btnAFSRAction` | Button | Text: `Switch(ThisItem.cpw_Status, "Returned for Correction", "Continue", "Approved", "View", "Published", "View", "Review")`, Variant: Outline, OnSelect: `Navigate(scrValidation, ScreenTransition.None, {locSelectedSurveyId: ThisItem.cpw_SurveyId})` |

**Empty state (no matching surveys):**
| Control | Type | Properties |
|---|---|---|
| `lblAFEmpty` | Label | Visible: `CountRows(colAFFiltered) = 0`, Text: `"No surveys match the current filters."`, centered |

### Data Sources
| Source | Used For |
|---|---|
| `cpw_Water` | NE water list for filter |
| `cpw_Survey` | All NE surveys |

### Variables Used/Modified
| Variable | Action |
|---|---|
| `locWaterFilter` | Set/Read |
| `locStatusFilter` | Set/Read |
| `locDateFrom` | Set/Read |

### Navigation Targets
| From | Target | Parameters |
|---|---|---|
| `lblAFGroupName` | `scrWaterProfile` | `{locSelectedWaterId: ThisItem.cpw_WaterId}` |
| `btnAFSRAction` | `scrValidation` | `{locSelectedSurveyId: ThisItem.cpw_SurveyId}` |

---

## 10. Screen 7: scrQueryBuilder

### Screen Name: `scrQueryBuilder`
### Purpose: Visual query builder with left filter panel, center condition builder, right live results preview.

### Screen.OnVisible
```
UpdateContext({
    locUnit: "mm",
    locExcludeYOY: true,
    locAdvancedMode: false
});

ClearCollect(colQBConditions,
    {Id: "1", Field: "species", Operator: "equals", Value: "Brown Trout"},
    {Id: "2", Field: "region", Operator: "equals", Value: "Northeast"},
    {Id: "3", Field: "year", Operator: "greater-equal", Value: "2018"}
);
```

### Header
| Control | Type | Properties |
|---|---|---|
| `lblQBTitle` | Label | `"Cross-Survey Analysis"`, Font: 22, Color: clrPrimary |
| `lblQBSubtitle` | Label | `"Analyze multi-year population trends across waters and species"` |
| `cmpRoleIndicator_QB` | Component | |

**Mode Toggle (Senior Biologist only):**
| Control | Type | Properties |
|---|---|---|
| `conQBModeToggle` | Container | Visible: `gblCurrentRole = "Senior Biologist"`, bordered |
| `lblQBModeLabel` | Label | `"Mode:"` |
| `btnQBStandard` | Button | `"Standard"`, highlighted when `!locAdvancedMode` |
| `btnQBAdvanced` | Button | `"Advanced"`, highlighted when `locAdvancedMode` |

### Scope Strips
| Control | Visible | Content |
|---|---|---|
| `cmpRegionalScopeStrip_QB` | `gblCurrentRole = "Area Biologist"` | Regional scope |
| `recQBAdvancedBanner` | `gblCurrentRole = "Senior Biologist" && locAdvancedMode` | `"Advanced Analysis Mode Active -- Multi-water selection, protocol comparison, and year-over-year aggregation enabled"` |

### Main Layout: 4-column grid (1 + 2 + 1)

#### Column 1 (1/4): Query Filters

| Control | Type | Properties |
|---|---|---|
| `crdQBFilters` | Container (Card) | Sticky position |
| `lblQBFilterTitle` | Label | `"Query Filters"`, Font: 16 |

**Filter controls (stacked vertically):**
| Control | Type | Label | Items |
|---|---|---|---|
| `drpQBWater` | Dropdown | `"Water"` / `"Waters in Northeast Region"` (Area Bio) | Water list based on role scope |
| `drpQBSpecies` | Dropdown | `"Species"` | `AddColumns(colSpecies, "Display", cpw_CommonName & " (" & cpw_Code & ")")` |
| `drpQBRegion` | Dropdown | `"Region"` | `["Northeast Colorado","Southeast Colorado","Northwest Colorado","Southwest Colorado","All Regions"]` |
| `dtpQBDateStart` | DatePicker | `"Date Range"` (start) | Default: 2018-01-01 |
| `dtpQBDateEnd` | DatePicker | (end) | Default: 2025-12-31 |
| `drpQBProtocol` | Dropdown | `"Protocol Type"` | `["Two-Pass Removal","Single-Pass CPUE","Mark-Recapture","Electrofishing CPUE","All Protocols"]` |
| `tglQBExcludeYOY` | Toggle | `"Exclude Young of Year"` | Default: On |
| `conQBUnitButtons` | Container | `"Measurement Units"` | Two buttons: Millimeters / Inches |

#### Column 2-3 (2/4): Visual Query Builder

| Control | Type | Properties |
|---|---|---|
| `crdQBBuilder` | Container (Card) | 2/4 width |
| `lblQBBuilderTitle` | Label | `"Visual Query Builder"`, Font: 16 |
| `btnQBAddCondition` | Button | `"Add Condition"`, Icon: Plus, Variant: Outline |

**Active Query Summary:**
| Control | Type | Properties |
|---|---|---|
| `recQBActiveQuery` | Container | Fill: clrPrimary/5, Border: clrPrimary/30 |
| `lblQBActiveQueryLabel` | Label | `"Active Query"`, uppercase |
| `galQBQueryChips` | Gallery (Horizontal, wrap) | Items: `colQBConditions` |

**Chip template:**
| Control | Type | Content |
|---|---|---|
| `lblQBChipAnd` | Label | `"AND"`, Visible: index > 0 |
| `recQBChip` | Container | White bg, bordered |
| `lblQBChipField` | Label | `ThisItem.Field`, Mono, Color: clrPrimary |
| `lblQBChipOp` | Label | `"="` |
| `lblQBChipValue` | Label | `ThisItem.Value`, bold |

**Condition Builder (galQBConditions):**
| Control | Type | Properties |
|---|---|---|
| `galQBConditions` | Gallery (Vertical) | Items: `colQBConditions`, TemplateHeight: 100 |

**Gallery template:**
| Control | Type | Content |
|---|---|---|
| `recQBCondAndDivider` | Container | Visible: index > 0. Horizontal line with "AND" badge centered |
| `recQBCondCard` | Container | Bordered, bg muted |
| `drpQBCondField` | Dropdown | `"Field"`: Species, Length, Weight, Date, Water Body, Region, Year |
| `drpQBCondOp` | Dropdown | `"Operator"`: Equals, Not Equals, Greater Than, Greater or Equal, Less Than, Contains |
| `txtQBCondValue` | TextInput | `"Value"`: `ThisItem.Value` |
| `btnQBCondRemove` | Button | Icon: X, Visible: `CountRows(colQBConditions) > 1`, Color: clrDestructive |

**btnQBAddCondition.OnSelect:**
```
Collect(colQBConditions,
    {Id: Text(Now()), Field: "species", Operator: "equals", Value: ""}
)
```

**btnQBCondRemove.OnSelect:**
```
Remove(colQBConditions, ThisItem)
```

**Action Buttons (below builder card):**
| Control | Type | Properties |
|---|---|---|
| `btnQBClearAll` | Button | `"Clear All Conditions"`, Variant: Outline, OnSelect: clear collection |
| `btnQBRunAnalysis` | Button | `"Run Analysis"`, Icon: Play, Fill: clrPrimary, OnSelect: `Navigate(scrInsights, ScreenTransition.None)` |

#### Column 4 (1/4): Live Results Preview

| Control | Type | Properties |
|---|---|---|
| `crdQBResults` | Container (Card) | Sticky position |
| `lblQBResultsTitle` | Label | `"Live Results"`, Font: 16 |
| `lblQBResultsSub` | Label | `"Query match preview"` |

**Hero metric:**
| Control | Type | Properties |
|---|---|---|
| `recQBResultsHero` | Container | clrPrimary/5 bg, centered |
| `lblQBResultsCount` | Label | Dynamic survey count, Font: 48, Color: clrPrimary |
| `lblQBResultsLabel` | Label | `"Matching Surveys"`, uppercase |

**Summary rows:**
| Row | Label | Value |
|---|---|---|
| Fish Records | `"Fish Records"` | Computed sum |
| Water Bodies | `"Water Bodies"` | Distinct water count |
| Date Range | `"Date Range"` | `"2021-2025"` |
| Regions | `"Regions"` | `"1"` |

**Species Distribution:**
| Control | Type | Properties |
|---|---|---|
| `lblQBSpecDistTitle` | Label | `"Species Distribution"`, uppercase |
| `galQBSpecDist` | Gallery (Vertical) | 4 species with horizontal progress bars |

**Gallery template:**
| Control | Type | Content |
|---|---|---|
| `lblQBSpecName` | Label | Species name |
| `lblQBSpecCount` | Label | Count, Mono |
| `recQBSpecBarBg` | Rectangle | Height: 6, Fill: clrBorder |
| `recQBSpecBarFill` | Rectangle | Width proportional, Fill: color-coded (clrPrimary, clrSecondary, clrAccent, clrTextMuted) |

### Data Sources
| Source | Used For |
|---|---|
| `cpw_Water` | Water dropdown |
| `cpw_Species` | Species dropdown |
| `cpw_Survey` | Live results computation |
| `cpw_FishRecord` | Fish count aggregation |

### Variables Used/Modified
| Variable | Action |
|---|---|
| `locUnit` | Set (button toggle) |
| `locExcludeYOY` | Set (toggle) |
| `locAdvancedMode` | Set (mode buttons, Senior only) |
| `colQBConditions` | Collection (add/remove conditions) |

### Role-Based Visibility
| Element | Data Entry | Area Biologist | Senior Biologist |
|---|---|---|---|
| Screen access | Hidden in nav | Visible | Visible |
| Mode toggle | -- | -- | Visible |
| Advanced banner | -- | -- | Visible when active |
| Water dropdown scope | -- | NE only | All waters |

### Navigation Targets
| From | Target | Parameters |
|---|---|---|
| `btnQBRunAnalysis` | `scrInsights` | (pass query params if needed) |

---

## 11. Screen 8: scrInsights

### Screen Name: `scrInsights`
### Purpose: Multi-year ecological trend analysis. Summary metrics, trend chart, length-frequency histogram, statistical summary.

### Screen.OnVisible
```
// locSelectedWaterId passed via Navigate context, or default
UpdateContext({
    locSelectedWaterId: If(
        !IsBlank(locSelectedWaterId),
        locSelectedWaterId,
        "south-platte"
    ),
    locMetricSelector: "population",
    locCompareMode: false
});

Set(locInsWater, LookUp(cpw_Water, cpw_WaterId = locSelectedWaterId));

ClearCollect(colInsTrend,
    SortByColumns(
        Filter(cpw_TrendData, cpw_WaterId = locSelectedWaterId),
        "cpw_Year", SortOrder.Ascending
    )
);

ClearCollect(colInsSurveys,
    Filter(cpw_Survey, cpw_WaterId = locSelectedWaterId)
);
```

### Header
| Control | Type | Properties |
|---|---|---|
| `lblInsTitle` | Label | `"Insights"`, Font: 18, Color: clrPrimary |
| `lblInsSubtitle` | Label | `"Multi-year ecological trend analysis based on validated survey data"` |
| `cmpRoleIndicator_Ins` | Component | |

**Senior Biologist Toolbar:**
| Control | Type | Visible |
|---|---|---|
| `btnInsExportExcel` | Button | `gblCurrentRole = "Senior Biologist"` |
| `btnInsOpenTableau` | Button | `gblCurrentRole = "Senior Biologist"` |
| `btnInsSaveAnalysis` | Button | always |

### WaterBanner + Scope Strip
| Control | Type | Properties |
|---|---|---|
| `cmpWaterBanner_Ins` | cmpWaterBanner | Bound to `locInsWater` |
| `cmpRegionalScopeStrip_Ins` | cmpRegionalScopeStrip | Visible: `gblCurrentRole = "Area Biologist"` |

### Context Banner
| Control | Type | Properties |
|---|---|---|
| `recInsContextBanner` | Container | Bordered, muted bg |
| `lblInsContextText` | Label | `"Based on " & CountRows(colInsSurveys) & " surveys conducted between " & First(colInsTrend).cpw_Year & "--" & Last(colInsTrend).cpw_Year & " using validated protocols."` |

### Row 1: Summary Metric Cards (4 columns)

| Card Control | Metric Label | Value | Sub-detail |
|---|---|---|---|
| `crdInsPopulation` | `"Population Estimate"` | `Last(colInsTrend).cpw_PopEstimate` | `"+X% from [prevYear]"` + `"95% CI: lower - upper"` |
| `crdInsCPUE` | `"CPUE Index"` | `Last(colInsTrend).cpw_CPUE` | `"+X% from [prevYear]"` + `"Fish per hour effort"` |
| `crdInsBiomass` | `"Biomass"` | `Last(colInsTrend).cpw_BiomassKg` | `"+X% from [prevYear]"` + `"kg total standing"` |
| `crdInsRelativeWt` | `"Relative Weight Avg"` | `"98.4"` | `"Condition index"` + `"Wr index baseline 100"` |

### Row 2: Main Trend Chart (full width)

| Control | Type | Properties |
|---|---|---|
| `crdInsTrendChart` | Container (Card) | Full width |
| `lblInsTrendTitle` | Label | `"Multi-Year Population Trend"`, Font: 18 |
| `lblInsTrendSub` | Label | Dynamic: changes based on compare mode |

**Compare Mode Toggle (Senior Biologist only):**
| Control | Type | Properties |
|---|---|---|
| `conInsCompareToggle` | Container | Visible: `gblCurrentRole = "Senior Biologist"` |
| `btnInsSingleWater` | Button | `"Single Water"`, highlighted when `!locCompareMode` |
| `btnInsCompareWaters` | Button | `"Compare Waters"`, highlighted when `locCompareMode` |

**Metric Selector:**
| Control | Type | Properties |
|---|---|---|
| `drpInsMetric` | Dropdown | Items: `["Population Estimate","CPUE","Biomass (kg)"]`, Default: `"Population Estimate"`, Width: 200 |

**Chart Control (Single Water Mode):**
| Control | Type | Properties |
|---|---|---|
| `chtInsTrendLine` | LineChart | Visible: `!locCompareMode`, Items: `colInsTrend`, Series: dynamic based on `locMetricSelector`, Labels: cpw_Year, Height: 400, Color: dynamic |

**Chart Control (Compare Waters Mode):**
| Control | Type | Properties |
|---|---|---|
| `chtInsCompareLine` | LineChart | Visible: `locCompareMode && gblCurrentRole = "Senior Biologist"`, Items: compare data collection (3 lines), Height: 400 |

To build compare data:
```
// On locCompareMode toggle
ClearCollect(colInsCompare,
    AddColumns(
        Filter(cpw_TrendData, cpw_WaterId = "south-platte"),
        "SouthPlatte", cpw_PopEstimate
    )
);
// ... join blue-river and colorado-river data by year
```

**Compare Legend:**
- South Platte Basin: clrPrimary (#1B365D)
- Colorado River: clrSecondary (#2F6F73)
- Blue River: clrAccent (#5B7C99)

**Statewide Delta Analysis (Senior Compare Mode):**
| Control | Type | Properties |
|---|---|---|
| `recInsDelta` | Container | Visible: `locCompareMode && gblCurrentRole = "Senior Biologist"`, clrPrimary/5 bg |
| 3 stat boxes | Container | Each: water name, delta %, baseline year |

**Method/Quality Note (below chart):**
| Control | Type | Properties |
|---|---|---|
| `recInsMethodNote` | Container | Info box with icon |
| `lblInsMethodTitle` | Label | `"Statistical Method:"` + Zippin's description |
| `lblInsDataQuality` | Label | `"Data Quality:"` + validation note |

### Row 3: Length-Frequency Histogram (2/3) + Statistical Summary (1/3)

##### Left: Length-Frequency Histogram
| Control | Type | Properties |
|---|---|---|
| `crdInsLengthFreq` | Container (Card) | 2/3 width |
| `lblInsLFTitle` | Label | `"Length-Frequency Distribution"`, Font: 18 |
| `chtInsLFBar` | BarChart | Items: length frequency data, Series: Count, Labels: length class, Height: 340, Color: clrPrimary |

**Interpretation Note:**
| Control | Type | Content |
|---|---|---|
| `lblInsLFInterpretation` | Label | `"Distribution shows normal curve with peak at 200-250mm length class..."` |

##### Right: Statistical Summary
| Control | Type | Properties |
|---|---|---|
| `crdInsStatSummary` | Container (Card) | 1/3 width |
| `lblInsStatTitle` | Label | `"Statistical Summary"`, Font: 16 |

**Summary rows (galInsStatRows):**
| Metric | Value |
|---|---|
| Mean Length | `"234 mm"` |
| Std Deviation | `"45.3 mm"` |
| Min Length | `"67 mm"` |
| Max Length | `"487 mm"` |
| Sample Size | `"4,695"` |

**Confidence Interval Section:**
| Control | Type | Properties |
|---|---|---|
| `lblInsCI95Title` | Label | `"Confidence Interval (95%)"`, uppercase |
| `recInsCIBox` | Container | clrPrimary/5 bg, clrPrimary/20 border |
| `lblInsCILower` | Label | `"Lower Bound: " & [computed]` |
| `lblInsCIUpper` | Label | `"Upper Bound: " & [computed]` |
| `lblInsCIMargin` | Label | `"Margin of Error: +/-5.7%"` |

### Data Sources
| Source | Used For |
|---|---|
| `cpw_Water` | Water context |
| `cpw_TrendData` | All trend charts |
| `cpw_Survey` | Survey count for context |
| `cpw_FishRecord` | Length-frequency, statistical summary |
| `cpw_Species` | Species labels |

### Variables Used/Modified
| Variable | Action |
|---|---|
| `locSelectedWaterId` | Read |
| `locMetricSelector` | Set (dropdown), Read (chart series) |
| `locCompareMode` | Set (toggle), Read (chart visibility) |
| `gblCurrentRole` | Read (button visibility, compare toggle visibility) |

### Role-Based Visibility
| Element | Data Entry | Area Biologist | Senior Biologist |
|---|---|---|---|
| Screen access | Hidden in nav | Visible | Visible |
| Export/Tableau buttons | Hidden | Hidden | Visible |
| Compare Waters toggle | Hidden | Hidden | Visible |
| Compare chart | Hidden | Hidden | Visible |
| Delta analysis panel | Hidden | Hidden | Visible |

### Navigation Targets
None outbound. This is a destination screen.

---

## 12. Status Badge Reference

Use this consistent badge rendering across all screens. Implemented as a reusable label pattern.

### Status-to-Style Mapping

| Status Value | Background | Text Color | Category |
|---|---|---|---|
| `"Approved"` | `RGBA(22,163,74,0.1)` | `clrSuccess` | Terminal |
| `"Published"` | `RGBA(22,163,74,0.1)` | `clrSuccess` | Terminal |
| `"Flagged Suspect"` | `RGBA(220,38,38,0.1)` | `clrDestructive` | Alert |
| `"Returned for Correction"` | `RGBA(220,38,38,0.1)` | `clrDestructive` | Alert |
| `"Pending Validation"` | `RGBA(217,119,6,0.1)` | `clrWarning` | In Progress |
| `"Pending Approval"` | `RGBA(217,119,6,0.1)` | `clrWarning` | In Progress |
| `"Draft"` | `RGBA(100,116,139,0.1)` | `clrTextMuted` | Initial |

### Badge Label Formula
```
// Fill
Switch(ThisItem.cpw_Status,
    "Approved", RGBA(22,163,74,0.1),
    "Published", RGBA(22,163,74,0.1),
    "Flagged Suspect", RGBA(220,38,38,0.1),
    "Returned for Correction", RGBA(220,38,38,0.1),
    "Pending Validation", RGBA(217,119,6,0.1),
    "Pending Approval", RGBA(217,119,6,0.1),
    RGBA(100,116,139,0.1)
)

// Color
Switch(ThisItem.cpw_Status,
    "Approved", ColorValue("#16A34A"),
    "Published", ColorValue("#16A34A"),
    "Flagged Suspect", ColorValue("#DC2626"),
    "Returned for Correction", ColorValue("#DC2626"),
    "Pending Validation", ColorValue("#D97706"),
    "Pending Approval", ColorValue("#D97706"),
    ColorValue("#64748B")
)
```

### Badge Dimensions
- Height: 22
- PaddingLeft / PaddingRight: 8
- PaddingTop / PaddingBottom: 2
- Font: 11
- FontWeight: Semibold
- BorderRadius: 4

---

## 13. Navigation Map

### Screen-to-Screen Navigation

```
scrDashboard
  |-- btnUploadSurvey              --> scrSurveyUpload
  |-- btnDEGalUpload               --> scrSurveyUpload
  |-- lblRQWater (link)            --> scrWaterProfile  {locSelectedWaterId}
  |-- btnRQAction                  --> scrValidation    {locSelectedSurveyId}
  |-- btnABRQViewAll               --> scrActivityFeed
  |-- btnABSpeciesViewAnalysis     --> scrQueryBuilder
  |-- btnSBCWAdvancedQuery         --> scrQueryBuilder
  |-- btnSBAttentionIntel          --> scrInsights
  |-- lblWTWater (link)            --> scrWaterProfile  {locSelectedWaterId}

scrWaterSelect
  |-- galWSWaters.OnSelect         --> scrWaterProfile  {locSelectedWaterId}

scrWaterProfile
  |-- galWPBioRecent.OnSelect      --> scrValidation    {locSelectedSurveyId}
  |-- btnWPBioViewAnalytics        --> scrInsights      {locSelectedWaterId}
  |-- Breadcrumb "Waters"          --> scrWaterSelect

scrSurveyUpload
  |-- btnSUReviewErrors            --> scrValidation    {locSelectedSurveyId}

scrValidation
  |-- Breadcrumb "Waters"          --> scrDashboard
  |-- Breadcrumb [water name]      --> scrWaterProfile  {locSelectedWaterId}

scrActivityFeed
  |-- lblAFGroupName               --> scrWaterProfile  {locSelectedWaterId}
  |-- btnAFSRAction                --> scrValidation    {locSelectedSurveyId}

scrQueryBuilder
  |-- btnQBRunAnalysis             --> scrInsights

scrInsights
  |-- (no outbound navigation)
```

### Sidebar Navigation (all screens)

| Nav Item | Target Screen | Visible to Roles |
|---|---|---|
| Dashboard / My Waters | `scrDashboard` | All |
| Water Profile | `scrWaterSelect` | All |
| Upload Survey | `scrSurveyUpload` | All |
| Validation / Validation Queue | `scrValidation` | All |
| Query Builder | `scrQueryBuilder` | Area Biologist, Senior Biologist |
| Insights | `scrInsights` | Area Biologist, Senior Biologist |

---

## Appendix: Control Naming Convention Reference

| Prefix | Control Type | Example |
|---|---|---|
| `scr` | Screen | `scrDashboard` |
| `gal` | Gallery | `galABReviewQueue` |
| `btn` | Button | `btnValApprove` |
| `lbl` | Label | `lblABTitle` |
| `drp` | Dropdown | `drpSBRegionFilter` |
| `frm` | Form | `frmUpload` |
| `ico` | Icon | `icoABSpeciesWarn` |
| `crd` | Card container | `crdABStatWaters` |
| `tgl` | Toggle | `tglUnit` |
| `cht` | Chart | `chtSBRegionalBar` |
| `rec` | Rectangle/Container | `recValRowStrip` |
| `con` | Container (layout) | `conDashboardDataEntry` |
| `cmp` | Component instance | `cmpRoleIndicator_AB` |
| `txt` | TextInput | `txtQBCondValue` |
| `dtp` | DatePicker | `dtpAFDateFrom` |
| `img` | Image | `imgABStationViz` |
| `col` | Collection (variable) | `colNEWaters` |
| `loc` | Context variable | `locSelectedWaterId` |
| `gbl` | Global variable | `gblCurrentRole` |
| `clr` | Color token | `clrPrimary` |
| `fnt` | Font token | `fntPageTitle` |
