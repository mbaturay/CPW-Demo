# Power Apps Parity Flags

Features in this demo that cannot be fully reproduced in a Canvas Power App, or require additional work.

## High Severity

| File Path | Feature | Suggested Power Apps Fallback | Notes |
|---|---|---|---|
| `src/app/pages/QueryBuilder.tsx` | Visual query builder with dynamic condition add/remove | Build with repeating gallery of dropdown rows + `Collect`/`Remove` on local collection | Highest-complexity screen; achievable but requires careful gallery management and collection state |
| `src/app/components/StationViz.tsx` | SVG-based station position visualization | Use static Image control with pre-rendered map, or embed a Power Apps Map control (premium) | SVG rendering not available in Canvas Apps |

## Medium Severity — Charts (simplified but still Recharts)

| File Path | Feature | Suggested Power Apps Fallback | Notes |
|---|---|---|---|
| `src/app/pages/Insights.tsx` | Recharts LineChart + BarChart (single-series, no tooltips/legends) | Use Power Apps Chart control (single series) or embed Power BI tile | Already simplified; PA Chart control can approximate this |
| `src/app/pages/WaterProfile.tsx` | Recharts LineChart (single-series, no dots) | Use Power Apps Chart control with single line series | Already simplified from ComposedChart; close to PA-reproducible |
| `src/app/pages/SeniorBiologistDashboard.tsx` | Recharts BarChart (single-series, no tooltips) | Use Power Apps Chart control | Already simplified; single-series bar is directly PA-reproducible |

## Medium Severity

| File Path | Feature | Suggested Power Apps Fallback | Notes |
|---|---|---|---|
| `src/app/components/CollapsibleSidebar.tsx` | Collapsible sidebar navigation | Use left-nav container with toggle button; or use standard Power Apps navigation | Power Apps supports side navigation via containers but not animated collapse |
| `src/app/pages/ActivityFeed.tsx` | ~~Collapsible water-grouped sections~~ **Resolved** | Flattened to always-expanded list in Canvas Layout pass | No longer a parity concern |
| `src/styles/tailwind.css` | tw-animate-css (Tailwind animation utilities) | Remove all animation classes; use immediate state changes | Power Apps has no CSS animation support |
| `src/app/pages/WaterProfile.tsx` | Progress bars for species composition | Use Power Apps Progress Bar control or colored rectangles | Width-based progress bars require calculated Width properties |
| `src/app/pages/SeniorBiologistDashboard.tsx` | Progress bars for federal reporting compliance | Use Power Apps Progress Bar control | Same approach as above |

## Low Severity

| File Path | Feature | Suggested Power Apps Fallback | Notes |
|---|---|---|---|
| `src/styles/theme.css` | Dark mode CSS variables (`.dark` class) | Not needed; Power Apps does not support dark mode | Remove if building production Canvas App |
| `src/app/components/RoleIndicator.tsx` | Demo role switcher dropdown | Replace with `gblCurrentRole` global variable set from `cpw_AppUser` table | Demo-only feature; production uses real user roles |
| `src/app/components/Breadcrumb.tsx` | Breadcrumb navigation | Use a horizontal container with label controls and chevron icons | Straightforward to reproduce |
| `src/app/components/WaterBanner.tsx` | Water context banner with embedded StationViz | Use a horizontal container with labels; replace StationViz with static image | Layout is simple; only the SVG viz needs fallback |

## Not Applicable — UI Library Code

The following patterns exist in shadcn/ui library components (`src/app/components/ui/`) but do **not** affect Power Apps build feasibility because these React components are replaced entirely by native Power Apps controls:

- `transition-*`, `animate-*`, `duration-*` classes in ~28 ui/ component files (Select, Dialog, Accordion, Sheet, etc.)
- `hover:` styles in Button, Table, Toggle, Card (card.tsx hover:shadow-md was removed in the feasibility audit pass)

These are cosmetic library-level patterns. No action needed for Power Apps build.
