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
    <div className="bg-white border-b border-border">
      <div className="px-8 py-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex items-start justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-[24px] font-semibold text-primary mb-3">{waterName}</h2>
              <p className="text-[14px] text-muted-foreground">
                <span className="font-medium">Region:</span> {region} <span className="mx-3">|</span>
                <span className="font-medium">Watershed:</span> {watershed} <span className="mx-3">|</span>
                <span className="font-medium">Stations:</span> {stations.length} <span className="mx-3">|</span>
                <span className="font-medium">Total Surveys:</span> {totalSurveys} <span className="mx-3">|</span>
                <span className="font-medium">Years Active:</span> {yearsActive}
              </p>
            </div>

            <div className="w-64 h-40 flex-shrink-0">
              <StationViz
                stations={stations}
                title={`Survey Stations — ${waterName}`}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="h-px bg-border/50"></div>
    </div>
  );
}
