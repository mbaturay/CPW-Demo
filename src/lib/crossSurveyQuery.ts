import type { Survey, Protocol, FishRecord } from '../app/data/world';
import { waters, getWaterById, getFishRecords, species as allSpecies } from '../app/data/world';

// ── QueryState: single source of truth for all filter controls ──
export type QueryState = {
  water: string;       // waterId or 'all'
  species: string;     // lowercase species code or 'all'
  region: string;      // 'ne' | 'nw' | 'sw' | 'se' | 'all'
  protocol: string;    // 'two-pass' | 'single-pass' | 'mark-recapture' | 'electrofish' | 'all'
  dateFrom: string;    // ISO date string or ''
  dateTo: string;      // ISO date string or ''
  excludeYOY: boolean;
  unit: 'mm' | 'inches';
};

export const defaultQueryState: QueryState = {
  water: 'south-platte',
  species: 'bnt',
  region: 'ne',
  protocol: 'two-pass',
  dateFrom: '2018-01-01',
  dateTo: '2025-12-31',
  excludeYOY: true,
  unit: 'mm',
};

// ── Mapping helpers ──

const PROTOCOL_MAP: Record<string, Protocol> = {
  'two-pass': 'Two-Pass Removal',
  'single-pass': 'Single-Pass CPUE',
  'mark-recapture': 'Mark-Recapture',
  'electrofish': 'Electrofishing CPUE',
};

const REGION_MAP: Record<string, string> = {
  ne: 'Northeast',
  nw: 'Northwest',
  sw: 'Southwest',
  se: 'Southeast',
};

// ── Result types ──

export type SpeciesDistEntry = {
  code: string;
  name: string;
  count: number;        // total fish records (from fishRecords) or detection count (from surveys)
  pct: number;          // 0-100
};

export type QueryResult = {
  matchingSurveys: Survey[];
  aggregates: {
    totalFishCount: number;       // sum of survey.fishCount
    uniqueWaters: number;
    dateRange: string;            // e.g. "2025-06-22 – 2026-02-10"
    regions: number;
    speciesDistribution: SpeciesDistEntry[];
  };
  /** Fish-level records pooled from all matching surveys (only those with records) */
  fishRecords: FishRecord[];
};

// ── Core query function ──

export function runCrossSurveyQuery(
  allSurveys: Survey[],
  q: QueryState,
): QueryResult {
  let filtered = [...allSurveys];

  // 1. Water filter
  if (q.water !== 'all') {
    filtered = filtered.filter(s => s.waterId === q.water);
  }

  // 2. Region filter (via water → region mapping)
  if (q.region !== 'all') {
    const regionLabel = REGION_MAP[q.region];
    if (regionLabel) {
      const regionWaterIds = new Set(
        waters.filter(w => w.region === regionLabel).map(w => w.id),
      );
      filtered = filtered.filter(s => regionWaterIds.has(s.waterId));
    }
  }

  // 3. Species filter — only keep surveys that detected the selected species
  if (q.species !== 'all') {
    const speciesUpper = q.species.toUpperCase();
    filtered = filtered.filter(s => s.speciesDetected.includes(speciesUpper));
  }

  // 4. Protocol filter
  if (q.protocol !== 'all') {
    const protocolLabel = PROTOCOL_MAP[q.protocol];
    if (protocolLabel) {
      filtered = filtered.filter(s => s.protocol === protocolLabel);
    }
  }

  // 5. Date range filter
  if (q.dateFrom) {
    filtered = filtered.filter(s => s.date >= q.dateFrom);
  }
  if (q.dateTo) {
    filtered = filtered.filter(s => s.date <= q.dateTo);
  }

  // ── Aggregates ──
  const totalFishCount = filtered.reduce((sum, s) => sum + s.fishCount, 0);
  const uniqueWaterIds = new Set(filtered.map(s => s.waterId));
  const regionSet = new Set(
    [...uniqueWaterIds].map(id => getWaterById(id)?.region).filter(Boolean),
  );

  const dates = filtered.map(s => s.date).sort();
  const dateRange =
    dates.length >= 2
      ? `${dates[0]} – ${dates[dates.length - 1]}`
      : dates[0] ?? '—';

  // Species distribution — count how many times each species appears across surveys
  const speciesCountMap = new Map<string, number>();
  for (const s of filtered) {
    for (const sp of s.speciesDetected) {
      speciesCountMap.set(sp, (speciesCountMap.get(sp) ?? 0) + 1);
    }
  }
  const totalSpeciesDetections = [...speciesCountMap.values()].reduce(
    (a, b) => a + b,
    0,
  );
  const speciesDistribution: SpeciesDistEntry[] = [...speciesCountMap.entries()]
    .map(([code, count]) => ({
      code,
      name: allSpecies.find(sp => sp.code === code)?.common ?? code,
      count,
      pct:
        totalSpeciesDetections > 0
          ? Math.round((count / totalSpeciesDetections) * 100)
          : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // ── Pooled fish-level records ──
  let pooledRecords: FishRecord[] = [];
  for (const s of filtered) {
    const recs = getFishRecords(s.id);
    if (recs) {
      pooledRecords = pooledRecords.concat(recs);
    }
  }

  // Filter by species at fish-record level too
  if (q.species !== 'all') {
    const speciesUpper = q.species.toUpperCase();
    pooledRecords = pooledRecords.filter(r => r.species === speciesUpper);
  }

  // Exclude young of year (< 150mm)
  if (q.excludeYOY) {
    pooledRecords = pooledRecords.filter(r => r.length >= 150);
  }

  return {
    matchingSurveys: filtered,
    aggregates: {
      totalFishCount,
      uniqueWaters: uniqueWaterIds.size,
      dateRange,
      regions: regionSet.size,
      speciesDistribution,
    },
    fishRecords: pooledRecords,
  };
}

// ── Derived statistics from fish records ──

export type FishStats = {
  meanLength: number;
  stdDevLength: number;
  minLength: number;
  maxLength: number;
  meanWeight: number;
  sampleSize: number;
  lengthFrequency: { length: string; count: number }[];
  relativeWeightAvg: number | null;
};

export function computeFishStats(records: FishRecord[]): FishStats | null {
  if (records.length === 0) return null;

  const lengths = records.map(r => r.length);
  const weights = records.map(r => r.weight);

  const meanLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const meanWeight = weights.reduce((a, b) => a + b, 0) / weights.length;

  const variance =
    lengths.reduce((sum, l) => sum + (l - meanLength) ** 2, 0) /
    (lengths.length - 1 || 1);
  const stdDevLength = Math.sqrt(variance);

  const minLength = Math.min(...lengths);
  const maxLength = Math.max(...lengths);

  // Length-frequency bins (50mm bins)
  const bins = [
    { label: '50-100', min: 50, max: 100 },
    { label: '100-150', min: 100, max: 150 },
    { label: '150-200', min: 150, max: 200 },
    { label: '200-250', min: 200, max: 250 },
    { label: '250-300', min: 250, max: 300 },
    { label: '300-350', min: 300, max: 350 },
    { label: '350-400', min: 350, max: 400 },
    { label: '400+', min: 400, max: Infinity },
  ];

  const lengthFrequency = bins.map(bin => ({
    length: bin.label,
    count: lengths.filter(l => l >= bin.min && l < bin.max).length,
  }));

  // Relative weight (Wr) — simplified: actual weight / predicted weight * 100
  // Use standard weight equation W = a * L^b  (rough trout approximation: a=0.00001, b=3.0)
  const a = 0.00001;
  const b = 3.0;
  let wrSum = 0;
  let wrCount = 0;
  for (const r of records) {
    const predictedWeight = a * Math.pow(r.length, b);
    if (predictedWeight > 0) {
      wrSum += (r.weight / predictedWeight) * 100;
      wrCount++;
    }
  }
  const relativeWeightAvg = wrCount > 0 ? Math.round(wrSum / wrCount * 10) / 10 : null;

  return {
    meanLength: Math.round(meanLength),
    stdDevLength: Math.round(stdDevLength * 10) / 10,
    minLength,
    maxLength,
    meanWeight: Math.round(meanWeight),
    sampleSize: records.length,
    lengthFrequency,
    relativeWeightAvg,
  };
}

// ── URL encoding helpers ──

export function encodeQueryState(q: QueryState): string {
  const json = JSON.stringify(q);
  // btoa is fine for ASCII JSON; use URL-safe base64
  return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeQueryState(encoded: string): QueryState | null {
  try {
    // Restore standard base64
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) b64 += '=';
    const json = atob(b64);
    return JSON.parse(json) as QueryState;
  } catch {
    return null;
  }
}
