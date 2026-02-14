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
