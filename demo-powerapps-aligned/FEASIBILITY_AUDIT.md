# Power Apps Build Feasibility Audit

> Branch: `demo-powerapps-aligned`
> Date: 2026-02-13
> Scope: Canvas App feasibility analysis for all 8 routes (10 page components)

---

## Executive Summary

1. **7 of 8 routes are directly buildable** in a Canvas App using standard controls (Gallery, EditForm, Label, Button, Dropdown, Container). The Query Builder (`/query`) is the only High-risk screen due to its dynamic condition add/remove pattern, but it is achievable with a repeating Gallery of dropdown rows.

2. **No blocking non-portables remain** after this audit pass. All `position: sticky`, drag-and-drop, hover-only tooltips, and CSS transitions in app-level code have been removed. Remaining transitions exist only in shadcn/ui library primitives (Select, Dialog, Accordion) which are replaced by native Power Apps controls.

3. **The Dataverse schema (`powerapps_kit/02_dataverse_schema.md`) maps 1:1 to the React data model.** All 9 tables are defined. The demo uses 7 entity types; Dataverse adds `cpw_AppUser` and `cpw_StatusHistory` for auth and audit. No schema changes needed.

4. **Charts and SVG visualizations are the only features requiring premium or external controls.** Recharts is retained as visual reference only. Use the Power Apps Chart control for simple single-series charts; embed Power BI tiles for the Insights multi-metric view and Senior Biologist dashboard.

5. **A 4-screen MVP (Dashboard, Water Select, Survey Upload, Validation) covers the core data-entry workflow** and can be built in 2-3 days using standard Canvas App patterns.

---

## Screen-by-Screen Feasibility Table

| # | Route | Page Component(s) | Layout Risk | Interaction Risk | Data Risk | Component Risk | Complexity Risk | Overall | Key Notes |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `/` | `Dashboard.tsx` (area-biologist) | Low | Low | Low | Med | Low | **Low** | Cards + Table + StationViz (SVG → static image) |
| 2 | `/` | `DataEntryDashboard.tsx` (data-entry) | Low | Low | Low | Low | Low | **Low** | Cards + 2 Tables; simplest screen |
| 3 | `/` | `SeniorBiologistDashboard.tsx` (senior) | Low | Low | Low | Med | Med | **Med** | BarChart (→ PA Chart or Power BI), cross-water trends table, progress bars |
| 4 | `/water` | `WaterSelect.tsx` | Low | Low | Low | Low | Low | **Low** | Single Gallery list; filter by region dropdown |
| 5 | `/water/profile` | `WaterProfile.tsx` | Low | Low | Low | Med | Med | **Med** | Role-conditional layout, LineChart (→ PA Chart), species composition bars, StationViz |
| 6 | `/upload` | `SurveyUpload.tsx` | Low | Low | Low | Low | Low | **Low** | Click-only file upload + metadata display; maps to Attachments control |
| 7 | `/validation` | `Validation.tsx` | Low | Low | Med | Low | Med | **Med** | Data grid with inline status, role-based action buttons, validation issues panel. Delegation concern on fish records (>2000 rows). |
| 8 | `/query` | `QueryBuilder.tsx` | Med | Med | Med | Low | **High** | **High** | Dynamic condition builder (add/remove rows). Requires Gallery of dropdown rows + collection-based state. Most complex screen. |
| 9 | `/insights` | `Insights.tsx` | Low | Low | Low | Med | Low | **Med** | Metric selector + single-series LineChart (→ PA Chart or Power BI) + histogram |
| 10 | `/activity-feed` | `ActivityFeed.tsx` | Med | Low | Low | Low | Med | **Med** | Collapsible water-grouped sections. Use flat Gallery with group headers, or nested galleries. |

---

## Audit Dimension Details

### 1. UI Layout Feasibility

All screens use a single-column or 2-3 column grid that maps directly to Power Apps horizontal/vertical containers. Max nesting depth is 3 levels (page → grid → card → content).

| Pattern | React Implementation | Power Apps Equivalent | Risk |
|---|---|---|---|
| Header + content layout | `<header>` + `<div className="px-8 py-8">` | Screen with HeaderContainer + ScrollableContainer | Low |
| 2-column grid | `grid grid-cols-1 lg:grid-cols-3` | Horizontal container with width ratios | Low |
| Card grid (4-up) | `grid grid-cols-1 md:grid-cols-4` | Horizontal container with 4 card containers | Low |
| Sidebar nav | `CollapsibleSidebar.tsx` (fixed, click-toggle) | Left-nav container with `locNavExpanded` variable | Low |
| WaterBanner | Horizontal container with StationViz | Container with labels + Image control | Low |

### 2. Interaction Feasibility

| Pattern | Status | Location | Notes |
|---|---|---|---|
| Hover-only tooltips | **Removed** | `Validation.tsx` | Replaced with visible inline text |
| `position: sticky` | **Removed** | `Validation.tsx`, `QueryBuilder.tsx` | Removed from issues panel and results panel |
| Drag-and-drop | **Removed** | `SurveyUpload.tsx` | Replaced with click-only file select |
| CSS transitions (app code) | **Removed** | `QueryBuilder.tsx`, `Navigation.tsx`, `card.tsx` | Cleaned in this audit pass |
| CSS transitions (ui/ library) | **Noted** | shadcn/ui components (Select, Dialog, etc.) | Not applicable — these are replaced by native PA controls |
| `setTimeout` for message auto-dismiss | Cosmetic | `Validation.tsx:86` | 3s timeout to clear action message. Not a blocker; Power Apps uses `Timer` control |
| Collapsible sections | Click-based | `ActivityFeed.tsx` | `collapsed` state per water ID. Use `locExpanded` collection in PA |

### 3. Data Binding Feasibility

| React Pattern | Power Apps Pattern | Risk | Notes |
|---|---|---|---|
| `surveys.filter(s => ...)` | `Filter(cpw_Survey, ...)` | Low | Delegable to Dataverse |
| `surveys.sort((a,b) => ...)` | `SortByColumns(...)` | Low | Delegable |
| `useMemo(() => grouped, [deps])` | `GroupBy(...)` or collection | Low | GroupBy for activity feed |
| `updateSurveyStatus(id, status)` | `Patch(cpw_Survey, ...)` | Low | Single-record Patch |
| `getTrendForWater(waterId)` | `Filter(cpw_TrendData, cpw_Water = ...)` | Low | Delegable |
| `getFishRecords(surveyId)` | `Filter(cpw_FishRecord, cpw_Survey = ...)` | Med | **Delegation risk**: could exceed 2000 rows per survey over time. Always filter by Survey first. |
| Dynamic query conditions | `Collect(locConditions, ...)` + build filter | Med | QueryBuilder needs collection-based filter construction |
| `sessionStorage` overrides | Not needed | Low | Dataverse persists state natively |

### 4. Component Feasibility

| React Component | Power Apps Control | Risk | Notes |
|---|---|---|---|
| `<Card>` | Container with border + shadow | Low | Direct mapping |
| `<Table>` | Gallery in table layout | Low | Standard pattern |
| `<Select>` / `<SelectContent>` | Dropdown control | Low | Native |
| `<Button>` | Button control | Low | Native |
| `<Input>` | TextInput control | Low | Native |
| `<Switch>` | Toggle control | Low | Native |
| `<Label>` | Label control | Low | Native |
| Recharts `<LineChart>` | Chart control (Line) or Power BI tile | Med | PA Chart is limited; Power BI for rich charts |
| Recharts `<BarChart>` | Chart control (Bar) or Power BI tile | Med | Same as above |
| `<StationViz>` (SVG) | Image control with pre-rendered map, or Map control (premium) | Med | SVG not available in Canvas Apps |
| `<Breadcrumb>` | Horizontal container + Label controls + ">" icons | Low | Straightforward |
| `<RoleIndicator>` | Label bound to `gblCurrentRole` | Low | Demo-only; production uses real roles |
| Progress bars (species composition, federal reporting) | Progress Bar control or calculated-width Rectangle | Low | Standard PA pattern |

### 5. Complexity Hotspots

| Rank | Screen | Complexity | Why | Mitigation |
|---|---|---|---|---|
| 1 | **QueryBuilder** | **High** | Dynamic condition add/remove with 3 dropdowns per row; add/remove buttons; live results sidebar | Use `Collect(locConditions, {id: ..., field: ..., op: ..., value: ...})` with a Gallery. "Add Condition" = `Collect`. "Remove" = `Remove`. "Run Analysis" = navigate to Insights with filter params. |
| 2 | **Validation** | **Medium** | Role-based action buttons (3 different button sets), data grid with colored status strips, validation issues panel, unit toggle | Split action buttons into 3 `Visible` groups. Data grid = Gallery with conditional formatting. Issues panel = separate Gallery. |
| 3 | **ActivityFeed** | **Medium** | Water-grouped collapsible sections, 3 filter dropdowns, dynamic survey count per group | Use flat Gallery with `GroupBy()` or nested Gallery. Collapse = `locExpanded` collection + `If(locExpanded, Gallery.Height, HeaderHeight)`. |
| 4 | **Dashboard (area-biologist)** | **Medium** | Review queue table with action buttons, StationViz, species-of-concern panel | Replace StationViz with static image. Table = Gallery. Action buttons in Gallery template. |
| 5 | **WaterProfile** | **Medium** | Role-conditional entire layout (data-entry vs. biologist), chart, species bars, recent surveys | Use `If(gblCurrentRole = ..., ...)` to toggle Container visibility. |

---

## Top 10 Build Risks (Ranked)

| # | Risk | Severity | Screen(s) | Mitigation |
|---|---|---|---|---|
| 1 | **Query Builder dynamic conditions** | High | `/query` | Use `Collect/Remove` on a local collection + Gallery. Test with 5+ conditions. |
| 2 | **Fish record delegation** | High | `/validation` | Always filter `cpw_FishRecord` by `cpw_Survey` first. Set delegation limit to 2000. Monitor row counts. |
| 3 | **Chart rendering fidelity** | Medium | `/insights`, `/water/profile`, `/` (senior) | Use PA Chart control for simple line/bar; embed Power BI tile for multi-metric views. Accept visual differences. |
| 4 | **StationViz SVG replacement** | Medium | `/`, `/water/profile` | Replace with static map image per water, or use Map control (premium connector, requires Bing Maps key). |
| 5 | **Collapsible grouped sections** | Medium | `/activity-feed` | Use flat Gallery with `IsExpanded` column in collection, or just use non-collapsible flat list. |
| 6 | **Role-based view switching** | Medium | All screens | Use `gblCurrentRole` variable with `Visible` property on containers. Test all 3 roles. Each role may need different Gallery items. |
| 7 | **3-column responsive layout** | Medium | `/query`, `/validation` | Canvas Apps are fixed-width. Design for 1366px. Use horizontal containers with percentage widths. |
| 8 | **Progress bar rendering** | Low | `/water/profile`, `/` (senior) | Use `Width: Parent.Width * (value/max)` on a colored Rectangle inside a Container. |
| 9 | **Breadcrumb navigation** | Low | `/water/profile`, `/validation` | Horizontal container with Label controls, chevron Text labels, and `Navigate()` OnSelect. |
| 10 | **Unit toggle (mm/inches)** | Low | `/validation`, `/query` | Use `locUnit` variable + `If(locUnit="mm", Value, Value/25.4)` in Gallery Text properties. |

---

## Fastest MVP Subset

**Goal:** Demonstrate core data-entry workflow end-to-end in the fewest screens.

### MVP Screens (build order)

| Order | Screen | PA Screen Name | Why | Effort |
|---|---|---|---|---|
| 1 | Water Select | `scrWaterSelect` | Entry point; simple Gallery + Dropdown filter. Proves Dataverse binding works. | 2-3 hours |
| 2 | Survey Upload | `scrSurveyUpload` | Attachments control + EditForm for metadata. Proves file handling works. | 3-4 hours |
| 3 | Validation | `scrValidation` | Data grid Gallery + action buttons + Patch. Proves workflow state transitions. | 4-6 hours |
| 4 | Dashboard (data-entry) | `scrDashboard_DE` | Cards + Table. Proves summary views and navigation. | 2-3 hours |

**Total MVP estimate: 11-16 hours**

### Defer to Phase 2

| Screen | Reason |
|---|---|
| Dashboard (area-biologist) | Needs StationViz replacement |
| Dashboard (senior-biologist) | Needs Chart/Power BI integration |
| Water Profile | Role-conditional layout adds complexity |
| Query Builder | Dynamic condition builder is highest-risk |
| Insights | Chart-heavy; needs Power BI tile |
| Activity Feed | Collapsible groups add complexity |

### MVP Dataverse Tables Needed

Only 5 of 9 tables needed for MVP:

| Table | Purpose |
|---|---|
| `cpw_Water` | Water body reference (Gallery source) |
| `cpw_Station` | Station reference (Dropdown source) |
| `cpw_Species` | Species reference (validation lookup) |
| `cpw_Survey` | Core survey records (CRUD) |
| `cpw_FishRecord` | Fish measurements (Gallery in Validation) |

Defer `cpw_ValidationIssue`, `cpw_TrendData`, `cpw_StatusHistory`, `cpw_AppUser` to Phase 2.
