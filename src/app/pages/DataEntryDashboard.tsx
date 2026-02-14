import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Upload, CheckCircle2, Clock, Info } from 'lucide-react';
import { Link } from 'react-router';
import { RoleIndicator } from '../components/RoleIndicator';

export default function DataEntryDashboard() {
  const assignedWaters = [
    { water: 'South Platte Basin', station: 'SP-04', lastUpload: '2026-02-10', status: 'Complete', surveysThisYear: 6 },
    { water: 'Cache la Poudre', station: 'CP-12', lastUpload: '2026-02-09', status: 'Complete', surveysThisYear: 4 },
    { water: 'South Platte Basin', station: 'SP-02', lastUpload: '2026-01-28', status: 'Complete', surveysThisYear: 5 },
    { water: 'Cache la Poudre', station: 'CP-08', lastUpload: '2026-01-15', status: 'Needs Upload', surveysThisYear: 3 },
    { water: 'South Platte Basin', station: 'SP-06', lastUpload: '2025-11-15', status: 'Needs Upload', surveysThisYear: 4 },
  ];
  
  const recentSubmissions = [
    { id: 'SRV-2026-089', water: 'South Platte Basin', station: 'SP-04', date: '2026-02-10', status: 'Validated', reviewer: 'J. Martinez' },
    { id: 'SRV-2026-088', water: 'Cache la Poudre', station: 'CP-12', date: '2026-02-09', status: 'Validated', reviewer: 'J. Martinez' },
    { id: 'SRV-2026-087', water: 'South Platte Basin', station: 'SP-02', date: '2026-01-28', status: 'Pending Review', reviewer: 'J. Martinez' },
    { id: 'SRV-2026-078', water: 'Cache la Poudre', station: 'CP-12', date: '2026-01-20', status: 'Validated', reviewer: 'J. Martinez' },
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border px-8 py-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-semibold text-primary">Assigned Waters — Data Entry View</h1>
              <p className="text-[13px] text-muted-foreground mt-1">Upload and manage survey data for your supervising biologist</p>
            </div>
            <RoleIndicator />
          </div>
        </div>
      </header>
      
      <div className="px-8 py-8">
        <div className="max-w-[1280px] mx-auto space-y-8">
          
          {/* Role Scope Banner */}
          <div className="bg-muted/20 border border-border rounded px-4 py-3 flex items-start gap-3">
            <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[13px] text-foreground font-medium mb-1">
                Your Data Entry Scope
              </p>
              <p className="text-[12px] text-muted-foreground">
                You can upload and edit surveys for waters assigned to your supervising biologist (J. Martinez, Area Biologist — Northeast Region). Contact your supervisor to request access to additional waters.
              </p>
            </div>
          </div>
          
          {/* Primary Action and Quick Stats */}
          {/* CANVAS-ALIGNMENT: 2-col card grid (was 4-col) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-primary/20 bg-primary/[0.02] shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-[13px] text-foreground font-medium">Quick Action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/upload">
                  <Button className="w-full text-[13px]">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Survey Data
                  </Button>
                </Link>
                <p className="text-[11px] text-muted-foreground text-center">
                  Start data entry workflow
                </p>
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Assigned Waters
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-[28px] font-semibold text-foreground mb-1">2</div>
                <p className="text-[11px] text-muted-foreground">South Platte Basin, Cache la Poudre</p>
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Pending Upload
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-[28px] font-semibold text-foreground mb-1">2</div>
                <p className="text-[11px] text-muted-foreground">Stations need data entry</p>
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Awaiting Review
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-[28px] font-semibold text-foreground mb-1">1</div>
                <p className="text-[11px] text-muted-foreground">By supervising biologist</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Assigned Waters Status Table */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[16px]">Assigned Waters Status</CardTitle>
                  <p className="text-[12px] text-muted-foreground mt-1">Survey stations you manage for data entry</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[12px]">Water Body</TableHead>
                    <TableHead className="text-[12px]">Station</TableHead>
                    <TableHead className="text-[12px]">Last Upload</TableHead>
                    <TableHead className="text-[12px]">Status</TableHead>
                    <TableHead className="text-[12px]">Surveys This Year</TableHead>
                    <TableHead className="text-[12px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedWaters.map((water, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-[13px] font-medium">{water.water}</TableCell>
                      <TableCell className="text-[13px] font-mono text-primary">{water.station}</TableCell>
                      <TableCell className="text-[12px] text-muted-foreground">{water.lastUpload}</TableCell>
                      <TableCell>
                        <span className={`
                          inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium
                          ${water.status === 'Complete' 
                            ? 'bg-success/10 text-success' 
                            : 'bg-warning/10 text-warning'
                          }
                        `}>
                          {water.status === 'Complete' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {water.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-[12px] font-mono text-muted-foreground">{water.surveysThisYear}</TableCell>
                      <TableCell>
                        <Link to="/upload">
                          <Button variant="outline" size="sm" className="text-[12px] h-7">
                            Upload
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Recent Submissions */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[16px]">Your Recent Submissions</CardTitle>
                  <p className="text-[12px] text-muted-foreground mt-1">Last 4 surveys you uploaded</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[12px]">Survey ID</TableHead>
                    <TableHead className="text-[12px]">Water Body</TableHead>
                    <TableHead className="text-[12px]">Station</TableHead>
                    <TableHead className="text-[12px]">Upload Date</TableHead>
                    <TableHead className="text-[12px]">Review Status</TableHead>
                    <TableHead className="text-[12px]">Reviewer</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-mono text-[13px] text-primary">{submission.id}</TableCell>
                      <TableCell className="text-[13px]">{submission.water}</TableCell>
                      <TableCell className="text-[13px] font-mono">{submission.station}</TableCell>
                      <TableCell className="text-[12px] text-muted-foreground">{submission.date}</TableCell>
                      <TableCell>
                        <span className={`
                          inline-flex px-2 py-0.5 rounded text-[11px] font-medium
                          ${submission.status === 'Validated' 
                            ? 'bg-success/10 text-success' 
                            : 'bg-warning/10 text-warning'
                          }
                        `}>
                          {submission.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-[12px] text-muted-foreground">{submission.reviewer}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
        </div>
      </div>
    </div>
  );
}
