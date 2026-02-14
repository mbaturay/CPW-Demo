import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { FileSpreadsheet, TrendingUp, Info, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { WaterBanner } from '../components/WaterBanner';
import { RoleIndicator } from '../components/RoleIndicator';
import { useRole } from '../context/RoleContext';
import { useSearchParams } from 'react-router';
import { getWaterById, getTrendForWater } from '../data/world';
import { useDemo } from '../context/DemoContext';

export default function Insights() {
  const { role } = useRole();
  const { surveys } = useDemo();
  const [metric, setMetric] = useState('population');
  const [searchParams] = useSearchParams();
  const waterId = searchParams.get('waterId') || 'south-platte';

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
              <RoleIndicator />
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border border-border shadow-sm">
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

            <Card className="border border-border shadow-sm">
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

            <Card className="border border-border shadow-sm">
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

            <Card className="border border-border shadow-sm">
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
          <Card className="border border-border shadow-sm">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Length-Frequency Histogram */}
            <Card className="lg:col-span-2 border border-border shadow-sm">
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
              <Card className="border border-border shadow-sm">
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
