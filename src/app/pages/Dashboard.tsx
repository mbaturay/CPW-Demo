import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { AlertTriangle, Upload, CheckCircle2 } from 'lucide-react';
import { StationViz } from '../components/StationViz';
import { Link } from 'react-router';
import { useRole } from '../context/RoleContext';
import { RoleIndicator } from '../components/RoleIndicator';
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

  const stats = [
    {
      title: 'Waters Active',
      subtitle: 'Current Season',
      value: String(neWaters.length),
      icon: Upload,
      trend: `${neWaters.length} in Northeast Region`,
      color: 'text-primary'
    },
    {
      title: 'Pending Approval',
      subtitle: 'Surveys Requiring Review',
      value: String(pendingCount),
      icon: AlertTriangle,
      trend: `Across ${reviewQueue.length} items in queue`,
      color: 'text-warning'
    },
    {
      title: 'Flagged Surveys',
      subtitle: 'Data Quality Review',
      value: String(flaggedCount),
      icon: AlertTriangle,
      trend: flaggedCount > 0 ? 'Data quality review needed' : 'No flagged surveys',
      color: 'text-destructive'
    },
    {
      title: 'Federal Reporting',
      subtitle: 'Annual Compliance',
      value: '87%',
      icon: CheckCircle2,
      trend: 'Due: March 31, 2026',
      color: 'text-success'
    },
  ];

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
            <RoleIndicator />
          </div>
        </div>
      </header>

      <div className="px-8 py-8">
        <div className="max-w-[1280px] mx-auto space-y-8">

          {/* Stats Grid - Operational Focus */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="border border-border shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
                          {stat.subtitle}
                        </p>
                        <CardTitle className="text-[13px] text-foreground font-medium">
                          {stat.title}
                        </CardTitle>
                      </div>
                      <Icon className={`w-4 h-4 ${stat.color} mt-1`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-[28px] font-semibold text-foreground mb-1">{stat.value}</div>
                    <p className="text-[11px] text-muted-foreground">{stat.trend}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Review Queue */}
            <Card className="lg:col-span-2 border border-border shadow-sm">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[16px]">Review Queue</CardTitle>
                    <p className="text-[12px] text-muted-foreground mt-1">Surveys requiring attention within Northeast Region</p>
                  </div>
                  <Link to="/activity-feed">
                    <Button variant="outline" size="sm" className="text-[13px]">View All</Button>
                  </Link>
                </div>
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
            <Card className="border border-border shadow-sm">
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
          <Card className="border border-border shadow-sm">
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
          <Card className="border border-destructive/20 bg-destructive/[0.02] shadow-sm">
            <CardHeader className="border-b border-destructive/10">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-[16px] text-foreground flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    Species of Concern Activity
                  </CardTitle>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    Population trends requiring monitoring attention
                  </p>
                </div>
                <Link to="/query">
                  <Button variant="outline" size="sm" className="text-[13px]">View Analysis</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
