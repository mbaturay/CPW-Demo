import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { StationViz } from '../components/StationViz';
import { Link } from 'react-router';
import { useRole } from '../context/RoleContext';

import DataEntryDashboard from './DataEntryDashboard';
import SeniorBiologistDashboard from './SeniorBiologistDashboard';
import { waters, buildActivityFeed, getTrendForWater } from '../data/world';
import { useDemo } from '../context/DemoContext';

export default function Dashboard() {
  const { role } = useRole();
  const { surveys } = useDemo();

  // Route to role-specific dashboards
  if (role === 'data-entry') {
    return <DataEntryDashboard />;
  }

  if (role === 'senior-biologist') {
    return <SeniorBiologistDashboard />;
  }

  // Default: Area Biologist view — derived from world.ts + demo overrides
  const neWaters = waters.filter(w => w.region === 'Northeast');
  const neWaterIds = new Set(neWaters.map(w => w.id));
  const neSurveys = surveys.filter(s => neWaterIds.has(s.waterId));
  const reviewQueue = buildActivityFeed('Northeast', surveys);

  const pendingCount = neSurveys.filter(s =>
    s.status === 'Pending Validation' || s.status === 'Pending Approval'
  ).length;
  const flaggedCount = neSurveys.filter(s => s.status === 'Flagged Suspect').length;
  const neStations = neWaters.flatMap(w => w.stations);
  const totalStations = neStations.length;

  /* Stats derived for summary strip */

  // Review queue rows with full survey details
  const reviewRows = reviewQueue.map(item => {
    const survey = surveys.find(s => s.id === item.surveyId)!;
    return {
      id: survey.id,
      waterId: item.waterId,
      waterName: item.waterName,
      stationId: survey.stationId,
      protocol: survey.protocol,
      date: survey.date,
      status: survey.status,
      uploader: survey.uploader,
      primaryAction: item.primaryAction,
    };
  });

  // Waters in region with survey counts
  const watersInRegion = neWaters.map(w => {
    const wSurveys = surveys.filter(s => s.waterId === w.id);
    const sorted = [...wSurveys].sort((a, b) => b.date.localeCompare(a.date));
    return {
      id: w.id,
      name: w.name,
      activeSurveys: wSurveys.length,
      lastSurvey: sorted[0]?.date ?? 'N/A',
      status: 'Active',
    };
  });

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

  // Species of concern: derive CTT decline from Poudre trend
  const poudreTrend = getTrendForWater('cache-la-poudre');
  const cttTrend = poudreTrend?.bySpecies?.CTT;
  const cttDecline = cttTrend && cttTrend.length >= 2
    ? Math.round(((cttTrend[cttTrend.length - 1].cpue - cttTrend[0].cpue) / cttTrend[0].cpue) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border px-8 py-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-semibold text-primary">Waters Overview</h1>
              <p className="text-[13px] text-muted-foreground mt-1">Statewide Operational Status</p>
            </div>

          </div>
        </div>
      </header>

      {/* CANVAS-AESTHETIC: Command bar with primary actions */}
      <div className="border-b border-border bg-white px-8 py-3">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <p className="text-[13px] text-muted-foreground">{reviewQueue.length} items requiring review</p>
          <div className="flex gap-2">
            <Link to="/activity-feed">
              <Button variant="outline" size="sm" className="text-[13px]">View All Surveys</Button>
            </Link>
            <Link to="/query">
              <Button variant="outline" size="sm" className="text-[13px]">Run Analysis</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="max-w-[1280px] mx-auto space-y-8">

          {/* CANVAS-AESTHETIC: Summary strip replaces stat card grid */}
          <div className="border border-border rounded bg-white" style={{ boxShadow: 'var(--shadow-1)' }}>
            <div className="flex divide-x divide-border">
              <div className="flex-1 px-6 py-5">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Waters Active</p>
                <p className="text-[24px] font-semibold text-foreground">{neWaters.length}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Northeast Region</p>
              </div>
              <div className="flex-1 px-6 py-5">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Pending Approval</p>
                <p className="text-[24px] font-semibold text-foreground">{pendingCount}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Surveys in queue</p>
              </div>
              <div className="flex-1 px-6 py-5">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Flagged Surveys</p>
                <p className="text-[24px] font-semibold text-foreground">{flaggedCount}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{flaggedCount > 0 ? 'Review needed' : 'None'}</p>
              </div>
              <div className="flex-1 px-6 py-5">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Federal Reporting</p>
                <p className="text-[24px] font-semibold text-foreground">87%</p>
                <p className="text-[11px] text-muted-foreground mt-1">Due: Mar 31, 2026</p>
              </div>
            </div>
          </div>

          {/* CANVAS-ALIGNMENT: Stacked vertical (was 3-col side-by-side) */}
          <div className="space-y-6">
            {/* Review Queue */}
            <Card className="border border-border">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="text-[16px]">Review Queue</CardTitle>
                <p className="text-[12px] text-muted-foreground mt-1">Surveys requiring attention within Northeast Region</p>
              </CardHeader>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[12px]">Survey ID</TableHead>
                      <TableHead className="text-[12px]">Water Body</TableHead>
                      <TableHead className="text-[12px]">Protocol</TableHead>
                      <TableHead className="text-[12px]">Date</TableHead>
                      <TableHead className="text-[12px]">Status</TableHead>
                      <TableHead className="text-[12px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviewRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-mono text-[13px] text-primary">{row.id}</TableCell>
                        <TableCell className="text-[13px]">
                          <Link to={`/water/profile?waterId=${row.waterId}`} className="text-primary underline visited:text-primary">
                            {row.waterName}
                          </Link>
                        </TableCell>
                        <TableCell className="text-[12px] text-muted-foreground">{row.protocol}</TableCell>
                        <TableCell className="text-[12px] text-muted-foreground">{row.date}</TableCell>
                        <TableCell>
                          <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${getStatusStyle(row.status)}`}>
                            {row.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Link to={`/validation?surveyId=${row.id}`}>
                            <Button variant="outline" size="sm" className="text-[12px] h-7">
                              {row.primaryAction}
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Active Survey Stations Map Preview */}
            <Card className="border border-border">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="text-[16px]">Active Survey Stations</CardTitle>
                <p className="text-[12px] text-muted-foreground mt-1">Current field season locations</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="aspect-square">
                  <StationViz
                    stations={neStations}
                    title="Survey Stations — Northeast Region"
                  />
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-muted-foreground">Active Regions</span>
                    <span className="font-mono text-foreground">1</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-muted-foreground">Water Bodies</span>
                    <span className="font-mono text-foreground">{neWaters.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-muted-foreground">Survey Stations</span>
                    <span className="font-mono text-foreground">{totalStations}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Waters in Northeast Region */}
          <Card className="border border-border">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-[16px]">Waters in Northeast Region</CardTitle>
              <p className="text-[12px] text-muted-foreground mt-1">
                Active water bodies under regional management
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[12px]">Water Name</TableHead>
                    <TableHead className="text-[12px]">Active Surveys</TableHead>
                    <TableHead className="text-[12px]">Last Survey Date</TableHead>
                    <TableHead className="text-[12px]">Status Summary</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {watersInRegion.map((water) => (
                    <TableRow key={water.id}>
                      <TableCell className="text-[13px]">
                        <Link to={`/water/profile?waterId=${water.id}`} className="text-primary underline visited:text-primary font-medium">
                          {water.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-[13px] font-mono">{water.activeSurveys}</TableCell>
                      <TableCell className="text-[12px] text-muted-foreground">{water.lastSurvey}</TableCell>
                      <TableCell>
                        <span className="inline-flex px-2 py-0.5 bg-success/10 text-success rounded text-[11px] font-medium">
                          {water.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Species of Concern Activity Panel */}
          {/* CANVAS-AESTHETIC: Removed decorative colored border — standard card */}
          <Card className="border border-border" style={{ boxShadow: 'var(--shadow-1)' }}>
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-[16px] text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                Species of Concern Activity
              </CardTitle>
              <p className="text-[12px] text-muted-foreground mt-1">
                Population trends requiring monitoring attention
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              {/* CANVAS-ALIGNMENT: Stacked items (was 3-col grid) */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-foreground">Cutthroat Trout (CTT)</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-destructive/10 text-destructive font-medium">
                      {cttDecline}% decline
                    </span>
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    Cache la Poudre — CPUE declining since 2021
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-foreground">Mountain Whitefish (MWF)</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-warning/10 text-warning font-medium">
                      Monitoring
                    </span>
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    Big Thompson — Low CPUE trend observed
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-foreground">Creek Chub (CRD)</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-warning/10 text-warning font-medium">
                      Range shift
                    </span>
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    Cache la Poudre — Expanding into non-native watersheds
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
