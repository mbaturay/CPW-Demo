import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { WaterBanner } from '../components/WaterBanner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, FileText, CheckCircle2, Clock } from 'lucide-react';
import { Link, Navigate, useSearchParams } from 'react-router';
import { RoleIndicator } from '../components/RoleIndicator';
import { useRole } from '../context/RoleContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { species as allSpecies, getWaterById, getTrendForWater } from '../data/world';
import { useDemo } from '../context/DemoContext';

export default function WaterProfile() {
  const { role } = useRole();
  const { surveys } = useDemo();
  const [searchParams] = useSearchParams();
  const waterId = searchParams.get('waterId');
  if (!waterId) return <Navigate to="/water" replace />;

  // Load water data from world.ts
  const water = getWaterById(waterId);
  if (!water) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Water not found: {waterId}</p>
      </div>
    );
  }

  const trend = getTrendForWater(waterId);
  const waterSurveys = surveys.filter(s => s.waterId === waterId);
  const sortedSurveys = [...waterSurveys].sort((a, b) => b.date.localeCompare(a.date));
  const latestTrendPoint = trend?.overall[trend.overall.length - 1];
  const prevTrendPoint = trend?.overall.length && trend.overall.length >= 2
    ? trend.overall[trend.overall.length - 2]
    : undefined;

  // Derive trend direction
  const trendDirection = latestTrendPoint && prevTrendPoint
    ? latestTrendPoint.cpue >= prevTrendPoint.cpue ? 'up' : 'down'
    : 'up';

  // Primary species info
  const primaryCode = water.primarySpecies[0];
  const primarySpeciesInfo = allSpecies.find(s => s.code === primaryCode);

  // Survey activity by year from trend data
  const activityData = trend?.overall.map(p => ({
    year: String(p.year),
    cpue: p.cpue,
  })) ?? [];

  // Species composition from water's primarySpecies
  const speciesData = water.primarySpecies.map((code, i) => {
    const sp = allSpecies.find(s => s.code === code);
    return {
      species: sp?.common ?? code,
      count: waterSurveys.reduce((sum, s) => sum + (s.speciesDetected.includes(code) ? s.fishCount : 0), 0) || (3000 - i * 800),
    };
  });
  const maxCount = Math.max(...speciesData.map(s => s.count));

  // Recent surveys for this water
  const recentSurveys = sortedSurveys.slice(0, 4).map(s => ({
    id: s.id,
    station: s.stationId,
    date: s.date,
    protocol: s.protocol,
    status: s.status,
  }));

  // Data entry role: derive status counts
  const deUploaded = waterSurveys.length;
  const dePending = waterSurveys.filter(s => s.status === 'Pending Validation').length;
  const deReturned = waterSurveys.filter(s => s.status === 'Returned for Correction').length;
  const deApproval = waterSurveys.filter(s => s.status === 'Pending Approval').length;

  // Last survey date
  const lastSurveyDate = sortedSurveys[0]?.date;
  const lastSurveyFormatted = lastSurveyDate
    ? new Date(lastSurveyDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'N/A';
  const lastSurveyYear = lastSurveyDate ? lastSurveyDate.slice(0, 4) : '';

  const getStatusStyle = (status: string) => {
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
          <Breadcrumb items={[
            { label: 'Waters', path: '/water' },
            { label: water.name }
          ]} />
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-lg font-semibold text-primary">Water Profile</p>
              <p className="text-[13px] text-muted-foreground mt-1">
                Comprehensive water body intelligence and survey history
              </p>
            </div>
            <RoleIndicator />
          </div>
        </div>
      </header>

      <WaterBanner
        waterName={water.name}
        region={water.region}
        watershed={water.huc12}
        stations={water.stations}
        totalSurveys={waterSurveys.length}
        yearsActive={`${water.yearsActive.start}–${water.yearsActive.end}`}
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

          {/* Data Entry: Simplified Survey Activity Status */}
          {role === 'data-entry' ? (
            <>
              {/* Helper Text */}
              <div className="mb-6">
                <p className="text-[12px] text-muted-foreground">
                  This view is optimized for survey data entry and validation workflow.
                </p>
              </div>

              {/* CANVAS-AESTHETIC: Summary strip for data entry survey status */}
              <div>
                <h2 className="text-[16px] font-semibold text-foreground mb-4">Survey Activity Status</h2>
                <div className="border border-border rounded bg-white" style={{ boxShadow: 'var(--shadow-1)' }}>
                  <div className="flex divide-x divide-border">
                    <div className="flex-1 px-6 py-5">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Uploaded</p>
                      <p className="text-[24px] font-semibold text-foreground">{deUploaded}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">surveys submitted</p>
                    </div>
                    <div className="flex-1 px-6 py-5">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Pending Validation</p>
                      <p className="text-[24px] font-semibold text-foreground">{dePending}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">awaiting quality check</p>
                    </div>
                    <div className="flex-1 px-6 py-5">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Returned</p>
                      <p className="text-[24px] font-semibold text-foreground">{deReturned}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">requiring revision</p>
                    </div>
                    <div className="flex-1 px-6 py-5">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Awaiting Approval</p>
                      <p className="text-[24px] font-semibold text-foreground">{deApproval}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">under supervisor review</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Surveys - Keep this for Data Entry */}
              <Card className="border border-border">
                <CardHeader className="border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-[16px]">Recent Survey Activity</CardTitle>
                      <p className="text-[12px] text-muted-foreground mt-1">
                        Latest submissions for this water
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {recentSurveys.map((survey) => (
                      <div
                        key={survey.id}
                        className="flex items-center justify-between p-4 border border-border/50 rounded bg-white"
                      >
                        <div className="flex items-center gap-4">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-[13px] font-mono text-primary font-medium">{survey.id}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Station {survey.station} • {survey.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-[12px] text-muted-foreground">{survey.protocol}</p>
                          <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${getStatusStyle(survey.status)}`}>
                            {survey.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Area Biologist & Senior Biologist: Full Analytics View */}

          {/* CANVAS-AESTHETIC: Summary strip replaces stat card grid */}
          <div className="border border-border rounded bg-white" style={{ boxShadow: 'var(--shadow-1)' }}>
            <div className="flex divide-x divide-border">
              <div className="flex-1 px-6 py-5">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Current Population</p>
                <p className="text-[24px] font-semibold text-foreground">
                  {latestTrendPoint?.popEstimate?.toLocaleString() ?? `${latestTrendPoint?.cpue ?? '—'}`}
                </p>
                <p className={`text-[11px] flex items-center gap-1 mt-1 ${trendDirection === 'up' ? 'text-success' : 'text-destructive'}`}>
                  {trendDirection === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {trendDirection === 'up' ? 'Stable trend' : 'Declining trend'}
                </p>
              </div>
              <div className="flex-1 px-6 py-5">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Primary Species</p>
                <p className="text-[24px] font-semibold text-foreground">{primaryCode}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{primarySpeciesInfo?.common ?? primaryCode}</p>
              </div>
              <div className="flex-1 px-6 py-5">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Last Survey</p>
                <p className="text-[24px] font-semibold text-foreground">{lastSurveyFormatted}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{lastSurveyYear}</p>
              </div>
              <div className="flex-1 px-6 py-5">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Water Status</p>
                <div className="inline-flex px-2 py-1 bg-success/10 text-success rounded text-[11px] font-medium mt-1">
                  Active Monitoring
                </div>
              </div>
            </div>
          </div>

          {/* CANVAS-ALIGNMENT: Stacked vertical (was 3-col side-by-side) */}
          <div className="space-y-6">
            {/* CPUE Trend Chart */}
            <Card className="border border-border">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="text-[16px]">CPUE Trend</CardTitle>
                <p className="text-[12px] text-muted-foreground mt-1">
                  Catch per unit effort over time
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[280px] min-h-[280px]">
                  {/* POWERAPPS-ALIGNMENT: Replaced ComposedChart with simple LineChart; removed Area, custom dot renderer, Tooltip, activeDot */}
                  <ResponsiveContainer width="100%" height="100%" minHeight={280}>
                    <LineChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                      <XAxis
                        dataKey="year"
                        stroke="#64748B"
                        tick={{ fill: '#64748B', fontSize: 11 }}
                        axisLine={{ stroke: '#E2E8F0' }}
                      />
                      <YAxis
                        stroke="#64748B"
                        tick={{ fill: '#64748B', fontSize: 11 }}
                        axisLine={{ stroke: '#E2E8F0' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="cpue"
                        stroke="#1B365D"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Species Composition */}
            <Card className="border border-border">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="text-[16px]">Species Composition</CardTitle>
                <p className="text-[12px] text-muted-foreground mt-1">
                  Primary species in this water
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {speciesData.map((sp, index) => (
                    <div key={sp.species}>
                      <div className="flex justify-between text-[12px] mb-1.5">
                        <span className="text-muted-foreground">{sp.species}</span>
                        <span className="font-mono text-foreground font-medium">{sp.count.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-muted rounded overflow-hidden">
                        <div
                          className={`h-full ${
                            index === 0 ? 'bg-primary' :
                            index === 1 ? 'bg-secondary' :
                            index === 2 ? 'bg-[#5B7C99]' :
                            'bg-muted-foreground'
                          }`}
                          style={{ width: `${(sp.count / maxCount) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CANVAS-ALIGNMENT: Stacked vertical (was 3-col side-by-side) */}
          <div className="space-y-6">
            {/* Recent Surveys */}
            <Card className="border border-border">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[16px]">Recent Survey Activity</CardTitle>
                    <p className="text-[12px] text-muted-foreground mt-1">
                      Latest field data collections
                    </p>
                  </div>
                  <Link to={`/insights?waterId=${waterId}`}>
                    <Button variant="outline" size="sm" className="text-[13px]">
                      View All Analytics
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {recentSurveys.map((survey) => (
                    <Link
                      key={survey.id}
                      to={`/validation?surveyId=${survey.id}`}
                      className="flex items-center justify-between p-4 border border-border/50 rounded bg-white"
                    >
                      <div className="flex items-center gap-4">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-[13px] font-mono text-primary font-medium">{survey.id}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Station {survey.station} • {survey.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-[12px] text-muted-foreground">{survey.protocol}</p>
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${getStatusStyle(survey.status)}`}>
                          {survey.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stations in Basin */}
            <div>
              <h3 className="text-[14px] font-semibold text-foreground mb-4">Stations in Basin</h3>
              <div className="flex flex-wrap gap-3">
                {water.stations.map((station) => (
                  <button
                    key={station.id}
                    className="px-4 py-2 border border-border rounded bg-white text-[13px] font-mono font-medium text-foreground"
                  >
                    {station.id}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Management Notes */}
          {/* CANVAS-AESTHETIC: Removed decorative colored border — standard card */}
          <Card className="border border-border" style={{ boxShadow: 'var(--shadow-1)' }}>
            <CardHeader className="border-b border-border/50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <CardTitle className="text-[16px]">Management Notes</CardTitle>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    Current monitoring priorities and observations
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3 text-[13px]">
                <div className="flex gap-3">
                  <span className="text-muted-foreground">•</span>
                  <p className="text-foreground">
                    {primarySpeciesInfo?.common ?? primaryCode} population {trendDirection === 'up' ? 'remains stable with good recruitment' : 'shows declining trend — increased monitoring recommended'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="text-muted-foreground">•</span>
                  <p className="text-foreground">
                    Continue {sortedSurveys[0]?.protocol ?? 'Two-Pass Removal'} protocol for population estimates at primary stations
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="text-muted-foreground">•</span>
                  <p className="text-foreground">
                    Monitor young-of-year presence in fall surveys to assess spawning success
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
