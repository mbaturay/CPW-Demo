# ADAMAS React Repository Inventory

This document is a comprehensive inventory of every page, component, context provider, data type, helper function, and data flow in the ADAMAS React demo (`CPW-Demo2`). It serves as the authoritative source-of-truth for rebuilding the application as a Microsoft Power Apps Canvas App.

---

## Table of Contents

1. [Application Shell](#1-application-shell)
2. [Pages / Screens](#2-pages--screens)
3. [Reusable Components](#3-reusable-components)
4. [Context Providers (State Management)](#4-context-providers-state-management)
5. [Data Model (world.ts)](#5-data-model-worldts)
6. [Data Flow Architecture](#6-data-flow-architecture)
7. [Role-Based Behavior Matrix](#7-role-based-behavior-matrix)
8. [Session Storage Usage and Implications](#8-session-storage-usage-and-implications)
9. [Navigation Configuration](#9-navigation-configuration)
10. [UI Component Library](#10-ui-component-library)
11. [Known Issues and Required Fixes](#11-known-issues-and-required-fixes)

---

## 1. Application Shell

### Entry Point

| File | Path | Purpose |
|---|---|---|
| `main.tsx` | `src/main.tsx` | React DOM root mount. Renders `<App />`. |
| `App.tsx` | `src/app/App.tsx` | Wraps the entire application in `<RoleProvider>` then `<DemoProvider>`, then provides `<RouterProvider>` with the route configuration. |

### Provider Nesting Order

```
<RoleProvider>          -- stores current role in React state
  <DemoProvider>        -- stores survey status overrides in sessionStorage
    <RouterProvider>    -- react-router v7 browser router
      <Layout>          -- sidebar + main content area
        <Outlet />      -- renders the matched page component
      </Layout>
    </RouterProvider>
  </DemoProvider>
</RoleProvider>
```

### Layout

| File | Path | Purpose |
|---|---|---|
| `Layout.tsx` | `src/app/Layout.tsx` | Renders `<CollapsibleSidebar position="left" />` as a fixed left nav, with `<main className="ml-16">` as the content area. The sidebar is 64px wide (collapsed), so the main content has a permanent 64px left margin (`ml-16` = 4rem = 64px). |

### Route Configuration

| File | Path | Purpose |
|---|---|---|
| `routes.ts` | `src/app/routes.ts` | Defines all routes using `createBrowserRouter`. All routes are children of the Layout route. |

| Route Path | Component | Purpose |
|---|---|---|
| `/` (index) | `Dashboard` | Role-dispatching dashboard. Renders one of three sub-dashboards. |
| `/water` | `WaterSelect` | Water body selection list. |
| `/water/profile` | `WaterProfile` | Single water body detail page. Requires `?waterId=` query param. |
| `/upload` | `SurveyUpload` | File upload and metadata detection workflow. |
| `/validation` | `Validation` | Survey data grid with validation issues panel. Accepts `?surveyId=` query param. |
| `/query` | `QueryBuilder` | Visual query builder for cross-survey analysis. |
| `/insights` | `Insights` | Trend charts, length-frequency histograms, statistical summaries. Accepts `?waterId=` query param. |
| `/activity-feed` | `ActivityFeed` | All survey activity for Northeast Region with filters. |

---

## 2. Pages / Screens

### 2.1 Dashboard (`/`)

**File**: `src/app/pages/Dashboard.tsx`

**Purpose**: Role-dispatching hub. Does NOT render its own content for data-entry or senior-biologist roles -- it conditionally renders a sub-dashboard component instead.

**Role Dispatch Logic**:
```
if (role === 'data-entry')       --> render <DataEntryDashboard />
if (role === 'senior-biologist') --> render <SeniorBiologistDashboard />
else (area-biologist)            --> render Area Biologist dashboard (inline)
```

#### 2.1a Area Biologist Dashboard (default, inline in Dashboard.tsx)

**Key UI Elements**:
- **Header**: "Waters Overview" title, "Statewide Operational Status" subtitle, RoleIndicator dropdown.
- **Stats Grid** (4 cards in a row):
  - "Waters Active" -- count of Northeast region waters (derived from `waters.filter(w => w.region === 'Northeast')`).
  - "Pending Approval" -- count of surveys with status `Pending Validation` or `Pending Approval` (derived from `useDemo().surveys`).
  - "Flagged Surveys" -- count of surveys with status `Flagged Suspect`.
  - "Federal Reporting" -- hard-coded "87%" with deadline "March 31, 2026".
- **Review Queue** (table, spans 2 columns): Shows surveys from `buildActivityFeed('Northeast', surveys)`. Columns: Survey ID (mono font, links to validation), Water Body (links to water profile), Protocol, Date, Status (color-coded badge), Action button ("Review" or "Continue", links to `/validation?surveyId=...`).
- **Active Survey Stations** (card, 1 column): `StationViz` component showing all Northeast region stations. Below it: summary stats (Active Regions, Water Bodies, Survey Stations).
- **Waters in Northeast Region** (table): All NE waters with name (links to profile), active survey count, last survey date, status badge.
- **Species of Concern Activity** (alert card with destructive border):
  - Cutthroat Trout (CTT) with computed decline percentage from Poudre trend data.
  - Mountain Whitefish (MWF) -- "Monitoring" status.
  - Creek Chub (CRD) -- "Range shift" status.
  - "View Analysis" button links to `/query`.

**Data Sources**: `waters` (filtered to Northeast), `useDemo().surveys`, `buildActivityFeed()`, `getTrendForWater('cache-la-poudre')`.

**User Actions**: Navigate to water profile, navigate to validation for a specific survey, navigate to query builder, navigate to activity feed ("View All").

---

#### 2.1b Data Entry Dashboard

**File**: `src/app/pages/DataEntryDashboard.tsx`

**Key UI Elements**:
- **Header**: "Assigned Waters -- Data Entry View" title, RoleIndicator.
- **Role Scope Banner** (info box): Explains the data entry scope ("You can upload and edit surveys for waters assigned to your supervising biologist (J. Martinez, Area Biologist -- Northeast Region)").
- **Quick Stats** (4 cards):
  - "Quick Action" card with "Upload Survey Data" button linking to `/upload`.
  - "Assigned Waters" -- hard-coded "2" (South Platte Basin, Cache la Poudre).
  - "Pending Upload" -- hard-coded "2".
  - "Awaiting Review" -- hard-coded "1".
- **Assigned Waters Status** (table): 5 rows of hard-coded assignment data. Columns: Water Body, Station, Last Upload, Status (Complete/Needs Upload with icons), Surveys This Year, Action ("Upload" button links to `/upload`).
- **Your Recent Submissions** (table): 4 rows of hard-coded submission data. Columns: Survey ID (mono font), Water Body, Station, Upload Date, Review Status (Validated/Pending Review), Reviewer.

**Data Sources**: All data is **hard-coded inline** -- does NOT use `useDemo()` or `world.ts`. This is a significant difference from other pages.

**User Actions**: Navigate to upload page.

**Power Apps Note**: Replace hard-coded data with Dataverse queries filtered to the current user's assigned waters.

---

#### 2.1c Senior Biologist Dashboard

**File**: `src/app/pages/SeniorBiologistDashboard.tsx`

**Key UI Elements**:
- **Header**: "Statewide Water Intelligence Overview" title, RoleIndicator.
- **Regional Filter Bar**: Dropdown to select region scope (Statewide, Northeast, Southeast, Northwest, Southwest, Central). "Export Statewide Report" and "Open in Tableau" buttons.
- **Statewide Summary Cards** (4 cards): Total Waters Monitored (118), Waters Flagged for Review (7), Federal Reporting Readiness (82%), Data Quality Score (96%). All hard-coded.
- **Regional Performance Comparison** (bar chart): Recharts `BarChart` showing surveys by region. Data is hard-coded `regionalData` array with 5 regions.
- **Cross-Water Population Trends** (list): 5 water bodies with trend percentage, population count, status (Stable/Declining/Concern). "Advanced Query" button links to `/query`.
- **Federal Reporting Compliance** (progress bars): 4 reporting requirements with deadlines, progress bars, and status badges (On Track/Needs Attention/In Progress).
- **Waters Requiring Strategic Attention** (alert card): 3 waters with specific concerns. "View Intelligence" button links to `/insights`.

**Data Sources**: All data is **hard-coded inline**. The bar chart uses `recharts` `BarChart` with `ResponsiveContainer`.

**User Actions**: Change region filter (does not actually filter data in demo), navigate to query builder, navigate to insights.

---

### 2.2 WaterSelect (`/water`)

**File**: `src/app/pages/WaterSelect.tsx`

**Purpose**: Water body picker. Lists all Northeast Region waters as clickable rows.

**Key UI Elements**:
- **Header**: "Select Water Body" title, RoleIndicator.
- **Regional Scope Strip**: "Regional Scope Active -- Northeast Basin".
- **Water List** (card with divided rows): Each row shows:
  - Water icon (Waves from lucide-react).
  - Water name (bold, 14px).
  - Primary species names (resolved from species codes to common names).
  - Survey count (from `useDemo().surveys` filtered by waterId).
  - Station count with MapPin icon.
  - Years active range.
  - ChevronRight arrow.
  - Entire row is a `<Link>` to `/water/profile?waterId={water.id}`.

**Data Sources**: `waters` (filtered to Northeast), `useDemo().surveys`, `allSpecies`.

**User Actions**: Click a water to navigate to its profile page.

---

### 2.3 WaterProfile (`/water/profile`)

**File**: `src/app/pages/WaterProfile.tsx`

**Purpose**: Comprehensive single-water detail page. Content varies significantly by role.

**Query Parameter**: `?waterId=` (required). If missing, redirects to `/water`. If waterId is not found, shows "Water not found" message.

**Key UI Elements (shared across roles)**:
- **Header**: Breadcrumb (`Waters > {water.name}`), "Water Profile" title, RoleIndicator.
- **WaterBanner** component: Shows water name, region, watershed (HUC12), station count, total surveys, years active, and embedded StationViz.

**Data Entry Role View**:
- **Survey Activity Status** (2x2 card grid): Uploaded, Pending Validation, Returned for Correction, Awaiting Biologist Approval. Counts derived from `useDemo().surveys` filtered by waterId and status.
- **Recent Survey Activity** (card list): Last 4 surveys for this water. Each row shows survey ID, station, date, protocol, status badge. NOT clickable (no Link wrapper).

**Area Biologist / Senior Biologist View**:
- **Summary Cards** (4 cards): Current Population (from trend data, with up/down indicator), Primary Species (first species code), Last Survey (formatted date), Water Status ("Active Monitoring").
- **CPUE Trend Chart** (Recharts ComposedChart with Area + Line): Shows CPUE over years from `getTrendForWater(waterId)`. Gradient fill under line. Highlighted last data point. Spans 2 columns.
- **Species Composition** (horizontal bar chart): Shows primary species with proportional bars. 1 column.
- **Recent Survey Activity** (card list): Last 4 surveys. Each row is a `<Link>` to `/validation?surveyId={survey.id}`. "View All Analytics" button links to `/insights?waterId={waterId}`.
- **Stations in Basin**: Clickable station ID buttons for each station.
- **Management Notes** (warning-styled card): 3 bullet points derived from species data and trend direction.

**Regional Scope Strip**: Only shown for area-biologist role.

**Data Sources**: `getWaterById(waterId)`, `getTrendForWater(waterId)`, `useDemo().surveys`, `allSpecies`.

**User Actions**: Navigate to validation for a specific survey, navigate to insights, click station buttons (no-op in demo).

---

### 2.4 SurveyUpload (`/upload`)

**File**: `src/app/pages/SurveyUpload.tsx`

**Purpose**: Two-phase upload workflow. Phase 1: drag-and-drop file selection. Phase 2: metadata detection and validation summary.

**State**: Local `uploaded` boolean toggles between Phase 1 and Phase 2. `dragActive` boolean for drag hover styling.

**Phase 1 (pre-upload) Key UI Elements**:
- **Header**: "Upload Survey Data" title, RoleIndicator.
- **Regional Scope Strip**: For area-biologist role.
- **Step Indicator**: For data-entry role ("Step 1 of 3: Upload Survey Data -> Step 2: Validate -> Step 3: Submit for Biologist Review").
- **Upload Area** (left column):
  - Dashed border drag-drop zone with Upload icon, "Drag & Drop Survey File" heading, "Select File" button.
  - Supported formats: .xlsx, .csv, .xls (Max 50MB).
  - "Data Requirements" info box with 5 bullet points about CPW template format.
- **Info Panel** (right column):
  - "Supported Protocol Types" card: Three protocols listed (Two-Pass Removal, Three-Pass Removal, Single Pass Electrofish).
  - "Download Templates" card: Two template download buttons (CPW_River_Survey_2026.xlsx, CPW_Lake_Survey_2026.xlsx).

**Phase 2 (post-upload) Key UI Elements**:
- **File Detected & Analyzed** (left column):
  - File info: "Colorado_River_Survey_Feb2026.xlsx", 284 KB.
  - Auto-Detected Metadata: Water (South Platte Basin), Station (SP-04), Region (Northeast), Template Type (River Survey), Protocol (Two-Pass Removal), Water Code (COCOL03), Water Body (Colorado River - Reach 3), Survey Date (February 10, 2026). All hard-coded.
  - Data Summary: 247 Fish Records, 4 Species Detected.
- **Validation Summary** (right column):
  - 247 Valid Records (green), 12 Warnings (yellow), 3 Errors (red). All hard-coded.
  - Issues list: Row 34 invalid species "RNTR", Row 89 length exceeds max (892mm), Row 156 protocol mismatch.
  - "Cancel Upload" button (resets to Phase 1) and "Review & Correct Errors" button (links to `/validation`).

**Data Sources**: No Dataverse data. All detection results are hard-coded.

**User Actions**: Drag/drop or click to "upload" file (sets uploaded=true), cancel upload, proceed to validation.

**Power Apps Note**: This page requires actual file upload handling. Use Power Apps Attachments control or a custom connector. The metadata detection and validation summary should be generated by a Power Automate flow that parses the uploaded Excel/CSV file.

---

### 2.5 Validation (`/validation`)

**File**: `src/app/pages/Validation.tsx`

**Purpose**: The core workflow screen. Displays fish record data in a table with inline validation indicators, a side panel of validation issues, and role-specific action buttons.

**Query Parameter**: `?surveyId=` (optional). If not provided, defaults to the first survey with an actionable status (`Pending Validation`, `Returned for Correction`, `Pending Approval`, or `Flagged Suspect`). If no actionable surveys exist, falls back to `surveys[0].id`.

**Key UI Elements**:
- **Header**: Breadcrumb (`Waters > {waterName} > Survey Validation`), "Survey Validation" title, RoleIndicator, mm/inches toggle, "Revalidate" button.
- **Role-specific action buttons in header**:
  - **Data Entry**: "Submit for Review" button. Sets status to `Pending Approval`.
  - **Area Biologist**: "Request Correction" button (sets status to `Returned for Correction`) + "Approve Survey" button (sets status to `Approved`). Approve is disabled when there are errors.
  - **Senior Biologist**: "Flag as Suspect" button (sets status to `Flagged Suspect`) + "Publish to Analysis" button (sets status to `Published`). Publish is disabled when there are errors.
- **Action confirmation**: Inline success message with new status badge after any action.
- **WaterBanner**: Full water context banner.
- **Regional Scope Strip**: For area-biologist role.
- **Contextual Survey Header**: Station, Survey Date, Protocol.
- **Protocol Banner**: Protocol name with tooltip explaining the methodology, Survey ID, and Biologist name.
- **Summary Cards** (4 cards): Valid Rows (green check), Warnings (yellow alert), Errors (red alert), Total Records (grey info).
- **Data Preview Table** (2 columns wide):
  - Columns: colored left strip (red/yellow/transparent), Row number, Pass number, Species (mono font), Length (with mm/inches conversion), Weight (g), Status (Valid/Warning/Error with tooltip showing error message).
  - Data from `getFishRecords(surveyId)` if available, else falls back to hard-coded sample data (10 rows).
  - Footer info box: Population estimation method explanation.
- **Validation Issues Panel** (1 column, sticky):
  - Lists all issues from `getValidationBySurveyId(surveyId)` if available. Each issue shows severity icon, row number or field, message, suggestion, and "Jump to Row" button.
  - If no validation case exists but errors/warnings are present, shows fallback hard-coded issues.
  - If clean survey (no errors, no warnings), shows green "No issues detected" message.
  - **CPW Species Reference** (bottom of panel): Lists first 5 species codes and common names.

**State Management**:
- `unit` state: `'mm' | 'inches'` for length display toggle.
- `actionMessage` state: Shown after status actions, auto-clears after 3s for revalidate.
- `useDemo().updateSurveyStatus()`: Called on approve, return, submit, flag, publish actions.
- `useDemo().getSurveyStatus()`: Gets effective status (may be overridden from sessionStorage).

**Data Sources**: `getSurveyById(surveyId)`, `getWaterById(survey.waterId)`, `getValidationBySurveyId(surveyId)`, `getFishRecords(surveyId)`, `useDemo().surveys`, `allSpecies`.

**User Actions**: Toggle mm/inches, revalidate, approve (area-biologist), request correction (area-biologist), submit for review (data-entry), flag as suspect (senior-biologist), publish (senior-biologist).

**Terminal Status Behavior**: When status is `Approved` or `Published`, all action buttons are disabled (`isTerminalStatus` flag).

---

### 2.6 QueryBuilder (`/query`)

**File**: `src/app/pages/QueryBuilder.tsx`

**Purpose**: Visual query builder for cross-survey analysis. Restricted to area-biologist and senior-biologist roles (not in nav for data-entry).

**Key UI Elements**:
- **Header**: "Cross-Survey Analysis" title, RoleIndicator. Senior biologist gets a Standard/Advanced mode toggle.
- **Regional Scope Strip**: For area-biologist ("Regional Scope Active -- Northeast Basin"). For senior-biologist in advanced mode ("Advanced Analysis Mode Active...").
- **Layout**: 3-column grid (1+2+1).
- **Filter Panel** (left, 1 column):
  - Water dropdown: NE waters for area-biologist, all waters for senior-biologist.
  - Species dropdown: All 7 species + "All Species".
  - Region dropdown: 4 regions + "All Regions".
  - Date Range: Two date inputs (from/to).
  - Protocol Type dropdown: 4 protocols + "All Protocols".
  - Exclude Young of Year toggle (Switch).
  - Measurement Units toggle (mm/inches buttons).
- **Visual Query Builder** (center, 2 columns):
  - "Active Query" summary strip: Shows conditions as chips with AND connectors.
  - Condition rows: Each has Field dropdown, Operator dropdown, Value input, and remove button.
  - Default conditions: `species = Brown Trout AND region = Northeast AND year >= 2018`.
  - "Add Condition" button, "Clear All Conditions" button, "Run Analysis" button (links to `/insights`).
- **Live Results Preview** (right, 1 column, sticky):
  - Matching Surveys count (large number, derived from `useDemo().surveys` filtered to NE).
  - Fish Records count, Water Bodies count, Date Range, Regions.
  - Species Distribution: Brown Trout (6,234), Rainbow Trout (3,891), Cutthroat Trout (1,456), Other (723). Hard-coded.

**State**: `conditions` array, `excludeYOY` boolean, `unit` string, `advancedMode` boolean.

**Data Sources**: `waters`, `allSpecies`, `useDemo().surveys` (for live results count).

**User Actions**: Add/remove query conditions, change filters, toggle YOY exclusion, toggle units, switch Standard/Advanced mode (senior only), run analysis (navigates to insights).

---

### 2.7 Insights (`/insights`)

**File**: `src/app/pages/Insights.tsx`

**Purpose**: Multi-year ecological trend analysis with charts and statistical summaries. Restricted to area-biologist and senior-biologist roles.

**Query Parameter**: `?waterId=` (optional, defaults to `'south-platte'` -- this is a known issue).

**Key UI Elements**:
- **Header**: "Insights" title, RoleIndicator. Senior biologist gets "Export to Excel" and "Open in Tableau" buttons. All roles get "Save Analysis" button.
- **WaterBanner**: Full water context.
- **Regional Scope Strip**: For area-biologist.
- **Context Banner**: "Based on {N} surveys conducted between {start}-{end} using validated protocols."
- **Summary Metric Cards** (4 cards):
  - Population Estimate (with 95% CI on right side, computed as +/-5.5%).
  - CPUE Index (with percent change from previous year).
  - Biomass (kg, with percent change).
  - Relative Weight Avg (hard-coded 98.4, "Wr index baseline 100").
- **Multi-Year Population Trend** (main chart, full width):
  - Senior biologist: "Single Water" / "Compare Waters" toggle.
  - Metric selector dropdown: Population Estimate, CPUE, Biomass.
  - **Single Water mode**: `LineChart` with one line, data from `getTrendForWater(waterId)`.
  - **Compare Waters mode** (senior only): `LineChart` with 3 lines (South Platte, Colorado River, Blue River). Data from `getTrendForWater()` for each.
  - **Statewide Delta Analysis** (compare mode): 3-card grid showing percent change for each compared water vs baseline year.
  - **Statistical Method info box**: Explains Zippin's MLE depletion estimator.
- **Length-Frequency Distribution** (bar chart, 2 columns): `BarChart` with 8 length bins. Data is hard-coded. Interpretation note below.
- **Statistical Summary** (1 column):
  - Mean Length, Std Deviation, Min Length, Max Length, Sample Size. All hard-coded.
  - 95% Confidence Interval: Lower/Upper bounds (computed from `latestPoint.popEstimate * 0.944 / 1.055`), Margin of Error (+/-5.7%).

**Data Sources**: `getWaterById(waterId)`, `getTrendForWater(waterId)`, `useDemo().surveys`, `getTrendForWater('south-platte')`, `getTrendForWater('blue-river')`, `getTrendForWater('colorado-river')`.

**User Actions**: Switch metric, toggle compare mode (senior only), export to Excel (no-op), open in Tableau (no-op), save analysis (no-op).

---

### 2.8 ActivityFeed (`/activity-feed`)

**File**: `src/app/pages/ActivityFeed.tsx`

**Purpose**: Comprehensive, filterable list of all survey activity in the Northeast Region. Grouped by water body with collapsible sections.

**Key UI Elements**:
- **Header**: "All Survey Activity -- Northeast Region" title with count of filtered surveys, RoleIndicator.
- **Regional Scope Strip**: "Regional Scope Active -- Northeast Basin".
- **Filters Card**:
  - Water dropdown: "All Waters" + all NE waters.
  - Status dropdown: "All Statuses", "Pending / In Review", "Approved / Published", "Flagged Suspect", "Draft".
  - Date From: Date input.
- **Water-Grouped Survey List**: Each water body is a collapsible card.
  - **Card Header** (clickable to toggle): Water name (links to profile), survey count, pending review count. ChevronDown/ChevronRight toggle icon.
  - **Card Content** (when expanded): List of survey rows. Each shows:
    - Survey ID (mono font), Station ID, Protocol, Date.
    - Status badge (color-coded).
    - Action button: "Review" (for pending statuses), "Continue" (for Returned for Correction), "View" (for Approved/Published). Links to `/validation?surveyId=...`.
- **Empty State**: "No surveys match the current filters."

**Status Filter Mapping** (`matchesStatusFilter` function):
- `'all'`: All statuses.
- `'pending'`: `Pending Validation`, `Pending Approval`, `Returned for Correction`.
- `'approved'`: `Approved`, `Published`.
- `'flagged'`: `Flagged Suspect`.
- `'draft'`: `Draft`.

**Data Sources**: `waters` (NE only), `useDemo().surveys` (filtered to NE waterIds, then by status/water/date filters).

**User Actions**: Filter by water, filter by status, filter by date, expand/collapse water groups, navigate to validation for a specific survey, navigate to water profile.

**Important Note**: This page correctly includes Approved/Published surveys in its filter options. The bug where approved surveys "disappear" originates from the Dashboard's `buildActivityFeed()` helper, which excludes those statuses from the review queue. The ActivityFeed page itself handles this correctly when the "Approved / Published" filter is selected.

---

## 3. Reusable Components

### 3.1 CollapsibleSidebar

**File**: `src/app/components/CollapsibleSidebar.tsx`

**Purpose**: Primary navigation. Fixed-position left sidebar that expands on hover and collapses when the mouse leaves.

**Dimensions**: 64px collapsed (`COLLAPSED_W`), 288px expanded (`EXPANDED_W`).

**Behavior**:
- **Desktop (hover capable)**: Expands on mouseenter (80ms debounce), collapses on mouseleave (80ms debounce). Also expands on focus, collapses on blur (unless focus moved within the nav).
- **Touch (no hover)**: First tap on a collapsed link prevents navigation and expands the sidebar. Second tap navigates. Tapping non-link area toggles expansion.
- **Keyboard**: Escape key collapses the sidebar and focuses the first link.
- **Visual**: `bg-primary` background, white text, `shadow-lg` when expanded. 200ms cubic-bezier width transition.

**Content**:
- **Branding**: "AD" monogram when collapsed (fades out on expand), "ADAMAS" + "Aquatic Data & Monitoring" when expanded.
- **Navigation Items**: Filtered by current role. Each item shows icon (18x18), label text. Active route gets `bg-white/20` highlight. Inactive items: `text-white/60` with `hover:bg-white/10`.
- **Footer**: Version "1.0.2", "Colorado Parks & Wildlife", "Fisheries Program".

**Props**: `position` ('left' | 'right', default 'left'), `items` (optional NavItem[] override).

**Active Route Detection**: `location.pathname === to || location.pathname.startsWith(to + '/')`.

**Role Filtering**: Uses `useRole().role` to filter `navItems` array. Items only appear if their `roles` array includes the current role.

**Data Entry Label Override**: If `role === 'data-entry'` and the nav item has a `dataEntryLabel`, that label is shown instead of the default.

---

### 3.2 Navigation (unused alternate)

**File**: `src/app/components/Navigation.tsx`

**Purpose**: A simpler, non-collapsible sidebar implementation. **Not used in the current Layout** (Layout uses CollapsibleSidebar instead). Included for reference only.

**Differences from CollapsibleSidebar**: Fixed 256px width, no collapse/expand behavior, no hover interaction, no touch handling.

---

### 3.3 WaterBanner

**File**: `src/app/components/WaterBanner.tsx`

**Purpose**: Full-width banner showing water body context information. Used on WaterProfile, Validation, and Insights pages.

**Props**:
| Prop | Type | Description |
|---|---|---|
| `waterName` | `string` | Display name of the water body |
| `region` | `string` | Region name (e.g., "Northeast") |
| `watershed` | `string` | HUC12 code |
| `stations` | `Station[]` | Array of station objects (passed to StationViz) |
| `totalSurveys` | `number` | Total survey count for this water |
| `yearsActive` | `string` | Formatted years range (e.g., "1998-2025") |

**Layout**: White background with bottom border. Left side: blue vertical accent bar + water name (24px semibold) + metadata line (Region | Watershed | Stations | Total Surveys | Years Active). Right side: 256x160px StationViz component.

---

### 3.4 Breadcrumb

**File**: `src/app/components/Breadcrumb.tsx`

**Purpose**: Navigation breadcrumbs shown at the top of WaterProfile and Validation pages.

**Props**: `items: BreadcrumbItem[]` where each item has `label: string` and optional `path?: string`.

**Behavior**: Items with a `path` render as `<Link>` (clickable, hover color change). Items without a path render as `<span>` with bold text (current page). Items separated by ChevronRight icon.

---

### 3.5 RoleIndicator

**File**: `src/app/components/RoleIndicator.tsx`

**Purpose**: Demo-mode role switcher. Dropdown that appears in the header of every page, allowing instant role switching.

**Implementation**: Uses shadcn/ui `Select` component. Displays current role label, with "(Demo mode)" text. Calls `useRole().setRole()` on change.

**Values**:
| Value | Label |
|---|---|
| `data-entry` | Data Entry Assistant |
| `area-biologist` | Area Biologist |
| `senior-biologist` | Senior Biologist |

**Power Apps Note**: This component is for demo purposes only. In production, role should be determined from Dataverse security roles or a user-role lookup table, not from a UI dropdown.

---

### 3.6 StationViz

**File**: `src/app/components/StationViz.tsx`

**Purpose**: Lightweight canvas-like station position visualization. Shows station dots on a stylized basin boundary.

**Props**: `stations: Station[]`, `title: string`, `subtitle?: string` (unused).

**Positioning Algorithm**:
1. If 2+ stations have coordinates: Normalizes lat/lon to percentage positions within a bounding box. Latitude inverted (north = top). Padding: 15% left, 20% top.
2. If <2 stations have coordinates: Uses deterministic hash of station ID to generate stable x/y positions.

**Visual Elements**:
- SVG path drawing a curved basin boundary outline (green, `#2F6F73`, 30% opacity).
- Station dots: 8x8px circles with `bg-primary` color, absolutely positioned.
- Title text: 10px in top-left corner.
- Legend bar: Shows station count and boundary indicator.

---

### 3.7 ImageWithFallback

**File**: `src/app/components/figma/ImageWithFallback.tsx`

**Purpose**: Image component with error fallback. Shows a placeholder SVG if the image fails to load.

**Power Apps Note**: Not needed in Power Apps. Use the built-in Image control with a fallback image URL.

---

## 4. Context Providers (State Management)

### 4.1 RoleContext

**File**: `src/app/context/RoleContext.tsx`

**Type**: `UserRole = 'data-entry' | 'area-biologist' | 'senior-biologist'`

**State**: `role: UserRole` stored in React state (default: `'area-biologist'`).

**Exposed Values**:
- `role` -- current role string.
- `setRole(role)` -- function to change the current role.

**Helper Function**: `getRoleLabel(role)` returns the human-readable label for a role.

**Persistence**: None. Role resets to `'area-biologist'` on every page refresh.

**Power Apps Equivalent**: `varCurrentRole` global variable, populated from Dataverse user-role lookup at app start. Or use `User().Email` with a `cpw_UserRole` table.

---

### 4.2 DemoContext

**File**: `src/app/context/DemoContext.tsx`

**Storage Key**: `adamas_demo_state_v1` in `sessionStorage`.

**State**: `overrides: Record<string, SurveyStatus>` -- a map of survey IDs to overridden statuses.

**Exposed Values**:
- `surveys: Survey[]` -- the full survey list from `world.ts` with any status overrides applied. Computed via `baseSurveys.map(s => overrides[s.id] ? { ...s, status: overrides[s.id] } : s)`.
- `getSurveyStatus(surveyId)` -- returns the overridden status if one exists, otherwise the original status from `world.ts`.
- `updateSurveyStatus(surveyId, status)` -- writes a new override to both React state and sessionStorage.
- `resetDemo()` -- clears all overrides from state and sessionStorage.

**Critical Behavior**:
- When a user approves a survey on the Validation page, `updateSurveyStatus(surveyId, 'Approved')` is called.
- This writes the override to sessionStorage and React state.
- All pages that consume `useDemo().surveys` will now see the updated status.
- The `buildActivityFeed()` function in `world.ts` filters OUT Approved/Published surveys, so they disappear from the Dashboard review queue. This is intentional for the queue but creates the "approved surveys disappear" bug when users expect to still see them somewhere.

**Power Apps Equivalent**: Remove entirely. All status changes go directly to Dataverse via `Patch()`. No client-side override layer is needed.

---

## 5. Data Model (world.ts)

**File**: `src/app/data/world.ts`

This file contains all type definitions, reference data, transactional data, and helper functions for the application.

### 5.1 Type Definitions

#### Role
```
type Role = "data-entry" | "area" | "senior"
```
Note: These values differ slightly from `RoleContext.tsx` which uses `'data-entry' | 'area-biologist' | 'senior-biologist'`. The `world.ts` Role type is not used by any component -- the `RoleContext` type is the authoritative one.

#### Species
```
type Species = {
  code: string           -- 3-letter code (e.g., "BNT")
  common: string         -- common name (e.g., "Brown Trout")
  scientific: string     -- scientific name (e.g., "Salmo trutta")
  lengthMm: { min, max } -- plausible length range in millimeters
  weightG: { min, max }  -- plausible weight range in grams
}
```

#### Station
```
type Station = {
  id: string             -- station code (e.g., "SP-01")
  name: string           -- station name (e.g., "Deckers")
  riverMile?: number     -- optional river mile marker
  coords?: { lat, lon }  -- optional GPS coordinates
}
```

#### Water
```
type Water = {
  id: string                        -- slug identifier (e.g., "south-platte")
  name: string                      -- display name
  region: "Northeast" | "Comparison" -- region classification
  huc12: string                     -- USGS HUC12 watershed code
  stations: Station[]               -- nested station array
  yearsActive: { start, end }       -- monitoring period
  primarySpecies: string[]          -- species codes
}
```

#### SurveyStatus (Choice/Enum)
```
"Draft" | "Pending Validation" | "Returned for Correction" | "Pending Approval" | "Approved" | "Published" | "Flagged Suspect"
```
7 distinct values. Status transition flow:
```
Draft --> Pending Validation --> Pending Approval --> Approved --> Published
                |                     |                              ^
                v                     v                              |
        Returned for Correction   Flagged Suspect ---(publish)-------+
                |
                v
        Pending Validation (re-submitted)
```

#### Protocol (Choice/Enum)
```
"Two-Pass Removal" | "Single-Pass CPUE" | "Mark-Recapture" | "Electrofishing CPUE"
```

#### Survey
```
type Survey = {
  id: string             -- survey identifier (e.g., "SVY-2026-NE-0100")
  waterId: string        -- FK to Water.id
  stationId: string      -- FK to Station.id
  date: string           -- ISO date (e.g., "2026-02-10")
  protocol: Protocol     -- survey protocol used
  uploader: string       -- name of person who uploaded
  status: SurveyStatus   -- current workflow status
  fishCount: number      -- total fish records in survey
  speciesDetected: string[] -- species codes found
}
```

#### FishRecord
```
type FishRecord = {
  row: number            -- row number in the data sheet
  pass: number           -- electrofishing pass number (1 or 2)
  species: string        -- species code
  length: number         -- length in mm
  weight: number         -- weight in grams
  status: "valid" | "warning" | "error"
  error?: string         -- error/warning message
}
```

#### ValidationIssue
```
type ValidationIssue = {
  severity: "Error" | "Warning"
  code: "SPECIES_CODE_INVALID" | "LENGTH_OUT_OF_RANGE" | "WEIGHT_LENGTH_IMPLAUSIBLE" | "PROTOCOL_MISMATCH" | "MISSING_REQUIRED_FIELD" | "STATION_INVALID"
  message: string
  row?: number           -- row number (if row-specific)
  field?: string         -- field name (if field-specific)
  suggestion?: string    -- corrective suggestion
}
```

#### ValidationCase
```
type ValidationCase = {
  surveyId: string                      -- FK to Survey.id
  summary: { errors: number, warnings: number }
  issues: ValidationIssue[]
}
```

#### TrendSeriesPoint
```
type TrendSeriesPoint = {
  year: number
  cpue: number           -- catch per unit effort
  biomassKg: number      -- total biomass in kilograms
  popEstimate?: number   -- optional population estimate
}
```

#### Trend
```
type Trend = {
  waterId: string
  overall: TrendSeriesPoint[]
  bySpecies?: Record<string, TrendSeriesPoint[]>  -- keyed by species code
}
```

#### ActivityItem
```
type ActivityItem = {
  id: string             -- derived: "ACT-{surveyId}"
  surveyId: string
  waterId: string
  waterName: string
  stationId: string
  date: string
  status: SurveyStatus
  primaryAction: "Review" | "Continue" | "View"
}
```

### 5.2 Reference Data Constants

#### Species (7 records)

| Code | Common Name | Scientific Name | Length (mm) | Weight (g) |
|---|---|---|---|---|
| BNT | Brown Trout | Salmo trutta | 80-750 | 5-6000 |
| RBT | Rainbow Trout | Oncorhynchus mykiss | 80-800 | 5-7000 |
| CTT | Cutthroat Trout | Oncorhynchus clarkii | 70-650 | 4-4500 |
| MWF | Mountain Whitefish | Prosopium williamsoni | 90-600 | 8-2800 |
| WHS | White Sucker | Catostomus commersonii | 120-700 | 20-3500 |
| CRD | Creek Chub | Semotilus atromaculatus | 40-220 | 1-200 |
| LMB | Largemouth Bass | Micropterus salmoides | 80-650 | 5-5500 |

#### Waters (7 records)

| ID | Name | Region | HUC12 | Stations | Years | Primary Species |
|---|---|---|---|---|---|---|
| south-platte | South Platte Basin | Northeast | 140100010101 | SP-01, SP-03, SP-04 | 1998-2025 | BNT, RBT, WHS |
| cache-la-poudre | Cache la Poudre River | Northeast | 101900070203 | PDR-01, PDR-02 | 2004-2025 | CTT, BNT, CRD |
| st-vrain | St. Vrain Creek | Northeast | 101900050104 | SV-01, SV-02 | 2009-2025 | RBT, BNT, WHS |
| big-thompson | Big Thompson River | Northeast | 101900060201 | BT-01, BT-02 | 2006-2025 | RBT, MWF, WHS |
| boyd-lake | Boyd Lake (Reservoir) | Northeast | 101900060305 | BL-01, BL-02 | 2012-2025 | LMB, WHS, CRD |
| blue-river | Blue River | Comparison | 140100020101 | BR-01, BR-02 | 1995-2025 | RBT, BNT, MWF |
| colorado-river | Colorado River (Middle) | Comparison | 140100010204 | CR-01, CR-02 | 1990-2025 | BNT, MWF, WHS |

#### Stations (15 records)

Embedded within their parent Water objects. See Waters table above for station IDs. Each station has an `id`, `name`, optional `riverMile`, and optional `coords` (lat/lon).

#### Surveys (16 records)

3 "hero" surveys for demo flow (2026 dates, sort to top):
- **SVY-2026-NE-0100**: South Platte SP-04, Pending Approval, 18 fish, clean survey (all valid).
- **SVY-2026-NE-0101**: Cache la Poudre PDR-01, Pending Approval, 15 fish, 1 warning (young-of-year CTT).
- **SVY-2026-NE-0102**: South Platte SP-03, Pending Validation, 20 fish, 2 errors + 1 warning.

13 additional surveys across all 7 waters with various statuses (Pending Approval, Returned for Correction, Approved, Pending Validation, Flagged Suspect).

#### FishRecords (3 keyed sets, 53 total records)

Fish-level data keyed by survey ID. Only 3 hero surveys have explicit fish records:
- `SVY-2026-NE-0100`: 18 records, all valid. Species: BNT, RBT, WHS. 2 passes.
- `SVY-2026-NE-0101`: 15 records, 1 warning (row 7: 134mm CTT young-of-year). Species: BNT, CTT, CRD. 1 pass.
- `SVY-2026-NE-0102`: 20 records, 2 errors (row 4: invalid species "RNTR", row 7: 892mm RBT exceeds max) + 1 warning (row 9: 145mm CTT young-of-year). Species: BNT, RBT, CTT, RNTR. 2 passes.

Surveys without explicit fish records fall back to a 10-row hard-coded sample in `Validation.tsx`.

#### ValidationCases (5 records)

| Survey ID | Errors | Warnings | Key Issues |
|---|---|---|---|
| SVY-2026-NE-0101 | 0 | 1 | Young-of-year CTT at 134mm |
| SVY-2026-NE-0102 | 2 | 1 | Invalid species "RNTR", length exceeds max, young-of-year |
| SVY-2025-SP-0006 | 2 | 1 | Weight/length implausible, length out of range, missing water temp |
| SVY-2025-PDR-0012 | 1 | 2 | Protocol mismatch (mark-recapture), missing HUC12, invalid species "CUT" |
| SVY-2025-BT-0009 | 0 | 2 | Station coords outside boundary, missing effort duration |

#### Trends (7 records, one per water)

Each trend has 5 years of data (2021-2025) with CPUE, biomass, and optional population estimates. Two waters (South Platte, Cache la Poudre) also have per-species breakdowns (`bySpecies`).

### 5.3 Helper Functions

| Function | Signature | Purpose |
|---|---|---|
| `getWaterById` | `(id: string) => Water \| undefined` | Lookup water by slug ID |
| `getSurveyById` | `(id: string) => Survey \| undefined` | Lookup survey by ID |
| `getValidationBySurveyId` | `(surveyId: string) => ValidationCase \| undefined` | Lookup validation case by survey ID |
| `buildActivityFeed` | `(region, surveyList?) => ActivityItem[]` | Builds activity items from surveys. **Filters to only actionable statuses**: Pending Validation, Returned for Correction, Pending Approval, Flagged Suspect. Excludes Draft, Approved, Published. Sorted by date descending. |
| `getTrendForWater` | `(waterId: string) => Trend \| undefined` | Lookup trend data for a water |
| `getFishRecords` | `(surveyId: string) => FishRecord[] \| undefined` | Lookup fish-level records for a survey |

---

## 6. Data Flow Architecture

### Read Path

```
world.ts (static arrays: waters, surveys, species, etc.)
    |
    v
DemoContext.DemoProvider
    |-- loads overrides from sessionStorage on mount
    |-- applies overrides: surveys.map(s => overrides[s.id] ? {...s, status: overrides[s.id]} : s)
    |
    v
Pages call useDemo().surveys to get the override-applied survey list
Pages call world.ts helpers (getWaterById, etc.) for reference data lookups
Pages call world.ts buildActivityFeed() passing useDemo().surveys for the review queue
```

### Write Path

```
User clicks "Approve" / "Return" / "Flag" / "Submit" / "Publish" on Validation page
    |
    v
Component calls useDemo().updateSurveyStatus(surveyId, newStatus)
    |
    v
DemoContext.updateSurveyStatus:
    1. Updates React state: overrides = {...prev, [surveyId]: newStatus}
    2. Writes to sessionStorage: JSON.stringify(overrides) under key "adamas_demo_state_v1"
    |
    v
React re-renders: useDemo().surveys now returns updated list
All consuming pages see the new status immediately
```

### Which Pages Read What

| Page | `useDemo().surveys` | `waters` | `species` | `buildActivityFeed()` | `getTrendForWater()` | `getWaterById()` | `getSurveyById()` | `getValidationBySurveyId()` | `getFishRecords()` |
|---|---|---|---|---|---|---|---|---|---|
| Dashboard (Area Bio) | Yes | Yes | No | Yes | Yes (Poudre for CTT) | No | No | No | No |
| DataEntryDashboard | No | No | No | No | No | No | No | No | No |
| SeniorBiologistDashboard | No | No | No | No | No | No | No | No | No |
| WaterSelect | Yes | Yes | Yes | No | No | No | No | No | No |
| WaterProfile | Yes | No | Yes | No | Yes | Yes | No | No | No |
| SurveyUpload | No | No | No | No | No | No | No | No | No |
| Validation | Yes | No | Yes | No | No | Yes | Yes | Yes | Yes |
| QueryBuilder | Yes | Yes | Yes | No | No | No | No | No | No |
| Insights | Yes | No | No | No | Yes (3 waters) | Yes | No | No | No |
| ActivityFeed | Yes | Yes | No | No | No | Yes | No | No | No |

---

## 7. Role-Based Behavior Matrix

### Navigation Visibility

| Nav Item | Route | data-entry | area-biologist | senior-biologist | data-entry Label Override |
|---|---|---|---|---|---|
| Dashboard | `/` | Visible | Visible | Visible | "My Waters" |
| Water Profile | `/water` | Visible | Visible | Visible | -- |
| Upload Survey | `/upload` | Visible | Visible | Visible | -- |
| Validation | `/validation` | Visible | Visible | Visible | "Validation Queue" |
| Query Builder | `/query` | **Hidden** | Visible | Visible | -- |
| Insights | `/insights` | **Hidden** | Visible | Visible | -- |

### Dashboard Routing

| Role | Rendered Component | Title |
|---|---|---|
| data-entry | `DataEntryDashboard` | "Assigned Waters -- Data Entry View" |
| area-biologist | Dashboard.tsx (inline) | "Waters Overview" |
| senior-biologist | `SeniorBiologistDashboard` | "Statewide Water Intelligence Overview" |

### Validation Page Actions

| Action | data-entry | area-biologist | senior-biologist |
|---|---|---|---|
| Toggle mm/inches | Yes | Yes | Yes |
| Revalidate | Yes | Yes | Yes |
| Submit for Review | **Yes** | No | No |
| Request Correction | No | **Yes** | No |
| Approve Survey | No | **Yes** | No |
| Flag as Suspect | No | No | **Yes** |
| Publish to Analysis | No | No | **Yes** |

### Page-Level Role Variations

| Page | Variation |
|---|---|
| WaterProfile | data-entry sees simplified "Survey Activity Status" (4 status count cards + recent surveys list). area-biologist and senior-biologist see full analytics view (population cards, CPUE chart, species composition, management notes). |
| SurveyUpload | data-entry gets "Step 1 of 3" progress indicator. area-biologist gets regional scope strip. senior-biologist gets no extra decoration. |
| QueryBuilder | area-biologist: water dropdown limited to Northeast waters, regional scope strip shown. senior-biologist: all waters available, Standard/Advanced mode toggle. |
| Insights | area-biologist: regional scope strip. senior-biologist: Export to Excel + Open in Tableau buttons, Single Water / Compare Waters toggle. |
| SeniorBiologistDashboard | Region filter dropdown, Export Statewide Report button, Open in Tableau button, bar chart, federal reporting compliance. |

---

## 8. Session Storage Usage and Implications

### What Is Stored

- **Key**: `adamas_demo_state_v1`
- **Value**: JSON string of `Record<string, SurveyStatus>` mapping survey IDs to overridden statuses.
- **Example**: `{"SVY-2026-NE-0100":"Approved","SVY-2026-NE-0102":"Returned for Correction"}`

### Where It Is Read

- `DemoContext.tsx`, `loadOverrides()` function, called on component mount (`useState(loadOverrides)`).

### Where It Is Written

- `DemoContext.tsx`, `saveOverrides()` function, called inside `updateSurveyStatus()` after updating React state.

### Where It Is Cleared

- `DemoContext.tsx`, `resetDemo()` function calls `sessionStorage.removeItem(STORAGE_KEY)`.

### Implications for Power Apps

1. **Lost on refresh**: `sessionStorage` persists only within a single browser tab session. Closing the tab or opening a new tab resets all overrides.
2. **Not shared across tabs**: Two tabs open to the same app will have independent override states.
3. **No audit trail**: Status changes are overwritten without history.
4. **No concurrent user support**: Only the current user's browser session sees their changes.
5. **No server-side persistence**: The base data in `world.ts` is never modified. All overrides are purely client-side.

**Fix in Power Apps**: Eliminate this pattern entirely. All status changes should be written directly to Dataverse using `Patch(cpw_Survey, LookUp(cpw_Survey, SurveyID = varSurveyId), {Status: 'Approved'})`. This provides immediate persistence, cross-device consistency, multi-user support, and audit trail (via Dataverse audit logging).

---

## 9. Navigation Configuration

### NavItem Type

```typescript
interface NavItem {
  key: string          -- unique identifier
  to: string           -- route path
  icon: LucideIcon     -- icon component from lucide-react
  label: string        -- display label
  roles: string[]      -- which roles can see this item
  dataEntryLabel?: string  -- alternate label for data-entry role
  badge?: string       -- optional badge text (not used)
}
```

### NavItems Array

| Key | Route | Icon | Label | data-entry Label | Roles |
|---|---|---|---|---|---|
| dashboard | `/` | Home | Dashboard | My Waters | data-entry, area-biologist, senior-biologist |
| water | `/water` | Waves | Water Profile | -- | data-entry, area-biologist, senior-biologist |
| upload | `/upload` | Upload | Upload Survey | -- | data-entry, area-biologist, senior-biologist |
| validation | `/validation` | CheckSquare | Validation | Validation Queue | data-entry, area-biologist, senior-biologist |
| query | `/query` | Search | Query Builder | -- | area-biologist, senior-biologist |
| insights | `/insights` | BarChart3 | Insights | -- | area-biologist, senior-biologist |

Note: The Activity Feed page (`/activity-feed`) is NOT in the sidebar navigation. It is accessed via the "View All" button on the Dashboard review queue.

---

## 10. UI Component Library

The application uses **shadcn/ui** components (Radix UI primitives + Tailwind CSS). The following UI primitives are used across pages:

| Component | File | Used By |
|---|---|---|
| Card, CardContent, CardHeader, CardTitle | `ui/card.tsx` | All pages |
| Button | `ui/button.tsx` | All pages |
| Table, TableBody, TableCell, TableHead, TableHeader, TableRow | `ui/table.tsx` | Dashboard, DataEntry, SeniorBio, Validation |
| Select, SelectContent, SelectItem, SelectTrigger, SelectValue | `ui/select.tsx` | RoleIndicator, QueryBuilder, Insights, ActivityFeed, SeniorBio |
| Input | `ui/input.tsx` | QueryBuilder, ActivityFeed |
| Label | `ui/label.tsx` | QueryBuilder, Validation |
| Switch | `ui/switch.tsx` | Validation, QueryBuilder |
| Tooltip, TooltipContent, TooltipProvider, TooltipTrigger | `ui/tooltip.tsx` | Validation |
| Badge | `ui/badge.tsx` | Available but status badges are built inline with className styling |
| Separator | `ui/separator.tsx` | Available |
| Skeleton | `ui/skeleton.tsx` | Available but not used (no loading states in demo) |
| Sheet | `ui/sheet.tsx` | Available but not used |
| Dialog | `ui/dialog.tsx` | Available but not used |

### Charting Library

- **Recharts** is used for all charts: `LineChart`, `BarChart`, `ComposedChart`, `Area`, `Line`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`, `Legend`.
- Charts appear on: Dashboard (SeniorBio bar chart), WaterProfile (CPUE trend ComposedChart), Insights (LineChart, BarChart), QueryBuilder (no charts, but links to Insights).

### Icon Library

- **lucide-react** for all icons: Home, Upload, CheckSquare, Search, BarChart3, Waves, AlertTriangle, CheckCircle2, Clock, Info, FileText, FileSpreadsheet, TrendingUp, TrendingDown, AlertCircle, RotateCw, Save, HelpCircle, Plus, X, Play, ChevronDown, ChevronRight, ChevronRight (breadcrumb), MapPin, Database.

### Color Theme

Primary colors (from Tailwind theme in `src/styles/theme.css`):
- `primary`: Deep navy blue (`#1B365D` in charts).
- `secondary`: Teal green (`#2F6F73` in charts, StationViz basin outline).
- `success`: Green (used for Approved/Published status badges, valid indicators).
- `warning`: Amber/yellow (used for Pending status badges, warning indicators).
- `destructive`: Red (used for Error/Flagged status badges, error indicators).
- `muted-foreground`: Grey (`#64748B` in chart axes).
- `border`: Light grey (`#E2E8F0` in chart grid lines).

---

## 11. Known Issues and Required Fixes

### Issue 1: SessionStorage Persistence

**React Behavior**: Survey status overrides are stored in `sessionStorage` under key `adamas_demo_state_v1`. Changes are lost on tab close, not shared across tabs, and have no server-side persistence.

**Files Affected**: `src/app/context/DemoContext.tsx`.

**Fix for Power Apps**: Replace `sessionStorage` with direct Dataverse writes. Every `updateSurveyStatus()` call becomes a `Patch(cpw_Survey, ...)` call.

### Issue 2: Approved Surveys Disappear

**React Behavior**: After approving a survey, it disappears from the Dashboard review queue because `buildActivityFeed()` in `world.ts` (line 776) explicitly filters to only `Pending Validation`, `Returned for Correction`, `Pending Approval`, and `Flagged Suspect` statuses. Approved and Published surveys are excluded.

**Files Affected**: `src/app/data/world.ts` (`buildActivityFeed` function), `src/app/pages/Dashboard.tsx` (consumes `buildActivityFeed`).

**Where It Works Correctly**: The `ActivityFeed.tsx` page has its own filter that includes an "Approved / Published" option, so approved surveys CAN be found there. But the Dashboard queue does not surface them.

**Fix for Power Apps**: The Dashboard review queue should only show actionable surveys (this is correct). But add a separate "Recently Approved" section or ensure there is an obvious path to the Activity Feed where the full history is visible. Make the "View All" link to Activity Feed prominent.

### Issue 3: Hard-Coded South Platte Default

**React Behavior**: `Insights.tsx` line 20: `const waterId = searchParams.get('waterId') || 'south-platte';`. If no `waterId` query parameter is provided, it defaults to South Platte. Similar fallback behavior exists in `Validation.tsx` for water name display (line 62: `const waterName = water?.name ?? 'South Platte Basin';`).

**Files Affected**: `src/app/pages/Insights.tsx`, `src/app/pages/Validation.tsx`.

**Fix for Power Apps**: Use a `varSelectedWaterId` global variable that is set when navigating from the Water Select or Water Profile page. Never hard-code a default water body. If no water is selected, show a water picker or prompt.
