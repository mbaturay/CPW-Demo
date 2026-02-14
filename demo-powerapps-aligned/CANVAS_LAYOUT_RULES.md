# Canvas Layout Rules

> Constraint reference for building this app in Power Apps Canvas.
> Applied during the "Canvas Container Alignment Pass" on branch `demo-powerapps-aligned`.

---

## Core Principles

1. **Single-axis containers only.** Canvas Apps use Horizontal and Vertical containers—no CSS grid, no flexbox wrap. Every layout must decompose into a strict row or column.
2. **Max 2 columns for stat cards.** The 4-column responsive grids used in dashboards exceed what a Canvas container row can comfortably hold at 1366px. Use 2 columns (2 cards per row via Horizontal container).
3. **Stack, don't tile.** Side-by-side scroll regions (e.g., data grid beside issues panel) are fragile in Canvas. Stack them vertically so each section gets full width.
4. **No responsive breakpoints.** Canvas Apps render at a fixed resolution (typically 1366×768). Remove all `sm:`, `md:`, `lg:` grid/column overrides.
5. **No accordion / collapse toggles inside galleries.** Canvas galleries cannot host interactive expand/collapse. Use always-visible sections or separate screens.

---

## Spacing

All spacing values stay on the 8px grid used by Power Apps:

| Tailwind Class | Pixels | Use For |
|---|---|---|
| `gap-2` / `space-y-2` | 8px | Tight lists, inline items |
| `gap-4` / `space-y-4` | 16px | Card internals, form fields |
| `gap-6` / `space-y-6` | 24px | Between cards/sections |
| `gap-8` / `space-y-8` | 32px | Major page sections |
| `px-8 py-6` | 32/24 | Page header padding |
| `px-8 py-8` | 32/32 | Main content area padding |

Off-grid values (e.g., `gap-5` = 20px, `gap-7` = 28px) should be avoided.

---

## Layout Patterns Applied

### Dashboard stat cards
```
Before: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
After:  grid-cols-1 md:grid-cols-2
```
Canvas equivalent: Horizontal container with 2 cards, each `Width = Parent.Width / 2`.

### Detail panels (data + sidebar)
```
Before: grid grid-cols-1 lg:grid-cols-3   (main 2/3 + sidebar 1/3)
After:  space-y-6                          (stacked vertically)
```
Canvas equivalent: Vertical container. Each section fills full width.

### Multi-panel layouts (filter + builder + results)
```
Before: grid grid-cols-1 lg:grid-cols-4   (3 panels spanning 1+2+1)
After:  space-y-6                          (stacked vertically)
```
Canvas equivalent: Vertical container with full-width sections.

### Side-by-side upload + info
```
Before: grid grid-cols-1 lg:grid-cols-2 gap-8
After:  space-y-8
```
Canvas equivalent: Vertical container. Upload card on top, info card below.

### Grouped activity list (accordion)
```
Before: Collapsible card per water (click header to expand/collapse)
After:  Always-expanded card per water (flat list, no toggle)
```
Canvas equivalent: Gallery with group headers. All items always visible.

### Small summary grids (2-item stats)
```
Kept: grid-cols-2
```
Canvas equivalent: Horizontal container with 2 labels. Acceptable at this scale.

---

## What NOT to Do in Canvas

| Anti-pattern | Why it fails | Do instead |
|---|---|---|
| 3+ column grids | Containers only support H/V, not grid | Use 2-col max or stack |
| `lg:col-span-2` | No responsive column spanning | Full-width sections |
| Nested scroll regions side-by-side | Gallery scroll conflicts | Stack vertically |
| Accordion inside Gallery | Gallery items can't host toggles | Always-expanded flat list |
| `position: sticky` | Not supported in Canvas | Static positioning |
| Responsive breakpoints | Canvas has fixed resolution | Design for 1366px |

---

## Files Changed in Container Pass

| File | Change |
|---|---|
| `Dashboard.tsx` | 4→2 col stats, 3-col→stacked (review queue, species) |
| `DataEntryDashboard.tsx` | 4→2 col stats |
| `SeniorBiologistDashboard.tsx` | 4→2 col stats, 2-col→stacked, 3-col→stacked |
| `Validation.tsx` | 4→2 col summary, 3-col→stacked |
| `Insights.tsx` | 4→2 col summary, 3-col→stacked |
| `WaterProfile.tsx` | 4→2 col summary, 3-col→stacked (2 sections) |
| `QueryBuilder.tsx` | 3-panel→stacked |
| `SurveyUpload.tsx` | 2-col→stacked (pre-upload + post-upload) |
| `ActivityFeed.tsx` | Accordion→always-expanded flat list |

---

## Canvas Aesthetic Simulation Pass

> Added in the "Canvas Aesthetic Simulation" pass. These rules further tighten the demo's
> look-and-feel to match what a Canvas App actually delivers on screen.

### Summary Strip Pattern

Replace stat-card grids with a single horizontal container using dividers.

```
Before: grid grid-cols-1 md:grid-cols-2 → 2+ Card components
After:  single <div> with flex divide-x divide-border, inline stat cells
```

Canvas equivalent: Horizontal container with Label controls separated by Rectangle dividers.
Used in: Dashboard, DataEntryDashboard, SeniorBiologistDashboard, Validation, WaterProfile.

### Command Bar Pattern

One command bar per screen, placed directly below the header. Contains 1-3 primary actions.

```
<div className="border-b border-border bg-white px-8 py-3">
  <div className="max-w-[1280px] mx-auto flex items-center justify-between">
    <p>Context text</p>
    <div className="flex gap-2">
      <Button variant="outline" size="sm">Action 1</Button>
      <Button size="sm">Primary Action</Button>
    </div>
  </div>
</div>
```

Canvas equivalent: Horizontal container with Label + Button controls. `OnSelect` navigates or triggers workflow.
Used in: Dashboard, DataEntryDashboard.

### Table / Gallery Density

Tables use larger row heights and cell padding to match Canvas gallery proportions.

```
TableHead:  h-10 → h-12,  px-2 → px-3
TableCell:  p-2  → px-3 py-3
TableRow:   removed hover:bg-muted/50 and transition-colors
```

Canvas equivalent: Gallery with TemplateHeight = 48 or larger. No hover state.

### Elevation

All cards use `--shadow-1: 0 1px 2px rgba(0,0,0,0.04)` only.

```
card.tsx:   shadow-sm → shadow-[0_1px_2px_rgba(0,0,0,0.04)]
All pages:  removed extra shadow-sm from Card classNames (33 occurrences)
```

Canvas equivalent: Container `DropShadow = DropShadow.Light` (or None).

### Border Radius

Cards use `rounded-lg` (8px) instead of `rounded-xl` (12px). Canvas containers use 4-8px corner radius.

### Hover Removal

All hover interactions removed from app-level code:

| Component | Removed |
|---|---|
| `table.tsx` (TableRow) | `hover:bg-muted/50`, `transition-colors` |
| `CollapsibleSidebar.tsx` | `hover:bg-white/10 hover:text-white` |
| `Navigation.tsx` | `hover:bg-muted/50` |
| `WaterSelect.tsx` | `hover:bg-muted/20` |
| `WaterProfile.tsx` | `hover:bg-muted/20` (survey cards + station buttons) |
| `QueryBuilder.tsx` | `hover:text-destructive hover:bg-destructive/10` |
| `Validation.tsx` | `hover:bg-destructive/[0.04]` |
| `Breadcrumb.tsx` | `hover:text-foreground` → always-visible `text-primary underline` |

Canvas equivalent: No hover state exists. All interactions are click-first.

### Decorative Border Flattening

Cards with colored borders (e.g., `border-destructive/20 bg-destructive/[0.02]`) flattened to standard `border border-border`.

Affected: Dashboard (species concern), SeniorBiologistDashboard (waters requiring attention), WaterProfile (management notes).

### Files Changed in Aesthetic Pass

| File | Change |
|---|---|
| `Dashboard.tsx` | Stat cards → summary strip, added command bar, flattened species card, removed duplicate buttons |
| `DataEntryDashboard.tsx` | Stat cards → summary strip, added command bar, removed role scope banner |
| `SeniorBiologistDashboard.tsx` | Stat cards → summary strip, flattened attention card |
| `Validation.tsx` | Stat cards → summary strip (with icons), removed hover from table rows |
| `WaterProfile.tsx` | Stat cards → summary strip (2 views), flattened management notes, removed hover |
| `ActivityFeed.tsx` | Increased row padding (p-4 → px-4 py-5) |
| `QueryBuilder.tsx` | Removed hover from remove button |
| `WaterSelect.tsx` | Removed hover from water list items |
| `CollapsibleSidebar.tsx` | Removed hover from nav links |
| `Navigation.tsx` | Removed hover from nav links |
| `Breadcrumb.tsx` | Hover link → always-visible underline link |
| `card.tsx` | `rounded-xl` → `rounded-lg`, `shadow-sm` → shadow-1 token |
| `table.tsx` | Removed hover, increased padding/height |
| `Insights.tsx` | Removed shadow-sm from Cards |
| `SurveyUpload.tsx` | Removed shadow-sm from Cards |
