import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { AlertTriangle, FileSpreadsheet, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router';
import { RoleIndicator } from '../components/RoleIndicator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function SeniorBiologistDashboard() {
  const [regionFilter, setRegionFilter] = useState('statewide');
  
  const regionalData = [
    { region: 'Northeast', waters: 23, surveys: 147, compliance: 94 },
    { region: 'Southeast', waters: 18, surveys: 112, compliance: 89 },
    { region: 'Northwest', waters: 31, surveys: 189, compliance: 87 },
    { region: 'Southwest', waters: 27, surveys: 156, compliance: 91 },
    { region: 'Central', waters: 19, surveys: 98, compliance: 96 },
  ];
  
  const crossWaterTrends = [
    { water: 'South Platte Basin', region: 'Northeast', trend: '+8%', population: 3812, status: 'Stable' },
    { water: 'Arkansas River', region: 'Southeast', trend: '-4%', population: 2456, status: 'Declining' },
    { water: 'Blue River', region: 'Northwest', trend: '-12%', population: 1834, status: 'Concern' },
    { water: 'Colorado River', region: 'Northwest', trend: '+3%', population: 4123, status: 'Stable' },
    { water: 'Cache la Poudre', region: 'Northeast', trend: '+6%', population: 2987, status: 'Stable' },
  ];
  
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
            <RoleIndicator />
          </div>
        </div>
      </header>
      
      <div className="px-8 py-8">
        <div className="max-w-[1280px] mx-auto space-y-8">
          
          {/* Regional Filter Bar */}
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
              <Button variant="outline" size="sm" className="text-[13px]">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export Statewide Report
              </Button>
              <Button variant="outline" size="sm" className="text-[13px]">
                <BarChart3 className="w-4 h-4 mr-2" />
                Open in Tableau
              </Button>
            </div>
          </div>
          
          {/* Statewide Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Total Waters Monitored
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-[28px] font-semibold text-foreground mb-1">118</div>
                <p className="text-[11px] text-muted-foreground">Across 5 regions, 702 surveys YTD</p>
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Waters Flagged for Review
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-[28px] font-semibold text-foreground mb-1">7</div>
                <p className="text-[11px] text-destructive">Population declines require analysis</p>
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Federal Reporting Readiness
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-[28px] font-semibold text-foreground mb-1">82%</div>
                <p className="text-[11px] text-muted-foreground">Avg. completion across 4 requirements</p>
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Data Quality Score
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-[28px] font-semibold text-foreground mb-1">96%</div>
                <p className="text-[11px] text-success">Validation rate across all surveys</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Regional Performance Comparison */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[16px]">Regional Performance Comparison</CardTitle>
                  <p className="text-[12px] text-muted-foreground mt-1">Survey activity and compliance metrics by region</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionalData}>
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
                    {/* POWERAPPS-ALIGNMENT: Removed Tooltip and rounded bar corners */}
                    <Bar dataKey="surveys" fill="#1B365D" name="Total Surveys" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cross-Water Population Trends */}
            <Card className="border border-border shadow-sm">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[16px]">Cross-Water Population Trends</CardTitle>
                    <p className="text-[12px] text-muted-foreground mt-1">Multi-basin comparative analysis</p>
                  </div>
                  <Link to="/query">
                    <Button variant="outline" size="sm" className="text-[12px]">
                      Advanced Query
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
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
              </CardContent>
            </Card>
            
            {/* Federal Reporting Compliance */}
            <Card className="border border-border shadow-sm">
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
          <Card className="border border-destructive/20 bg-destructive/[0.02] shadow-sm">
            <CardHeader className="border-b border-destructive/10">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
