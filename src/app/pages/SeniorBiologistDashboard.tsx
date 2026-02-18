import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertTriangle, FileSpreadsheet, BarChart3, TrendingUp, TrendingDown, ClipboardList } from 'lucide-react';
import { Link } from 'react-router';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

// ── Scope-keyed mocked data ──────────────────────────────────────

type ScopeKPIs = {
  label: string;
  waters: number;
  surveysYtd: number;
  regionsNote: string;
  flagged: number;
  flaggedNote: string;
  federalReadiness: number;
  dataQuality: number;
  dataQualityNote: string;
};

const SCOPE_KPIS: Record<string, ScopeKPIs> = {
  statewide: { label: 'Statewide', waters: 118, surveysYtd: 702, regionsNote: '5 regions, 702 surveys YTD', flagged: 7, flaggedNote: 'Declines require analysis', federalReadiness: 82, dataQuality: 96, dataQualityNote: 'Validation rate' },
  northeast: { label: 'Northeast Region', waters: 23, surveysYtd: 147, regionsNote: '1 region, 147 surveys YTD', flagged: 2, flaggedNote: 'Protocol concerns', federalReadiness: 88, dataQuality: 94, dataQualityNote: 'Validation rate' },
  southeast: { label: 'Southeast Region', waters: 18, surveysYtd: 112, regionsNote: '1 region, 112 surveys YTD', flagged: 1, flaggedNote: 'Data quality review', federalReadiness: 79, dataQuality: 89, dataQualityNote: 'Validation rate' },
  northwest: { label: 'Northwest Region', waters: 31, surveysYtd: 189, regionsNote: '1 region, 189 surveys YTD', flagged: 3, flaggedNote: 'Population declines noted', federalReadiness: 76, dataQuality: 87, dataQualityNote: 'Validation rate' },
  southwest: { label: 'Southwest Region', waters: 27, surveysYtd: 156, regionsNote: '1 region, 156 surveys YTD', flagged: 1, flaggedNote: 'Range shift flagged', federalReadiness: 84, dataQuality: 91, dataQualityNote: 'Validation rate' },
  central:   { label: 'Central Region', waters: 19, surveysYtd: 98, regionsNote: '1 region, 98 surveys YTD', flagged: 0, flaggedNote: 'None', federalReadiness: 91, dataQuality: 96, dataQualityNote: 'Highest statewide' },
};

const SCOPE_CHART: Record<string, { region: string; surveys: number }[]> = {
  statewide: [
    { region: 'Northeast', surveys: 147 },
    { region: 'Southeast', surveys: 112 },
    { region: 'Northwest', surveys: 189 },
    { region: 'Southwest', surveys: 156 },
    { region: 'Central', surveys: 98 },
  ],
  northeast: [
    { region: 'S. Platte', surveys: 52 },
    { region: 'Poudre', surveys: 38 },
    { region: 'St. Vrain', surveys: 24 },
    { region: 'Big Thompson', surveys: 19 },
    { region: 'Boyd Lake', surveys: 14 },
  ],
  southeast: [
    { region: 'Arkansas', surveys: 41 },
    { region: 'Purgatoire', surveys: 28 },
    { region: 'Huerfano', surveys: 22 },
    { region: 'Fountain Cr', surveys: 21 },
  ],
  northwest: [
    { region: 'Colorado R.', surveys: 56 },
    { region: 'Blue River', surveys: 38 },
    { region: 'Eagle R.', surveys: 34 },
    { region: 'Roaring Fork', surveys: 32 },
    { region: 'Yampa', surveys: 29 },
  ],
  southwest: [
    { region: 'Gunnison', surveys: 44 },
    { region: 'San Juan', surveys: 36 },
    { region: 'Dolores', surveys: 28 },
    { region: 'Animas', surveys: 26 },
    { region: 'Uncompahgre', surveys: 22 },
  ],
  central: [
    { region: 'Clear Cr.', surveys: 28 },
    { region: 'Bear Cr.', surveys: 22 },
    { region: 'S. Platte (C)', surveys: 21 },
    { region: 'Chatfield', surveys: 27 },
  ],
};

// ── Component ────────────────────────────────────────────────────

export default function SeniorBiologistDashboard() {
  const [regionFilter, setRegionFilter] = useState('statewide');

  const kpis = SCOPE_KPIS[regionFilter] ?? SCOPE_KPIS.statewide;
  const chartData = SCOPE_CHART[regionFilter] ?? SCOPE_CHART.statewide;
  const chartLabel = regionFilter === 'statewide'
    ? 'Survey activity and compliance metrics by region'
    : `Water body survey breakdown — ${kpis.label}`;

  const crossWaterTrends = useMemo(() => {
    const all = [
      { water: 'South Platte Basin', region: 'Northeast', trend: '+8%', population: 3812, status: 'Stable' as const },
      { water: 'Arkansas River', region: 'Southeast', trend: '-4%', population: 2456, status: 'Declining' as const },
      { water: 'Blue River', region: 'Northwest', trend: '-12%', population: 1834, status: 'Concern' as const },
      { water: 'Colorado River', region: 'Northwest', trend: '+3%', population: 4123, status: 'Stable' as const },
      { water: 'Cache la Poudre', region: 'Northeast', trend: '+6%', population: 2987, status: 'Stable' as const },
      { water: 'Gunnison River', region: 'Southwest', trend: '-2%', population: 2105, status: 'Declining' as const },
      { water: 'Clear Creek', region: 'Central', trend: '+5%', population: 1456, status: 'Stable' as const },
    ];
    if (regionFilter === 'statewide') return all;
    const regionLabel = SCOPE_KPIS[regionFilter]?.label.replace(' Region', '') ?? '';
    return all.filter(w => w.region === regionLabel);
  }, [regionFilter]);

  const federalReporting = [
    { requirement: 'Annual Species Inventory', deadline: 'Mar 31, 2026', progress: 87, status: 'On Track' },
    { requirement: 'Endangered Species Monitoring', deadline: 'Apr 15, 2026', progress: 94, status: 'On Track' },
    { requirement: 'Water Quality Impact Assessment', deadline: 'May 1, 2026', progress: 67, status: 'Needs Attention' },
    { requirement: 'Population Trend Analysis', deadline: 'Jun 30, 2026', progress: 45, status: 'In Progress' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border px-8 py-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-semibold text-primary">Statewide Water Intelligence Overview</h1>
              <p className="text-[13px] text-muted-foreground mt-1">Strategic cross-water analysis and federal reporting dashboard</p>
            </div>
          </div>
        </div>
      </header>

      {/* Analysis Scope Active strip */}
      <div className="bg-muted/20 border-b border-border px-8 py-3">
        <div className="max-w-[1280px] mx-auto">
          <p className="text-[12px] text-muted-foreground">
            <span className="font-medium text-foreground">Analysis Scope Active</span> — {kpis.label}
          </p>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="max-w-[1280px] mx-auto space-y-8">

          {/* Filter Bar */}
          <div className="flex items-center justify-between bg-muted/20 border border-border rounded px-4 py-3">
            <div className="flex items-center gap-4">
              <span className="text-[13px] font-medium text-foreground">Analysis Scope:</span>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-[200px] h-9 text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="statewide" className="text-[13px]">Statewide</SelectItem>
                  <SelectItem value="northeast" className="text-[13px]">Northeast Region</SelectItem>
                  <SelectItem value="southeast" className="text-[13px]">Southeast Region</SelectItem>
                  <SelectItem value="northwest" className="text-[13px]">Northwest Region</SelectItem>
                  <SelectItem value="southwest" className="text-[13px]">Southwest Region</SelectItem>
                  <SelectItem value="central" className="text-[13px]">Central Region</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Link to={`/activity-feed?scope=${regionFilter}`}>
                <Button variant="outline" size="sm" className="text-[13px]">
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Browse Surveys
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="text-[13px]">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm" className="text-[13px]">
                <BarChart3 className="w-4 h-4 mr-2" />
                Open in Tableau
              </Button>
            </div>
          </div>

          {/* KPI Summary Strip — scope-reactive */}
          <div className="border border-border rounded bg-white" style={{ boxShadow: 'var(--shadow-1)' }}>
            <div className="flex divide-x divide-border">
              <div className="flex-1 px-6 py-5">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Waters Monitored</p>
                <p className="text-[24px] font-semibold text-foreground">{kpis.waters}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{kpis.regionsNote}</p>
              </div>
              <div className="flex-1 px-6 py-5">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Flagged for Review</p>
                <p className="text-[24px] font-semibold text-foreground">{kpis.flagged}</p>
                <p className={`text-[11px] mt-1 ${kpis.flagged > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>{kpis.flaggedNote}</p>
              </div>
              <div className="flex-1 px-6 py-5">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Federal Readiness</p>
                <p className="text-[24px] font-semibold text-foreground">{kpis.federalReadiness}%</p>
                <p className="text-[11px] text-muted-foreground mt-1">Avg. across 4 requirements</p>
              </div>
              <div className="flex-1 px-6 py-5">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Data Quality</p>
                <p className="text-[24px] font-semibold text-foreground">{kpis.dataQuality}%</p>
                <p className={`text-[11px] mt-1 ${kpis.dataQuality >= 95 ? 'text-success' : 'text-muted-foreground'}`}>{kpis.dataQualityNote}</p>
              </div>
            </div>
          </div>

          {/* Regional Performance Comparison — scope-reactive chart */}
          <Card className="border border-border">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[16px]">
                    {regionFilter === 'statewide' ? 'Regional Performance Comparison' : `${kpis.label} — Water Breakdown`}
                  </CardTitle>
                  <p className="text-[12px] text-muted-foreground mt-1">{chartLabel}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="region"
                      stroke="#64748B"
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      axisLine={{ stroke: '#E2E8F0' }}
                    />
                    <YAxis
                      stroke="#64748B"
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      axisLine={{ stroke: '#E2E8F0' }}
                    />
                    <Bar dataKey="surveys" fill="#1B365D" name="Total Surveys" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Cross-Water Population Trends — scope-filtered */}
          <div className="space-y-6">
            <Card className="border border-border">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[16px]">Cross-Water Population Trends</CardTitle>
                    <p className="text-[12px] text-muted-foreground mt-1">
                      {regionFilter === 'statewide' ? 'Multi-basin comparative analysis' : `Trend data — ${kpis.label}`}
                    </p>
                  </div>
                  <Link to="/query">
                    <Button variant="outline" size="sm" className="text-[12px]">
                      Advanced Query
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {crossWaterTrends.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground py-4 text-center">No trend data available for this scope.</p>
                ) : (
                  <div className="space-y-4">
                    {crossWaterTrends.map((water, idx) => (
                      <div key={idx} className="flex items-center justify-between pb-3 border-b border-border/50 last:border-0 last:pb-0">
                        <div className="flex-1">
                          <p className="text-[13px] font-medium text-foreground">{water.water}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{water.region} • Pop: {water.population.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center gap-1 text-[12px] font-medium ${
                            water.trend.startsWith('+') ? 'text-success' : 'text-destructive'
                          }`}>
                            {water.trend.startsWith('+') ? (
                              <TrendingUp className="w-3.5 h-3.5" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5" />
                            )}
                            {water.trend}
                          </div>
                          <span className={`
                            inline-flex px-2 py-0.5 rounded text-[10px] font-medium
                            ${water.status === 'Stable'
                              ? 'bg-success/10 text-success'
                              : water.status === 'Declining'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-destructive/10 text-destructive'
                            }
                          `}>
                            {water.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Federal Reporting Compliance */}
            <Card className="border border-border">
              <CardHeader className="border-b border-border/50">
                <div>
                  <CardTitle className="text-[16px]">Federal Reporting Compliance</CardTitle>
                  <p className="text-[12px] text-muted-foreground mt-1">2026 mandated deliverables status</p>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  {federalReporting.map((report, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-[12px] font-medium text-foreground">{report.requirement}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">Due: {report.deadline}</p>
                        </div>
                        <span className={`
                          inline-flex px-2 py-0.5 rounded text-[10px] font-medium
                          ${report.status === 'On Track'
                            ? 'bg-success/10 text-success'
                            : report.status === 'Needs Attention'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-muted/50 text-muted-foreground'
                          }
                        `}>
                          {report.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
                          <div
                            className={`h-full ${
                              report.progress >= 85 ? 'bg-success' :
                              report.progress >= 70 ? 'bg-warning' :
                              'bg-destructive'
                            }`}
                            style={{ width: `${report.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-[12px] font-mono text-muted-foreground w-12 text-right">
                          {report.progress}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Waters Requiring Attention */}
          <Card className="border border-border" style={{ boxShadow: 'var(--shadow-1)' }}>
            <CardHeader className="border-b border-border/50">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-[16px] text-foreground flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    Waters Requiring Strategic Attention
                  </CardTitle>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    Population declines, data quality issues, or management interventions needed
                  </p>
                </div>
                <Link to="/insights">
                  <Button variant="outline" size="sm" className="text-[13px]">View Intelligence</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-foreground">Blue River — Northwest</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-destructive/10 text-destructive font-medium">
                      -12% decline
                    </span>
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    Cutthroat population showing significant decrease across 8 surveys
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-foreground">Arkansas River — SE</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-warning/10 text-warning font-medium">
                      Data Quality
                    </span>
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    3 recent surveys flagged for protocol compliance review
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-foreground">Gunnison River — SW</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-warning/10 text-warning font-medium">
                      Range Shift
                    </span>
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    Non-native species expanding — management action may be required
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
