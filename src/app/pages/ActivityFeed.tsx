import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { RoleIndicator } from '../components/RoleIndicator';

type Survey = {
  id: string;
  station: string;
  protocol: string;
  date: string;
  status: string;
};

type WaterGroup = {
  name: string;
  surveys: Survey[];
  expanded: boolean;
};

export default function ActivityFeed() {
  const [waters, setWaters] = useState<WaterGroup[]>([
    {
      name: 'South Platte Basin',
      expanded: true,
      surveys: [
        { id: 'SRV-2026-089', station: 'SP-04', protocol: 'Two-Pass Removal', date: '2026-02-10', status: 'Validated' },
        { id: 'SRV-2026-081', station: 'SP-02', protocol: 'Single Pass', date: '2026-02-05', status: 'Pending' },
        { id: 'SRV-2026-072', station: 'SP-06', protocol: 'Two-Pass Removal', date: '2026-01-28', status: 'Validated' },
      ],
    },
    {
      name: 'Cache la Poudre',
      expanded: true,
      surveys: [
        { id: 'SRV-2026-088', station: 'CP-12', protocol: 'Single Pass', date: '2026-02-09', status: 'Validated' },
        { id: 'SRV-2026-078', station: 'CP-08', protocol: 'Two-Pass Removal', date: '2026-02-03', status: 'Pending' },
      ],
    },
    {
      name: 'Blue River',
      expanded: true,
      surveys: [
        { id: 'SRV-2026-087', station: 'BR-06', protocol: 'Two-Pass Removal', date: '2026-02-09', status: 'Pending' },
        { id: 'SRV-2026-079', station: 'BR-04', protocol: 'Single Pass', date: '2026-02-04', status: 'Validated' },
        { id: 'SRV-2026-071', station: 'BR-02', protocol: 'Two-Pass Removal', date: '2026-01-27', status: 'Validated' },
      ],
    },
    {
      name: 'Arkansas River',
      expanded: true,
      surveys: [
        { id: 'SRV-2026-086', station: 'AR-18', protocol: 'Electrofish Survey', date: '2026-02-08', status: 'Validated' },
        { id: 'SRV-2026-080', station: 'AR-12', protocol: 'Two-Pass Removal', date: '2026-02-04', status: 'Validated' },
      ],
    },
    {
      name: 'Roaring Fork',
      expanded: true,
      surveys: [
        { id: 'SRV-2026-085', station: 'RF-03', protocol: 'Two-Pass Removal', date: '2026-02-07', status: 'Validated' },
      ],
    },
  ]);

  const toggleWater = (waterName: string) => {
    setWaters(waters.map(w => 
      w.name === waterName ? { ...w, expanded: !w.expanded } : w
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border px-8 py-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-semibold text-primary">All Survey Activity — Northeast Region</h1>
              <p className="text-[13px] text-muted-foreground mt-1">
                Comprehensive review queue grouped by water body
              </p>
            </div>
            <RoleIndicator />
          </div>
        </div>
      </header>
      
      {/* Regional Scope Strip */}
      <div className="bg-muted/20 border-b border-border px-8 py-3">
        <div className="max-w-[1280px] mx-auto">
          <p className="text-[12px] text-muted-foreground">
            <span className="font-medium text-foreground">Regional Scope Active</span> — Northeast Basin
          </p>
        </div>
      </div>
      
      <div className="px-8 py-8">
        <div className="max-w-[1280px] mx-auto space-y-6">
          
          {/* Filters */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-[16px]">Filters</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="filter-water" className="text-[13px]">Water</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="filter-water" className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Waters</SelectItem>
                      <SelectItem value="south-platte">South Platte Basin</SelectItem>
                      <SelectItem value="cache-poudre">Cache la Poudre</SelectItem>
                      <SelectItem value="blue-river">Blue River</SelectItem>
                      <SelectItem value="arkansas">Arkansas River</SelectItem>
                      <SelectItem value="roaring-fork">Roaring Fork</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="filter-status" className="text-[13px]">Status</Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="filter-status" className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="validated">Validated</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="filter-date" className="text-[13px]">Date Range</Label>
                  <Input 
                    id="filter-date" 
                    type="date"
                    defaultValue="2026-01-01"
                    className="mt-1.5 text-[12px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Water-Grouped Activity */}
          <div className="space-y-4">
            {waters.map((water) => (
              <Card key={water.name} className="border border-border shadow-sm">
                <CardHeader 
                  className="border-b border-border/50 cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => toggleWater(water.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {water.expanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <div>
                        <Link 
                          to="/water" 
                          className="text-[16px] font-semibold text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {water.name}
                        </Link>
                        <p className="text-[12px] text-muted-foreground mt-0.5">
                          {water.surveys.length} survey{water.surveys.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">
                        {water.surveys.filter(s => s.status === 'Pending').length} pending review
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                {water.expanded && (
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {water.surveys.map((survey) => (
                        <div 
                          key={survey.id}
                          className="flex items-center justify-between p-4 border border-border/50 rounded bg-white hover:bg-muted/20 transition-colors"
                        >
                          <div className="flex items-center gap-6">
                            <div>
                              <p className="text-[13px] font-mono text-primary font-medium">{survey.id}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                Station {survey.station}
                              </p>
                            </div>
                            <div>
                              <p className="text-[12px] text-muted-foreground">{survey.protocol}</p>
                            </div>
                            <div>
                              <p className="text-[12px] text-muted-foreground">{survey.date}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className={`
                              inline-flex px-2 py-0.5 rounded text-[11px] font-medium
                              ${survey.status === 'Validated' 
                                ? 'bg-[#059669]/10 text-[#059669]' 
                                : 'bg-[#D97706]/10 text-[#D97706]'
                              }
                            `}>
                              {survey.status}
                            </span>
                            <Link to="/validation">
                              <Button variant="outline" size="sm" className="text-[12px] h-7">
                                Review
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
}
