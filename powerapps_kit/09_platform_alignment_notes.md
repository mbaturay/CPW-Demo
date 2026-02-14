# Platform Alignment Notes

> This document links the Power Apps kit to the platform alignment pass performed on the `demo-powerapps-aligned` branch.

## What is the alignment pass?

The `demo-powerapps-aligned` branch applies a conservative visual and interaction alignment to the React demo, constraining it to what can be reliably reproduced in a Microsoft Power Apps Canvas App. No business logic was changed.

## Where to find details

| Document | Location | Purpose |
|---|---|---|
| **Audit log** | `demo-powerapps-aligned/AUDIT.md` | Every file changed, exact edits, rationale |
| **Parity flags** | `demo-powerapps-aligned/PARITY_FLAGS.md` | Features that cannot be reproduced in Power Apps |
| **Control name checklist** | `demo-powerapps-aligned/control_name_checklist.md` | All Power Fx control names mapped to screens |
| **Visual tokens** | `demo-powerapps-aligned/visual_tokens.json` | Color, spacing, elevation tokens for Power Apps |
| **PR template** | `demo-powerapps-aligned/PR_TEMPLATE.md` | How to review and test |

## Dev-time caveats

1. **Recharts charts** are retained in the demo for visual reference but cannot be directly reproduced in Power Apps. Use the Power Apps Chart control for simple charts, or embed Power BI for complex visualizations.

2. **StationViz (SVG)** is retained as a visual placeholder. In Power Apps, replace with a static image or the premium Map control.

3. **CollapsibleSidebar** was converted from hover-to-expand to click-to-toggle. In Power Apps, implement using a left-nav container with a toggle button that sets a `locNavExpanded` variable.

4. **Hover tooltips** were replaced with visible inline text. This is the recommended approach for Power Apps, where hover events are not available on most controls.

5. **Drag-and-drop upload** was replaced with click-only file selection. Power Apps uses the Attachments control for file upload.

6. **CSS transitions/animations** were removed throughout. Power Apps does not support CSS animations. All state changes are immediate.

7. **The existing `09_control_naming_checklist.md` file** in this folder contains the same control names. The `demo-powerapps-aligned/control_name_checklist.md` file adds screen placement and purpose columns for additional context.
