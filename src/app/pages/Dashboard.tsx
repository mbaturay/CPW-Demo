import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { AlertTriangle, Upload, Database, CheckCircle2, MapPin } from 'lucide-react';
import { Link } from 'react-router';
import { useRole } from '../context/RoleContext';
import { RoleIndicator } from '../components/RoleIndicator';
import DataEntryDashboard from './DataEntryDashboard';
import SeniorBiologistDashboard from './SeniorBiologistDashboard';

export default function Dashboard() {
  const { role } = useRole();
  
  // Route to role-specific dashboards
  if (role === 'data-entry') {
    return <DataEntryDashboard />;
  }
  
  if (role === 'senior-biologist') {
    return <SeniorBiologistDashboard />;
  }
  
  // Default: Area Biologist view
  const stats = [
    { 
      title: 'Waters Active', 
      subtitle: 'Current Season',
      value: '18', 
      icon: Upload,
      trend: '+3 from last month',
      color: 'text-primary'
    },
    { 
      title: 'Pending Validation', 
      subtitle: 'Waters with Issues',
      value: '3', 
      icon: AlertTriangle,
      trend: 'Across 8 surveys',
      color: 'text-[#D97706]'
    },
    { 
      title: 'Flagged Surveys', 
      subtitle: 'Waters Affected',
      value: '2', 
      icon: AlertTriangle,
      trend: 'Data quality review needed',
      color: 'text-[#B91C1C]'
    },
    { 
      title: 'Federal Reporting', 
      subtitle: 'Annual Compliance',
      value: '87%', 
      icon: CheckCircle2,
      trend: 'Due: March 31, 2026',
      color: 'text-[#059669]'
    },
  ];
  
  const recentUploads = [
    { id: 'SRV-2026-089', water: 'South Platte Basin', station: 'SP-04', protocol: 'Two-Pass Removal', date: '2026-02-10', status: 'Validated', biologist: 'J. Martinez' },
    { id: 'SRV-2026-088', water: 'Cache la Poudre', station: 'CP-12', protocol: 'Single Pass', date: '2026-02-09', status: 'Validated', biologist: 'S. Chen' },
    { id: 'SRV-2026-087', water: 'Blue River', station: 'BR-06', protocol: 'Two-Pass Removal', date: '2026-02-09', status: 'Pending', biologist: 'A. Williams' },
    { id: 'SRV-2026-086', water: 'Arkansas River', station: 'AR-18', protocol: 'Electrofish Survey', date: '2026-02-08', status: 'Validated', biologist: 'J. Martinez' },
    { id: 'SRV-2026-085', water: 'Roaring Fork', station: 'RF-03', protocol: 'Two-Pass Removal', date: '2026-02-07', status: 'Validated', biologist: 'M. Johnson' },
  ];
  
  const watersInRegion = [
    { name: 'South Platte Basin', activeSurveys: 12, lastSurvey: '2026-02-10', status: 'Active' },
    { name: 'Cache la Poudre', activeSurveys: 8, lastSurvey: '2026-02-09', status: 'Active' },
    { name: 'Blue River', activeSurveys: 6, lastSurvey: '2026-02-09', status: 'Active' },
    { name: 'Arkansas River', activeSurveys: 5, lastSurvey: '2026-02-08', status: 'Active' },
    { name: 'Roaring Fork', activeSurveys: 4, lastSurvey: '2026-02-07', status: 'Active' },
  ];
  
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
                    {recentUploads.map((upload) => (
                      <TableRow key={upload.id}>
                        <TableCell className="font-mono text-[13px] text-primary">{upload.id}</TableCell>
                        <TableCell className="text-[13px]">
                          <Link to="/water" className="text-primary hover:underline">
                            {upload.water}
                          </Link>
                        </TableCell>
                        <TableCell className="text-[12px] text-muted-foreground">{upload.protocol}</TableCell>
                        <TableCell className="text-[12px] text-muted-foreground">{upload.date}</TableCell>
                        <TableCell>
                          <span className={`
                            inline-flex px-2 py-0.5 rounded text-[11px] font-medium
                            ${upload.status === 'Validated' 
                              ? 'bg-[#059669]/10 text-[#059669]' 
                              : 'bg-[#D97706]/10 text-[#D97706]'
                            }
                          `}>
                            {upload.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Link to="/validation">
                            <Button variant="outline" size="sm" className="text-[12px] h-7">
                              Review
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
                <div className="aspect-square bg-muted/30 rounded border border-border/50 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-50">
                    <div className="absolute top-1/4 left-1/3 w-2.5 h-2.5 bg-primary rounded-full"></div>
                    <div className="absolute top-1/3 left-2/3 w-2.5 h-2.5 bg-secondary rounded-full"></div>
                    <div className="absolute bottom-1/3 left-1/2 w-2.5 h-2.5 bg-primary rounded-full"></div>
                    <div className="absolute top-2/3 left-1/4 w-2.5 h-2.5 bg-secondary rounded-full"></div>
                    <div className="absolute top-1/2 left-3/4 w-2.5 h-2.5 bg-primary rounded-full"></div>
                  </div>
                  <div className="relative z-10 text-center">
                    <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-[12px] text-muted-foreground">Geographic Distribution</p>
                  </div>
                </div>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-muted-foreground">Active Regions</span>
                    <span className="font-mono text-foreground">5</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-muted-foreground">Water Bodies</span>
                    <span className="font-mono text-foreground">18</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-muted-foreground">Survey Stations</span>
                    <span className="font-mono text-foreground">127</span>
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
                    <TableRow key={water.name}>
                      <TableCell className="text-[13px]">
                        <Link to="/water" className="text-primary hover:underline font-medium">
                          {water.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-[13px] font-mono">{water.activeSurveys}</TableCell>
                      <TableCell className="text-[12px] text-muted-foreground">{water.lastSurvey}</TableCell>
                      <TableCell>
                        <span className="inline-flex px-2 py-0.5 bg-[#059669]/10 text-[#059669] rounded text-[11px] font-medium">
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
          <Card className="border border-[#B91C1C]/20 bg-[#B91C1C]/[0.02] shadow-sm">
            <CardHeader className="border-b border-[#B91C1C]/10">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-[16px] text-foreground flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#B91C1C]" />
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
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[#B91C1C]/10 text-[#B91C1C] font-medium">
                      -12% decline
                    </span>
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    Blue River basin — 8 surveys show population decrease since 2024
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-foreground">Longnose Dace (LND)</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[#D97706]/10 text-[#D97706] font-medium">
                      Monitoring
                    </span>
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    Arkansas River — Low CPUE reported in 3 recent surveys
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-foreground">Brook Trout (BKT)</span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[#D97706]/10 text-[#D97706] font-medium">
                      Range shift
                    </span>
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    Southwest region — Expanding into non-native watersheds
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