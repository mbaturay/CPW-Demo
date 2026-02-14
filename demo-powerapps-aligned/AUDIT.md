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

---

## Canvas Aesthetic Simulation Pass

> Date: 2026-02-13
> Purpose: Make layouts and interaction patterns feel like what a Canvas App actually delivers on screen. Summary strips replace stat card grids, command bars consolidate primary actions, table density reduced, hover interactions removed, elevation minimized.

### 29. `src/app/pages/Dashboard.tsx` (Aesthetic Simulation)
- **Edit 1:** Replaced 2-column stat card grid (4 Card components) with horizontal summary strip (`flex divide-x divide-border` in single container).
  - Rationale: Canvas Apps use label rows inside a horizontal container, not individual card controls for summary stats.
- **Edit 2:** Added command bar below header with "View All Surveys" and "Run Analysis" buttons.
  - Rationale: Canvas screens have a command bar at the top for primary actions.
- **Edit 3:** Removed duplicate "View All" button from Review Queue card header and "View Analysis" button from Species Concern card.
  - Rationale: Actions consolidated to command bar.
- **Edit 4:** Flattened species-of-concern card — replaced `border-destructive/20 bg-destructive/[0.02]` with standard `border border-border`.
  - Rationale: Canvas containers don't use decorative colored borders.
- **Edit 5:** Removed `shadow-sm` from all Card classNames.
- **Edit 6:** Changed review/waters sections from side-by-side to stacked vertical with `space-y-6`.

### 30. `src/app/pages/DataEntryDashboard.tsx` (Aesthetic Simulation)
- **Edit 1:** Replaced stat card grid (3 stat cards + 1 action card) with summary strip (3 inline stat cells).
  - Rationale: Summary strip is more Canvas-faithful than a grid of cards.
- **Edit 2:** Added command bar with Upload Survey Data button and assignment context text.
  - Rationale: Upload action moved from card grid to command bar.
- **Edit 3:** Removed role scope info banner (moved to command bar context).
- **Edit 4:** Removed `Info` import (unused after banner removal).
- **Edit 5:** Removed `shadow-sm` from all Card classNames.

### 31. `src/app/pages/SeniorBiologistDashboard.tsx` (Aesthetic Simulation)
- **Edit 1:** Replaced 2-column stat card grid with horizontal summary strip (4 inline stat cells).
- **Edit 2:** Flattened waters-requiring-attention card — replaced `border-destructive/20 bg-destructive/[0.02]` with standard `border border-border`.
- **Edit 3:** Removed `shadow-sm` from all Card classNames.

### 32. `src/app/pages/Validation.tsx` (Aesthetic Simulation)
- **Edit 1:** Replaced 2-column stat card grid with horizontal summary strip (4 inline stat cells with icons).
- **Edit 2:** Removed hover backgrounds from validation data table rows (`bg-destructive/[0.02] hover:bg-destructive/[0.04]` → `bg-destructive/[0.03]`).
- **Edit 3:** Removed `shadow-sm` from all Card classNames.

### 33. `src/app/pages/WaterProfile.tsx` (Aesthetic Simulation)
- **Edit 1:** Replaced biologist-view stat card grid with summary strip.
- **Edit 2:** Replaced data-entry-view stat card grid with summary strip.
- **Edit 3:** Flattened management notes card — replaced `border-warning/20 bg-warning/[0.02]` with standard `border border-border`.
- **Edit 4:** Removed `hover:bg-muted/20` from survey card items and station buttons.
- **Edit 5:** Removed `shadow-sm` from all Card classNames.

### 34. `src/app/pages/ActivityFeed.tsx` (Aesthetic Simulation)
- **Edit 1:** Increased survey row padding from `p-4` to `px-4 py-5`.
  - Rationale: Canvas gallery rows have larger template heights than typical web table rows.
- **Edit 2:** Removed `shadow-sm` from all Card classNames.

### 35. `src/app/pages/QueryBuilder.tsx` (Aesthetic Simulation)
- **Edit:** Removed `hover:text-destructive hover:bg-destructive/10` from condition remove button.
  - Rationale: No hover states in Canvas Apps.
- **Edit 2:** Removed `shadow-sm` from all Card classNames.

### 36. `src/app/pages/SurveyUpload.tsx` (Aesthetic Simulation)
- **Edit:** Removed `shadow-sm` from all Card classNames (5 occurrences).

### 37. `src/app/pages/Insights.tsx` (Aesthetic Simulation)
- **Edit:** Removed `shadow-sm` from all Card classNames (7 occurrences).

### 38. `src/app/pages/WaterSelect.tsx` (Aesthetic Simulation)
- **Edit 1:** Removed `hover:bg-muted/20` from water list items.
- **Edit 2:** Removed `shadow-sm` from Card className.

### 39. `src/app/components/CollapsibleSidebar.tsx` (Aesthetic Simulation)
- **Edit:** Removed `hover:bg-white/10 hover:text-white` from inactive nav links.
  - Rationale: No hover states in Canvas Apps. Nav items now static `text-white/60`.

### 40. `src/app/components/Navigation.tsx` (Aesthetic Simulation)
- **Edit:** Removed `hover:bg-muted/50` from nav links.

### 41. `src/app/components/Breadcrumb.tsx` (Aesthetic Simulation)
- **Edit:** Changed `hover:text-foreground` to always-visible `text-primary underline visited:text-primary`.
  - Rationale: Links must be visually identifiable without hover. Canvas Apps don't have hover states.

### 42. `src/app/components/ui/table.tsx` (Aesthetic Simulation)
- **Edit 1:** TableRow — removed `hover:bg-muted/50` and `transition-colors`.
- **Edit 2:** TableHead — increased height `h-10` → `h-12`, padding `px-2` → `px-3`.
- **Edit 3:** TableCell — increased padding `p-2` → `px-3 py-3`.
  - Rationale: Canvas gallery rows have larger row heights. No hover states.

### 43. `src/app/components/ui/card.tsx` (Aesthetic Simulation)
- **Edit 1:** Changed `rounded-xl` → `rounded-lg` (12px → 8px radius).
  - Rationale: Canvas containers use 4-8px corner radius.
- **Edit 2:** Changed `shadow-sm` → `shadow-[0_1px_2px_rgba(0,0,0,0.04)]` (matches `--shadow-1` token).
  - Rationale: Minimal elevation to match Canvas DropShadow.Light.

---

## Top Navigation & Role Floater Pass

> Date: 2026-02-13
> Purpose: Replace the left collapsible sidebar with a horizontal top navigation bar. Relocate the role dropdown into a demo-only floating control outside page content.

### 44. `src/app/components/TopNav.tsx` (NEW)
- **Created:** Horizontal top navigation bar replacing the left sidebar.
  - Left: ADAMAS branding ("AD" mark + "ADAMAS" text + subtitle).
  - Center: Role-filtered nav links (reuses `navItems` from CollapsibleSidebar).
  - Active state: `bg-white/20 text-white font-medium` (same as sidebar).
  - ARIA: `role="navigation"`, `aria-label="Main navigation"`.
  - Sticky positioning (`sticky top-0 z-50`).

### 45. `src/app/components/RoleFloater.tsx` (NEW)
- **Created:** Demo-only floating role selector.
  - Fixed position below top nav (`fixed top-16 right-4 z-40`).
  - Contains role Select dropdown with same options as previous RoleIndicator.
  - Preserves `id="ddRole"` on the select trigger for control name parity.
  - Marked with `// DEMO-ONLY` comment and `(demo)` badge.

### 46. `src/app/Layout.tsx` (Top Nav)
- **Edit:** Replaced `<CollapsibleSidebar position="left" />` with `<TopNav />` and `<RoleFloater />`.
- **Edit:** Removed `ml-16` from `<main>` (no left sidebar margin needed).
- **Rationale:** Canvas Apps typically use top navigation, not a collapsible left panel.

### 47. `src/app/pages/*` — RoleIndicator removal (10 files)
- **Edit:** Removed `import { RoleIndicator }` and `<RoleIndicator />` from:
  Dashboard, DataEntryDashboard, SeniorBiologistDashboard, WaterSelect,
  WaterProfile, SurveyUpload, Validation, QueryBuilder, Insights, ActivityFeed.
- **Rationale:** Role selection is now centralized in the RoleFloater component
  rendered by Layout. Per-page role dropdowns are no longer needed.

### Preserved
- `CollapsibleSidebar.tsx` file retained (exports `navItems` used by TopNav).
- `RoleIndicator.tsx` file retained (no longer imported by any page).
- All routing, role-based display logic, and business logic unchanged.
- ARIA labels preserved on navigation.

---

## Typography Scale Pass

> Date: 2026-02-13
> Purpose: Increase typography scale globally to a noticeably larger, Canvas-app-like feel (option B). Centralized via CSS overrides — zero JSX files touched for font sizes.

### Approach

The codebase uses 470+ hardcoded `text-[Xpx]` Tailwind arbitrary values across 18 files.
Instead of editing each one, CSS attribute selectors in `theme.css` remap all sizes centrally.
Tailwind utility classes (`text-sm`, `text-xs`) are overridden via `@theme` in the same file.

### 48. `src/styles/powerapps-tokens.css` (Typography Scale)
- **Edit:** Added `--typo-*` CSS custom properties documenting the scale mapping.
  - `--typo-helper: 12px` (was 11px), `--typo-label: 13px` (was 12px),
    `--typo-body-sm: 14px` (was 13px), `--typo-body: 15px` (was 14px),
    `--typo-section: 18px` (was 16px), `--typo-subtitle: 20px` (was 18px),
    `--typo-title: 26px` (was 22px), `--typo-stat: 28px` (was 24px).

### 49. `src/styles/theme.css` (Typography Scale)
- **Edit 1:** Added `--text-xs: 13px` and `--text-sm: 15px` to `@theme inline` block.
  - Rationale: Bumps Tailwind `text-xs` (12→13) and `text-sm` (14→15) globally.
    Affects button.tsx, table.tsx, and all components using these utility classes.
- **Edit 2:** Added 10-line CSS override block using `[class*="text-[Xpx]"]` attribute selectors:
  - `text-[9px]→10, [10]→11, [11]→12, [12]→13, [13]→14, [14]→15` (+1px each)
  - `text-[16px]→18, [18]→20` (+2px each, section headers)
  - `text-[22px]→26, [24]→28` (+4px each, titles and stat numbers)
  - Uses `!important` to override Tailwind's JIT-generated utilities.
  - Covers all 470 occurrences across 18 files without touching any JSX.
- **Edit 3:** Updated `@layer base` line-heights from `1.5` to `1.55` for h1-h4, label, button, input.

### 50. `src/app/components/ui/table.tsx` (Typography Scale)
- **Edit:** Bumped TableCell padding from `py-3` (12px) to `py-3.5` (14px).
  - Rationale: Slightly more row height to accommodate larger text (+1px from text-sm bump).

### Old vs New sizes

| Element | Old | New | Delta |
|---|---|---|---|
| Page titles (`text-[22px]`) | 22px | 26px | +4 |
| Stat numbers (`text-[24px]`) | 24px | 28px | +4 |
| Section headers (`text-[16px]`) | 16px | 18px | +2 |
| Branding/subtitle (`text-[18px]`) | 18px | 20px | +2 |
| Body text (`text-[13px]`) | 13px | 14px | +1 |
| Body/nav text (`text-[14px]`) | 14px | 15px | +1 |
| Small labels (`text-[12px]`) | 12px | 13px | +1 |
| Helper text (`text-[11px]`) | 11px | 12px | +1 |
| Tailwind `text-sm` | 14px | 15px | +1 |
| Tailwind `text-xs` | 12px | 13px | +1 |
| Base line-height | 1.5 | 1.55 | +0.05 |
| Table cell padding | py-3 (12px) | py-3.5 (14px) | +2px |

### Regression checks
- TopNav: 6 nav items fit at 1366px with no wrapping.
- RoleFloater: stays compact, no overlap with page headers.
- Summary strips: stat numbers (28px) do not overflow containers.
- Validation table: 10 rows render cleanly with increased padding.
- Hierarchy preserved: titles (26px) > sections (18px) > body (14px) > helpers (12px).

---

## Typography Scale Pass (v2)

> Date: 2026-02-13
> Purpose: Lift baseline (body/label) typography one more step for Canvas readability.
> Headings, titles, and stat numbers are NOT changed — only text ≤ 14px source.

### 51. `src/styles/theme.css` (Typography v2)
- **Edit 1:** `@theme` overrides bumped:
  - `--text-xs`: 13px → **14px** (+1)
  - `--text-sm`: 15px → **16px** (+1)
  - Added `--text-base: 17px` (+1 from Tailwind default 16px)
- **Edit 2:** CSS attribute-selector block restructured into two sections:
  - **Body/labels (source ≤ 14px):** each bumped +1px from v1 (now +2 total from original).
    `text-[9px]→11, [10]→12, [11]→13, [12]→14, [13]→15, [14]→16`
  - **Headings/stats (source ≥ 16px):** unchanged from v1.
    `text-[16px]→18, [18]→20, [22]→26, [24]→28`

### 52. `src/styles/powerapps-tokens.css` (Typography v2)
- **Edit:** Updated `--typo-*` documentation tokens to reflect v2 values:
  - `--typo-helper`: 12→**13px**, `--typo-label`: 13→**14px**,
    `--typo-body-sm`: 14→**15px**, `--typo-body`: 15→**16px**.
  - Section/title/stat tokens unchanged.

### v1 → v2 diff (body/labels only)

| Element | v1 | v2 | Delta |
|---|---|---|---|
| Helper text (`text-[11px]`) | 12px | **13px** | +1 |
| Small labels (`text-[12px]`) | 13px | **14px** | +1 |
| Body text (`text-[13px]`) | 14px | **15px** | +1 |
| Body/nav text (`text-[14px]`) | 15px | **16px** | +1 |
| Tailwind `text-xs` | 13px | **14px** | +1 |
| Tailwind `text-sm` | 15px | **16px** | +1 |
| Tailwind `text-base` | 16px | **17px** | +1 |

### Unchanged from v1

| Element | Size |
|---|---|
| Page titles (`text-[22px]`) | 26px |
| Stat numbers (`text-[24px]`) | 28px |
| Section headers (`text-[16px]`) | 18px |
| Branding/subtitle (`text-[18px]`) | 20px |

### Regression checks
- TopNav: 6 nav items fit at 1366px, no wrapping.
- RoleFloater: compact, no overlap.
- Validation table: rows readable, not overly tall.
- Hierarchy preserved: titles (26) > sections (18) > body (15–16) > helpers (13).
