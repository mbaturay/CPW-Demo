import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { BarChart3, Info, X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router';

import { waters, getWaterById } from '../data/world';
import type { SurveyStatus, Survey } from '../data/world';
import { useDemo } from '../context/DemoContext';
import { useRole } from '../context/RoleContext';
import type { UserRole } from '../context/RoleContext';

const SCOPE_LABELS: Record<string, string> = {
  statewide: 'Statewide',
  northeast: 'Northeast Region',
  southeast: 'Southeast Region',
  northwest: 'Northwest Region',
  southwest: 'Southwest Region',
  central: 'Central Region',
};
const SCOPE_TO_REGION: Record<string, string | null> = {
  statewide: null,
  northeast: 'Northeast',
  southeast: 'Southeast',
  northwest: 'Northwest',
  southwest: 'Southwest',
  central: 'Central',
};

/** Return the default scope for a given role. */
function getDefaultScope(role: UserRole): string {
  switch (role) {
    case 'senior-biologist':
      return 'statewide';
    default:
      return 'northeast';
  }
}

/** Count surveys matching a scope (region filter). */
function countSurveysForScope(scope: string, allSurveys: Survey[]): number {
  const region = SCOPE_TO_REGION[scope];
  if (region === null) return allSurveys.length; // statewide
  const ids = new Set(waters.filter(w => w.region === region).map(w => w.id));
  return allSurveys.filter(s => ids.has(s.waterId)).length;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'flagged' | 'draft';

/** Map UI filter values to the SurveyStatus values they include */
function matchesStatusFilter(status: SurveyStatus, filter: StatusFilter): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'pending':
      return ['Pending Validation', 'Pending Approval', 'Returned for Correction'].includes(status);
    case 'approved':
      return ['Approved', 'Published'].includes(status);
    case 'flagged':
      return status === 'Flagged Suspect';
    case 'draft':
      return status === 'Draft';
  }
}

function getPrimaryAction(status: SurveyStatus): string {
  switch (status) {
    case 'Returned for Correction':
      return 'Continue';
    case 'Approved':
    case 'Published':
      return 'View';
    default:
      return 'Review';
  }
}

export default function ActivityFeed() {
  const { surveys } = useDemo();
  const navigate = useNavigate();
  const { role } = useRole();
  const [searchParams] = useSearchParams();

  // --- Read all query params upfront to avoid TDZ issues ---
  const waterIdParam = searchParams.get('waterId');
  const selectedParam = searchParams.get('selected');
  const [waterContext, setWaterContext] = useState<{ id: string; name: string } | null>(() => {
    if (!waterIdParam) return null;
    const w = getWaterById(waterIdParam);
    return w ? { id: w.id, name: w.name } : null;
  });

  // Sync water context when URL param changes (handles in-app navigation when
  // the component is already mounted — useState initialisers only run on mount)
  const prevWaterIdParam = useRef(waterIdParam);
  useEffect(() => {
    if (waterIdParam === prevWaterIdParam.current) return;
    prevWaterIdParam.current = waterIdParam;
    if (waterIdParam) {
      const w = getWaterById(waterIdParam);
      if (w) {
        setWaterContext({ id: w.id, name: w.name });
        setWaterFilter(w.id);
        return;
      }
    }
    // waterId removed or unrecognised — clear context but keep user's filter
    setWaterContext(null);
  }, [waterIdParam]);

  // --- Initial-load scope resolution with auto-fallback ---
  const isInitialLoad = useRef(true);
  const [scopeRelaxedFrom, setScopeRelaxedFrom] = useState<string | null>(null);

  // When water context is active, force statewide scope so the water is always visible
  const requestedScope = waterContext
    ? 'statewide'
    : (searchParams.get('scope') ?? getDefaultScope(role));

  // Determine effective scope: auto-relax to statewide on initial load if 0 results
  const effectiveScope = useMemo(() => {
    if (waterContext) return 'statewide'; // water context always uses statewide
    if (!isInitialLoad.current) return requestedScope;
    if (countSurveysForScope(requestedScope, surveys) > 0) return requestedScope;
    // Requested scope is empty — fallback to statewide
    return 'statewide';
  }, [requestedScope, surveys, waterContext]);

  // Track whether we relaxed + clean up `selected` param (runs once on mount)
  useEffect(() => {
    if (isInitialLoad.current) {
      if (!waterContext && effectiveScope !== requestedScope) {
        setScopeRelaxedFrom(SCOPE_LABELS[requestedScope] ?? requestedScope);
      }
      isInitialLoad.current = false;

      // Strip the `selected` param from URL after rehydrating (keep other params)
      if (selectedParam) {
        const next = new URLSearchParams(searchParams);
        next.delete('selected');
        const qs = next.toString();
        navigate(`/activity-feed${qs ? `?${qs}` : ''}`, { replace: true });
      }
    }
  }, [effectiveScope, requestedScope, waterContext, selectedParam, searchParams, navigate]);

  const scope = effectiveScope;
  const scopeLabel = SCOPE_LABELS[scope] ?? 'Northeast Region';
  const regionFilter_ = SCOPE_TO_REGION[scope];

  // Scope-aware water list
  const scopeWaters = useMemo(() => {
    if (regionFilter_ === null) return waters; // statewide — all waters
    return waters.filter(w => w.region === regionFilter_);
  }, [regionFilter_]);
  const scopeWaterIds = useMemo(() => new Set(scopeWaters.map(w => w.id)), [scopeWaters]);

  // All surveys within scope
  const allScopeSurveys = useMemo(
    () => surveys.filter(s => scopeWaterIds.has(s.waterId)).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [surveys, scopeWaterIds],
  );

  // Filter state — initialise water filter from context param
  const [waterFilter, setWaterFilter] = useState(() => waterContext?.id ?? 'all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFrom, setDateFrom] = useState('');

  // Clear water context: reset filter + strip waterId from URL
  const clearWaterContext = () => {
    setWaterContext(null);
    setWaterFilter('all');
    const next = new URLSearchParams(searchParams);
    next.delete('waterId');
    navigate(`/activity-feed${next.toString() ? `?${next}` : ''}`, { replace: true });
  };

  // Selection state — rehydrate from URL param when returning from Insights
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    if (!selectedParam) return new Set();
    return new Set(selectedParam.split(',').filter(Boolean));
  });
  const [selectionRestored, setSelectionRestored] = useState(!!selectedParam);

  // Derive filtered list
  const filtered = useMemo(() => {
    return allScopeSurveys.filter(s => {
      if (waterFilter !== 'all' && s.waterId !== waterFilter) return false;
      if (!matchesStatusFilter(s.status, statusFilter)) return false;
      if (dateFrom && s.date < dateFrom) return false;
      return true;
    });
  }, [allScopeSurveys, waterFilter, statusFilter, dateFrom]);

  // Prune selection when filters change — remove IDs no longer in visible set
  const filteredIds = useMemo(() => new Set(filtered.map(s => s.id)), [filtered]);
  useEffect(() => {
    setSelectedIds(prev => {
      const pruned = new Set([...prev].filter(id => filteredIds.has(id)));
      if (pruned.size !== prev.size) return pruned;
      return prev;
    });
  }, [filteredIds]);

  // Toggle single survey selection
  const toggleSurvey = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // Toggle all surveys in a water group
  const toggleGroup = (waterId: string, checked: boolean) => {
    const groupIds = filtered.filter(s => s.waterId === waterId).map(s => s.id);
    setSelectedIds(prev => {
      const next = new Set(prev);
      for (const id of groupIds) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  };

  // Compute group checkbox state (true / false / 'indeterminate')
  const getGroupChecked = (waterId: string): boolean | 'indeterminate' => {
    const groupIds = filtered.filter(s => s.waterId === waterId).map(s => s.id);
    const count = groupIds.filter(id => selectedIds.has(id)).length;
    if (count === 0) return false;
    if (count === groupIds.length) return true;
    return 'indeterminate';
  };

  // Navigate to Insights with selected survey IDs + water context
  const handleAnalyze = () => {
    const ids = Array.from(selectedIds).join(',');
    const mode = selectedIds.size === 2 ? 'compare' : 'aggregate';
    const params = new URLSearchParams({ selectedSurveyIds: ids, mode });
    if (waterContext) params.set('waterId', waterContext.id);
    navigate(`/insights?${params}`);
  };

  // POWERAPPS-ALIGNMENT: Removed collapsible accordion state.
  // Canvas Apps do not support expand/collapse toggles on Gallery items.

  // Group by water
  const waterGroups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const s of filtered) {
      const group = map.get(s.waterId) ?? [];
      group.push(s);
      map.set(s.waterId, group);
    }
    return Array.from(map.entries()).map(([waterId, items]) => ({
      waterId,
      name: getWaterById(waterId)?.name ?? waterId,
      items,
    }));
  }, [filtered]);

  const getStatusStyle = (status: SurveyStatus) => {
    switch (status) {
      case 'Approved': case 'Published':
        return 'bg-success/10 text-success';
      case 'Flagged Suspect': case 'Returned for Correction':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-warning/10 text-warning';
    }
  };

  return (
    <div className="min-h-screen bg-background" style={{ paddingBottom: selectedIds.size > 0 ? 72 : 0 }}>
      <header className="bg-white border-b border-border px-8 py-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-semibold text-primary">All Survey Activity — {scopeLabel}</h1>
              <p className="text-[13px] text-muted-foreground mt-1">
                {filtered.length} survey{filtered.length !== 1 ? 's' : ''} matching current filters
              </p>
            </div>

          </div>
        </div>
      </header>

      {/* Regional Scope Strip */}
      <div className="bg-muted/20 border-b border-border px-8 py-3">
        <div className="max-w-[1280px] mx-auto">
          <p className="text-[12px] text-muted-foreground">
            <span className="font-medium text-foreground">Regional Scope Active</span> — {scopeLabel}
          </p>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="max-w-[1280px] mx-auto space-y-6">

          {/* Water Profile context chip */}
          {waterContext && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded border border-primary/20 bg-primary/[0.04] text-[13px] text-foreground">
              <span>
                Filtered from Water Profile: <span className="font-medium text-primary">{waterContext.name}</span>
              </span>
              <button
                onClick={clearWaterContext}
                className="ml-auto inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear water filter"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          )}

          {/* Auto-relaxation notice */}
          {scopeRelaxedFrom && (
            <div className="flex items-start gap-2 px-4 py-3 rounded border border-blue-200 bg-blue-50 text-[13px] text-blue-800">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <p>
                No surveys found for <span className="font-medium">{scopeRelaxedFrom}</span>.
                Showing <span className="font-medium">{scopeLabel}</span> instead.
              </p>
            </div>
          )}

          {/* Filters */}
          <Card className="border border-border">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-[16px]">Filters</CardTitle>
              <p className="text-[12px] text-muted-foreground mt-1">
                Select surveys to compare or analyze across surveys.
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="filter-water" className="text-[13px]">Water</Label>
                  <Select value={waterFilter} onValueChange={setWaterFilter}>
                    <SelectTrigger id="filter-water" className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Waters</SelectItem>
                      {scopeWaters.map(w => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="filter-status" className="text-[13px]">Status</Label>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                    <SelectTrigger id="filter-status" className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending / In Review</SelectItem>
                      <SelectItem value="approved">Approved / Published</SelectItem>
                      <SelectItem value="flagged">Flagged Suspect</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="filter-date" className="text-[13px]">Date From</Label>
                  <Input
                    id="filter-date"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="mt-1.5 text-[12px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Water-Grouped Activity */}
          <div className="space-y-4">
            {waterGroups.length === 0 && (
              <Card className="border border-border">
                <CardContent className="py-12 text-center">
                  <p className="text-[14px] text-muted-foreground">No surveys match the current filters.</p>
                </CardContent>
              </Card>
            )}

            {waterGroups.map((water) => {
              const pendingCount = water.items.filter(
                s => s.status === 'Pending Validation' || s.status === 'Pending Approval',
              ).length;
              const groupChecked = getGroupChecked(water.waterId);

              return (
                <Card key={water.waterId} className="border border-border">
                  <CardHeader className="border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={groupChecked}
                          onCheckedChange={(checked) => toggleGroup(water.waterId, !!checked)}
                          aria-label={`Select all surveys for ${water.name}`}
                        />
                        <div>
                          <Link
                            to={`/water/profile?waterId=${water.waterId}`}
                            className="text-[16px] font-semibold text-primary"
                          >
                            {water.name}
                          </Link>
                          <p className="text-[12px] text-muted-foreground mt-0.5">
                            {water.items.length} survey{water.items.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      {pendingCount > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground">
                            {pendingCount} pending review
                          </span>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {water.items.map((survey) => (
                        <div
                          key={survey.id}
                          className={`flex items-center justify-between px-4 py-5 border rounded bg-white ${
                            selectedIds.has(survey.id) ? 'border-primary/40 bg-primary/[0.02]' : 'border-border/50'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <Checkbox
                              checked={selectedIds.has(survey.id)}
                              onCheckedChange={(checked) => toggleSurvey(survey.id, !!checked)}
                              aria-label={`Select survey ${survey.id}`}
                            />
                            <div className="flex items-center gap-6">
                              <div>
                                <p className="text-[13px] font-mono text-primary font-medium">{survey.id}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  Station {survey.stationId}
                                </p>
                              </div>
                              <div>
                                <p className="text-[12px] text-muted-foreground">{survey.protocol}</p>
                              </div>
                              <div>
                                <p className="text-[12px] text-muted-foreground">{survey.date}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${getStatusStyle(survey.status)}`}>
                              {survey.status}
                            </span>
                            <Link to={`/validation?surveyId=${survey.id}`}>
                              <Button variant="outline" size="sm" className="text-[12px] h-7">
                                {getPrimaryAction(survey.status)}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

        </div>
      </div>

      {/* Sticky selection action bar */}
      {selectedIds.size > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 border-t border-border"
          style={{ boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' }}
        >
          <div className="max-w-[1280px] mx-auto px-8 py-3 flex items-center justify-between">
            <p className="text-[13px] text-foreground">
              <span className="font-semibold">{selectedIds.size}</span> survey{selectedIds.size !== 1 ? 's' : ''} selected
              {selectionRestored && (
                <span className="text-muted-foreground ml-2">(restored)</span>
              )}
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="text-[12px]"
                onClick={() => { setSelectedIds(new Set()); setSelectionRestored(false); }}
              >
                Clear
              </Button>
              <Button size="sm" className="text-[12px]" onClick={handleAnalyze}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Analyze selected
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
