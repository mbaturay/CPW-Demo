import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { WaterBanner } from '../components/WaterBanner';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, ScatterChart, ZAxis } from 'recharts';
import { TrendingUp, AlertTriangle, MapPin, FileText, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router';
import { RoleIndicator } from '../components/RoleIndicator';
import { useRole } from '../context/RoleContext';
import { Breadcrumb } from '../components/Breadcrumb';

export default function WaterProfile() {
  const { role } = useRole();
  
  // Survey activity over time
  const activityData = [
    { year: '2018', surveys: 5 },
    { year: '2019', surveys: 6 },
    { year: '2020', surveys: 4 },
    { year: '2021', surveys: 7 },
    { year: '2022', surveys: 6 },
    { year: '2023', surveys: 8 },
    { year: '2024', surveys: 6 },
    { year: '2025', surveys: 5 },
  ];
  
  // Survey timeline data - individual surveys plotted
  const timelineData = [
    { year: 2018, month: 3, id: 'SRV-2018-014', protocol: 'Two-Pass Removal', fish: 892 },
    { year: 2018, month: 6, id: 'SRV-2018-067', protocol: 'Single Pass', fish: 456 },
    { year: 2018, month: 8, id: 'SRV-2018-123', protocol: 'Two-Pass Removal', fish: 1034 },
    { year: 2018, month: 10, id: 'SRV-2018-189', protocol: 'Two-Pass Removal', fish: 923 },
    { year: 2019, month: 4, id: 'SRV-2019-034', protocol: 'Two-Pass Removal', fish: 1123 },
    { year: 2019, month: 7, id: 'SRV-2019-098', protocol: 'Single Pass', fish: 567 },
    { year: 2019, month: 9, id: 'SRV-2019-156', protocol: 'Two-Pass Removal', fish: 1245 },
    { year: 2020, month: 5, id: 'SRV-2020-045', protocol: 'Two-Pass Removal', fish: 987 },
    { year: 2020, month: 8, id: 'SRV-2020-112', protocol: 'Two-Pass Removal', fish: 1089 },
    { year: 2021, month: 3, id: 'SRV-2021-023', protocol: 'Single Pass', fish: 645 },
    { year: 2021, month: 6, id: 'SRV-2021-089', protocol: 'Two-Pass Removal', fish: 1456 },
    { year: 2021, month: 8, id: 'SRV-2021-134', protocol: 'Two-Pass Removal', fish: 1389 },
    { year: 2021, month: 10, id: 'SRV-2021-198', protocol: 'Two-Pass Removal', fish: 1267 },
    { year: 2022, month: 4, id: 'SRV-2022-034', protocol: 'Two-Pass Removal', fish: 1298 },
    { year: 2022, month: 7, id: 'SRV-2022-101', protocol: 'Single Pass', fish: 723 },
    { year: 2022, month: 9, id: 'SRV-2022-167', protocol: 'Two-Pass Removal', fish: 1345 },
    { year: 2023, month: 3, id: 'SRV-2023-029', protocol: 'Two-Pass Removal', fish: 1423 },
    { year: 2023, month: 5, id: 'SRV-2023-078', protocol: 'Single Pass', fish: 789 },
    { year: 2023, month: 7, id: 'SRV-2023-123', protocol: 'Two-Pass Removal', fish: 1501 },
    { year: 2023, month: 9, id: 'SRV-2023-178', protocol: 'Two-Pass Removal', fish: 1456 },
    { year: 2024, month: 4, id: 'SRV-2024-042', protocol: 'Two-Pass Removal', fish: 1489 },
    { year: 2024, month: 8, id: 'SRV-2024-134', protocol: 'Two-Pass Removal', fish: 1534 },
    { year: 2025, month: 3, id: 'SRV-2025-031', protocol: 'Two-Pass Removal', fish: 1512 },
    { year: 2025, month: 9, id: 'SRV-2025-198', protocol: 'Two-Pass Removal', fish: 1589 },
  ];
  
  // Species composition
  const speciesData = [
    { species: 'Brown Trout', count: 6234 },
    { species: 'Rainbow', count: 3891 },
    { species: 'Cutthroat', count: 1456 },
    { species: 'Brook', count: 723 },
  ];
  
  const recentSurveys = [
    { id: 'SRV-2026-089', station: 'SP-04', date: '2026-02-10', protocol: 'Two-Pass Removal', status: 'Validated' },
    { id: 'SRV-2026-067', station: 'SP-02', date: '2026-01-28', protocol: 'Single Pass', status: 'Validated' },
    { id: 'SRV-2025-234', station: 'SP-06', date: '2025-11-15', protocol: 'Two-Pass Removal', status: 'Validated' },
    { id: 'SRV-2025-198', station: 'SP-04', date: '2025-09-22', protocol: 'Two-Pass Removal', status: 'Validated' },
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border px-8 py-6">
        <div className="max-w-[1280px] mx-auto">
          <Breadcrumb items={[
            { label: 'Waters', path: '/' },
            { label: 'South Platte Basin' }
          ]} />
          <div className="flex items-center justify-between mt-3">
            <div>
              <h1 className="text-[22px] font-semibold text-primary">Water Profile — South Platte Basin</h1>
              <p className="text-[13px] text-muted-foreground mt-1">
                Comprehensive water body intelligence and survey history
              </p>
            </div>
            <RoleIndicator />
          </div>
        </div>
      </header>
      
      <WaterBanner
        waterName="South Platte Basin"
        region="Northeast"
        watershed="HUC12-123456"
        stations={6}
        totalSurveys={47}
        yearsActive="1998–2025"
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
              
              {/* Survey Activity Status Section */}
              <div>
                <h2 className="text-[18px] font-semibold text-foreground mb-4">Survey Activity Status</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border border-border shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[13px] text-muted-foreground mb-2">Uploaded</p>
                          <p className="text-[32px] font-semibold text-foreground leading-none">4</p>
                          <p className="text-[12px] text-muted-foreground mt-2">surveys submitted</p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-[#059669] mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-border shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[13px] text-muted-foreground mb-2">Pending Validation</p>
                          <p className="text-[32px] font-semibold text-foreground leading-none">1</p>
                          <p className="text-[12px] text-muted-foreground mt-2">awaiting data quality check</p>
                        </div>
                        <Clock className="w-5 h-5 text-[#D97706] mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-border shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[13px] text-muted-foreground mb-2">Returned for Correction</p>
                          <p className="text-[32px] font-semibold text-foreground leading-none">0</p>
                          <p className="text-[12px] text-muted-foreground mt-2">requiring revision</p>
                        </div>
                        <AlertTriangle className="w-5 h-5 text-[#B91C1C] mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border border-border shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[13px] text-muted-foreground mb-2">Awaiting Biologist Approval</p>
                          <p className="text-[32px] font-semibold text-foreground leading-none">1</p>
                          <p className="text-[12px] text-muted-foreground mt-2">under supervisor review</p>
                        </div>
                        <Clock className="w-5 h-5 text-primary mt-1" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              {/* Recent Surveys - Keep this for Data Entry */}
              <Card className="border border-border shadow-sm">
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
                        className="flex items-center justify-between p-4 border border-border/50 rounded bg-white hover:bg-muted/20 transition-colors"
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
                          <span className="inline-flex px-2 py-0.5 bg-[#059669]/10 text-[#059669] rounded text-[11px] font-medium">
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
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Current Population
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[28px] font-semibold leading-none text-foreground">3,812</p>
                    <p className="text-[12px] text-[#059669] flex items-center gap-1 mt-2">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Stable trend
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Primary Species
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-[28px] font-semibold leading-none text-foreground">BNT</p>
                <p className="text-[12px] text-muted-foreground mt-2">Brown Trout</p>
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Last Survey
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-[28px] font-semibold leading-none text-foreground">Feb 10</p>
                <p className="text-[12px] text-muted-foreground mt-2">2026</p>
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Water Status
                </p>
              </CardHeader>
              <CardContent>
                <div className="inline-flex px-2 py-1 bg-[#059669]/10 text-[#059669] rounded text-[11px] font-medium">
                  Active Monitoring
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Survey Activity History */}
            <Card className="lg:col-span-2 border border-border shadow-sm">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="text-[16px]">Survey Activity History</CardTitle>
                <p className="text-[12px] text-muted-foreground mt-1">
                  Annual survey frequency over time
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[280px] min-h-[280px]">
                  <ResponsiveContainer width="100%" height="100%" minHeight={280}>
                    <BarChart data={activityData}>
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
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          fontSize: '13px'
                        }}
                      />
                      <Bar dataKey="surveys" fill="#1B365D" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Species Composition */}
            <Card className="border border-border shadow-sm">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="text-[16px]">Species Composition</CardTitle>
                <p className="text-[12px] text-muted-foreground mt-1">
                  All-time catch distribution
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {speciesData.map((species, index) => (
                    <div key={species.species}>
                      <div className="flex justify-between text-[12px] mb-1.5">
                        <span className="text-muted-foreground">{species.species}</span>
                        <span className="font-mono text-foreground font-medium">{species.count.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-muted rounded overflow-hidden">
                        <div 
                          className={`h-full ${
                            index === 0 ? 'bg-primary' :
                            index === 1 ? 'bg-secondary' :
                            index === 2 ? 'bg-[#5B7C99]' :
                            'bg-muted-foreground'
                          }`}
                          style={{ width: `${(species.count / 6234) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Survey Activity Timeline - Full Width */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-[16px]">Survey Activity Timeline</CardTitle>
              <p className="text-[12px] text-muted-foreground mt-1">
                Individual survey events plotted across years — reinforcing water → surveys → time → trend
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[120px] min-h-[120px]">
                <ResponsiveContainer width="100%" height="100%" minHeight={120}>
                  <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis 
                      type="number" 
                      dataKey="year" 
                      domain={[2017.5, 2025.5]}
                      ticks={[2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]}
                      stroke="#64748B"
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      axisLine={{ stroke: '#E2E8F0' }}
                    />
                    <YAxis 
                      type="number"
                      dataKey="month"
                      domain={[0, 12]}
                      ticks={[]}
                      stroke="#64748B"
                      axisLine={{ stroke: '#E2E8F0' }}
                    />
                    <ZAxis range={[30, 30]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white border border-border rounded px-3 py-2 text-[12px] shadow-sm">
                              <p className="font-mono text-primary font-medium">{data.id}</p>
                              <p className="text-muted-foreground mt-0.5">{data.protocol}</p>
                              <p className="text-foreground mt-0.5">{data.fish.toLocaleString()} fish</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter data={timelineData} fill="#1B365D" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Surveys */}
            <Card className="lg:col-span-2 border border-border shadow-sm">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-[16px]">Recent Survey Activity</CardTitle>
                    <p className="text-[12px] text-muted-foreground mt-1">
                      Latest field data collections
                    </p>
                  </div>
                  <Link to="/insights">
                    <Button variant="outline" size="sm" className="text-[13px]">
                      View All Analytics
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {recentSurveys.map((survey) => (
                    <div 
                      key={survey.id}
                      className="flex items-center justify-between p-4 border border-border/50 rounded bg-white hover:bg-muted/20 transition-colors"
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
                        <span className="inline-flex px-2 py-0.5 bg-[#059669]/10 text-[#059669] rounded text-[11px] font-medium">
                          {survey.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Stations in Basin */}
            <div>
              <h3 className="text-[14px] font-semibold text-foreground mb-4">Stations in Basin</h3>
              <div className="flex flex-wrap gap-3">
                {['SP-02', 'SP-04', 'SP-06', 'SP-08', 'SP-12', 'SP-15'].map((station) => (
                  <button
                    key={station}
                    className="px-4 py-2 border border-border rounded bg-white hover:bg-muted/20 transition-colors text-[13px] font-mono font-medium text-foreground"
                  >
                    {station}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Management Notes */}
          <Card className="border border-[#D97706]/20 bg-[#D97706]/[0.02] shadow-sm">
            <CardHeader className="border-b border-[#D97706]/10">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#D97706] mt-0.5" />
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
                    Brown trout population remains stable with good recruitment observed in recent surveys
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="text-muted-foreground">•</span>
                  <p className="text-foreground">
                    Continue Two-Pass Removal protocol for population estimates at stations SP-04 and SP-06
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