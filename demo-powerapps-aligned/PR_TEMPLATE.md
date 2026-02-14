## Summary of Changes

This PR performs a conservative platform-alignment pass on the ADAMAS React demo, constraining visuals and interactions to what can be reliably reproduced in a Microsoft Power Apps Canvas App.

### Key changes:
- **Fonts:** Replaced IBM Plex Sans with Segoe UI system font stack
- **Sidebar:** Converted hover-to-expand to click-to-toggle; removed animated width transition
- **Tooltips:** Replaced hover-only tooltips with visible inline helper text
- **Drag-and-drop:** Replaced drag-drop upload zone with click-only file selector
- **Gradients/Shadows:** Replaced SVG gradient with flat fill; constrained box-shadows to minimal elevation
- **Transitions:** Removed CSS `transition-colors` and `transition-opacity` throughout
- **Sticky positioning:** Removed `position: sticky` from panels
- **Design tokens:** Added `powerapps-tokens.css` with 8px spacing grid and color mappings

### No changes to:
- Business logic, data model, or state management
- Route configuration or navigation structure
- User-facing labels (except drag-drop copy adjustment)

## How to Test

```bash
npm install
npm run build    # Verify clean compilation
npm run dev      # Start dev server, check all 8 routes
```

### Routes to verify:
1. `/` — Dashboard (all 3 role views)
2. `/water` — Water Select
3. `/water/profile?waterId=south-platte` — Water Profile
4. `/upload` — Survey Upload (click file select, verify no drag-drop)
5. `/validation` — Validation (check inline error text, no hover tooltips)
6. `/query` — Query Builder
7. `/insights?waterId=south-platte` — Insights
8. `/activity-feed` — Activity Feed

### Sidebar test:
- Click sidebar to expand/collapse (should be immediate, no animation)
- Verify navigation links work when expanded

## Screenshots

Screenshots saved under `demo-powerapps-aligned/sanity-screenshots/` (if available).

## Parity Flags

See `demo-powerapps-aligned/PARITY_FLAGS.md` for features that cannot be fully reproduced in Power Apps:
- **High:** Recharts interactive charts, SVG station visualization, visual query builder
- **Medium:** Collapsible sidebar, progress bars, animation utilities
- **Low:** Dark mode, demo role switcher, breadcrumbs
