import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Download, FileSpreadsheet, TrendingUp, Info, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { WaterBanner } from '../components/WaterBanner';
import { RoleIndicator } from '../components/RoleIndicator';
import { useRole } from '../context/RoleContext';

export default function Insights() {
  const { role } = useRole();
  const [metric, setMetric] = useState('population');
  const [compareMode, setCompareMode] = useState(false);
  
  // Multi-year trend data - South Platte Basin
  const trendData = [
    { year: '2018', population: 2845, cpue: 98, biomass: 145 },
    { year: '2019', population: 3124, cpue: 112, biomass: 167 },
    { year: '2020', population: 2967, cpue: 105, biomass: 158 },
    { year: '2021', population: 3389, cpue: 124, biomass: 189 },
    { year: '2022', population: 3456, cpue: 128, biomass: 195 },
    { year: '2023', population: 3512, cpue: 131, biomass: 201 },
    { year: '2024', population: 3678, cpue: 138, biomass: 214 },
    { year: '2025', population: 3812, cpue: 143, biomass: 223 },
  ];
  
  // Multi-water comparison data (Colorado River and Blue River for comparison)
  const compareData = [
    { year: '2018', southPlatte: 2845, coloradoRiver: 4234, blueRiver: 1823 },
    { year: '2019', southPlatte: 3124, coloradoRiver: 4512, blueRiver: 1967 },
    { year: '2020', southPlatte: 2967, coloradoRiver: 4389, blueRiver: 1789 },
    { year: '2021', southPlatte: 3389, coloradoRiver: 4678, blueRiver: 2034 },
    { year: '2022', southPlatte: 3456, coloradoRiver: 4823, blueRiver: 2145 },
    { year: '2023', southPlatte: 3512, coloradoRiver: 4967, blueRiver: 2234 },
    { year: '2024', southPlatte: 3678, coloradoRiver: 5123, blueRiver: 2389 },
    { year: '2025', southPlatte: 3812, coloradoRiver: 5298, blueRiver: 2456 },
  ];
  
  // Length-frequency data
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
        return { key: 'biomass', name: 'Biomass (kg/ha)', color: '#5B7C99' };
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
              <h1 className="text-[22px] font-semibold text-primary">Water Intelligence — South Platte Basin</h1>
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
        waterName="South Platte Basin"
        region="Northeast"
        watershed="HUC12-14010001"
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
          
          {/* Context Banner */}
          <div className="bg-muted/20 border border-border rounded px-4 py-3">
            <p className="text-[13px] text-foreground">
              Based on <span className="font-semibold">47 surveys</span> conducted between <span className="font-semibold">2018–2025</span> using <span className="font-semibold">Two-Pass Removal</span> protocol.
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
                    <p className="text-[32px] font-semibold leading-none text-foreground">3,812</p>
                    <p className="text-[12px] text-[#059669] flex items-center gap-1 mt-2">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +3.5% from 2024
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground">
                    <p>95% CI:</p>
                    <p className="font-mono">3,589 - 4,021</p>
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
                    <p className="text-[32px] font-semibold leading-none text-foreground">143</p>
                    <p className="text-[12px] text-[#059669] flex items-center gap-1 mt-2">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +3.6% from 2024
                    </p>
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
                    <p className="text-[32px] font-semibold leading-none text-foreground">223</p>
                    <p className="text-[12px] text-[#059669] flex items-center gap-1 mt-2">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +4.3% from 2024
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground">
                    <p>kg/ha</p>
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
                    {compareMode && role === 'senior-biologist' ? (
                      <>Comparing population trends across <span className="font-medium text-foreground">3 basins</span> — Strategic multi-basin analysis enabled</>
                    ) : (
                      <>Based on <span className="font-medium text-foreground">47 surveys</span> conducted between{' '}
                      <span className="font-medium text-foreground">2018–2025</span> using{' '}
                      <span className="font-medium text-foreground">Two-Pass Removal</span> protocol</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {role === 'senior-biologist' && (
                    <div className="flex items-center gap-2 px-3 py-1.5 border border-border rounded bg-muted/20">
                      <span className="text-[12px] text-muted-foreground">View:</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setCompareMode(false)}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                            !compareMode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Single Water
                        </button>
                        <button
                          onClick={() => setCompareMode(true)}
                          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                            compareMode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Compare Waters
                        </button>
                      </div>
                    </div>
                  )}
                  <Select value={metric} onValueChange={setMetric}>
                    <SelectTrigger className="w-[200px] text-[13px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="population">Population Estimate</SelectItem>
                      <SelectItem value="cpue">CPUE</SelectItem>
                      <SelectItem value="biomass">Biomass (kg/ha)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {compareMode && role === 'senior-biologist' && (
                <div className="mb-4 px-3 py-2 bg-primary/5 border border-primary/20 rounded">
                  <p className="text-[11px] text-muted-foreground">
                    <span className="font-medium text-primary">Multi-Basin Analysis Mode</span> — Statewide comparison enabled for strategic decision-making
                  </p>
                </div>
              )}
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  {compareMode && role === 'senior-biologist' ? (
                    <LineChart data={compareData}>
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
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          fontSize: '13px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '13px', paddingTop: '16px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="southPlatte" 
                        name="South Platte Basin"
                        stroke="#1B365D"
                        strokeWidth={3}
                        dot={{ fill: '#1B365D', r: 5, strokeWidth: 2, stroke: 'white' }}
                        activeDot={{ r: 7 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="coloradoRiver" 
                        name="Colorado River"
                        stroke="#2F6F73"
                        strokeWidth={3}
                        dot={{ fill: '#2F6F73', r: 5, strokeWidth: 2, stroke: 'white' }}
                        activeDot={{ r: 7 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="blueRiver" 
                        name="Blue River"
                        stroke="#5B7C99"
                        strokeWidth={3}
                        dot={{ fill: '#5B7C99', r: 5, strokeWidth: 2, stroke: 'white' }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  ) : (
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
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          fontSize: '13px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '13px', paddingTop: '16px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey={metricInfo.key} 
                        name={metricInfo.name}
                        stroke={metricInfo.color}
                        strokeWidth={3}
                        dot={{ fill: metricInfo.color, r: 5, strokeWidth: 2, stroke: 'white' }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
              
              {compareMode && role === 'senior-biologist' && (
                <div className="mt-6 p-4 border border-primary/20 bg-primary/5 rounded">
                  <h4 className="text-[12px] font-medium text-foreground mb-3">Statewide Delta Analysis</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 border border-border/50 rounded bg-white">
                      <p className="text-[11px] text-muted-foreground mb-1">Colorado River</p>
                      <p className="text-[20px] font-semibold text-[#059669]">+39%</p>
                      <p className="text-[10px] text-muted-foreground">vs. 2018 baseline</p>
                    </div>
                    <div className="text-center p-3 border border-border/50 rounded bg-white">
                      <p className="text-[11px] text-muted-foreground mb-1">South Platte Basin</p>
                      <p className="text-[20px] font-semibold text-[#059669]">+34%</p>
                      <p className="text-[10px] text-muted-foreground">vs. 2018 baseline</p>
                    </div>
                    <div className="text-center p-3 border border-border/50 rounded bg-white">
                      <p className="text-[11px] text-muted-foreground mb-1">Blue River</p>
                      <p className="text-[20px] font-semibold text-[#059669]">+35%</p>
                      <p className="text-[10px] text-muted-foreground">vs. 2018 baseline</p>
                    </div>
                  </div>
                </div>
              )}
              
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
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E2E8F0',
                          borderRadius: '6px',
                          fontSize: '13px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                        }}
                        cursor={{ fill: '#1B365D', opacity: 0.1 }}
                      />
                      <Bar dataKey="count" fill="#1B365D" radius={[4, 4, 0, 0]} />
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
                        <span className="font-mono font-medium text-foreground">3,589</span>
                      </div>
                      <div className="flex justify-between text-[12px]">
                        <span className="text-muted-foreground">Upper Bound</span>
                        <span className="font-mono font-medium text-foreground">4,021</span>
                      </div>
                      <div className="flex justify-between text-[12px] pt-2 border-t border-primary/10">
                        <span className="text-muted-foreground">Margin of Error</span>
                        <span className="font-mono font-medium text-foreground">±5.7%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-border shadow-sm">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="text-[16px]">Survey Water Bodies</CardTitle>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Geographic coverage
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="aspect-square bg-muted/30 rounded border border-border/50 flex items-center justify-center relative overflow-hidden mb-4">
                    <div className="absolute inset-0 opacity-40">
                      <div className="absolute top-[20%] left-[30%] w-2 h-2 bg-primary rounded-full"></div>
                      <div className="absolute top-[35%] left-[65%] w-2 h-2 bg-primary rounded-full"></div>
                      <div className="absolute top-[55%] left-[45%] w-2 h-2 bg-secondary rounded-full"></div>
                      <div className="absolute top-[70%] left-[25%] w-2 h-2 bg-secondary rounded-full"></div>
                      <div className="absolute top-[50%] left-[75%] w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <div className="relative z-10 text-center">
                      <Download className="w-8 h-8 text-muted-foreground mx-auto mb-1.5" />
                      <p className="text-[11px] text-muted-foreground">8 Water Bodies</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-[12px]">
                    <div className="flex justify-between p-2 border border-border/50 rounded bg-white">
                      <span className="text-muted-foreground">Colorado River</span>
                      <span className="font-mono font-medium">18 surveys</span>
                    </div>
                    <div className="flex justify-between p-2 border border-border/50 rounded bg-white">
                      <span className="text-muted-foreground">Blue River</span>
                      <span className="font-mono font-medium">12 surveys</span>
                    </div>
                    <div className="flex justify-between p-2 border border-border/50 rounded bg-white">
                      <span className="text-muted-foreground">Roaring Fork</span>
                      <span className="font-mono font-medium">9 surveys</span>
                    </div>
                    <div className="flex justify-between p-2 border border-border/50 rounded bg-white">
                      <span className="text-muted-foreground">Other (5 waters)</span>
                      <span className="font-mono font-medium">8 surveys</span>
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