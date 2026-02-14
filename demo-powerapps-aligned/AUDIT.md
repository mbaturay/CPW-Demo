# Platform Alignment Audit Log

> Branch: `demo-powerapps-aligned`
> Date: 2026-02-13
> Purpose: Align React demo visuals and interactions to what can be reproduced in a Microsoft Power Apps Canvas App.

---

## Files Changed

### 1. `src/styles/fonts.css`
- **Edit:** Replaced Google Fonts import (`@import url(...)` for IBM Plex Sans) with a comment.
- **Rationale:** Power Apps uses Segoe UI as its native font. External font loading is not supported in Canvas Apps. System font stack used instead.

### 2. `src/styles/theme.css`
- **Edit:** Replaced `font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` with `font-family: 'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif`.
- **Rationale:** Segoe UI is the standard Power Apps font. Ensures visual parity between demo and Canvas App.

### 3. `src/styles/index.css`
- **Edit:** Added `@import './powerapps-tokens.css';` before tailwind and theme imports.
- **Rationale:** New token file provides spacing and elevation variables for Power Apps alignment.

### 4. `src/styles/powerapps-tokens.css` (NEW)
- **Created:** CSS custom properties file with 8px spacing grid (`--space-1` through `--space-8`), minimal elevation (`--shadow-1`), system font stack, and color token mappings.
- **Rationale:** Provides a single source of truth for Power Apps-compatible design tokens. Referenced by `visual_tokens.json`.

### 5. `src/app/components/CollapsibleSidebar.tsx`
- **Edit 1:** Removed `useCanHover()` hook and hover-media detection logic.
  - Rationale: Power Apps is click-first; no hover detection needed.
- **Edit 2:** Removed debounced `openSoon` / `closeSoon` hover handlers, `timerRef`, `clearTimer`, and `focusHandlers`.
  - Rationale: Hover-to-expand is not reproducible in Power Apps. Replaced with click-to-toggle.
- **Edit 3:** Replaced `onMouseEnter`/`onMouseLeave` and focus handlers with `onClick={handleToggleClick}`.
  - Rationale: Click-first interaction model.
- **Edit 4:** Removed `transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1)'` from inline style.
  - Rationale: Power Apps does not support CSS transitions; width change is now immediate.
- **Edit 5:** Replaced `shadow-lg` with `boxShadow: '0 1px 2px rgba(0,0,0,0.04)'` (minimal elevation).
  - Rationale: Power Apps supports only basic drop shadows.
- **Edit 6:** Removed `transition-opacity duration-200` from branding text spans (2 occurrences).
  - Rationale: No CSS transitions in Power Apps.
- **Edit 7:** Removed `handleLinkClick` (tap-to-expand on touch) and `transition-colors` from nav links.
  - Rationale: Simplified to click-to-toggle model.
- **Edit 8:** Removed `useEffect` import (no longer needed after removing timer cleanup).
- **Preserved:** ARIA labels (`role="navigation"`, `aria-label`), keyboard Escape handler, link labels.

### 6. `src/app/pages/Validation.tsx`
- **Edit 1:** Removed Radix UI Tooltip imports (`Tooltip`, `TooltipContent`, `TooltipProvider`, `TooltipTrigger`).
  - Rationale: Hover-only tooltips are not reproducible in Power Apps (click-first).
- **Edit 2:** Replaced hover tooltip for protocol info (HelpCircle icon) with visible inline helper text.
  - Search: `<TooltipProvider>...<TooltipContent>...Zippin's depletion method...</TooltipContent>...</TooltipProvider>`
  - Replace: `<HelpCircle /> <span>Zippin's depletion method -- 2 passes required.</span>`
  - Rationale: Essential info must be visible, not hidden behind hover.
- **Edit 3:** Replaced hover tooltips on Warning/Error status cells with visible inline text.
  - Search: `<TooltipProvider><Tooltip>...Warning...</Tooltip></TooltipProvider>` (2 occurrences)
  - Replace: `<div className="flex flex-col"><span>Warning/Error</span><span>{item.error}</span></div>`
  - Rationale: Error details must be visible without hover.
- **Edit 4:** Removed `sticky top-6` from validation issues panel Card.
  - Rationale: Power Apps does not support CSS `position: sticky`.
- **Preserved:** All business logic (approve, reject, flag, publish handlers), ARIA labels, data model.

### 7. `src/app/pages/WaterProfile.tsx`
- **Edit 1:** Removed `<linearGradient>` SVG definition from CPUE trend chart.
  - Rationale: SVG gradients cannot be reproduced in Power Apps Chart control.
- **Edit 2:** Replaced `fill="url(#cpueGradient)"` with flat fill `fill="rgba(27, 54, 93, 0.08)"`.
  - Rationale: Flat fill approximates the gradient's visual effect within Power Apps constraints.
- **Edit 3:** Removed `transition-colors` from hover interactions on survey cards and station buttons (4 occurrences).
  - Rationale: No CSS transitions in Power Apps.
- **Preserved:** All chart data, business logic, role-based views.

### 8. `src/app/pages/SurveyUpload.tsx`
- **Edit 1:** Removed `dragActive` state, `handleDrag` handler, and `handleDrop` handler.
  - Rationale: Power Apps Attachments control is click-to-browse only; drag-and-drop is not supported.
- **Edit 2:** Replaced drag-drop zone with click-only upload area.
  - Search: `onDragEnter={handleDrag}...Drag & Drop Survey File`
  - Replace: Static bordered area with `Upload Survey File` and `Click below to browse your files`.
- **Edit 3:** Removed `transition-colors` from drag zone styling.
- **Preserved:** File select handler, upload workflow, validation summary, all business logic.

### 9. `src/app/pages/QueryBuilder.tsx`
- **Edit:** Removed `sticky top-6` from Live Results panel Card.
- **Rationale:** `position: sticky` not supported in Power Apps.

### 10. `src/app/pages/Insights.tsx`
- **Edit:** Replaced `boxShadow: '0 2px 8px rgba(0,0,0,0.06)'` with `boxShadow: '0 1px 2px rgba(0,0,0,0.04)'` in chart tooltip styles (4 occurrences).
- **Rationale:** Deep shadows not reproducible in Power Apps; minimal elevation used instead.

### 11. `src/app/pages/WaterSelect.tsx`
- **Edit:** Removed `transition-colors` from water list item hover.
- **Rationale:** No CSS transitions in Power Apps.

### 12. `src/app/pages/ActivityFeed.tsx`
- **Edit:** Removed `transition-colors` from card header hover and survey item hover (2 occurrences).
- **Rationale:** No CSS transitions in Power Apps.

### 13. `src/app/components/Breadcrumb.tsx`
- **Edit:** Removed `transition-colors` from link hover.
- **Rationale:** No CSS transitions in Power Apps.

---

## New Files Created

| File | Purpose |
|---|---|
| `src/styles/powerapps-tokens.css` | CSS custom properties for Power Apps-aligned spacing, elevation, fonts, colors |
| `demo-powerapps-aligned/00_README.md` | Summary of the alignment pass |
| `demo-powerapps-aligned/AUDIT.md` | This file |
| `demo-powerapps-aligned/PARITY_FLAGS.md` | Features that cannot be fully reproduced in Power Apps |
| `demo-powerapps-aligned/control_name_checklist.md` | Control names from Power Fx formulas |
| `demo-powerapps-aligned/visual_tokens.json` | Color, spacing, and elevation tokens |
| `demo-powerapps-aligned/PR_TEMPLATE.md` | Pull request template |
| `powerapps_kit/09_platform_alignment_notes.md` | Dev-time caveats linking to audit |

---

---

## Chart Simplification Pass

> Date: 2026-02-13
> Purpose: Tighten chart UX so the React demo does not imply Power Apps chart capabilities that cannot be reproduced.

### 14. `src/app/pages/Insights.tsx` (Chart Simplification)
- **Edit 1:** Removed `Legend` and `Tooltip` from Recharts imports.
  - Rationale: Power Apps Chart control does not support interactive legends or custom tooltips.
- **Edit 2:** Removed `compareMode` state and compare mode toggle UI (Single Water / Compare Waters buttons).
  - Rationale: Multi-series compare mode is not reproducible in Power Apps.
- **Edit 3:** Removed compare mode data preparation (`spTrend`, `brTrend`, `crTrend`, `compareYears`, `compareData`, `getDelta` function, first/last point variables).
  - Rationale: Dead code after removing compare mode.
- **Edit 4:** Simplified chart subtitle — removed `compareMode` conditional.
  - Rationale: No compare mode means no conditional text.
- **Edit 5:** Replaced multi-series/single-series ternary chart with single-series LineChart only. Removed Legend, Tooltip, custom dot/activeDot. Set `dot={false}`, `strokeWidth={2}`.
  - Rationale: Power Apps Chart control shows simple lines without markers or tooltips.
- **Edit 6:** Removed compare mode analysis banner ("Multi-Basin Analysis Mode").
  - Rationale: Compare mode removed.
- **Edit 7:** Removed delta analysis section (3-basin comparison cards).
  - Rationale: Compare mode removed.
- **Edit 8:** Removed Tooltip and rounded bar corners (`radius={[4, 4, 0, 0]}`) from length-frequency BarChart.
  - Rationale: Power Apps Chart control does not support custom tooltips or rounded bar corners.

### 15. `src/app/pages/WaterProfile.tsx` (Chart Simplification)
- **Edit 1:** Replaced `ComposedChart` and `Area` imports with `LineChart` import. Removed `Tooltip` import.
  - Rationale: Power Apps Chart control does not support composed charts or area fills.
- **Edit 2:** Replaced ComposedChart (Line + Area + custom dot renderer + Tooltip + activeDot) with simple LineChart. Set `dot={false}`.
  - Rationale: Custom dot renderers and area fills are not reproducible in Power Apps.

### 16. `src/app/pages/SeniorBiologistDashboard.tsx` (Chart Simplification)
- **Edit 1:** Removed `Tooltip` import.
  - Rationale: Custom tooltips not available in Power Apps Chart control.
- **Edit 2:** Removed Tooltip component and `radius={[4, 4, 0, 0]}` from Bar.
  - Rationale: Rounded bar corners and interactive tooltips not reproducible.

---

---

## Feasibility Audit Pass

> Date: 2026-02-13
> Purpose: Practical Power Apps build feasibility audit. Identify remaining non-portable patterns, rate screens by risk, and clean up stragglers.

### Remaining non-portables found and fixed

#### 17. `src/app/pages/QueryBuilder.tsx` (Feasibility Cleanup)
- **Edit 1:** Removed `transition-colors` from Standard/Advanced mode toggle buttons (2 occurrences, lines 75, 83).
  - Rationale: CSS transitions not supported in Power Apps.
- **Edit 2:** Removed `hover:text-foreground` from inactive toggle button states.
  - Rationale: Hover color changes are cosmetic; simplifies to static styling.

#### 18. `src/app/components/Navigation.tsx` (Feasibility Cleanup)
- **Edit:** Removed `transition-colors` from nav link className (line 45).
  - Rationale: CSS transitions not supported in Power Apps.

#### 19. `src/app/components/ui/card.tsx` (Feasibility Cleanup)
- **Edit:** Removed `transition-shadow duration-150 hover:shadow-md` from Card base className (line 10).
  - Rationale: Shadow transitions not supported in Power Apps. This change affects **every Card on every screen**, removing a non-portable hover animation from the entire app.

### Non-portables noted but not fixed (library code)

The following `transition-*` and `animate-*` patterns exist in shadcn/ui library components (`src/app/components/ui/`). These are **not fixed** because:
- They are generic UI library code, not app-level code
- In Power Apps, these controls are replaced by native equivalents (Dropdown, Dialog, Toggle, etc.)
- Modifying 20+ library files would be disproportionate for no demo benefit

Affected ui/ files: `select.tsx`, `dialog.tsx`, `accordion.tsx`, `button.tsx`, `input.tsx`, `textarea.tsx`, `sidebar.tsx`, `sheet.tsx`, `popover.tsx`, `hover-card.tsx`, `navigation-menu.tsx`, `breadcrumb.tsx`, `table.tsx`, `badge.tsx`, `toggle.tsx`, `checkbox.tsx`, `radio-group.tsx`, `slider.tsx`, `scroll-area.tsx`, `alert-dialog.tsx`, `context-menu.tsx`, `dropdown-menu.tsx`, `menubar.tsx`, `tabs.tsx`, `progress.tsx`, `skeleton.tsx`, `tooltip.tsx`, `input-otp.tsx`.

### Deliverables created

| File | Purpose |
|---|---|
| `demo-powerapps-aligned/FEASIBILITY_AUDIT.md` | Screen-by-screen risk ratings, top 10 risks, MVP subset |
| `demo-powerapps-aligned/POWERAPPS_PATTERN_MAP.md` | Maps each React screen to PA controls and key formulas |

---

## Canvas Container Alignment Pass

> Date: 2026-02-13
> Purpose: Constrain layouts to what Canvas Apps horizontal/vertical containers can replicate. No responsive grids, no side-by-side scroll panels, no accordion toggles.

### Layout refactors

#### 20. `src/app/pages/Dashboard.tsx` (Canvas Layout)
- **Edit 1:** 4-column stats grid → 2-column: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` → `grid-cols-1 md:grid-cols-2`.
- **Edit 2:** 3-column review queue + station viz → stacked vertical: `grid grid-cols-1 lg:grid-cols-3` → `space-y-6`, removed `lg:col-span-2`.
- **Edit 3:** 3-column species of concern → stacked: `grid grid-cols-1 md:grid-cols-3` → `space-y-4`.

#### 21. `src/app/pages/DataEntryDashboard.tsx` (Canvas Layout)
- **Edit:** 4-column stats → 2-column: `grid-cols-1 md:grid-cols-4` → `grid-cols-1 md:grid-cols-2`, removed `md:col-span-1`.

#### 22. `src/app/pages/SeniorBiologistDashboard.tsx` (Canvas Layout)
- **Edit 1:** 4-column stats → 2-column.
- **Edit 2:** 2-column cross-water + federal → stacked: `grid grid-cols-1 lg:grid-cols-2` → `space-y-6`.
- **Edit 3:** 3-column waters requiring attention → stacked: `grid grid-cols-1 md:grid-cols-3` → `space-y-4`.

#### 23. `src/app/pages/Validation.tsx` (Canvas Layout)
- **Edit 1:** 4-column summary cards → 2-column.
- **Edit 2:** 3-column data grid + issues panel → stacked: removed `lg:col-span-2`.

#### 24. `src/app/pages/Insights.tsx` (Canvas Layout)
- **Edit 1:** 4-column summary cards → 2-column.
- **Edit 2:** 3-column chart + stats → stacked: removed `lg:col-span-2`.

#### 25. `src/app/pages/WaterProfile.tsx` (Canvas Layout)
- **Edit 1:** 4-column summary cards → 2-column.
- **Edit 2:** 3-column chart + species → stacked: removed `lg:col-span-2`.
- **Edit 3:** 3-column surveys + stations → stacked: removed `lg:col-span-2`.

#### 26. `src/app/pages/QueryBuilder.tsx` (Canvas Layout)
- **Edit 1:** 3-panel layout → stacked vertical: `grid grid-cols-1 lg:grid-cols-4` → `space-y-6`.
- **Edit 2:** Removed `lg:col-span-2` from builder panel.
- **Edit 3:** Removed `lg:col-span-1` from results panel.

#### 27. `src/app/pages/SurveyUpload.tsx` (Canvas Layout)
- **Edit 1:** Pre-upload 2-column → stacked: `grid grid-cols-1 lg:grid-cols-2 gap-8` → `space-y-8`.
- **Edit 2:** Post-upload 2-column → stacked: same pattern.

#### 28. `src/app/pages/ActivityFeed.tsx` (Canvas Layout)
- **Edit 1:** Removed `collapsed` state, `toggleWater` function, and ChevronDown/ChevronRight imports.
  - Rationale: Canvas Apps galleries cannot host expand/collapse toggles.
- **Edit 2:** Replaced collapsible CardHeader (cursor-pointer, hover:bg, chevron icons) with static header.
- **Edit 3:** Removed `{isExpanded && (` conditional wrapper around CardContent — sections always expanded.
- **Edit 4:** Removed `hover:bg-muted/20` from survey item rows and `hover:underline` from water name links.

### Deliverables created

| File | Purpose |
|---|---|
| `demo-powerapps-aligned/CANVAS_LAYOUT_RULES.md` | Layout constraint reference for Canvas container model |

---

## Copy Changes

No user-facing copy was changed except:
- `SurveyUpload.tsx`: "Drag & Drop Survey File" changed to "Upload Survey File" and "or click to browse your files" changed to "Click below to browse your files".
  - **Reason:** Drag-and-drop is not available in Power Apps; copy must reflect click-only behavior.

## Test Changes

No automated tests exist in this repo. No test changes were required.

## Accessibility Preservation

- All `aria-label` attributes preserved (CollapsibleSidebar navigation, form labels).
- Keyboard Escape handler retained on sidebar.
- Tooltip content that was previously hidden behind hover is now **more accessible** as visible inline text.
- No ARIA labels were removed.
