// src/app/data/world.ts
export type Role = "data-entry" | "area" | "senior";

export type Species = {
  code: string;
  common: string;
  scientific: string;
  // plausible ranges for validation (mm / g)
  lengthMm: { min: number; max: number };
  weightG: { min: number; max: number };
};

export type Station = {
  id: string;
  name: string;
  riverMile?: number;
  coords?: { lat: number; lon: number };
};

export type Water = {
  id: string;
  name: string;
  region: "Northeast" | "Comparison";
  huc12: string;
  stations: Station[];
  yearsActive: { start: number; end: number };
  primarySpecies: string[]; // species codes
};

export type SurveyStatus =
  | "Draft"
  | "Pending Validation"
  | "Returned for Correction"
  | "Pending Approval"
  | "Approved"
  | "Published"
  | "Flagged Suspect";

export type Protocol =
  | "Two-Pass Removal"
  | "Single-Pass CPUE"
  | "Mark-Recapture"
  | "Electrofishing CPUE";

export type Survey = {
  id: string;
  waterId: string;
  stationId: string;
  date: string; // ISO
  protocol: Protocol;
  uploader: string;
  status: SurveyStatus;
  // high-level counts for dashboard/rows
  fishCount: number;
  speciesDetected: string[]; // species codes
};

export type ValidationIssue = {
  severity: "Error" | "Warning";
  code:
    | "SPECIES_CODE_INVALID"
    | "LENGTH_OUT_OF_RANGE"
    | "WEIGHT_LENGTH_IMPLAUSIBLE"
    | "PROTOCOL_MISMATCH"
    | "MISSING_REQUIRED_FIELD"
    | "STATION_INVALID";
  message: string;
  row?: number;
  field?: string;
  suggestion?: string;
};

export type ValidationCase = {
  surveyId: string;
  summary: { errors: number; warnings: number };
  issues: ValidationIssue[];
};

export type TrendSeriesPoint = {
  year: number;
  cpue: number; // catch per unit effort
  biomassKg: number;
  popEstimate?: number; // optional
};

export type Trend = {
  waterId: string;
  // overall water trend
  overall: TrendSeriesPoint[];
  // optional per-species trend
  bySpecies?: Record<string, TrendSeriesPoint[]>;
};

export type ActivityItem = {
  id: string;
  surveyId: string;
  waterId: string;
  waterName: string;
  stationId: string;
  date: string;
  status: SurveyStatus;
  // primary CTA destination
  primaryAction: "Review" | "Continue" | "View";
};

// -------------------------
// Species (believable set)
// -------------------------
export const species: Species[] = [
  {
    code: "BNT",
    common: "Brown Trout",
    scientific: "Salmo trutta",
    lengthMm: { min: 80, max: 750 },
    weightG: { min: 5, max: 6000 },
  },
  {
    code: "RBT",
    common: "Rainbow Trout",
    scientific: "Oncorhynchus mykiss",
    lengthMm: { min: 80, max: 800 },
    weightG: { min: 5, max: 7000 },
  },
  {
    code: "CTT",
    common: "Cutthroat Trout",
    scientific: "Oncorhynchus clarkii",
    lengthMm: { min: 70, max: 650 },
    weightG: { min: 4, max: 4500 },
  },
  {
    code: "MWF",
    common: "Mountain Whitefish",
    scientific: "Prosopium williamsoni",
    lengthMm: { min: 90, max: 600 },
    weightG: { min: 8, max: 2800 },
  },
  {
    code: "WHS",
    common: "White Sucker",
    scientific: "Catostomus commersonii",
    lengthMm: { min: 120, max: 700 },
    weightG: { min: 20, max: 3500 },
  },
  {
    code: "CRD",
    common: "Creek Chub",
    scientific: "Semotilus atromaculatus",
    lengthMm: { min: 40, max: 220 },
    weightG: { min: 1, max: 200 },
  },
  {
    code: "LMB",
    common: "Largemouth Bass",
    scientific: "Micropterus salmoides",
    lengthMm: { min: 80, max: 650 },
    weightG: { min: 5, max: 5500 },
  },
];

// -------------------------
// Waters (Northeast + comparisons)
// -------------------------
export const waters: Water[] = [
  {
    id: "south-platte",
    name: "South Platte Basin",
    region: "Northeast",
    huc12: "140100010101",
    yearsActive: { start: 1998, end: 2025 },
    stations: [
      { id: "SP-01", name: "Deckers", riverMile: 62, coords: { lat: 39.255, lon: -105.221 } },
      { id: "SP-03", name: "Waterton Canyon", riverMile: 25, coords: { lat: 39.488, lon: -105.103 } },
      { id: "SP-04", name: "Chatfield Reach", riverMile: 18, coords: { lat: 39.54, lon: -105.065 } },
    ],
    primarySpecies: ["BNT", "RBT", "WHS"],
  },
  {
    id: "cache-la-poudre",
    name: "Cache la Poudre River",
    region: "Northeast",
    huc12: "101900070203",
    yearsActive: { start: 2004, end: 2025 },
    stations: [
      { id: "PDR-01", name: "Mishawaka", riverMile: 70, coords: { lat: 40.688, lon: -105.309 } },
      { id: "PDR-02", name: "Gateway", riverMile: 52, coords: { lat: 40.68, lon: -105.21 } },
    ],
    primarySpecies: ["CTT", "BNT", "CRD"],
  },
  {
    id: "st-vrain",
    name: "St. Vrain Creek",
    region: "Northeast",
    huc12: "101900050104",
    yearsActive: { start: 2009, end: 2025 },
    stations: [
      { id: "SV-01", name: "Lyons", riverMile: 34, coords: { lat: 40.224, lon: -105.271 } },
      { id: "SV-02", name: "Longmont Reach", riverMile: 18, coords: { lat: 40.167, lon: -105.101 } },
    ],
    primarySpecies: ["RBT", "BNT", "WHS"],
  },
  {
    id: "big-thompson",
    name: "Big Thompson River",
    region: "Northeast",
    huc12: "101900060201",
    yearsActive: { start: 2006, end: 2025 },
    stations: [
      { id: "BT-01", name: "Drake", riverMile: 43, coords: { lat: 40.416, lon: -105.28 } },
      { id: "BT-02", name: "Loveland Reach", riverMile: 12, coords: { lat: 40.394, lon: -105.076 } },
    ],
    primarySpecies: ["RBT", "MWF", "WHS"],
  },
  {
    id: "boyd-lake",
    name: "Boyd Lake (Reservoir)",
    region: "Northeast",
    huc12: "101900060305",
    yearsActive: { start: 2012, end: 2025 },
    stations: [
      { id: "BL-01", name: "North Shore", coords: { lat: 40.42, lon: -105.01 } },
      { id: "BL-02", name: "Dam Area", coords: { lat: 40.41, lon: -105.0 } },
    ],
    primarySpecies: ["LMB", "WHS", "CRD"],
  },

  // Comparison waters (for Senior compare mode)
  {
    id: "blue-river",
    name: "Blue River",
    region: "Comparison",
    huc12: "140100020101",
    yearsActive: { start: 1995, end: 2025 },
    stations: [
      { id: "BR-01", name: "Silverthorne", riverMile: 22, coords: { lat: 39.624, lon: -106.073 } },
      { id: "BR-02", name: "Green Mountain Reach", riverMile: 8, coords: { lat: 39.87, lon: -106.33 } },
    ],
    primarySpecies: ["RBT", "BNT", "MWF"],
  },
  {
    id: "colorado-river",
    name: "Colorado River (Middle)",
    region: "Comparison",
    huc12: "140100010204",
    yearsActive: { start: 1990, end: 2025 },
    stations: [
      { id: "CR-01", name: "Kremmling", riverMile: 84, coords: { lat: 40.06, lon: -106.38 } },
      { id: "CR-02", name: "Glenwood Reach", riverMile: 32, coords: { lat: 39.55, lon: -107.33 } },
    ],
    primarySpecies: ["BNT", "MWF", "WHS"],
  },
];

// -------------------------
// Fish-level records for validation page (per survey)
// -------------------------
export type FishRecord = {
  row: number;
  pass: number;
  species: string;
  length: number; // mm
  weight: number; // g
  status: "valid" | "warning" | "error";
  error?: string;
};

export const fishRecords: Record<string, FishRecord[]> = {
  // Hero A — Clean survey (all valid)
  "SVY-2026-NE-0100": [
    { row: 1, pass: 1, species: "BNT", length: 287, weight: 312, status: "valid" },
    { row: 2, pass: 1, species: "RBT", length: 245, weight: 186, status: "valid" },
    { row: 3, pass: 1, species: "BNT", length: 198, weight: 105, status: "valid" },
    { row: 4, pass: 1, species: "WHS", length: 302, weight: 380, status: "valid" },
    { row: 5, pass: 1, species: "RBT", length: 176, weight: 78, status: "valid" },
    { row: 6, pass: 1, species: "BNT", length: 334, weight: 510, status: "valid" },
    { row: 7, pass: 1, species: "RBT", length: 223, weight: 148, status: "valid" },
    { row: 8, pass: 2, species: "BNT", length: 256, weight: 224, status: "valid" },
    { row: 9, pass: 2, species: "WHS", length: 275, weight: 290, status: "valid" },
    { row: 10, pass: 2, species: "RBT", length: 190, weight: 98, status: "valid" },
    { row: 11, pass: 2, species: "BNT", length: 312, weight: 425, status: "valid" },
    { row: 12, pass: 2, species: "RBT", length: 267, weight: 260, status: "valid" },
    { row: 13, pass: 2, species: "WHS", length: 340, weight: 490, status: "valid" },
    { row: 14, pass: 2, species: "BNT", length: 201, weight: 112, status: "valid" },
    { row: 15, pass: 2, species: "RBT", length: 234, weight: 168, status: "valid" },
    { row: 16, pass: 2, species: "BNT", length: 278, weight: 295, status: "valid" },
    { row: 17, pass: 2, species: "RBT", length: 156, weight: 56, status: "valid" },
    { row: 18, pass: 2, species: "WHS", length: 290, weight: 340, status: "valid" },
  ],
  // Hero B — Warning-only survey (1 warning: young-of-year CTT)
  "SVY-2026-NE-0101": [
    { row: 1, pass: 1, species: "BNT", length: 310, weight: 420, status: "valid" },
    { row: 2, pass: 1, species: "CTT", length: 198, weight: 115, status: "valid" },
    { row: 3, pass: 1, species: "BNT", length: 245, weight: 195, status: "valid" },
    { row: 4, pass: 1, species: "CRD", length: 112, weight: 18, status: "valid" },
    { row: 5, pass: 1, species: "CTT", length: 275, weight: 310, status: "valid" },
    { row: 6, pass: 1, species: "BNT", length: 189, weight: 92, status: "valid" },
    { row: 7, pass: 1, species: "CTT", length: 134, weight: 38, status: "warning", error: "Young of year detected (134mm CTT)" },
    { row: 8, pass: 1, species: "CRD", length: 98, weight: 12, status: "valid" },
    { row: 9, pass: 1, species: "BNT", length: 356, weight: 625, status: "valid" },
    { row: 10, pass: 1, species: "CTT", length: 223, weight: 162, status: "valid" },
    { row: 11, pass: 1, species: "BNT", length: 267, weight: 258, status: "valid" },
    { row: 12, pass: 1, species: "CRD", length: 105, weight: 15, status: "valid" },
    { row: 13, pass: 1, species: "CTT", length: 256, weight: 240, status: "valid" },
    { row: 14, pass: 1, species: "BNT", length: 201, weight: 112, status: "valid" },
    { row: 15, pass: 1, species: "CTT", length: 178, weight: 82, status: "valid" },
  ],
  // Hero C — Error survey (2 errors, 1 warning)
  "SVY-2026-NE-0102": [
    { row: 1, pass: 1, species: "BNT", length: 245, weight: 186, status: "valid" },
    { row: 2, pass: 1, species: "RBT", length: 198, weight: 124, status: "valid" },
    { row: 3, pass: 1, species: "BNT", length: 312, weight: 425, status: "valid" },
    { row: 4, pass: 1, species: "RNTR", length: 189, weight: 98, status: "error", error: "Invalid species code \"RNTR\" — Not in CPW reference database" },
    { row: 5, pass: 1, species: "RBT", length: 156, weight: 67, status: "valid" },
    { row: 6, pass: 1, species: "BNT", length: 267, weight: 289, status: "valid" },
    { row: 7, pass: 1, species: "RBT", length: 892, weight: 1245, status: "error", error: "Length exceeds biological maximum (892mm for Rainbow Trout)" },
    { row: 8, pass: 2, species: "BNT", length: 234, weight: 198, status: "valid" },
    { row: 9, pass: 2, species: "CTT", length: 145, weight: 45, status: "warning", error: "Young of year detected (145mm CTT)" },
    { row: 10, pass: 2, species: "RBT", length: 223, weight: 167, status: "valid" },
    { row: 11, pass: 2, species: "BNT", length: 178, weight: 78, status: "valid" },
    { row: 12, pass: 2, species: "RBT", length: 290, weight: 340, status: "valid" },
    { row: 13, pass: 2, species: "BNT", length: 256, weight: 224, status: "valid" },
    { row: 14, pass: 2, species: "RBT", length: 201, weight: 118, status: "valid" },
    { row: 15, pass: 2, species: "BNT", length: 334, weight: 510, status: "valid" },
    { row: 16, pass: 2, species: "RBT", length: 167, weight: 68, status: "valid" },
    { row: 17, pass: 2, species: "BNT", length: 223, weight: 148, status: "valid" },
    { row: 18, pass: 2, species: "RBT", length: 278, weight: 295, status: "valid" },
    { row: 19, pass: 2, species: "BNT", length: 190, weight: 95, status: "valid" },
    { row: 20, pass: 2, species: "RBT", length: 245, weight: 192, status: "valid" },
  ],
};

// -------------------------
// Surveys (enough for queue + clicks)
// -------------------------
export const surveys: Survey[] = [
  // ── Hero surveys for demo flow (2026 dates → sort to top) ──
  {
    id: "SVY-2026-NE-0100",
    waterId: "south-platte",
    stationId: "SP-04",
    date: "2026-02-10",
    protocol: "Two-Pass Removal",
    uploader: "J. Alvarez",
    status: "Pending Approval",
    fishCount: 18,
    speciesDetected: ["BNT", "RBT", "WHS"],
  },
  {
    id: "SVY-2026-NE-0101",
    waterId: "cache-la-poudre",
    stationId: "PDR-01",
    date: "2026-02-08",
    protocol: "Single-Pass CPUE",
    uploader: "K. Singh",
    status: "Pending Approval",
    fishCount: 15,
    speciesDetected: ["BNT", "CTT", "CRD"],
  },
  {
    id: "SVY-2026-NE-0102",
    waterId: "south-platte",
    stationId: "SP-03",
    date: "2026-02-06",
    protocol: "Two-Pass Removal",
    uploader: "M. Chen",
    status: "Pending Validation",
    fishCount: 20,
    speciesDetected: ["BNT", "RBT", "RNTR"],
  },

  // South Platte
  {
    id: "SVY-2025-SP-0007",
    waterId: "south-platte",
    stationId: "SP-04",
    date: "2025-08-14",
    protocol: "Two-Pass Removal",
    uploader: "J. Alvarez",
    status: "Pending Approval",
    fishCount: 214,
    speciesDetected: ["BNT", "RBT", "WHS"],
  },
  {
    id: "SVY-2025-SP-0006",
    waterId: "south-platte",
    stationId: "SP-03",
    date: "2025-08-03",
    protocol: "Electrofishing CPUE",
    uploader: "K. Singh",
    status: "Returned for Correction",
    fishCount: 167,
    speciesDetected: ["BNT", "RBT"],
  },
  {
    id: "SVY-2025-SP-0005",
    waterId: "south-platte",
    stationId: "SP-01",
    date: "2025-07-21",
    protocol: "Two-Pass Removal",
    uploader: "K. Singh",
    status: "Approved",
    fishCount: 241,
    speciesDetected: ["BNT", "RBT", "WHS"],
  },

  // Cache la Poudre
  {
    id: "SVY-2025-PDR-0012",
    waterId: "cache-la-poudre",
    stationId: "PDR-02",
    date: "2025-09-02",
    protocol: "Mark-Recapture",
    uploader: "M. Chen",
    status: "Pending Validation",
    fishCount: 98,
    speciesDetected: ["CTT", "BNT"],
  },
  {
    id: "SVY-2025-PDR-0011",
    waterId: "cache-la-poudre",
    stationId: "PDR-01",
    date: "2025-08-18",
    protocol: "Two-Pass Removal",
    uploader: "M. Chen",
    status: "Approved",
    fishCount: 132,
    speciesDetected: ["CTT", "BNT", "CRD"],
  },

  // St. Vrain
  {
    id: "SVY-2025-SV-0004",
    waterId: "st-vrain",
    stationId: "SV-01",
    date: "2025-08-28",
    protocol: "Single-Pass CPUE",
    uploader: "A. Patel",
    status: "Pending Approval",
    fishCount: 121,
    speciesDetected: ["RBT", "BNT", "WHS"],
  },
  {
    id: "SVY-2025-SV-0003",
    waterId: "st-vrain",
    stationId: "SV-02",
    date: "2025-08-11",
    protocol: "Single-Pass CPUE",
    uploader: "A. Patel",
    status: "Approved",
    fishCount: 109,
    speciesDetected: ["RBT", "WHS"],
  },

  // Big Thompson
  {
    id: "SVY-2025-BT-0009",
    waterId: "big-thompson",
    stationId: "BT-01",
    date: "2025-07-30",
    protocol: "Electrofishing CPUE",
    uploader: "S. Romero",
    status: "Flagged Suspect",
    fishCount: 88,
    speciesDetected: ["RBT", "MWF"],
  },
  {
    id: "SVY-2025-BT-0008",
    waterId: "big-thompson",
    stationId: "BT-02",
    date: "2025-07-12",
    protocol: "Single-Pass CPUE",
    uploader: "S. Romero",
    status: "Approved",
    fishCount: 102,
    speciesDetected: ["RBT", "MWF", "WHS"],
  },

  // Boyd Lake (Reservoir)
  {
    id: "SVY-2025-BL-0002",
    waterId: "boyd-lake",
    stationId: "BL-02",
    date: "2025-06-22",
    protocol: "Electrofishing CPUE",
    uploader: "D. Wilson",
    status: "Pending Approval",
    fishCount: 64,
    speciesDetected: ["LMB", "WHS"],
  },

  // Comparison: Blue River
  {
    id: "SVY-2025-BR-0015",
    waterId: "blue-river",
    stationId: "BR-02",
    date: "2025-09-06",
    protocol: "Single-Pass CPUE",
    uploader: "Statewide Team",
    status: "Approved",
    fishCount: 93,
    speciesDetected: ["RBT", "BNT", "MWF"],
  },

  // Comparison: Colorado River
  {
    id: "SVY-2025-CR-0019",
    waterId: "colorado-river",
    stationId: "CR-01",
    date: "2025-08-24",
    protocol: "Electrofishing CPUE",
    uploader: "Statewide Team",
    status: "Approved",
    fishCount: 156,
    speciesDetected: ["BNT", "MWF", "WHS"],
  },
];

// -------------------------
// Validation cases (believable scientific errors)
// -------------------------
export const validationCases: ValidationCase[] = [
  // Hero B — warning only
  {
    surveyId: "SVY-2026-NE-0101",
    summary: { errors: 0, warnings: 1 },
    issues: [
      {
        severity: "Warning",
        code: "LENGTH_OUT_OF_RANGE",
        message: "Young of year detected (134mm CTT) — Consider exclusion flag for population analysis.",
        row: 7,
        field: "length_mm",
        suggestion: "Flag young-of-year or exclude from depletion estimate.",
      },
    ],
  },
  // Hero C — errors
  {
    surveyId: "SVY-2026-NE-0102",
    summary: { errors: 2, warnings: 1 },
    issues: [
      {
        severity: "Error",
        code: "SPECIES_CODE_INVALID",
        message: "Species code \"RNTR\" not recognized in CPW reference database.",
        row: 4,
        field: "species_code",
        suggestion: "Did you mean \"RBT\" (Rainbow Trout) or \"CTT\" (Cutthroat Trout)?",
      },
      {
        severity: "Error",
        code: "LENGTH_OUT_OF_RANGE",
        message: "Length 892mm exceeds biological maximum for Rainbow Trout (max 800mm).",
        row: 7,
        field: "length_mm",
        suggestion: "Check measurement units (mm) and transcription.",
      },
      {
        severity: "Warning",
        code: "LENGTH_OUT_OF_RANGE",
        message: "Young of year detected (145mm CTT) — Consider exclusion flag for population analysis.",
        row: 9,
        field: "length_mm",
        suggestion: "Flag young-of-year or exclude from depletion estimate.",
      },
    ],
  },
  {
    surveyId: "SVY-2025-SP-0006",
    summary: { errors: 2, warnings: 1 },
    issues: [
      {
        severity: "Error",
        code: "WEIGHT_LENGTH_IMPLAUSIBLE",
        message: "Weight appears implausible relative to length for Brown Trout.",
        row: 17,
        field: "weight_g",
        suggestion: "Verify scale entry or units (g).",
      },
      {
        severity: "Error",
        code: "LENGTH_OUT_OF_RANGE",
        message: "Length exceeds plausible range for Rainbow Trout.",
        row: 41,
        field: "length_mm",
        suggestion: "Check measurement units (mm) and transcription.",
      },
      {
        severity: "Warning",
        code: "MISSING_REQUIRED_FIELD",
        message: "Water temperature missing for station metadata (recommended).",
        field: "water_temp_c",
        suggestion: "Add station conditions if available.",
      },
    ],
  },
  {
    surveyId: "SVY-2025-PDR-0012",
    summary: { errors: 1, warnings: 2 },
    issues: [
      {
        severity: "Error",
        code: "PROTOCOL_MISMATCH",
        message: "Mark-Recapture protocol selected but recapture flag missing on all records.",
        suggestion: "Confirm protocol or mark recapture fields.",
      },
      {
        severity: "Warning",
        code: "MISSING_REQUIRED_FIELD",
        message: "HUC12 not populated in submission metadata.",
        field: "huc12",
        suggestion: "Select HUC12 from water profile metadata.",
      },
      {
        severity: "Warning",
        code: "SPECIES_CODE_INVALID",
        message: "Species code 'CUT' not recognized. Did you mean 'CTT'?",
        row: 6,
        field: "species_code",
        suggestion: "Use lookup codes (CTT, BNT, RBT...).",
      },
    ],
  },
  {
    surveyId: "SVY-2025-BT-0009",
    summary: { errors: 0, warnings: 2 },
    issues: [
      {
        severity: "Warning",
        code: "STATION_INVALID",
        message: "Station coordinates are outside expected station reach boundary (minor).",
        suggestion: "Confirm station selection or GPS rounding.",
      },
      {
        severity: "Warning",
        code: "MISSING_REQUIRED_FIELD",
        message: "Effort duration missing; CPUE will be estimated using default effort.",
        field: "effort_minutes",
        suggestion: "Enter electrofishing effort minutes for best CPUE accuracy.",
      },
    ],
  },
];

// -------------------------
// Trends (coherent stories per water)
// -------------------------
export const trends: Trend[] = [
  {
    waterId: "south-platte",
    overall: [
      { year: 2021, cpue: 2.9, biomassKg: 480, popEstimate: 11200 },
      { year: 2022, cpue: 3.1, biomassKg: 505, popEstimate: 11850 },
      { year: 2023, cpue: 3.3, biomassKg: 530, popEstimate: 12420 },
      { year: 2024, cpue: 3.5, biomassKg: 560, popEstimate: 13110 },
      { year: 2025, cpue: 3.6, biomassKg: 575, popEstimate: 13490 },
    ],
    bySpecies: {
      BNT: [
        { year: 2021, cpue: 1.6, biomassKg: 260 },
        { year: 2022, cpue: 1.7, biomassKg: 275 },
        { year: 2023, cpue: 1.9, biomassKg: 292 },
        { year: 2024, cpue: 2.0, biomassKg: 305 },
        { year: 2025, cpue: 2.1, biomassKg: 315 },
      ],
      RBT: [
        { year: 2021, cpue: 1.1, biomassKg: 170 },
        { year: 2022, cpue: 1.2, biomassKg: 178 },
        { year: 2023, cpue: 1.2, biomassKg: 182 },
        { year: 2024, cpue: 1.3, biomassKg: 190 },
        { year: 2025, cpue: 1.3, biomassKg: 192 },
      ],
    },
  },
  {
    waterId: "cache-la-poudre",
    overall: [
      { year: 2021, cpue: 2.6, biomassKg: 410, popEstimate: 9800 },
      { year: 2022, cpue: 2.5, biomassKg: 402, popEstimate: 9550 },
      { year: 2023, cpue: 2.4, biomassKg: 396, popEstimate: 9300 },
      { year: 2024, cpue: 2.4, biomassKg: 390, popEstimate: 9150 },
      { year: 2025, cpue: 2.3, biomassKg: 385, popEstimate: 9000 },
    ],
    bySpecies: {
      CTT: [
        { year: 2021, cpue: 1.2, biomassKg: 190 },
        { year: 2022, cpue: 1.1, biomassKg: 182 },
        { year: 2023, cpue: 1.0, biomassKg: 176 },
        { year: 2024, cpue: 1.0, biomassKg: 172 },
        { year: 2025, cpue: 0.9, biomassKg: 168 },
      ],
    },
  },
  {
    waterId: "st-vrain",
    overall: [
      { year: 2021, cpue: 2.2, biomassKg: 360 },
      { year: 2022, cpue: 2.3, biomassKg: 368 },
      { year: 2023, cpue: 2.3, biomassKg: 370 },
      { year: 2024, cpue: 2.4, biomassKg: 378 },
      { year: 2025, cpue: 2.4, biomassKg: 381 },
    ],
  },
  {
    waterId: "big-thompson",
    overall: [
      { year: 2021, cpue: 2.0, biomassKg: 335 },
      { year: 2022, cpue: 2.1, biomassKg: 340 },
      { year: 2023, cpue: 2.1, biomassKg: 338 },
      { year: 2024, cpue: 2.0, biomassKg: 332 },
      { year: 2025, cpue: 1.9, biomassKg: 325 },
    ],
  },
  {
    waterId: "boyd-lake",
    overall: [
      { year: 2021, cpue: 1.6, biomassKg: 290 },
      { year: 2022, cpue: 1.8, biomassKg: 305 },
      { year: 2023, cpue: 1.9, biomassKg: 318 },
      { year: 2024, cpue: 1.9, biomassKg: 320 },
      { year: 2025, cpue: 2.0, biomassKg: 330 },
    ],
  },

  // Comparisons for Senior "Compare Waters"
  {
    waterId: "blue-river",
    overall: [
      { year: 2021, cpue: 2.1, biomassKg: 420 },
      { year: 2022, cpue: 2.0, biomassKg: 415 },
      { year: 2023, cpue: 2.1, biomassKg: 418 },
      { year: 2024, cpue: 2.0, biomassKg: 410 },
      { year: 2025, cpue: 2.0, biomassKg: 408 },
    ],
  },
  {
    waterId: "colorado-river",
    overall: [
      { year: 2021, cpue: 3.0, biomassKg: 610 },
      { year: 2022, cpue: 3.1, biomassKg: 620 },
      { year: 2023, cpue: 3.2, biomassKg: 635 },
      { year: 2024, cpue: 3.3, biomassKg: 650 },
      { year: 2025, cpue: 3.4, biomassKg: 665 },
    ],
  },
];

// -------------------------
// Helpers (derive “Review Queue” from surveys)
// -------------------------
export function getWaterById(id: string) {
  return waters.find((w) => w.id === id);
}

export function getSurveyById(id: string) {
  return surveys.find((s) => s.id === id);
}

export function getValidationBySurveyId(surveyId: string) {
  return validationCases.find((v) => v.surveyId === surveyId);
}

export function buildActivityFeed(
  region: "Northeast" | "Comparison" | "All" = "Northeast",
  surveyList?: Survey[],
): ActivityItem[] {
  const source = surveyList ?? surveys;
  const allowedWaterIds =
    region === "All"
      ? new Set(waters.map((w) => w.id))
      : new Set(waters.filter((w) => w.region === region).map((w) => w.id));

  return source
    .filter((s) => allowedWaterIds.has(s.waterId))
    .filter((s) =>
      ["Pending Validation", "Returned for Correction", "Pending Approval", "Flagged Suspect"].includes(s.status)
    )
    .map((s) => {
      const w = getWaterById(s.waterId)!;
      const primaryAction: ActivityItem["primaryAction"] =
        s.status === "Returned for Correction" ? "Continue" : "Review";
      return {
        id: `ACT-${s.id}`,
        surveyId: s.id,
        waterId: s.waterId,
        waterName: w.name,
        stationId: s.stationId,
        date: s.date,
        status: s.status,
        primaryAction,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getTrendForWater(waterId: string) {
  return trends.find((t) => t.waterId === waterId);
}

export function getFishRecords(surveyId: string): FishRecord[] | undefined {
  return fishRecords[surveyId];
}

// ── Survey quality classification for analysis guardrails ──

export type SurveyQuality = 'validated' | 'unvalidated' | 'invalid';

export function getSurveyQuality(survey: Survey): SurveyQuality {
  // Validation errors override status-based classification
  const vc = getValidationBySurveyId(survey.id);
  if (vc && vc.summary.errors > 0) return 'invalid';

  switch (survey.status) {
    case 'Draft':
    case 'Returned for Correction':
      return 'invalid';
    case 'Approved':
    case 'Published':
      return 'validated';
    default:
      return 'unvalidated';
  }
}
