# Seed Data Import Guide

This directory contains CSV files that populate the ADAMAS demo application's Dataverse tables with realistic fisheries survey data sourced from the React prototype's `src/app/data/world.ts`.

## Import Order

Dataverse enforces referential integrity through lookup columns. Import tables in this order so that parent records exist before child records reference them:

| Step | File                  | Table (Display Name)     | Row Count | Dependencies          |
|------|-----------------------|--------------------------|-----------|-----------------------|
| 1    | `Species.csv`         | Species                  | 7         | None                  |
| 2    | `Waters.csv`          | Waters                   | 7         | None                  |
| 3    | `Stations.csv`        | Stations                 | 15        | Waters                |
| 4    | `AppUsers.csv`        | App Users                | 3         | None                  |
| 5    | `Surveys.csv`         | Surveys                  | 15        | Waters, Stations      |
| 6    | `FishRecords.csv`     | Fish Records             | 53        | Surveys, Species      |
| 7    | `ValidationIssues.csv`| Validation Issues        | 12        | Surveys               |
| 8    | `TrendData.csv`       | Trend Data               | 50        | Waters, Species       |

## How to Import CSVs into Dataverse

### Method: Power Apps Maker Portal

1. Navigate to [make.powerapps.com](https://make.powerapps.com) and select the correct environment.
2. In the left navigation, click **Tables**.
3. Select the target table (e.g., "Species").
4. Click the **Data** tab at the top of the table view, then select **Import data** > **From text/CSV**.
5. In the Power Query dialog, click **Browse** and select the corresponding CSV file.
6. Review the data preview. Verify column types are detected correctly.
7. Map each CSV column to the matching Dataverse column (see Column Mapping Notes below).
8. Click **Next**, then **Publish** to load the data.

### Alternative: Dataverse Excel Import

1. Open the table in Power Apps, click **Edit data in Excel**.
2. Paste the CSV rows into the Excel Online sheet.
3. Click **Publish** in the Excel add-in to push rows to Dataverse.

## Column Mapping Notes

### Species.csv
| CSV Column      | Dataverse Column     | Type           | Notes                              |
|-----------------|----------------------|----------------|------------------------------------|
| Code            | Code                 | Text (PK)      | 3-letter species code              |
| CommonName      | Common Name          | Text           |                                    |
| ScientificName  | Scientific Name      | Text           |                                    |
| LengthMinMm     | Length Min (mm)      | Whole Number   | Minimum plausible length           |
| LengthMaxMm     | Length Max (mm)      | Whole Number   | Maximum plausible length           |
| WeightMinG      | Weight Min (g)       | Whole Number   | Minimum plausible weight           |
| WeightMaxG      | Weight Max (g)       | Whole Number   | Maximum plausible weight           |

### Waters.csv
| CSV Column       | Dataverse Column     | Type           | Notes                              |
|------------------|----------------------|----------------|------------------------------------|
| WaterId          | Water ID             | Text (PK)      | Slug identifier                    |
| Name             | Name                 | Text           |                                    |
| Region           | Region               | Choice         | "Northeast" or "Comparison"        |
| HUC12            | HUC12                | Text           | 12-digit hydrologic unit code      |
| YearsActiveStart | Years Active Start   | Whole Number   |                                    |
| YearsActiveEnd   | Years Active End     | Whole Number   |                                    |
| PrimarySpecies   | Primary Species      | Text           | Comma-separated species codes      |

### Stations.csv
| CSV Column  | Dataverse Column | Type           | Notes                              |
|-------------|------------------|----------------|------------------------------------|
| StationId   | Station ID       | Text (PK)      |                                    |
| Name        | Name             | Text           |                                    |
| WaterId     | Water ID         | Lookup         | Must match Waters.WaterId          |
| RiverMile   | River Mile       | Decimal        | Blank for reservoir stations       |
| Latitude    | Latitude         | Decimal        |                                    |
| Longitude   | Longitude        | Decimal        |                                    |

### Surveys.csv
| CSV Column      | Dataverse Column     | Type           | Notes                              |
|-----------------|----------------------|----------------|------------------------------------|
| SurveyId        | Survey ID            | Text (PK)      |                                    |
| WaterId         | Water ID             | Lookup         | Must match Waters.WaterId          |
| StationId       | Station ID           | Lookup         | Must match Stations.StationId      |
| Date            | Date                 | Date Only      | ISO 8601 format (YYYY-MM-DD)       |
| Protocol        | Protocol             | Choice         | Use label text, not numeric value  |
| Uploader        | Uploader             | Text           |                                    |
| Status          | Status               | Choice         | Use label text (e.g., "Pending Approval") |
| FishCount       | Fish Count           | Whole Number   |                                    |
| SpeciesDetected | Species Detected     | Text           | Comma-separated species codes      |

### FishRecords.csv
| CSV Column    | Dataverse Column | Type           | Notes                              |
|---------------|------------------|----------------|------------------------------------|
| SurveyId      | Survey ID        | Lookup         | Must match Surveys.SurveyId        |
| Row           | Row              | Whole Number   | Row number within the survey       |
| Pass          | Pass             | Whole Number   | Electrofishing pass number         |
| Species       | Species          | Lookup/Text    | Species code (matches Species.Code)|
| LengthMm      | Length (mm)      | Whole Number   |                                    |
| WeightG       | Weight (g)       | Whole Number   |                                    |
| RecordStatus  | Record Status    | Choice         | "valid", "warning", or "error"     |
| ErrorMessage  | Error Message    | Text           | Blank for valid records            |

### ValidationIssues.csv
| CSV Column  | Dataverse Column | Type           | Notes                              |
|-------------|------------------|----------------|------------------------------------|
| SurveyId    | Survey ID        | Lookup         | Must match Surveys.SurveyId        |
| Severity    | Severity         | Choice         | "Error" or "Warning"               |
| Code        | Code             | Choice/Text    | Validation rule code               |
| Message     | Message          | Text (Multi)   | Human-readable description         |
| Row         | Row              | Whole Number   | Blank if issue is survey-level     |
| Field       | Field            | Text           | Column name with the issue         |
| Suggestion  | Suggestion       | Text (Multi)   | Recommended fix                    |

### TrendData.csv
| CSV Column   | Dataverse Column | Type           | Notes                              |
|--------------|------------------|----------------|------------------------------------|
| WaterId      | Water ID         | Lookup         | Must match Waters.WaterId          |
| Year         | Year             | Whole Number   |                                    |
| CPUE         | CPUE             | Decimal        | Catch per unit effort              |
| BiomassKg    | Biomass (kg)     | Decimal        |                                    |
| PopEstimate  | Pop Estimate     | Whole Number   | Blank when not available           |
| SpeciesCode  | Species Code     | Lookup/Text    | Blank for overall water trends     |

### AppUsers.csv
| CSV Column   | Dataverse Column | Type           | Notes                              |
|--------------|------------------|----------------|------------------------------------|
| Email        | Email            | Text (PK)      | UPN for the demo user              |
| DisplayName  | Display Name     | Text           |                                    |
| Role         | Role             | Choice         | "Data Entry Assistant", "Area Biologist", or "Senior Biologist" |
| Region       | Region           | Choice/Text    | "Northeast" or "Statewide"         |

## Post-Import Verification

After importing all files, verify the data is correct:

1. **Row counts** -- Open each table and confirm the expected number of rows (see table above).
2. **Lookup resolution** -- Open a Survey record and confirm the Water ID and Station ID lookups resolve to the correct display names (e.g., "South Platte Basin", "Chatfield Reach").
3. **Choice values** -- Verify Status and Protocol columns display their labels (e.g., "Pending Approval") rather than raw integer option-set values.
4. **Fish record integrity** -- Open survey `SVY-2026-NE-0100` and confirm it has 18 associated Fish Records, all with RecordStatus = "valid".
5. **Validation issues** -- Open survey `SVY-2026-NE-0102` and confirm 3 associated Validation Issues (2 errors, 1 warning).
6. **Trend data** -- Open the South Platte water record and confirm 15 associated Trend Data rows (5 overall + 5 BNT + 5 RBT).
7. **Dates** -- Confirm survey dates display correctly (the three hero surveys should show February 2026 dates).

## Troubleshooting

- **Lookup column fails to resolve**: Ensure parent table data was imported first (see Import Order above).
- **Choice column shows raw number**: Re-map the column to use label text instead of numeric values during import.
- **Duplicate key error**: The table may already contain seed data. Clear existing rows before re-importing.
- **CSV encoding issues**: Save files as UTF-8 (no BOM) if special characters (e.g., accented names like "Poudre") display incorrectly.


## Column mapping note

- The CSV headers in this folder are **human-friendly** and may not exactly match Dataverse schema names (e.g., `SurveyId` vs `cpw_SurveyId`).
- During import, use Dataverse's column mapping UI to map each CSV header to the correct Dataverse column as defined in `../03_dataverse_schema.md`.
- If you prefer exact header matches, regenerate the CSVs with `cpw_*` headers after your Dataverse tables exist.
