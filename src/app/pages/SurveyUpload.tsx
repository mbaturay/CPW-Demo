import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Link } from 'react-router';
import { RoleIndicator } from '../components/RoleIndicator';
import { useRole } from '../context/RoleContext';
import { WaterBanner } from '../components/WaterBanner';

export default function SurveyUpload() {
  const { role } = useRole();
  const [uploaded, setUploaded] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setUploaded(true);
  };
  
  const handleFileSelect = () => {
    setUploaded(true);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border px-8 py-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-semibold text-primary">Upload Survey Data</h1>
              <p className="text-[13px] text-muted-foreground mt-1">Import field data for validation and analysis</p>
            </div>
            <RoleIndicator />
          </div>
        </div>
      </header>
      
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
      
      {/* Role-Based Guidance Banner */}
      {role === 'data-entry' && (
        <div className="bg-muted/20 border-b border-border px-8 py-3">
          <div className="max-w-[1280px] mx-auto">
            <p className="text-[12px] text-muted-foreground">
              <span className="font-medium text-foreground">Step 1 of 3:</span> Upload Survey Data → <span className="text-muted-foreground">Step 2: Validate → Step 3: Submit for Biologist Review</span>
            </p>
          </div>
        </div>
      )}
      
      <div className="px-8 py-8">
        <div className="max-w-[1280px] mx-auto">
          
          {!uploaded ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Area */}
              <div>
                <Card className="border border-border shadow-sm">
                  <CardHeader className="border-b border-border/50">
                    <CardTitle className="text-[16px]">Select Survey File</CardTitle>
                    <p className="text-[12px] text-muted-foreground mt-1">
                      Upload CPW-compliant survey data in Excel or CSV format
                    </p>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div
                      className={`
                        border-2 border-dashed rounded p-12 text-center transition-colors
                        ${dragActive 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50 bg-muted/20'
                        }
                      `}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-[16px] font-medium mb-2">Drag & Drop Survey File</h3>
                      <p className="text-[13px] text-muted-foreground mb-6">
                        or click to browse your files
                      </p>
                      <Button onClick={handleFileSelect}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Select File
                      </Button>
                      <p className="text-[11px] text-muted-foreground mt-4">
                        Supported: .xlsx, .csv, .xls (Max 50MB)
                      </p>
                    </div>
                    
                    <div className="mt-6 p-4 border border-border/50 bg-muted/30 rounded">
                      <h4 className="text-[13px] font-medium mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4 text-muted-foreground" />
                        Data Requirements
                      </h4>
                      <ul className="text-[12px] text-muted-foreground space-y-1.5 ml-6">
                        <li>• CPW template format required</li>
                        <li>• Include water code, survey date, and protocol type</li>
                        <li>• Species codes must match CPW reference database</li>
                        <li>• Length measurements: millimeters or inches (specify)</li>
                        <li>• Weight measurements: grams</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Info Panel */}
              <div className="space-y-6">
                <Card className="border border-border shadow-sm">
                  <CardHeader className="border-b border-border/50">
                    <CardTitle className="text-[16px]">Supported Protocol Types</CardTitle>
                    <p className="text-[12px] text-muted-foreground mt-1">
                      System recognizes standard fisheries survey methodologies
                    </p>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-3">
                    <div className="p-3 border border-border/50 rounded bg-white">
                      <p className="text-[13px] font-medium text-foreground">Two-Pass Removal</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Population estimates via depletion methodology (Zippin's method)
                      </p>
                    </div>
                    <div className="p-3 border border-border/50 rounded bg-white">
                      <p className="text-[13px] font-medium text-foreground">Three-Pass Removal</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        Enhanced depletion estimates for higher precision
                      </p>
                    </div>
                    <div className="p-3 border border-border/50 rounded bg-white">
                      <p className="text-[13px] font-medium text-foreground">Single Pass Electrofish</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        CPUE and relative abundance metrics only
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-border shadow-sm">
                  <CardHeader className="border-b border-border/50">
                    <CardTitle className="text-[16px]">Download Templates</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start text-[13px]">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        CPW_River_Survey_2026.xlsx
                      </Button>
                      <Button variant="outline" className="w-full justify-start text-[13px]">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        CPW_Lake_Survey_2026.xlsx
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Auto-Detected Metadata */}
              <div className="space-y-6">
                <Card className="border border-border shadow-sm">
                  <CardHeader className="border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                      <CardTitle className="text-[16px]">File Detected & Analyzed</CardTitle>
                    </div>
                    <p className="text-[12px] text-muted-foreground mt-1">
                      System has parsed survey structure and metadata
                    </p>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-3 p-4 border border-border rounded bg-muted/20">
                      <FileSpreadsheet className="w-8 h-8 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-foreground truncate">
                          Colorado_River_Survey_Feb2026.xlsx
                        </p>
                        <p className="text-[11px] text-muted-foreground">284 KB • Uploaded 2 seconds ago</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-border pt-4">
                      <h4 className="text-[12px] uppercase tracking-wide text-muted-foreground mb-3">
                        Auto-Detected Metadata
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 border border-primary/30 bg-primary/5 rounded">
                          <span className="text-[12px] text-muted-foreground">Water</span>
                          <span className="text-[13px] font-semibold text-primary">South Platte Basin</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-border/50 rounded bg-white">
                          <span className="text-[12px] text-muted-foreground">Station</span>
                          <span className="text-[13px] font-medium font-mono">SP-04</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-border/50 rounded bg-white">
                          <span className="text-[12px] text-muted-foreground">Region</span>
                          <span className="text-[13px] font-medium">Northeast</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-border/50 rounded bg-white">
                          <span className="text-[12px] text-muted-foreground">Template Type</span>
                          <span className="text-[13px] font-medium font-mono">River Survey</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-border/50 rounded bg-white">
                          <span className="text-[12px] text-muted-foreground">Protocol</span>
                          <span className="text-[13px] font-medium font-mono">Two-Pass Removal</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-border/50 rounded bg-white">
                          <span className="text-[12px] text-muted-foreground">Water Code</span>
                          <span className="text-[13px] font-medium font-mono">COCOL03</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-border/50 rounded bg-white">
                          <span className="text-[12px] text-muted-foreground">Water Body</span>
                          <span className="text-[13px] font-medium">Colorado River - Reach 3</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-border/50 rounded bg-white">
                          <span className="text-[12px] text-muted-foreground">Survey Date</span>
                          <span className="text-[13px] font-medium">February 10, 2026</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-border pt-4">
                      <h4 className="text-[12px] uppercase tracking-wide text-muted-foreground mb-3">
                        Data Summary
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 border border-border/50 rounded bg-white text-center">
                          <p className="text-[20px] font-semibold text-foreground">247</p>
                          <p className="text-[11px] text-muted-foreground">Fish Records</p>
                        </div>
                        <div className="p-3 border border-border/50 rounded bg-white text-center">
                          <p className="text-[20px] font-semibold text-foreground">4</p>
                          <p className="text-[11px] text-muted-foreground">Species Detected</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Validation Summary */}
              <div className="space-y-6">
                <Card className="border border-border shadow-sm">
                  <CardHeader className="border-b border-border/50">
                    <CardTitle className="text-[16px]">Validation Summary</CardTitle>
                    <p className="text-[12px] text-muted-foreground mt-1">
                      Automated data quality assessment results
                    </p>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="p-4 border border-[#059669]/30 bg-[#059669]/5 rounded flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-[#059669] flex-shrink-0" />
                      <div>
                        <p className="text-[18px] font-semibold text-foreground">247 Valid Records</p>
                        <p className="text-[11px] text-muted-foreground">All required fields present and within range</p>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-[#D97706]/30 bg-[#D97706]/5 rounded flex items-center gap-3">
                      <AlertCircle className="w-6 h-6 text-[#D97706] flex-shrink-0" />
                      <div>
                        <p className="text-[18px] font-semibold text-foreground">12 Warnings</p>
                        <p className="text-[11px] text-muted-foreground">Minor issues — can proceed with review</p>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-[#B91C1C]/30 bg-[#B91C1C]/5 rounded flex items-center gap-3">
                      <AlertCircle className="w-6 h-6 text-[#B91C1C] flex-shrink-0" />
                      <div>
                        <p className="text-[18px] font-semibold text-foreground">3 Errors</p>
                        <p className="text-[11px] text-muted-foreground">Must be corrected before submission</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-border pt-4">
                      <h4 className="text-[12px] uppercase tracking-wide text-muted-foreground mb-3">
                        Issues Requiring Attention
                      </h4>
                      <div className="space-y-2 text-[12px]">
                        <div className="flex items-start gap-2 p-2 border border-[#B91C1C]/20 rounded bg-[#B91C1C]/5">
                          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#B91C1C]" />
                          <span className="text-foreground">
                            <span className="font-mono">Row 34:</span> Invalid species code "RNTR"
                          </span>
                        </div>
                        <div className="flex items-start gap-2 p-2 border border-[#B91C1C]/20 rounded bg-[#B91C1C]/5">
                          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#B91C1C]" />
                          <span className="text-foreground">
                            <span className="font-mono">Row 89:</span> Length exceeds biological maximum (892mm)
                          </span>
                        </div>
                        <div className="flex items-start gap-2 p-2 border border-[#B91C1C]/20 rounded bg-[#B91C1C]/5">
                          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#B91C1C]" />
                          <span className="text-foreground">
                            <span className="font-mono">Row 156:</span> Protocol mismatch (expected 2 passes, found 1)
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 text-[13px]" onClick={() => setUploaded(false)}>
                    Cancel Upload
                  </Button>
                  <Link to="/validation" className="flex-1">
                    <Button className="w-full text-[13px]">
                      Review & Correct Errors
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}