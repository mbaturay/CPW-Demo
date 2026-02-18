import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { FileSpreadsheet, TrendingUp, Info, BarChart3, ArrowLeft } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { WaterBanner } from '../components/WaterBanner';

import { useRole } from '../context/RoleContext';
import { Link, useSearchParams } from 'react-router';
import { getWaterById, getTrendForWater, getFishRecords } from '../data/world';
import type { Survey } from '../data/world';
import { useDemo } from '../context/DemoContext';

/** Derive per-species stats from fish records */
function buildSpeciesBreakdown(surveyId: string) {
  const records = getFishRecords(surveyId);
  if (!records) return null;
  const map = new Map<string, { count: number; totalLength: number; totalWeight: number }>();
  for (const r of records) {
    const entry = map.get(r.species) ?? { count: 0, totalLength: 0, totalWeight: 0 };
    entry.count++;
    entry.totalLength += r.length;
    entry.totalWeight += r.weight;
    map.set(r.species, entry);
  }
  return Array.from(map.entries())
    .map(([species, stats]) => ({
      species,
      count: stats.count,
      meanLength: Math.round(stats.totalLength / stats.count),
      meanWeight: Math.round(stats.totalWeight / stats.count),
    }))
    .sort((a, b) => b.count - a.count);
}

export default function Insights() {
  const { role } = useRole();
  const { surveys } = useDemo();
  const [metric, setMetric] = useState('population');
  const [searchParams] = useSearchParams();

  // ── Selection-based analysis params ──
  const selectedIdsParam = searchParams.get('selectedSurveyIds');
  const modeParam = searchParams.get('mode');

  const selectedSurveys = useMemo(() => {
    if (!selectedIdsParam) return null;
    const ids = selectedIdsParam.split(',');
    return surveys.filter(s => ids.includes(s.id));
  }, [selectedIdsParam, surveys]);

  // ── Default waterId-based params ──
  const waterId = searchParams.get('waterId') || 'south-platte';

  // ────────────────────────────────────────────────────
  // SELECTION-BASED: Empty state
  // ────────────────────────────────────────────────────
  if (selectedIdsParam && (!selectedSurveys || selectedSurveys.length === 0)) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-white border-b border-border px-8 py-6">
          <div className="max-w-[1280px] mx-auto">
            <p className="text-lg font-semibold text-primary">Insights</p>
            <p className="text-[13px] text-muted-foreground mt-1">Selection-based analysis</p>
          </div>
        </header>
        <div className="px-8 py-16 text-center">
          <div className="max-w-md mx-auto">
            <p className="text-[16px] font-medium text-foreground mb-2">No matching surveys found</p>
            <p className="text-[13px] text-muted-foreground mb-6">
              The selected survey IDs could not be matched in the current dataset.
            </p>
            <Link to="/activity-feed">
              <Button variant="outline" className="text-[13px]">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to All Survey Activity
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────
  // SELECTION-BASED: Compare mode (exactly 2 surveys)
  // ────────────────────────────────────────────────────
  if (selectedSurveys && modeParam === 'compare' && selectedSurveys.length === 2) {
    return <CompareView surveys={selectedSurveys} role={role} />;
  }

  // ────────────────────────────────────────────────────
  // SELECTION-BASED: Aggregate mode (>2 surveys)
  // ────────────────────────────────────────────────────
  if (selectedSurveys && selectedSurveys.length > 0) {
    return <AggregateView surveys={selectedSurveys} role={role} />;
  }

  // ────────────────────────────────────────────────────
  // DEFAULT: Existing waterId-based Insights view
  // ────────────────────────────────────────────────────
  // Load data from world.ts + demo overrides
  const water = getWaterById(waterId);
  const trend = getTrendForWater(waterId);
  const waterSurveys = surveys.filter(s => s.waterId === waterId);

  const waterName = water?.name ?? 'South Platte Basin';
  const waterRegion = water?.region ?? 'Northeast';
  const waterHuc = water?.huc12 ?? 'HUC12-14010001';
  const waterStations = water?.stations ?? [];
  const waterYears = water ? `${water.yearsActive.start}–${water.yearsActive.end}` : '1998–2025';

  // Derive trend data for chart
  const trendData = (trend?.overall ?? []).map(p => ({
    year: String(p.year),
    population: p.popEstimate ?? 0,
    cpue: p.cpue,
    biomass: p.biomassKg,
  }));

  const latestPoint = trend?.overall[trend.overall.length - 1];
  const prevPoint = trend?.overall.length && trend.overall.length >= 2
    ? trend.overall[trend.overall.length - 2]
    : undefined;

  // Calculate percent changes
  const popChange = latestPoint && prevPoint && latestPoint.popEstimate && prevPoint.popEstimate
    ? ((latestPoint.popEstimate - prevPoint.popEstimate) / prevPoint.popEstimate * 100).toFixed(1)
    : null;
  const cpueChange = latestPoint && prevPoint
    ? ((latestPoint.cpue - prevPoint.cpue) / prevPoint.cpue * 100).toFixed(1)
    : null;
  const biomassChange = latestPoint && prevPoint
    ? ((latestPoint.biomassKg - prevPoint.biomassKg) / prevPoint.biomassKg * 100).toFixed(1)
    : null;

  // Length-frequency data (not in world.ts — representative distribution)
  const lengthFreqData = [
    { length: '50-100', count: 234 },
    { length: '100-150', count: 456 },
    { length: '150-200', count: 892 },
    { length: '200-250', count: 1245 },
    { length: '250-300', count: 978 },
    { length: '300-350', count: 567 },
    { length: '350-400', count: 234 },
    { length: '400+', count: 89 },
  ];

  const getMetricData = () => {
    switch (metric) {
      case 'population':
        return { key: 'population', name: 'Population Estimate', color: '#1B365D' };
      case 'cpue':
        return { key: 'cpue', name: 'CPUE (fish/hour)', color: '#2F6F73' };
      case 'biomass':
        return { key: 'biomass', name: 'Biomass (kg)', color: '#5B7C99' };
      default:
        return { key: 'population', name: 'Population Estimate', color: '#1B365D' };
    }
  };

  const metricInfo = getMetricData();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border px-8 py-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-primary">Insights</p>
              <p className="text-[13px] text-muted-foreground mt-1">
                Multi-year ecological trend analysis based on validated survey data
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-3">
                {role === 'senior-biologist' && (
                  <>
                    <Button variant="outline" size="sm" className="text-[13px]">
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Export to Excel
                    </Button>
                    <Button variant="outline" size="sm" className="text-[13px]">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Open in Tableau
                    </Button>
                  </>
                )}
                <Button size="sm" className="text-[13px]">
                  Save Analysis
                </Button>
              </div>

            </div>
          </div>
        </div>
      </header>

      <WaterBanner
        waterName={waterName}
        region={waterRegion}
        watershed={waterHuc}
        stations={waterStations}
        totalSurveys={waterSurveys.length}
        yearsActive={waterYears}
      />

      {/* Regional Scope Strip for Area Biologist */}
      {role === 'area-biologist' && (
        <div className="bg-muted/20 border-b border-border px-8 py-3">
          <div className="max-w-[1280px] mx-auto">
            <p className="text-[12px] text-muted-foreground">
              <span className="font-medium text-foreground">Regional Scope Active</span> — Northeast Basin
            </p>
          </div>
        </div>
      )}

      <div className="px-8 py-8">
        <div className="max-w-[1280px] mx-auto space-y-8">

          {/* Context Banner */}
          <div className="bg-muted/20 border border-border rounded px-4 py-3">
            <p className="text-[13px] text-foreground">
              Based on <span className="font-semibold">{waterSurveys.length} surveys</span> conducted between <span className="font-semibold">{trendData[0]?.year ?? '—'}–{trendData[trendData.length - 1]?.year ?? '—'}</span> using validated protocols.
            </p>
          </div>

          {/* Summary Metric Cards */}
          {/* CANVAS-ALIGNMENT: 2-col card grid (was 4-col) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-border">
              <CardHeader className="pb-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Population Estimate
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[32px] font-semibold leading-none text-foreground">{latestPoint?.popEstimate?.toLocaleString() ?? '—'}</p>
                    {popChange && (
                      <p className="text-[12px] text-success flex items-center gap-1 mt-2">
                        <TrendingUp className="w-3.5 h-3.5" />
                        +{popChange}% from {prevPoint ? prevPoint.year : ''}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground">
                    <p>95% CI:</p>
                    <p className="font-mono">{latestPoint?.popEstimate ? `${Math.round(latestPoint.popEstimate * 0.944).toLocaleString()} - ${Math.round(latestPoint.popEstimate * 1.055).toLocaleString()}` : '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  CPUE Index
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[32px] font-semibold leading-none text-foreground">{latestPoint?.cpue ?? '—'}</p>
                    {cpueChange && (
                      <p className="text-[12px] text-success flex items-center gap-1 mt-2">
                        <TrendingUp className="w-3.5 h-3.5" />
                        +{cpueChange}% from {prevPoint ? prevPoint.year : ''}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground">
                    <p>Fish per</p>
                    <p>hour effort</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Biomass
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[32px] font-semibold leading-none text-foreground">{latestPoint?.biomassKg ?? '—'}</p>
                    {biomassChange && (
                      <p className="text-[12px] text-success flex items-center gap-1 mt-2">
                        <TrendingUp className="w-3.5 h-3.5" />
                        +{biomassChange}% from {prevPoint ? prevPoint.year : ''}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground">
                    <p>kg total</p>
                    <p>standing</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Relative Weight Avg
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[32px] font-semibold leading-none text-foreground">98.4</p>
                    <p className="text-[12px] text-muted-foreground mt-2">
                      Condition index
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground">
                    <p>Wr index</p>
                    <p>baseline 100</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Trend Chart */}
          <Card className="border border-border">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[18px]">Multi-Year Population Trend</CardTitle>
                  <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                    Based on <span className="font-medium text-foreground">{waterSurveys.length} surveys</span> conducted between{' '}
                    <span className="font-medium text-foreground">{trendData[0]?.year ?? '—'}–{trendData[trendData.length - 1]?.year ?? '—'}</span> using validated protocols
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={metric} onValueChange={setMetric}>
                    <SelectTrigger className="w-[200px] text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="population">Population Estimate</SelectItem>
                      <SelectItem value="cpue">CPUE</SelectItem>
                      <SelectItem value="biomass">Biomass (kg)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* POWERAPPS-ALIGNMENT: Single-series chart only; removed compare mode, Legend, Tooltip, custom dots */}
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="year"
                      stroke="#64748B"
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      axisLine={{ stroke: '#E2E8F0' }}
                    />
                    <YAxis
                      stroke="#64748B"
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      axisLine={{ stroke: '#E2E8F0' }}
                    />
                    <Line
                      type="monotone"
                      dataKey={metricInfo.key}
                      name={metricInfo.name}
                      stroke={metricInfo.color}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 p-4 border border-border/50 bg-muted/20 rounded flex items-start gap-3">
                <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-[11px] text-muted-foreground leading-relaxed">
                  <p className="mb-1.5">
                    <span className="font-medium text-foreground">Statistical Method:</span>{' '}
                    Population estimates calculated using Zippin's maximum likelihood depletion estimator.
                    Young of year (&lt;150mm) excluded from analysis per standard protocol.
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Data Quality:</span>{' '}
                    All surveys validated for protocol compliance and biological plausibility.
                    Confidence intervals computed at 95% level using standard error propagation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CANVAS-ALIGNMENT: Stacked vertical (was 3-col side-by-side) */}
          <div className="space-y-6">
            {/* Length-Frequency Histogram */}
            <Card className="border border-border">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="text-[18px]">Length-Frequency Distribution</CardTitle>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  Size structure analysis across all survey years
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={lengthFreqData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                      <XAxis
                        dataKey="length"
                        stroke="#64748B"
                        tick={{ fill: '#64748B', fontSize: 11 }}
                        label={{ value: 'Length (mm)', position: 'insideBottom', offset: -5, fill: '#64748B', fontSize: 11 }}
                        axisLine={{ stroke: '#E2E8F0' }}
                      />
                      <YAxis
                        stroke="#64748B"
                        tick={{ fill: '#64748B', fontSize: 11 }}
                        label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 11 }}
                        axisLine={{ stroke: '#E2E8F0' }}
                      />
                      {/* POWERAPPS-ALIGNMENT: Removed Tooltip and rounded bar corners */}
                      <Bar dataKey="count" fill="#1B365D" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 p-4 border border-border/50 bg-muted/20 rounded">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Interpretation:</span>{' '}
                    Distribution shows normal curve with peak at 200-250mm length class.
                    Multiple age classes represented. Young of year (&lt;150mm) constitute 5.6% of sample and can be excluded from population estimates if required.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Statistical Summary & Map */}
            <div className="space-y-6">
              <Card className="border border-border">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="text-[16px]">Statistical Summary</CardTitle>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Descriptive statistics
                  </p>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-[13px] p-2 border border-border/50 rounded bg-white">
                      <span className="text-muted-foreground">Mean Length</span>
                      <span className="font-mono font-medium">234 mm</span>
                    </div>
                    <div className="flex justify-between text-[13px] p-2 border border-border/50 rounded bg-white">
                      <span className="text-muted-foreground">Std Deviation</span>
                      <span className="font-mono font-medium">45.3 mm</span>
                    </div>
                    <div className="flex justify-between text-[13px] p-2 border border-border/50 rounded bg-white">
                      <span className="text-muted-foreground">Min Length</span>
                      <span className="font-mono font-medium">67 mm</span>
                    </div>
                    <div className="flex justify-between text-[13px] p-2 border border-border/50 rounded bg-white">
                      <span className="text-muted-foreground">Max Length</span>
                      <span className="font-mono font-medium">487 mm</span>
                    </div>
                    <div className="flex justify-between text-[13px] p-2 border border-border/50 rounded bg-white">
                      <span className="text-muted-foreground">Sample Size</span>
                      <span className="font-mono font-medium">4,695</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h4 className="text-[12px] uppercase tracking-wide text-muted-foreground mb-3">
                      Confidence Interval (95%)
                    </h4>
                    <div className="p-3 border border-primary/20 bg-primary/5 rounded space-y-2">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-muted-foreground">Lower Bound</span>
                        <span className="font-mono font-medium text-foreground">{latestPoint?.popEstimate ? Math.round(latestPoint.popEstimate * 0.944).toLocaleString() : '—'}</span>
                      </div>
                      <div className="flex justify-between text-[12px]">
                        <span className="text-muted-foreground">Upper Bound</span>
                        <span className="font-mono font-medium text-foreground">{latestPoint?.popEstimate ? Math.round(latestPoint.popEstimate * 1.055).toLocaleString() : '—'}</span>
                      </div>
                      <div className="flex justify-between text-[12px] pt-2 border-t border-primary/10">
                        <span className="text-muted-foreground">Margin of Error</span>
                        <span className="font-mono font-medium text-foreground">±5.7%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


// ────────────────────────────────────────────────────
// Compare View — Side-by-side (exactly 2 surveys)
// ────────────────────────────────────────────────────
function CompareView({ surveys, role }: { surveys: Survey[]; role: string }) {
  const [a, b] = surveys;
  const waterA = getWaterById(a.waterId);
  const waterB = getWaterById(b.waterId);
  const breakdownA = buildSpeciesBreakdown(a.id);
  const breakdownB = buildSpeciesBreakdown(b.id);

  const renderSurveyColumn = (survey: Survey, water: ReturnType<typeof getWaterById>, breakdown: ReturnType<typeof buildSpeciesBreakdown>) => (
    <Card className="border border-border flex-1">
      <CardHeader className="border-b border-border/50">
        <p className="text-[13px] font-mono text-primary font-medium">{survey.id}</p>
        <p className="text-[12px] text-muted-foreground mt-1">
          {water?.name ?? survey.waterId} — Station {survey.stationId}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {survey.date} · {survey.protocol}
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        {/* Fish Count */}
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Total Fish</p>
          <p className="text-[32px] font-semibold text-foreground leading-none">{survey.fishCount}</p>
        </div>

        {/* Species Detected */}
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Species Detected</p>
          <div className="flex flex-wrap gap-1.5">
            {survey.speciesDetected.map(sp => (
              <span key={sp} className="inline-flex px-2 py-0.5 rounded bg-muted text-[11px] font-mono text-foreground">
                {sp}
              </span>
            ))}
          </div>
        </div>

        {/* Species Breakdown (if fish records available) */}
        {breakdown && (
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Species Breakdown</p>
            <div className="space-y-2">
              {breakdown.map(row => (
                <div key={row.species} className="flex items-center justify-between text-[12px] p-2 border border-border/50 rounded bg-white">
                  <span className="font-mono text-primary">{row.species}</span>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>{row.count} fish</span>
                    <span>{row.meanLength} mm avg</span>
                    <span>{row.meanWeight} g avg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Survey Metadata */}
        <div className="pt-4 border-t border-border space-y-2">
          <div className="flex justify-between text-[12px]">
            <span className="text-muted-foreground">Protocol</span>
            <span className="font-medium text-foreground">{survey.protocol}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-muted-foreground">Uploader</span>
            <span className="font-medium text-foreground">{survey.uploader}</span>
          </div>
          <div className="flex justify-between text-[12px]">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium text-foreground">{survey.status}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border px-8 py-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <p className="text-lg font-semibold text-primary">Insights</p>
                <span className="inline-flex px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-medium">
                  Selection-based analysis
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground mt-1">
                Side-by-side comparison of 2 selected surveys
              </p>
            </div>
            <div className="flex items-center gap-3">
              {role === 'senior-biologist' && (
                <Button variant="outline" size="sm" className="text-[13px]">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export to Excel
                </Button>
              )}
              <Link to="/activity-feed">
                <Button variant="outline" size="sm" className="text-[13px]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Surveys
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="px-8 py-8">
        <div className="max-w-[1280px] mx-auto space-y-8">
          {/* Side-by-side columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderSurveyColumn(a, waterA, breakdownA)}
            {renderSurveyColumn(b, waterB, breakdownB)}
          </div>

          {/* Comparison Summary */}
          <Card className="border border-border">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-[16px]">Comparison Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4 text-[12px] font-medium text-muted-foreground border-b border-border pb-2">
                  <span>Metric</span>
                  <span className="text-center">{a.id}</span>
                  <span className="text-center">{b.id}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-[13px]">
                  <span className="text-muted-foreground">Fish Count</span>
                  <span className="text-center font-mono font-medium">{a.fishCount}</span>
                  <span className="text-center font-mono font-medium">{b.fishCount}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-[13px]">
                  <span className="text-muted-foreground">Species Count</span>
                  <span className="text-center font-mono font-medium">{a.speciesDetected.length}</span>
                  <span className="text-center font-mono font-medium">{b.speciesDetected.length}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-[13px]">
                  <span className="text-muted-foreground">Protocol</span>
                  <span className="text-center text-[12px]">{a.protocol}</span>
                  <span className="text-center text-[12px]">{b.protocol}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-[13px]">
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-center font-mono text-[12px]">{a.date}</span>
                  <span className="text-center font-mono text-[12px]">{b.date}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


// ────────────────────────────────────────────────────
// Aggregate View — Summary across >2 surveys
// ────────────────────────────────────────────────────
function AggregateView({ surveys: selectedSurveys, role }: { surveys: Survey[]; role: string }) {
  const waterIds = [...new Set(selectedSurveys.map(s => s.waterId))];
  const waterNames = waterIds.map(id => getWaterById(id)?.name ?? id);
  const dates = selectedSurveys.map(s => s.date).sort();
  const dateRange = dates.length >= 2 ? `${dates[0]} – ${dates[dates.length - 1]}` : dates[0] ?? '—';
  const totalFish = selectedSurveys.reduce((sum, s) => sum + s.fishCount, 0);

  // Species frequency: how many surveys detected each species
  const speciesFreq = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of selectedSurveys) {
      for (const sp of s.speciesDetected) {
        map.set(sp, (map.get(sp) ?? 0) + 1);
      }
    }
    return Array.from(map.entries())
      .map(([species, count]) => ({ species, count }))
      .sort((a, b) => b.count - a.count);
  }, [selectedSurveys]);

  // Fish count per survey (for bar chart)
  const fishCountData = selectedSurveys
    .map(s => ({
      id: s.id.replace(/^SVY-/, ''),
      fishCount: s.fishCount,
    }))
    .sort((a, b) => b.fishCount - a.fishCount);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border px-8 py-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <p className="text-lg font-semibold text-primary">Insights</p>
                <span className="inline-flex px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-medium">
                  Selection-based analysis
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground mt-1">
                Aggregate analysis across {selectedSurveys.length} selected surveys
              </p>
            </div>
            <div className="flex items-center gap-3">
              {role === 'senior-biologist' && (
                <Button variant="outline" size="sm" className="text-[13px]">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export to Excel
                </Button>
              )}
              <Link to="/activity-feed">
                <Button variant="outline" size="sm" className="text-[13px]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Surveys
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="px-8 py-8">
        <div className="max-w-[1280px] mx-auto space-y-8">

          {/* Summary Strip */}
          <div className="border border-border rounded bg-white" style={{ boxShadow: 'var(--shadow-1)' }}>
            <div className="flex divide-x divide-border">
              <div className="flex-1 px-6 py-5">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Surveys Selected</p>
                <p className="text-[24px] font-semibold text-foreground">{selectedSurveys.length}</p>
              </div>
              <div className="flex-1 px-6 py-5">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Waters Represented</p>
                <p className="text-[24px] font-semibold text-foreground">{waterIds.length}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{waterNames.join(', ')}</p>
              </div>
              <div className="flex-1 px-6 py-5">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Total Fish Records</p>
                <p className="text-[24px] font-semibold text-foreground">{totalFish.toLocaleString()}</p>
              </div>
              <div className="flex-1 px-6 py-5">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Date Range</p>
                <p className="text-[16px] font-semibold text-foreground mt-1">{dateRange}</p>
              </div>
            </div>
          </div>

          {/* Fish Count per Survey — Bar Chart */}
          <Card className="border border-border">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-[16px]">Fish Count by Survey</CardTitle>
              <p className="text-[12px] text-muted-foreground mt-1">
                Total fish recorded per selected survey
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fishCountData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                    <XAxis
                      type="number"
                      stroke="#64748B"
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      axisLine={{ stroke: '#E2E8F0' }}
                    />
                    <YAxis
                      dataKey="id"
                      type="category"
                      width={140}
                      stroke="#64748B"
                      tick={{ fill: '#64748B', fontSize: 10 }}
                      axisLine={{ stroke: '#E2E8F0' }}
                    />
                    <Bar dataKey="fishCount" fill="#1B365D" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Species Frequency */}
          <Card className="border border-border">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-[16px]">Species Detection Frequency</CardTitle>
              <p className="text-[12px] text-muted-foreground mt-1">
                Number of surveys in which each species was detected
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {speciesFreq.map(({ species, count }) => (
                  <div key={species}>
                    <div className="flex justify-between text-[12px] mb-1">
                      <span className="font-mono text-foreground">{species}</span>
                      <span className="text-muted-foreground">
                        {count} of {selectedSurveys.length} surveys
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded overflow-hidden">
                      <div
                        className="h-full bg-primary rounded"
                        style={{ width: `${(count / selectedSurveys.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Survey Breakdown Table */}
          <Card className="border border-border">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-[16px]">Survey Details</CardTitle>
              <p className="text-[12px] text-muted-foreground mt-1">
                Individual survey records included in this analysis
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-6 gap-4 text-[11px] font-medium text-muted-foreground uppercase tracking-wide border-b border-border pb-2">
                  <span>Survey ID</span>
                  <span>Water</span>
                  <span>Station</span>
                  <span>Date</span>
                  <span>Protocol</span>
                  <span className="text-right">Fish</span>
                </div>
                {/* Rows */}
                {selectedSurveys.map(s => (
                  <div key={s.id} className="grid grid-cols-6 gap-4 text-[12px] py-2 border-b border-border/30">
                    <span className="font-mono text-primary">{s.id}</span>
                    <span className="text-foreground">{getWaterById(s.waterId)?.name ?? s.waterId}</span>
                    <span className="text-muted-foreground">{s.stationId}</span>
                    <span className="text-muted-foreground font-mono">{s.date}</span>
                    <span className="text-muted-foreground">{s.protocol}</span>
                    <span className="text-right font-mono font-medium">{s.fishCount}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
