import { MapPin } from 'lucide-react';

interface WaterBannerProps {
  waterName: string;
  region: string;
  watershed: string;
  stations: number;
  totalSurveys: number;
  yearsActive: string;
}

export function WaterBanner({ 
  waterName, 
  region, 
  watershed, 
  stations, 
  totalSurveys, 
  yearsActive 
}: WaterBannerProps) {
  return (
    <div className="bg-white border-b border-border">
      <div className="px-8 py-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-[24px] font-semibold text-primary mb-3">{waterName}</h2>
              <p className="text-[14px] text-muted-foreground">
                <span className="font-medium">Region:</span> {region} <span className="mx-3">|</span>
                <span className="font-medium">Watershed:</span> {watershed} <span className="mx-3">|</span>
                <span className="font-medium">Stations:</span> {stations} <span className="mx-3">|</span>
                <span className="font-medium">Total Surveys:</span> {totalSurveys} <span className="mx-3">|</span>
                <span className="font-medium">Years Active:</span> {yearsActive}
              </p>
            </div>
            
            <div className="w-64 h-40 flex-shrink-0">
              <div className="w-full h-full border border-border bg-muted/20 rounded flex flex-col">
                <div className="flex-1 relative overflow-hidden">
                  {/* Basin boundary outline */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 256 160">
                    <path 
                      d="M 40 80 Q 60 40, 100 35 T 180 60 Q 220 80, 210 120 T 140 145 Q 80 140, 60 120 T 40 80 Z" 
                      fill="none" 
                      stroke="#2F6F73" 
                      strokeWidth="1.5"
                      opacity="0.3"
                    />
                  </svg>
                  
                  {/* Station markers */}
                  <div className="absolute top-[35%] left-[25%] w-2 h-2 bg-primary rounded-full"></div>
                  <div className="absolute top-[45%] left-[45%] w-2 h-2 bg-primary rounded-full"></div>
                  <div className="absolute top-[55%] left-[35%] w-2 h-2 bg-primary rounded-full"></div>
                  <div className="absolute top-[60%] left-[60%] w-2 h-2 bg-primary rounded-full"></div>
                  <div className="absolute top-[40%] left-[70%] w-2 h-2 bg-primary rounded-full"></div>
                  <div className="absolute top-[50%] left-[55%] w-2 h-2 bg-primary rounded-full"></div>
                  
                  <div className="absolute top-2 left-2 text-[10px] font-medium text-foreground">
                    Survey Stations Within Basin
                  </div>
                </div>
                
                {/* Map legend */}
                <div className="px-2 py-1.5 border-t border-border/50 bg-white/80 flex items-center gap-4 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>Stations</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-[1.5px] bg-secondary"></div>
                    <span>Boundary</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-px bg-border/50"></div>
    </div>
  );
}