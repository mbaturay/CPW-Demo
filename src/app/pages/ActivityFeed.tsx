import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
// POWERAPPS-ALIGNMENT: Removed ChevronDown/ChevronRight — accordion flattened to always-expanded list
import { Link } from 'react-router';

import { waters, getWaterById } from '../data/world';
import type { SurveyStatus } from '../data/world';
import { useDemo } from '../context/DemoContext';

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
  const neWaters = waters.filter(w => w.region === 'Northeast');
  const neWaterIds = useMemo(() => new Set(neWaters.map(w => w.id)), [neWaters]);

  // All NE surveys (no status filtering)
  const allNeSurveys = useMemo(
    () => surveys.filter(s => neWaterIds.has(s.waterId)).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [surveys, neWaterIds],
  );

  // Filter state
  const [waterFilter, setWaterFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dateFrom, setDateFrom] = useState('');

  // POWERAPPS-ALIGNMENT: Removed collapsible accordion state.
  // Canvas Apps do not support expand/collapse toggles on Gallery items.

  // Derive filtered list
  const filtered = useMemo(() => {
    return allNeSurveys.filter(s => {
      if (waterFilter !== 'all' && s.waterId !== waterFilter) return false;
      if (!matchesStatusFilter(s.status, statusFilter)) return false;
      if (dateFrom && s.date < dateFrom) return false;
      return true;
    });
  }, [allNeSurveys, waterFilter, statusFilter, dateFrom]);

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
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border px-8 py-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-semibold text-primary">All Survey Activity — Northeast Region</h1>
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
            <span className="font-medium text-foreground">Regional Scope Active</span> — Northeast Basin
          </p>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="max-w-[1280px] mx-auto space-y-6">

          {/* Filters */}
          <Card className="border border-border">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-[16px]">Filters</CardTitle>
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
                      {neWaters.map(w => (
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

              return (
                <Card key={water.waterId} className="border border-border">
                  <CardHeader className="border-b border-border/50">
                    <div className="flex items-center justify-between">
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
                          className="flex items-center justify-between px-4 py-5 border border-border/50 rounded bg-white"
                        >
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
    </div>
  );
}
