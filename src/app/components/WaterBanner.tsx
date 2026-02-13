import { StationViz } from './StationViz';
import type { Station } from '../data/world';

interface WaterBannerProps {
  waterName: string;
  region: string;
  watershed: string;
  stations: Station[];
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
    <div className="bg-white border-b border-border/70">
      <div className="px-8 py-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-start justify-between gap-8">
            <div className="flex gap-4 flex-1">
              <div className="w-1 shrink-0 rounded-full bg-primary" />
              <div>
                <h2 className="text-[24px] font-semibold text-foreground mb-3">{waterName}</h2>
                <p className="text-[14px] text-muted-foreground">
                  <span className="font-medium text-foreground">Region:</span> {region} <span className="mx-3 text-border">|</span>
                  <span className="font-medium text-foreground">Watershed:</span> {watershed} <span className="mx-3 text-border">|</span>
                  <span className="font-medium text-foreground">Stations:</span> {stations.length} <span className="mx-3 text-border">|</span>
                  <span className="font-medium text-foreground">Total Surveys:</span> {totalSurveys} <span className="mx-3 text-border">|</span>
                  <span className="font-medium text-foreground">Years Active:</span> {yearsActive}
                </p>
              </div>
            </div>

            <div className="w-64 h-40 flex-shrink-0 overflow-hidden">
              <StationViz
                stations={stations}
                title={`Survey Stations — ${waterName}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
