import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { AlertCircle, CheckCircle2, Info, RotateCw, Save, HelpCircle } from 'lucide-react';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
import { WaterBanner } from '../components/WaterBanner';
import { RoleIndicator } from '../components/RoleIndicator';
import { useRole } from '../context/RoleContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { useSearchParams } from 'react-router';
import { surveys, species as allSpecies, getWaterById, getSurveyById, getValidationBySurveyId } from '../data/world';

export default function Validation() {
  const { role } = useRole();
  const [unit, setUnit] = useState<'mm' | 'inches'>('mm');
  const [searchParams] = useSearchParams();

  // Load survey from world.ts via search param
  const surveyId = searchParams.get('surveyId') || surveys.find(s =>
    ['Pending Validation', 'Returned for Correction', 'Pending Approval', 'Flagged Suspect'].includes(s.status)
  )?.id || surveys[0].id;

  const survey = getSurveyById(surveyId);
  const water = survey ? getWaterById(survey.waterId) : undefined;
  const validationCase = survey ? getValidationBySurveyId(survey.id) : undefined;

  // Fish data table (representative sample — world.ts doesn't include fish-level records)
  const data = [
    { row: 1, pass: 1, species: 'RBT', length: 245, weight: 186, status: 'valid' },
    { row: 2, pass: 1, species: 'RBT', length: 198, weight: 124, status: 'valid' },
    { row: 3, pass: 1, species: 'BNT', length: 312, weight: 425, status: 'valid' },
    { row: 4, pass: 1, species: 'RNTR', length: 189, weight: 98, status: 'error', error: 'Invalid species code' },
    { row: 5, pass: 2, species: 'RBT', length: 156, weight: 67, status: 'valid' },
    { row: 6, pass: 2, species: 'BNT', length: 267, weight: 289, status: 'valid' },
    { row: 7, pass: 2, species: 'RBT', length: 892, weight: 1245, status: 'error', error: 'Length exceeds biological max' },
    { row: 8, pass: 2, species: 'BNT', length: 234, weight: 198, status: 'valid' },
    { row: 9, pass: 1, species: 'CTT', length: 145, weight: 45, status: 'warning', error: 'Young of year detected' },
    { row: 10, pass: 1, species: 'RBT', length: 223, weight: 167, status: 'valid' },
  ];

  const validCount = data.filter(d => d.status === 'valid').length;
  const warningCount = validationCase ? validationCase.summary.warnings : data.filter(d => d.status === 'warning').length;
  const errorCount = validationCase ? validationCase.summary.errors : data.filter(d => d.status === 'error').length;

  // Derive display values from loaded data
  const waterName = water?.name ?? 'South Platte Basin';
  const waterRegion = water?.region ?? 'Northeast';
  const waterHuc = water?.huc12 ?? 'HUC12-123456';
  const waterStations = water?.stations.length ?? 6;
  const waterSurveyCount = water ? surveys.filter(s => s.waterId === water.id).length : 47;
  const waterYears = water ? `${water.yearsActive.start}–${water.yearsActive.end}` : '1998–2025';

  const surveyStation = survey?.stationId ?? 'SP-04';
  const surveyDate = survey?.date
    ? new Date(survey.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Aug 14, 2024';
  const surveyProtocol = survey?.protocol ?? 'Two-Pass Removal';
  const surveyUploader = survey?.uploader ?? 'J. Martinez';

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border px-8 py-6">
        <div className="max-w-[1280px] mx-auto">
          <Breadcrumb items={[
            { label: 'Waters', path: '/' },
            { label: waterName, path: `/water?waterId=${water?.id ?? 'south-platte'}` },
            { label: 'Survey Validation' }
          ]} />
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="text-lg font-semibold text-primary">Survey Validation</p>
              <p className="text-[13px] text-muted-foreground mt-1">Designed to prevent protocol errors and preserve scientific integrity</p>
            </div>
            <div className="flex items-center gap-4">
              <RoleIndicator />
              <div className="flex items-center gap-2">
                <Label htmlFor="unit-toggle" className="text-[13px]">mm</Label>
                <Switch
                  id="unit-toggle"
                  checked={unit === 'inches'}
                  onCheckedChange={(checked) => setUnit(checked ? 'inches' : 'mm')}
                />
                <Label htmlFor="unit-toggle" className="text-[13px]">inches</Label>
              </div>
              <Button variant="outline" size="sm" className="text-[13px]">
                <RotateCw className="w-4 h-4 mr-2" />
                Revalidate
              </Button>
              {role === 'data-entry' && (
                <Button size="sm" className="text-[13px]">
                  <Save className="w-4 h-4 mr-2" />
                  Submit for Review
                </Button>
              )}
              {role === 'area-biologist' && (
                <>
                  <Button variant="outline" size="sm" className="text-[13px]">
                    Request Correction
                  </Button>
                  <Button size="sm" className="text-[13px]">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve Survey
                  </Button>
                </>
              )}
              {role === 'senior-biologist' && (
                <>
                  <Button variant="outline" size="sm" className="text-[13px]">
                    Flag as Suspect
                  </Button>
                  <Button size="sm" className="text-[13px]">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Publish to Analysis
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <WaterBanner
        waterName={waterName}
        region={waterRegion}
        watershed={waterHuc}
        stations={waterStations}
        totalSurveys={waterSurveyCount}
        yearsActive={waterYears}
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

      {/* Contextual Survey Header */}
      <div className="bg-muted/30 border-b border-border px-8 py-4">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-muted-foreground mb-1">
                Validating data integrity and protocol compliance for {waterName}
              </p>
              <p className="text-[14px] text-foreground">
                <span className="font-medium">Station:</span> <span className="font-mono">{surveyStation}</span>
                <span className="mx-3 text-muted-foreground">|</span>
                <span className="font-medium">Survey Date:</span> {surveyDate}
                <span className="mx-3 text-muted-foreground">|</span>
                <span className="font-medium">Protocol:</span> {surveyProtocol}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Protocol Banner */}
      <div className="bg-primary/5 border-b border-primary/10 px-8 py-4">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-[12px] font-medium">
                Protocol: {surveyProtocol}
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground">
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-[12px]">
                      Population estimates calculated using Two-Pass Removal with Zippin's depletion method.
                      This protocol requires exactly 2 passes through the sampling reach.
                      Removal efficiency calculated from first and second pass catch rates.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="text-[12px] text-muted-foreground">
                {waterName} — {surveyStation} • {surveyDate}
              </span>
            </div>
            <div className="flex items-center gap-6 text-[12px]">
              <div>
                <span className="text-muted-foreground">Survey ID:</span>{' '}
                <span className="font-mono text-foreground">{surveyId}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Biologist:</span>{' '}
                <span className="text-foreground">{surveyUploader}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="max-w-[1280px] mx-auto">

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border border-border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                  <div>
                    <p className="text-[26px] font-semibold">{validCount}</p>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Valid Rows</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-[#D97706]" />
                  <div>
                    <p className="text-[26px] font-semibold">{warningCount}</p>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Warnings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-[#B91C1C]" />
                  <div>
                    <p className="text-[26px] font-semibold">{errorCount}</p>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Errors</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border shadow-sm bg-muted/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-[26px] font-semibold">{survey?.fishCount ?? data.length}</p>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Total Records</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Data Grid with Left Error Strips */}
            <div className="lg:col-span-2">
              <Card className="border border-border shadow-sm">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="text-[16px]">Data Preview</CardTitle>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    Inline editing enabled • Click cells to modify values
                  </p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="border border-border rounded overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="w-3"></TableHead>
                          <TableHead className="w-16 text-[12px]">Row</TableHead>
                          <TableHead className="w-16 text-[12px]">Pass</TableHead>
                          <TableHead className="text-[12px]">Species</TableHead>
                          <TableHead className="text-[12px]">Length ({unit})</TableHead>
                          <TableHead className="text-[12px]">Weight (g)</TableHead>
                          <TableHead className="text-[12px]">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.map((item) => (
                          <TableRow
                            key={item.row}
                            className={
                              item.status === 'error'
                                ? 'bg-[#B91C1C]/[0.02] hover:bg-[#B91C1C]/[0.04]'
                                : item.status === 'warning'
                                ? 'bg-[#D97706]/[0.02] hover:bg-[#D97706]/[0.04]'
                                : 'hover:bg-muted/20'
                            }
                          >
                            <TableCell className="p-0 w-3">
                              <div className={`h-full w-1 ${
                                item.status === 'error' ? 'bg-[#B91C1C]' :
                                item.status === 'warning' ? 'bg-[#D97706]' :
                                'bg-transparent'
                              }`}></div>
                            </TableCell>
                            <TableCell className="font-mono text-[13px] text-muted-foreground">{item.row}</TableCell>
                            <TableCell className="text-center text-[13px]">{item.pass}</TableCell>
                            <TableCell className="font-mono text-[13px]">{item.species}</TableCell>
                            <TableCell className="text-[13px]">
                              {unit === 'mm' ? item.length : (item.length / 25.4).toFixed(1)}
                            </TableCell>
                            <TableCell className="text-[13px]">{item.weight}</TableCell>
                            <TableCell>
                              {item.status === 'valid' && (
                                <span className="flex items-center gap-1.5 text-[#059669] text-[12px]">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Valid
                                </span>
                              )}
                              {item.status === 'warning' && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="flex items-center gap-1.5 text-[#D97706] text-[12px] cursor-help">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        Warning
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-[12px]">{item.error}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {item.status === 'error' && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="flex items-center gap-1.5 text-[#B91C1C] text-[12px] cursor-help">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        Error
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="text-[12px]">{item.error}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="mt-6 p-4 border border-border/50 bg-muted/20 rounded flex items-start gap-3">
                    <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="text-[11px] text-muted-foreground leading-relaxed">
                      <p className="mb-1.5">
                        <span className="font-medium text-foreground">Population Estimation Method:</span> {surveyProtocol} with Zippin's depletion formula
                      </p>
                      <p>
                        Young of year (&lt;150mm) can be excluded from population analysis.
                        Removal efficiency will be calculated from pass 1 and pass 2 catch ratios using maximum likelihood estimation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Issues Panel */}
            <div>
              <Card className="border border-border shadow-sm sticky top-6">
                <CardHeader className="border-b border-border/50">
                  <CardTitle className="text-[16px]">Validation Issues</CardTitle>
                  <p className="text-[12px] text-muted-foreground mt-1">
                    {errorCount} errors, {warningCount} warnings
                  </p>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-3">
                    {validationCase ? (
                      validationCase.issues.map((issue, idx) => (
                        <div key={idx} className={`p-3 border rounded ${
                          issue.severity === 'Error'
                            ? 'border-[#B91C1C]/20 bg-[#B91C1C]/5'
                            : 'border-[#D97706]/20 bg-[#D97706]/5'
                        }`}>
                          <div className="flex items-start gap-2 mb-2">
                            <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                              issue.severity === 'Error' ? 'text-[#B91C1C]' : 'text-[#D97706]'
                            }`} />
                            <div className="flex-1">
                              <p className="text-[13px] font-medium text-foreground">
                                {issue.row ? `Row ${issue.row}` : issue.field ?? issue.code}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-1">
                                {issue.message}
                              </p>
                              {issue.suggestion && (
                                <p className="text-[11px] text-muted-foreground mt-1 italic">
                                  Suggestion: {issue.suggestion}
                                </p>
                              )}
                            </div>
                          </div>
                          {issue.row && (
                            <Button variant="outline" size="sm" className="w-full text-[12px]">
                              Jump to Row
                            </Button>
                          )}
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="p-3 border border-[#B91C1C]/20 rounded bg-[#B91C1C]/5">
                          <div className="flex items-start gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-[#B91C1C] mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-[13px] font-medium text-foreground">Row 4</p>
                              <p className="text-[11px] text-muted-foreground mt-1">
                                Invalid species code "RNTR" — Not in CPW reference database
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="w-full text-[12px]">
                            Jump to Row
                          </Button>
                        </div>

                        <div className="p-3 border border-[#B91C1C]/20 rounded bg-[#B91C1C]/5">
                          <div className="flex items-start gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-[#B91C1C] mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-[13px] font-medium text-foreground">Row 7</p>
                              <p className="text-[11px] text-muted-foreground mt-1">
                                Length exceeds biological maximum (892mm for Rainbow Trout)
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="w-full text-[12px]">
                            Jump to Row
                          </Button>
                        </div>

                        <div className="p-3 border border-[#D97706]/20 rounded bg-[#D97706]/5">
                          <div className="flex items-start gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-[#D97706] mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-[13px] font-medium text-foreground">Row 9</p>
                              <p className="text-[11px] text-muted-foreground mt-1">
                                Young of year detected (145mm CTT) — Consider exclusion flag
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="w-full text-[12px]">
                            Jump to Row
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h4 className="text-[12px] uppercase tracking-wide text-muted-foreground mb-3">
                      CPW Species Reference
                    </h4>
                    <div className="space-y-2 text-[11px]">
                      {allSpecies.slice(0, 5).map(sp => (
                        <div key={sp.code} className="flex justify-between">
                          <span className="font-mono text-foreground">{sp.code}</span>
                          <span className="text-muted-foreground">{sp.common}</span>
                        </div>
                      ))}
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
