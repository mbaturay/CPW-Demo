import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';
import { Plus, X, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';

import { useRole } from '../context/RoleContext';
import { waters, species as allSpecies } from '../data/world';
import { useDemo } from '../context/DemoContext';
import {
  runCrossSurveyQuery,
  encodeQueryState,
  defaultQueryState,
  type QueryState,
  type QueryResult,
} from '../../lib/crossSurveyQuery';

type Condition = {
  id: string;
  field: string;
  operator: string;
  value: string;
};

export default function QueryBuilder() {
  const { role } = useRole();
  const { surveys } = useDemo();
  const navigate = useNavigate();

  const [conditions, setConditions] = useState<Condition[]>([
    { id: '1', field: 'species', operator: 'equals', value: 'Brown Trout' },
    { id: '2', field: 'region', operator: 'equals', value: 'Northeast' },
    { id: '3', field: 'year', operator: 'greater-equal', value: '2018' }
  ]);
  const [excludeYOY, setExcludeYOY] = useState(defaultQueryState.excludeYOY);
  const [unit, setUnit] = useState<'mm' | 'inches'>(defaultQueryState.unit);
  const [advancedMode, setAdvancedMode] = useState(false);

  // Controlled filter state
  const [selectedWater, setSelectedWater] = useState(defaultQueryState.water);
  const [selectedSpecies, setSelectedSpecies] = useState(defaultQueryState.species);
  const [selectedRegion, setSelectedRegion] = useState(defaultQueryState.region);
  const [selectedProtocol, setSelectedProtocol] = useState(defaultQueryState.protocol);
  const [dateFrom, setDateFrom] = useState(defaultQueryState.dateFrom);
  const [dateTo, setDateTo] = useState(defaultQueryState.dateTo);

  // Build current QueryState
  const queryState: QueryState = useMemo(() => ({
    water: selectedWater,
    species: selectedSpecies,
    region: selectedRegion,
    protocol: selectedProtocol,
    dateFrom,
    dateTo,
    excludeYOY,
    unit,
  }), [selectedWater, selectedSpecies, selectedRegion, selectedProtocol, dateFrom, dateTo, excludeYOY, unit]);

  // Debounced query results
  const [isUpdating, setIsUpdating] = useState(false);
  const [results, setResults] = useState<QueryResult>(() => runCrossSurveyQuery(surveys, queryState));
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIsUpdating(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setResults(runCrossSurveyQuery(surveys, queryState));
      setIsUpdating(false);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [queryState, surveys]);

  // Derive water options: NE for area biologist, all for senior
  const waterOptions = role === 'area-biologist'
    ? waters.filter(w => w.region === 'Northeast')
    : waters;

  const { matchingSurveys, aggregates } = results;
  const hasResults = matchingSurveys.length > 0;

  // Species distribution bar colors
  const speciesBarColors = ['bg-primary', 'bg-secondary', 'bg-[#5B7C99]', 'bg-muted-foreground'];

  // Navigate to Insights with encoded query state
  const handleOpenAnalysis = () => {
    const encoded = encodeQueryState(queryState);
    navigate(`/insights?q=${encoded}`);
  };

  const addCondition = () => {
    setConditions([
      ...conditions,
      { id: Date.now().toString(), field: 'species', operator: 'equals', value: '' }
    ]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border px-8 py-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-semibold text-primary">Cross-Survey Query</h1>
              <p className="text-[13px] text-muted-foreground mt-1">
                Analyze multi-year population trends across waters and species
              </p>
            </div>
            <div className="flex items-center gap-3">

              {role === 'senior-biologist' && (
                <div className="flex items-center gap-2 px-3 py-1.5 border border-border rounded bg-muted/20">
                  <span className="text-[12px] text-muted-foreground">Mode:</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setAdvancedMode(false)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        !advancedMode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      Standard
                    </button>
                    <button
                      onClick={() => setAdvancedMode(true)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        advancedMode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      Advanced
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Role Scope Banner */}
      {role === 'area-biologist' && (
        <div className="bg-muted/20 border-b border-border px-8 py-3">
          <div className="max-w-[1280px] mx-auto">
            <p className="text-[12px] text-muted-foreground">
              <span className="font-medium text-foreground">Regional Scope Active</span> — Northeast Basin
            </p>
          </div>
        </div>
      )}

      {role === 'senior-biologist' && advancedMode && (
        <div className="bg-primary/5 border-b border-primary/10 px-8 py-3">
          <div className="max-w-[1280px] mx-auto">
            <p className="text-[12px] text-muted-foreground">
              <span className="font-medium text-primary">Advanced Analysis Mode Active</span> • Multi-water selection, protocol comparison, and year-over-year aggregation enabled
            </p>
          </div>
        </div>
      )}

      <div className="px-8 py-8">
        <div className="max-w-[1280px] mx-auto">

          {/* 2-COLUMN LAYOUT: Filters (left) + Live Results (right, sticky) */}
          <div className="qb-layout">

            {/* ─── Left Column: Filters ─── */}
            <div className="qb-filters space-y-6">

              {/* Basic Filters Card */}
              <Card className="border border-border">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="text-[16px]">Query Filters</CardTitle>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    Define search parameters
                  </p>
                </CardHeader>
                <CardContent className="pt-6 space-y-5">
                  <div>
                    <Label htmlFor="water" className="text-[13px] flex items-center gap-1">
                      {role === 'area-biologist' ? 'Waters in Northeast Region' : 'Water'} <span className="text-destructive">*</span>
                    </Label>
                    <Select value={selectedWater} onValueChange={setSelectedWater}>
                      <SelectTrigger id="water" className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {waterOptions.map(w => (
                          <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                        ))}
                        <SelectItem value="all">All Waters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="h-px bg-border"></div>

                  <div>
                    <Label htmlFor="species" className="text-[13px]">Species</Label>
                    <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
                      <SelectTrigger id="species" className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allSpecies.map(sp => (
                          <SelectItem key={sp.code} value={sp.code.toLowerCase()}>{sp.common} ({sp.code})</SelectItem>
                        ))}
                        <SelectItem value="all">All Species</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="region" className="text-[13px]">Region</Label>
                    <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                      <SelectTrigger id="region" className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nw">Northwest Colorado</SelectItem>
                        <SelectItem value="ne">Northeast Colorado</SelectItem>
                        <SelectItem value="sw">Southwest Colorado</SelectItem>
                        <SelectItem value="se">Southeast Colorado</SelectItem>
                        <SelectItem value="all">All Regions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="date-start" className="text-[13px]">Date Range</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      <Input
                        id="date-start"
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="text-[12px]"
                      />
                      <Input
                        id="date-end"
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="text-[12px]"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="protocol" className="text-[13px]">Protocol Type</Label>
                    <Select value={selectedProtocol} onValueChange={setSelectedProtocol}>
                      <SelectTrigger id="protocol" className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="two-pass">Two-Pass Removal</SelectItem>
                        <SelectItem value="single-pass">Single-Pass CPUE</SelectItem>
                        <SelectItem value="mark-recapture">Mark-Recapture</SelectItem>
                        <SelectItem value="electrofish">Electrofishing CPUE</SelectItem>
                        <SelectItem value="all">All Protocols</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 border-t border-border space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="exclude-yoy" className="text-[13px]">Exclude Young of Year</Label>
                      <Switch
                        id="exclude-yoy"
                        checked={excludeYOY}
                        onCheckedChange={setExcludeYOY}
                      />
                    </div>

                    <div>
                      <Label className="text-[13px] mb-2 block">Measurement Units</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={unit === 'mm' ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1 text-[12px]"
                          onClick={() => setUnit('mm')}
                        >
                          Millimeters
                        </Button>
                        <Button
                          variant={unit === 'inches' ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1 text-[12px]"
                          onClick={() => setUnit('inches')}
                        >
                          Inches
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Conditions — collapsed accordion */}
              <Card className="border border-border">
                <Accordion type="single" collapsible>
                  <AccordionItem value="advanced" className="border-b-0">
                    <CardHeader className="py-0">
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <div>
                          <p className="text-[16px] font-semibold text-foreground">Advanced conditions</p>
                          <p className="text-[12px] text-muted-foreground mt-1">(optional) Build multi-condition queries</p>
                        </div>
                      </AccordionTrigger>
                    </CardHeader>
                    <AccordionContent>
                      <CardContent className="pt-0 space-y-4">
                        {/* Query Condition Chips */}
                        <div className="p-4 border border-primary/30 bg-primary/5 rounded">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-3">Active Query</p>
                          <div className="flex flex-wrap gap-2">
                            {conditions.map((condition, index) => (
                              <div key={condition.id} className="flex items-center gap-1">
                                {index > 0 && (
                                  <span className="text-[11px] font-medium text-muted-foreground px-2">AND</span>
                                )}
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-border rounded text-[12px]">
                                  <span className="font-mono text-primary">{condition.field}</span>
                                  <span className="text-muted-foreground">=</span>
                                  <span className="font-medium">{condition.value || '(empty)'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Condition Builder */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[12px] uppercase tracking-wide text-muted-foreground">
                              Conditions
                            </h4>
                            <Button variant="outline" size="sm" onClick={addCondition} className="text-[12px]">
                              <Plus className="w-3.5 h-3.5 mr-1.5" />
                              Add
                            </Button>
                          </div>
                          {conditions.map((condition, index) => (
                            <div key={condition.id}>
                              {index > 0 && (
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="h-px bg-border flex-1"></div>
                                  <div className="px-3 py-1 bg-muted text-[11px] font-medium text-muted-foreground rounded">
                                    AND
                                  </div>
                                  <div className="h-px bg-border flex-1"></div>
                                </div>
                              )}

                              <div className="p-4 border border-border/50 bg-muted/20 rounded">
                                <div className="flex items-start gap-3">
                                  <div className="flex-1 grid grid-cols-3 gap-3">
                                    <div>
                                      <Label className="text-[11px] text-muted-foreground">Field</Label>
                                      <Select defaultValue={condition.field}>
                                        <SelectTrigger className="mt-1 text-[12px]">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="species">Species</SelectItem>
                                          <SelectItem value="length">Length</SelectItem>
                                          <SelectItem value="weight">Weight</SelectItem>
                                          <SelectItem value="date">Date</SelectItem>
                                          <SelectItem value="water">Water Body</SelectItem>
                                          <SelectItem value="region">Region</SelectItem>
                                          <SelectItem value="year">Year</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div>
                                      <Label className="text-[11px] text-muted-foreground">Operator</Label>
                                      <Select defaultValue={condition.operator}>
                                        <SelectTrigger className="mt-1 text-[12px]">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="equals">Equals</SelectItem>
                                          <SelectItem value="not-equals">Not Equals</SelectItem>
                                          <SelectItem value="greater">Greater Than</SelectItem>
                                          <SelectItem value="greater-equal">Greater or Equal</SelectItem>
                                          <SelectItem value="less">Less Than</SelectItem>
                                          <SelectItem value="contains">Contains</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div>
                                      <Label className="text-[11px] text-muted-foreground">Value</Label>
                                      <Input
                                        className="mt-1 text-[12px]"
                                        defaultValue={condition.value}
                                        placeholder="Enter value"
                                      />
                                    </div>
                                  </div>

                                  {conditions.length > 1 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="mt-5 text-destructive"
                                      onClick={() => removeCondition(condition.id)}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            </div>

            {/* ─── Right Column: Live Results (sticky) ─── */}
            <div className="qb-results">
              <Card className="border border-border">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="text-[16px]">Live Results</CardTitle>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    Preview updates automatically
                  </p>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {/* Matching Surveys hero */}
                  <div className="text-center p-6 border border-primary/30 bg-primary/5 rounded relative">
                    {isUpdating && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded z-10">
                        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Updating…
                        </div>
                      </div>
                    )}
                    <p className="text-[48px] font-semibold text-primary leading-none mb-2">{matchingSurveys.length}</p>
                    <p className="text-[12px] text-muted-foreground uppercase tracking-wide">Matching Surveys</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-[13px] p-2 border border-border/50 rounded bg-white">
                      <span className="text-muted-foreground">Fish Records</span>
                      <span className="font-mono text-foreground font-medium">{aggregates.totalFishCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[13px] p-2 border border-border/50 rounded bg-white">
                      <span className="text-muted-foreground">Water Bodies</span>
                      <span className="font-mono text-foreground font-medium">{aggregates.uniqueWaters}</span>
                    </div>
                    <div className="flex justify-between text-[13px] p-2 border border-border/50 rounded bg-white">
                      <span className="text-muted-foreground">Date Range</span>
                      <span className="font-mono text-foreground font-medium">{aggregates.dateRange}</span>
                    </div>
                    <div className="flex justify-between text-[13px] p-2 border border-border/50 rounded bg-white">
                      <span className="text-muted-foreground">Regions</span>
                      <span className="font-mono text-foreground font-medium">{aggregates.regions}</span>
                    </div>
                  </div>

                  {/* Species Distribution — data-driven */}
                  <div className="pt-4 border-t border-border">
                    <h4 className="text-[12px] uppercase tracking-wide text-muted-foreground mb-3">
                      Species Distribution
                    </h4>
                    {aggregates.speciesDistribution.length === 0 ? (
                      <p className="text-[12px] text-muted-foreground italic">No species data for current filters</p>
                    ) : (
                      <div className="space-y-2.5">
                        {aggregates.speciesDistribution.map((sp, i) => (
                          <div key={sp.code}>
                            <div className="flex justify-between text-[12px] mb-1">
                              <span className="text-muted-foreground">{sp.name}</span>
                              <span className="font-mono text-foreground">
                                {sp.count} survey{sp.count !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="h-1.5 bg-muted rounded overflow-hidden">
                              <div
                                className={`h-full ${speciesBarColors[Math.min(i, speciesBarColors.length - 1)]}`}
                                style={{ width: `${sp.pct}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Open full analysis CTA */}
                  <div className="pt-4 border-t border-border">
                    <Button
                      className="w-full text-[13px]"
                      disabled={!hasResults}
                      onClick={handleOpenAnalysis}
                    >
                      Open full analysis
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                    {!hasResults && (
                      <p className="text-[11px] text-muted-foreground text-center mt-2">
                        No matching surveys — adjust filters
                      </p>
                    )}
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
