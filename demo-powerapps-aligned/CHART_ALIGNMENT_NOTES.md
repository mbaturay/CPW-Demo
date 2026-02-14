# Chart Alignment Notes

> This document summarizes the chart simplification pass performed on the `demo-powerapps-aligned` branch.

## Motivation

Power Apps Canvas App chart controls support single-series bar/line/pie charts with basic axis labels and data-point values. They do **not** support:
- Multi-series overlays or compare modes
- Interactive legends (click-to-toggle series)
- Custom tooltips (styled popups with shadows, icons, or multi-line content)
- Custom dot/marker renderers (SVG render functions)
- Area fills under line series
- Rounded bar corners (`radius` prop)

The React demo used all of these features via Recharts. This pass simplifies every chart to match what a Power Apps Chart control can reproduce.

---

## Per-Screen Changes

### Insights.tsx (`/insights`)

**Before:**
- Multi-year population trend: compare mode toggle (Single Water / Compare Waters) with 3-series LineChart for senior biologist role
- Custom Tooltip with styled popup (white background, border, rounded corners, shadow)
- Interactive Legend component for series identification
- Custom dot styling (r=5, white stroke, activeDot r=7)
- Delta analysis section showing percentage changes across 3 basins
- Length-frequency BarChart with custom Tooltip and rounded bar corners (`radius={[4, 4, 0, 0]}`)
- Metric selector dropdown (Population / CPUE / Biomass)

**After:**
- Single-series LineChart only (no compare mode, no toggle UI)
- No Tooltip, no Legend
- No custom dots (`dot={false}`)
- Delta analysis section removed
- Length-frequency BarChart with no Tooltip, no rounded corners
- Metric selector dropdown retained (single-series switching is PA-compatible)

**Removed code:**
- `compareMode` state and toggle buttons
- Compare data preparation (`spTrend`, `brTrend`, `crTrend`, `compareData`, `getDelta`)
- Multi-basin analysis banner
- Legend import and usage (2 instances)
- Tooltip import and usage (3 instances)
- Delta analysis grid (3 basin comparison cards)

### WaterProfile.tsx (`/water/profile`)

**Before:**
- ComposedChart with Line + Area overlay for CPUE trend
- Custom dot renderer function (different radius/fill for last point vs. others)
- Custom activeDot styling (r=5, white stroke)
- Tooltip with styled popup
- Area fill (flat `rgba(27, 54, 93, 0.08)` — already simplified from gradient in pass 1)

**After:**
- Simple LineChart with single Line series
- No dots (`dot={false}`)
- No Tooltip
- No Area fill
- No custom rendering

**Removed code:**
- `ComposedChart` and `Area` imports (replaced with `LineChart`)
- `Tooltip` import
- Custom dot render function (15 lines)
- `activeDot` prop
- `Area` component

### SeniorBiologistDashboard.tsx (`/` when role=senior-biologist)

**Before:**
- BarChart with Tooltip (styled popup)
- Rounded bar corners (`radius={[4, 4, 0, 0]}`)

**After:**
- BarChart with no Tooltip
- Flat bar corners (no `radius` prop)

**Removed code:**
- `Tooltip` import
- Tooltip component with `contentStyle`
- `radius` prop from Bar

---

## Remaining Gaps

Even after this simplification, the demo retains Recharts components that are **not directly reproducible** in Power Apps. The charts serve as visual references for what the Power Apps Chart control should approximate.

| Gap | Severity | Recommendation |
|---|---|---|
| Recharts LineChart/BarChart rendering engine | Medium | Replace with Power Apps Chart control in Canvas App build |
| ResponsiveContainer (auto-sizing) | Low | Power Apps charts auto-size within their container |
| CartesianGrid styling | Low | Power Apps Chart control has built-in gridlines |
| XAxis/YAxis tick customization | Low | Power Apps Chart control has basic axis configuration |

For complex charts (multi-series, drill-down, cross-filtering), embed a **Power BI tile** instead of using the Power Apps Chart control.
