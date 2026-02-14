# Power Apps Platform Alignment Pass

This branch (`demo-powerapps-aligned`) applies a conservative, mechanistic alignment to the ADAMAS React demo, reducing visual and interactive expressiveness to what Microsoft Power Apps Canvas Apps can reliably reproduce. Business logic, data models, routes, and labels are preserved. Only visuals, interactions, layout primitives, and platform-incompatible patterns were changed.

## Top 5 Changes

1. **Font stack:** Replaced IBM Plex Sans (Google Fonts) with `'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif` — the native Power Apps font.

2. **Sidebar interaction model:** Converted the hover-to-expand collapsible sidebar to a click-to-toggle pattern. Removed the animated width transition (200ms cubic-bezier) for immediate show/hide.

3. **Hover tooltips to visible text:** Replaced all Radix UI hover-only tooltips in the Validation screen with visible inline helper text, so error details and protocol info are always readable without hover.

4. **Drag-and-drop removal:** Replaced the drag-and-drop file upload zone with a click-only file selector, matching the Power Apps Attachments control behavior.

5. **Flat design enforcement:** Removed SVG gradients from charts (replaced with flat fills), constrained all box-shadows to minimal elevation (`0 1px 2px rgba(0,0,0,0.04)`), and removed all CSS `transition-colors` / `transition-opacity` animations.

## Key Documents

| File | Purpose |
|---|---|
| [`AUDIT.md`](./AUDIT.md) | Machine-friendly log of every edit with search/replace details and rationale |
| [`PARITY_FLAGS.md`](./PARITY_FLAGS.md) | Features that cannot be fully reproduced in Power Apps, with severity and suggested fallbacks |
| [`control_name_checklist.md`](./control_name_checklist.md) | All Power Fx control names mapped to screens and purposes |
| [`visual_tokens.json`](./visual_tokens.json) | Color, spacing, and elevation tokens for Power Apps alignment |
| [`PR_TEMPLATE.md`](./PR_TEMPLATE.md) | Pull request template with testing instructions |

## How to Test Locally

```bash
# Install dependencies
npm install

# Verify clean build
npm run build

# Start dev server
npm run dev
```

Then visit all 8 routes:
- `/` — Dashboard (switch roles with the dropdown)
- `/water` — Water Select
- `/water/profile?waterId=south-platte` — Water Profile
- `/upload` — Survey Upload
- `/validation` — Validation
- `/query` — Query Builder
- `/insights?waterId=south-platte` — Insights
- `/activity-feed` — Activity Feed

## Note on Control Names

If anything in the formulas (`powerapps_kit/05_powerfx_formulas.md`) references a control name not present in the demo, open [`control_name_checklist.md`](./control_name_checklist.md) to add it. The checklist is the single source of truth for mapping formula references to screen placement.
