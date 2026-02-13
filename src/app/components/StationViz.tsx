import type { Station } from '../data/world';

interface StationVizProps {
  stations: Station[];
  title: string;
  subtitle?: string;
}

/**
 * Deterministic hash for station ID → stable position fallback.
 */
function hashPosition(id: string): { x: number; y: number } {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = ((h << 5) - h) + id.charCodeAt(i);
    h |= 0;
  }
  return {
    x: 20 + Math.abs(h % 60),
    y: 20 + Math.abs((h * 31) % 50),
  };
}

function getPositions(stations: Station[]): { x: number; y: number }[] {
  const withCoords = stations.filter(s => s.coords);

  if (withCoords.length >= 2) {
    const lats = withCoords.map(s => s.coords!.lat);
    const lons = withCoords.map(s => s.coords!.lon);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    const latRange = maxLat - minLat || 1;
    const lonRange = maxLon - minLon || 1;

    return stations.map(s => {
      if (s.coords) {
        return {
          x: 15 + ((s.coords.lon - minLon) / lonRange) * 70,
          y: 20 + ((maxLat - s.coords.lat) / latRange) * 55,
        };
      }
      return hashPosition(s.id);
    });
  }

  // Single station or no coords — use hash-based positions
  return stations.map(s => hashPosition(s.id));
}

export function StationViz({ stations, title }: StationVizProps) {
  const positions = getPositions(stations);

  return (
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

        {/* Station markers — positioned deterministically */}
        {positions.map((pos, i) => (
          <div
            key={stations[i]?.id ?? i}
            className="absolute w-2 h-2 bg-primary rounded-full"
            style={{ top: `${pos.y}%`, left: `${pos.x}%` }}
          />
        ))}

        <div className="absolute top-2 left-2 text-[10px] font-medium text-foreground">
          {title}
        </div>
      </div>

      {/* Legend */}
      <div className="px-2 py-1.5 border-t border-border/50 bg-white/80 flex items-center gap-4 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
          <span>Stations ({stations.length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-[1.5px] bg-secondary"></div>
          <span>Boundary</span>
        </div>
      </div>
    </div>
  );
}
