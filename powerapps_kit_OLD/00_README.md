# ADAMAS Power Apps Build Kit

## What This Kit Is

This build kit provides everything needed to rebuild the **ADAMAS** (Aquatic Data & Monitoring Analysis System) React demo application as a **Microsoft Power Apps Canvas App** backed by **Dataverse**. ADAMAS is a fisheries data management system built for the **Colorado Parks & Wildlife (CPW) Fisheries Program**, covering survey data entry, validation, approval workflows, population trend analysis, and cross-water insights.

The React demo (`CPW-Demo2`) was built as a high-fidelity prototype to validate UX and workflow requirements. This kit translates every screen, component, data relationship, role-based behavior, and known issue into structured deliverables that a Power Platform builder can follow to produce a production-ready Canvas App.

### What ADAMAS Does

- **Survey lifecycle management**: Upload survey data, validate against biological rules, route through approval workflows, publish to analysis datasets.
- **Multi-role workflows**: Data Entry Assistants upload and fix data; Area Biologists review and approve within their region; Senior Biologists analyze statewide trends and publish.
- **Water body intelligence**: Per-water profiles with CPUE trends, species composition, station maps, and survey history.
- **Cross-water analytics**: Query builder for multi-condition analysis, population trend comparison across basins, length-frequency distributions.
- **Activity tracking**: Region-scoped survey feeds with status filtering and water-grouped views.

---

## Prerequisites

| Requirement | Details |
|---|---|
| **Power Apps License** | Power Apps Per User or Per App plan (Canvas App with Dataverse) |
| **Dataverse Environment** | A dedicated environment (e.g., `CPW-Fisheries-Dev`) with System Administrator or Environment Maker role |
| **Power Automate License** | Included with Power Apps license; needed for approval flows and status transition automation |
| **Azure AD / Entra ID** | Security groups for the three roles: `CPW-DataEntry`, `CPW-AreaBiologist`, `CPW-SeniorBiologist` |
| **Browser** | Microsoft Edge or Chrome (latest) for Canvas App maker experience |
| **Optional: Power BI** | For advanced analytics screens (Insights page) if embedded visuals are preferred over native Canvas charts |

---

## 10-Minute Quickstart

1. **Read this README** to understand the kit structure and the app you are building.
2. **Read `01_repo_inventory.md`** to understand every screen, component, data flow, and role-based behavior in the React source.
3. **Import `02_dataverse_schema.md`** (when available) to create all Dataverse tables, columns, relationships, and Choice sets.
4. **Run `07_seed_data/`** scripts to populate reference data (Species, Waters, Stations) and sample survey records.
5. **Build the Canvas App shell**: Create a new Canvas App at tablet resolution (1366x768). Add a `SideNav` component and `MainContainer` using the layout spec in `03_screen_map.md` (when available).
6. **Build screens in order**: Dashboard, WaterSelect, WaterProfile, SurveyUpload, Validation, QueryBuilder, Insights, ActivityFeed.
7. **Wire up role-based visibility** using the `User().Email` lookup against the `cpw_Role` table or Entra ID group membership.
8. **Configure Power Automate flows** for survey status transitions (approve, return, flag, publish).
9. **Test the three demo personas** end-to-end: Data Entry upload-and-fix, Area Biologist review-and-approve, Senior Biologist analyze-and-publish.
10. **Validate against known issues** listed below to confirm they are resolved.

---

## File Manifest

| File | Description |
|---|---|
| `00_README.md` | **This file.** Kit overview, prerequisites, quickstart, manifest, and known issues. |
| `01_repo_inventory.md` | Detailed inventory of every page, component, context, data type, and data flow in the React source. The authoritative reference for what the Power App must replicate. |
| `02_dataverse_schema.md` | *(Planned)* Dataverse table definitions, column specs, relationships, Choice sets, and business rules. Direct translation of `world.ts` types into Dataverse schema. |
| `03_screen_map.md` | *(Planned)* Screen-by-screen build instructions for the Canvas App. Maps each React page to a Power Apps screen with layout coordinates, control types, and data source bindings. |
| `04_role_matrix.md` | *(Planned)* Role-permission matrix. Maps each role (data-entry, area-biologist, senior-biologist) to visible screens, available actions, data scope, and nav labels. |
| `05_power_automate_flows.md` | *(Planned)* Flow definitions for survey status transitions, approval routing, notification triggers, and audit logging. |
| `06_validation_rules.md` | *(Planned)* Business rule and validation logic specifications. Translates the validation engine from `world.ts` validation cases into Dataverse business rules and Canvas App formulas. |
| `07_seed_data/` | Seed data files (JSON/CSV) for Species, Waters, Stations, Surveys, FishRecords, ValidationCases, and Trends. Pre-populated from `world.ts` constants. |
| `08_ux_style_guide.md` | *(Planned)* Color tokens, typography, spacing, and component styling to match the React demo's Tailwind CSS theme. |

---

## How to Use This Kit Step by Step

### Phase 1: Understand the Source Application

1. **Read `01_repo_inventory.md` thoroughly.** It documents every page, route, component, data type, role behavior, and known issue. This is your ground truth.
2. **Run the React demo locally** (`npm install && npm run dev`) to click through all screens with all three roles. Use the RoleIndicator dropdown to switch roles.
3. **Pay special attention to**:
   - How the Dashboard changes completely depending on the active role.
   - How the Validation page shows different action buttons per role.
   - How the sidebar collapses and which nav items appear per role.
   - How survey status changes persist (currently via `sessionStorage` -- this is a known issue).

### Phase 2: Set Up the Dataverse Foundation

4. **Create the Dataverse environment** with the naming convention `CPW-Fisheries-{Dev|Test|Prod}`.
5. **Create tables** from `02_dataverse_schema.md`:
   - `cpw_Species` (reference data, 7 rows)
   - `cpw_Water` (reference data, 7 rows)
   - `cpw_Station` (reference data, ~15 rows, linked to Water)
   - `cpw_Survey` (transactional, linked to Water + Station)
   - `cpw_FishRecord` (transactional, linked to Survey)
   - `cpw_ValidationCase` (transactional, linked to Survey)
   - `cpw_ValidationIssue` (transactional, linked to ValidationCase)
   - `cpw_Trend` / `cpw_TrendPoint` (analytical, linked to Water)
6. **Create Choice sets**: `SurveyStatus` (7 values), `Protocol` (4 values), `Region` (2+ values), `RecordStatus` (valid/warning/error), `ValidationSeverity` (Error/Warning), `ValidationCode` (6 values).
7. **Import seed data** from `07_seed_data/` using the Dataverse import wizard or a Power Automate flow.

### Phase 3: Build the Canvas App

8. **Create the app shell**: Tablet layout, 1366x768. Add a persistent left sidebar component (64px collapsed, 288px expanded on hover).
9. **Build screens in dependency order**:
   - `scrDashboard` (routes to role-specific sub-screens)
   - `scrWaterSelect` (water picker list)
   - `scrWaterProfile` (water detail with charts)
   - `scrSurveyUpload` (file upload + metadata detection)
   - `scrValidation` (data grid + issues panel)
   - `scrQueryBuilder` (filter panel + condition builder + live preview)
   - `scrInsights` (trend charts + statistical summary)
   - `scrActivityFeed` (filterable survey list grouped by water)
10. **Implement role-based visibility** using `If(varCurrentRole = "data-entry", ...)` patterns on every screen and action button.
11. **Wire data sources** using `ClearCollect`, `Filter`, `LookUp`, and delegable queries against Dataverse.

### Phase 4: Implement Workflows

12. **Survey status transitions**: Replace the React `DemoContext.updateSurveyStatus()` with `Patch()` calls against `cpw_Survey.Status`.
13. **Approval flow**: Power Automate flow triggered by `Patch()` to `Pending Approval` status. Route to the appropriate Area Biologist based on Water.Region.
14. **Validation engine**: Implement validation rules as Canvas App formulas or a Power Automate flow that runs on upload, producing `cpw_ValidationIssue` records.

### Phase 5: Test and Validate

15. **Test each role persona end-to-end** using the demo flow described in the React source.
16. **Verify known issues are resolved** (see below).
17. **Performance test** with realistic data volumes (hundreds of surveys, thousands of fish records).

---

## Known Limitations and Assumptions

### Known Issues from the React Demo (Must Be Fixed in Power Apps)

| # | Issue | React Behavior | Required Power Apps Fix |
|---|---|---|---|
| 1 | **Session storage persistence** | Status overrides stored in `sessionStorage` via `DemoContext`. Lost on refresh, not shared across tabs, not truly persisted. | **Write status changes directly to Dataverse** using `Patch(cpw_Survey, ...)`. No client-side override layer needed. |
| 2 | **Approved surveys disappear** | After approving a survey on the Validation page, it vanishes from the Activity Feed and Dashboard review queue because `buildActivityFeed()` filters out Approved/Published statuses. | **Approved/Published surveys must remain visible** under the "Approved / Published" filter in the Activity Feed. Ensure `matchesStatusFilter("approved")` includes them, and the Dashboard "Review Queue" only hides them from the pending queue while a separate "Recently Approved" section shows them. |
| 3 | **Hard-coded South Platte default** | Several pages (`Insights`, `Validation`) fall back to `south-platte` when no `waterId` query param is provided. | **Use navigation context** (e.g., `varSelectedWaterId`) to carry the selected water across screens. Never hard-code a default water body. |

### Assumptions

- **Single-tenant deployment**: The app will be deployed within a single CPW Azure AD tenant.
- **Role assignment**: Roles are assigned via Dataverse security roles or a `cpw_UserRole` lookup table, not via a demo dropdown. The RoleIndicator from the React demo is for demonstration purposes only and should be replaced with actual role resolution.
- **Data volumes**: The seed data is small (7 waters, ~15 surveys, ~50 fish records). Production will have hundreds of waters, thousands of surveys, and hundreds of thousands of fish records. Delegation limits must be considered.
- **Charts**: The React demo uses Recharts (line charts, bar charts, area charts). Power Apps Canvas charts are limited. Consider embedding Power BI visuals for the Insights and WaterProfile trend charts.
- **File upload**: The React demo simulates file upload with drag-and-drop. Power Apps file upload uses the Attachments control or a custom connector. The actual parsing of Excel/CSV survey files will require a Power Automate flow or Azure Function.
- **Offline access**: Not required for initial release. All operations require Dataverse connectivity.
- **Comparison waters**: The React demo includes 2 "Comparison" region waters (Blue River, Colorado River) used exclusively for the Senior Biologist's cross-water comparison mode. These are real waters but outside the Northeast management region.

---

## Architecture Summary

```
React Demo Architecture          Power Apps Target Architecture
========================         ==============================

React Router (8 routes)    -->   Canvas App (8 screens)
RoleContext (React state)  -->   Dataverse security roles + varCurrentRole
DemoContext (sessionStorage) --> Dataverse (direct Patch/Filter)
world.ts (static data)    -->   Dataverse tables (cpw_*)
Tailwind CSS               -->   Canvas App themes + style constants
Recharts                   -->   Power Apps Charts / embedded Power BI
CollapsibleSidebar         -->   Canvas App Component (sidebar)
```

### Data Flow in the React Demo

```
world.ts (static arrays)
    |
    v
DemoContext (applies sessionStorage overrides to survey statuses)
    |
    v
Pages consume useDemo().surveys (filtered/sorted per page)
    |
    v
User actions call updateSurveyStatus() --> sessionStorage + React state
```

### Target Data Flow in Power Apps

```
Dataverse Tables (cpw_*)
    |
    v
Canvas App screens use Filter(), LookUp(), Search() against Dataverse
    |
    v
User actions call Patch(cpw_Survey, ...) --> Dataverse persists immediately
    |
    v
Power Automate triggers on status change --> notifications, audit log
```
