import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { RoleIndicator } from '../components/RoleIndicator';
import { waters, surveys, buildActivityFeed } from '../data/world';
import type { SurveyStatus } from '../data/world';

export default function ActivityFeed() {
  const activityItems = buildActivityFeed('Northeast');
  const neWaters = waters.filter(w => w.region === 'Northeast');

  // Group activity items by water
  const groupedByWater = new Map<string, typeof activityItems>();
  for (const item of activityItems) {
    const group = groupedByWater.get(item.waterId) ?? [];
    group.push(item);
    groupedByWater.set(item.waterId, group);
  }

  const initialWaterGroups = Array.from(groupedByWater.entries()).map(([waterId, items]) => ({
    waterId,
    name: items[0].waterName,
    items,
    expanded: true,
  }));

  const [waterGroups, setWaterGroups] = useState(initialWaterGroups);

  const toggleWater = (waterId: string) => {
    setWaterGroups(waterGroups.map(w =>
      w.waterId === waterId ? { ...w, expanded: !w.expanded } : w
    ));
  };

  const getStatusStyle = (status: SurveyStatus) => {
    switch (status) {
      case 'Approved': case 'Published':
        return 'bg-[#059669]/10 text-[#059669]';
      case 'Flagged Suspect': case 'Returned for Correction':
        return 'bg-[#B91C1C]/10 text-[#B91C1C]';
      default:
        return 'bg-[#D97706]/10 text-[#D97706]';
    }
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
                      {neWaters.map(w => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
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
                    defaultValue="2025-01-01"
                    className="mt-1.5 text-[12px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Water-Grouped Activity */}
          <div className="space-y-4">
            {waterGroups.map((water) => (
              <Card key={water.waterId} className="border border-border shadow-sm">
                <CardHeader
                  className="border-b border-border/50 cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => toggleWater(water.waterId)}
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
                          to={`/water?waterId=${water.waterId}`}
                          className="text-[16px] font-semibold text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {water.name}
                        </Link>
                        <p className="text-[12px] text-muted-foreground mt-0.5">
                          {water.items.length} survey{water.items.length !== 1 ? 's' : ''} requiring action
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-muted-foreground">
                        {water.items.filter(s => s.status === 'Pending Validation' || s.status === 'Pending Approval').length} pending review
                      </span>
                    </div>
                  </div>
                </CardHeader>

                {water.expanded && (
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {water.items.map((item) => {
                        const survey = surveys.find(s => s.id === item.surveyId)!;
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-4 border border-border/50 rounded bg-white hover:bg-muted/20 transition-colors"
                          >
                            <div className="flex items-center gap-6">
                              <div>
                                <p className="text-[13px] font-mono text-primary font-medium">{item.surveyId}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                  Station {item.stationId}
                                </p>
                              </div>
                              <div>
                                <p className="text-[12px] text-muted-foreground">{survey.protocol}</p>
                              </div>
                              <div>
                                <p className="text-[12px] text-muted-foreground">{item.date}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${getStatusStyle(item.status)}`}>
                                {item.status}
                              </span>
                              <Link to={`/validation?surveyId=${item.surveyId}`}>
                                <Button variant="outline" size="sm" className="text-[12px] h-7">
                                  {item.primaryAction}
                                </Button>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
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
