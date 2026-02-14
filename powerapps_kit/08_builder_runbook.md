# 08 - Builder Runbook: Assembling the ADAMAS Demo in Power Apps

> ADAMAS CPW Fisheries - Power Apps Build Kit
> Document version: 1.0 | Date: 2026-02-13

---

## How to Use This Document

This runbook walks you through every step required to build a working ADAMAS (Aquatic Data & Monitoring Analysis System) demo as a Power Apps Canvas App backed by Dataverse. Each step includes the exact menu paths, click sequences, field values, and formulas you need.

**Estimated build time:** 8-12 hours for someone with basic Power Apps familiarity.

**Conventions used in this document:**

- Menu paths are written as: **Tables > New table > Set display name**
- Power Fx formulas appear in fenced code blocks and can be copy-pasted directly
- Required fields are marked with **(required)**
- Cross-references to other kit files appear as `[see 05_powerfx_formulas.md]`

---

## Phase 1: Environment Setup (Steps 1-5)

### Step 1: Verify Prerequisites

Confirm you have the following before starting:

| Requirement | How to Verify |
|---|---|
| **Power Apps license** (Per User or Per App) | Go to [admin.microsoft.com](https://admin.microsoft.com) > Billing > Licenses. You need a license that includes Canvas Apps with Dataverse. |
| **Dataverse environment access** | Go to [admin.powerplatform.microsoft.com](https://admin.powerplatform.microsoft.com) > Environments. You need System Administrator or Environment Maker role. |
| **Power Automate license** | Included with most Power Apps licenses. Verify at admin.microsoft.com. |
| **Modern browser** | Microsoft Edge or Google Chrome, latest version. |
| **Seed data CSV files** | Located in `07_seed_data/` directory of this kit: `Species.csv`, `Waters.csv`, `Stations.csv`, `Surveys.csv`. |
| **This kit's companion files** | `02_workflow_and_status_model.md` (status transitions), plus optional `03_dataverse_schema.md`, `04_canvas_app_screen_spec.md`, `05_powerfx_formulas.md`, `06_power_automate_flows.md` if available. |

### Step 2: Create or Select a Dataverse Environment

1. Navigate to [admin.powerplatform.microsoft.com](https://admin.powerplatform.microsoft.com).
2. In the left navigation, click **Environments**.
3. Click **+ New** in the command bar.
4. Fill in the form:
   - **Name:** `CPW-Fisheries-Dev`
   - **Region:** United States (or your region)
   - **Type:** Developer (for personal testing) or Sandbox (for team testing)
   - **Purpose:** Development and testing of ADAMAS fisheries demo
   - **Create a database for this environment:** Yes
   - **Language:** English
   - **Currency:** USD
5. Click **Save**. Wait 2-5 minutes for provisioning to complete.
6. Once the environment shows as "Ready", click its name to verify you see the environment details page.

> **If using an existing environment:** Skip this step. Just confirm you have the Environment Maker or System Administrator security role in that environment.

### Step 3: Create a Solution Container

All customizations (tables, apps, flows) should live inside a solution for portability and lifecycle management.

1. Navigate to [make.powerapps.com](https://make.powerapps.com).
2. In the top-right environment picker, select your `CPW-Fisheries-Dev` environment.
3. In the left navigation, click **Solutions**.
4. Click **+ New solution**.
5. Fill in the form:
   - **Display name:** `ADAMAS CPW Fisheries`
   - **Name:** `ADAMASCPWFisheries` (auto-generated, or type your own)
   - **Publisher:** Select your publisher or create one:
     - Click **+ New publisher**
     - **Display name:** `CPW Fisheries`
     - **Name:** `cpw`
     - **Prefix:** `cpw`
     - Click **Save**
   - **Version:** `1.0.0.0`
6. Click **Create**.
7. You are now inside the solution. All subsequent tables, the app, and flows will be created here.

### Step 4: Create Global Choice Sets

Choice sets (option sets) must exist before the tables that reference them. Create all six global choices now.

**To create each choice set:**

1. Inside your solution, click **+ New** > **More** > **Choice**.
2. Fill in the fields as described below.
3. For each item, click **+ New choice** and enter the Label. Set the Value (integer) as specified.
4. Click **Save**.

#### Choice Set 1: cpw_SurveyStatus

| Field | Value |
|---|---|
| **Display name** | Survey Status |
| **Name** | cpw_SurveyStatus (auto-generated from publisher prefix) |

| Label | Value (integer) |
|---|---|
| Draft | 100000000 |
| Pending Validation | 100000001 |
| Returned for Correction | 100000002 |
| Pending Approval | 100000003 |
| Approved | 100000004 |
| Published | 100000005 |
| Flagged Suspect | 100000006 |

> **Important:** Set the integer values explicitly. These values are referenced in Power Fx formulas like `cpw_SurveyStatus.'Pending Approval'`.

#### Choice Set 2: cpw_Protocol

| Field | Value |
|---|---|
| **Display name** | Protocol |
| **Name** | cpw_Protocol |

| Label | Value |
|---|---|
| Two-Pass Removal | 100000000 |
| Single-Pass CPUE | 100000001 |
| Mark-Recapture | 100000002 |
| Electrofishing CPUE | 100000003 |

#### Choice Set 3: cpw_Region

| Field | Value |
|---|---|
| **Display name** | Region |
| **Name** | cpw_Region |

| Label | Value |
|---|---|
| Northeast | 100000000 |
| Southeast | 100000001 |
| Northwest | 100000002 |
| Southwest | 100000003 |
| Central | 100000004 |
| Comparison | 100000005 |

#### Choice Set 4: cpw_UserRole

| Field | Value |
|---|---|
| **Display name** | User Role |
| **Name** | cpw_UserRole |

| Label | Value |
|---|---|
| Data Entry Assistant | 100000000 |
| Area Biologist | 100000001 |
| Senior Biologist | 100000002 |

#### Choice Set 5: cpw_RecordStatus

| Field | Value |
|---|---|
| **Display name** | Record Status |
| **Name** | cpw_RecordStatus |

| Label | Value |
|---|---|
| Valid | 100000000 |
| Warning | 100000001 |
| Error | 100000002 |

#### Choice Set 6: cpw_IssueSeverity

| Field | Value |
|---|---|
| **Display name** | Issue Severity |
| **Name** | cpw_IssueSeverity |

| Label | Value |
|---|---|
| Error | 100000000 |
| Warning | 100000001 |

### Step 5: Verify Choice Sets

1. In the solution view, click **Choice** in the left filter panel (or scroll through the solution objects).
2. Confirm you see all 6 choice sets listed.
3. Click each one and verify the correct number of items and integer values.

---

## Phase 2: Create Dataverse Tables (Steps 6-14)

Tables must be created in dependency order. Reference tables (no lookups to other custom tables) come first; dependent tables come after their parents exist.

### General Instructions for Creating Each Table

1. Inside your solution, click **+ New** > **Table** > **Table**.
2. In the "New table" panel:
   - Set **Display name** (this determines the singular form visible in the maker UI).
   - Set **Plural name** (used in formulas, e.g., `cpw_Species` becomes `cpw_Specieses` by default -- override this to a natural plural).
   - Leave **Primary column** settings visible -- you will configure the primary name column as specified.
   - Under **Advanced options**, confirm the **Schema name** starts with your publisher prefix (`cpw_`).
3. Click **Save**.
4. After the table is created, you land on the table designer. Click **+ New column** for each additional column described below.

For each column:
1. Click **+ New column** (or **+ New** > **Column** in the table designer).
2. Set **Display name**, **Data type**, and **Required** as specified.
3. For Choice columns, select the corresponding global choice set created in Step 4.
4. For Lookup columns, select the target table.
5. Click **Save**.

---

### Step 6: Create Table -- cpw_Species

**No dependencies.** This is a reference table for fish species.

| Setting | Value |
|---|---|
| **Display name** | Species |
| **Plural name** | Species |
| **Primary column display name** | Code |
| **Primary column description** | Three-letter CPW species code (e.g., BNT, RBT) |
| **Schema name** | cpw_Species |

**Columns to add:**

| Display Name | Schema Name | Data Type | Required | Notes |
|---|---|---|---|---|
| Code | cpw_Code | Single line of text (100) | Required | This is the primary name column. Set max length to 10. |
| Common Name | cpw_CommonName | Single line of text (100) | Required | e.g., "Brown Trout" |
| Scientific Name | cpw_ScientificName | Single line of text (200) | Optional | e.g., "Salmo trutta" |
| Length Min (mm) | cpw_LengthMinMm | Whole number | Optional | Minimum plausible length in mm |
| Length Max (mm) | cpw_LengthMaxMm | Whole number | Optional | Maximum plausible length in mm |
| Weight Min (g) | cpw_WeightMinG | Whole number | Optional | Minimum plausible weight in grams |
| Weight Max (g) | cpw_WeightMaxG | Whole number | Optional | Maximum plausible weight in grams |

> **Note:** The primary name column is "Code" (e.g., "BNT"). This means when you use this table as a lookup from another table, the species code will display as the label.

---

### Step 7: Create Table -- cpw_Water

**No dependencies.** This is a reference table for water bodies.

| Setting | Value |
|---|---|
| **Display name** | Water |
| **Plural name** | Waters |
| **Primary column display name** | Name |
| **Schema name** | cpw_Water |

**Columns to add:**

| Display Name | Schema Name | Data Type | Required | Notes |
|---|---|---|---|---|
| Name | cpw_Name | Single line of text (200) | Required | Primary name column. e.g., "South Platte Basin" |
| Water ID | cpw_WaterId | Single line of text (50) | Required | Slug identifier, e.g., "south-platte" |
| Region | cpw_Region | Choice (cpw_Region) | Required | Use the global cpw_Region choice set |
| HUC12 | cpw_HUC12 | Single line of text (20) | Optional | 12-digit hydrologic unit code |
| Years Active Start | cpw_YearsActiveStart | Whole number | Optional | e.g., 1998 |
| Years Active End | cpw_YearsActiveEnd | Whole number | Optional | e.g., 2025 |
| Primary Species | cpw_PrimarySpecies | Single line of text (100) | Optional | Comma-separated codes, e.g., "BNT,RBT,WHS" |

---

### Step 8: Create Table -- cpw_Station

**Depends on:** cpw_Water (lookup relationship)

| Setting | Value |
|---|---|
| **Display name** | Station |
| **Plural name** | Stations |
| **Primary column display name** | Name |
| **Schema name** | cpw_Station |

**Columns to add:**

| Display Name | Schema Name | Data Type | Required | Notes |
|---|---|---|---|---|
| Name | cpw_Name | Single line of text (200) | Required | Primary name column. e.g., "Deckers" |
| Station ID | cpw_StationId | Single line of text (20) | Required | e.g., "SP-01" |
| Water | cpw_Water | Lookup (cpw_Water) | Required | Relationship to the Water table |
| River Mile | cpw_RiverMile | Decimal number | Optional | Blank for reservoir stations |
| Latitude | cpw_Latitude | Decimal number | Optional | GPS latitude |
| Longitude | cpw_Longitude | Decimal number | Optional | GPS longitude |

**To create the lookup column:**
1. Click **+ New column**.
2. Set Display name to `Water`.
3. Set Data type to **Lookup**.
4. In the **Related table** field, search for and select `cpw_Water`.
5. Click **Save**.

---

### Step 9: Create Table -- cpw_AppUser

**No dependencies.** This maps Power Platform users to ADAMAS roles.

| Setting | Value |
|---|---|
| **Display name** | App User |
| **Plural name** | App Users |
| **Primary column display name** | Display Name |
| **Schema name** | cpw_AppUser |

**Columns to add:**

| Display Name | Schema Name | Data Type | Required | Notes |
|---|---|---|---|---|
| Display Name | cpw_DisplayName | Single line of text (200) | Required | Primary name column |
| Email | cpw_Email | Single line of text (200) | Required | UPN / email address of the user |
| Role | cpw_Role | Choice (cpw_UserRole) | Required | Data Entry Assistant, Area Biologist, or Senior Biologist |
| Region | cpw_AppUserRegion | Single line of text (50) | Optional | e.g., "Northeast" or "Statewide" |

---

### Step 10: Create Table -- cpw_Survey

**Depends on:** cpw_Water (lookup), cpw_Station (lookup)

This is the core transactional table. Each row represents one fisheries survey event.

| Setting | Value |
|---|---|
| **Display name** | Survey |
| **Plural name** | Surveys |
| **Primary column display name** | Survey ID |
| **Schema name** | cpw_Survey |

**Columns to add:**

| Display Name | Schema Name | Data Type | Required | Notes |
|---|---|---|---|---|
| Survey ID | cpw_SurveyId | Single line of text (30) | Required | Primary name column. e.g., "SVY-2026-NE-0100" |
| Water | cpw_Water | Lookup (cpw_Water) | Required | Relationship to Water table |
| Station | cpw_Station | Lookup (cpw_Station) | Optional | Relationship to Station table |
| Survey Date | cpw_SurveyDate | Date only | Required | Date the survey was conducted |
| Protocol | cpw_Protocol | Choice (cpw_Protocol) | Required | Use global cpw_Protocol choice set |
| Uploader | cpw_Uploader | Single line of text (100) | Optional | Name of the person who uploaded the data |
| Status | cpw_Status | Choice (cpw_SurveyStatus) | Required | Use global cpw_SurveyStatus choice set. Default: Draft |
| Fish Count | cpw_FishCount | Whole number | Optional | Total fish records in this survey |
| Species Detected | cpw_SpeciesDetected | Single line of text (200) | Optional | Comma-separated species codes found |

**To set a default value on the Status column:**
1. After creating the Status column, click on it to edit.
2. In the column properties, set **Default value** to `Draft`.
3. Click **Save**.

---

### Step 11: Create Table -- cpw_FishRecord

**Depends on:** cpw_Survey (lookup)

Individual fish measurements within a survey.

| Setting | Value |
|---|---|
| **Display name** | Fish Record |
| **Plural name** | Fish Records |
| **Primary column display name** | Record Label |
| **Schema name** | cpw_FishRecord |

**Columns to add:**

| Display Name | Schema Name | Data Type | Required | Notes |
|---|---|---|---|---|
| Record Label | cpw_RecordLabel | Single line of text (50) | Required | Primary name. Auto-generated or "Row X" format |
| Survey | cpw_Survey | Lookup (cpw_Survey) | Required | Parent survey |
| Row | cpw_Row | Whole number | Required | Row number within the survey |
| Pass | cpw_Pass | Whole number | Optional | Electrofishing pass number (1, 2, etc.) |
| Species | cpw_Species | Single line of text (10) | Required | Species code (e.g., "BNT") |
| Length (mm) | cpw_LengthMm | Whole number | Required | Fish total length in millimeters |
| Weight (g) | cpw_WeightG | Whole number | Optional | Fish weight in grams |
| Record Status | cpw_RecordStatus | Choice (cpw_RecordStatus) | Optional | Valid, Warning, or Error |
| Error Message | cpw_ErrorMessage | Multiple lines of text | Optional | Description of the error or warning |

---

### Step 12: Create Table -- cpw_ValidationIssue

**Depends on:** cpw_Survey (lookup)

Validation issues flagged by the automated quality-check engine.

| Setting | Value |
|---|---|
| **Display name** | Validation Issue |
| **Plural name** | Validation Issues |
| **Primary column display name** | Issue Label |
| **Schema name** | cpw_ValidationIssue |

**Columns to add:**

| Display Name | Schema Name | Data Type | Required | Notes |
|---|---|---|---|---|
| Issue Label | cpw_IssueLabel | Single line of text (200) | Required | Primary name. Can be auto-generated from Code + Row |
| Survey | cpw_Survey | Lookup (cpw_Survey) | Required | The survey this issue belongs to |
| Severity | cpw_Severity | Choice (cpw_IssueSeverity) | Required | Error or Warning |
| Code | cpw_Code | Single line of text (50) | Required | e.g., "SPECIES_CODE_INVALID", "LENGTH_OUT_OF_RANGE" |
| Message | cpw_Message | Multiple lines of text | Required | Human-readable description |
| Row | cpw_IssueRow | Whole number | Optional | Row number in the survey data (blank for survey-level issues) |
| Field | cpw_Field | Single line of text (50) | Optional | Column name with the issue (e.g., "species_code") |
| Suggestion | cpw_Suggestion | Multiple lines of text | Optional | Recommended fix |

---

### Step 13: Create Table -- cpw_TrendData

**Depends on:** cpw_Water (lookup)

Multi-year population trend data for charts on the Insights and Water Profile screens.

| Setting | Value |
|---|---|
| **Display name** | Trend Data |
| **Plural name** | Trend Data |
| **Primary column display name** | Trend Label |
| **Schema name** | cpw_TrendData |

**Columns to add:**

| Display Name | Schema Name | Data Type | Required | Notes |
|---|---|---|---|---|
| Trend Label | cpw_TrendLabel | Single line of text (100) | Required | Primary name. e.g., "south-platte-2024" or "south-platte-BNT-2024" |
| Water | cpw_Water | Lookup (cpw_Water) | Required | Parent water body |
| Year | cpw_Year | Whole number | Required | Survey year |
| CPUE | cpw_CPUE | Decimal number | Required | Catch per unit effort |
| Biomass (kg) | cpw_BiomassKg | Decimal number | Optional | Total biomass in kilograms |
| Pop Estimate | cpw_PopEstimate | Whole number | Optional | Population estimate (when available) |
| Species Code | cpw_SpeciesCode | Single line of text (10) | Optional | Blank for overall trends; species code for per-species trends |

---

### Step 14: Create Table -- cpw_StatusHistory

**Depends on:** cpw_Survey (lookup)

Audit trail for every survey status transition. Critical for the Activity Feed timeline and compliance.

| Setting | Value |
|---|---|
| **Display name** | Status History |
| **Plural name** | Status Histories |
| **Primary column display name** | History Label |
| **Schema name** | cpw_StatusHistory |

**Columns to add:**

| Display Name | Schema Name | Data Type | Required | Notes |
|---|---|---|---|---|
| History Label | cpw_HistoryLabel | Single line of text (200) | Required | Primary name. Auto-generated. |
| Survey | cpw_Survey | Lookup (cpw_Survey) | Required | The survey that changed status |
| From Status | cpw_FromStatus | Choice (cpw_SurveyStatus) | Optional | The status before the change |
| To Status | cpw_ToStatus | Choice (cpw_SurveyStatus) | Required | The status after the change |
| Changed By | cpw_ChangedBy | Lookup (cpw_AppUser) | Optional | The user who triggered the transition |
| Changed On | cpw_ChangedOn | Date and time | Required | Timestamp of the transition |
| Reason | cpw_Reason | Single line of text (500) | Optional | Free-text reason or system label |

---



### CSV header mapping

The seed CSV files use human-friendly headers. When importing into Dataverse, **map each CSV header to the schema column** (e.g., `SurveyId` → `cpw_SurveyId`) using the import wizard. The authoritative schema is in `03_dataverse_schema.md`.


## Phase 3: Import Seed Data (Steps 15-19)

### Step 15: Prepare for Import

1. Locate the CSV files in the `07_seed_data/` directory of this kit:
   - `Species.csv` (7 rows)
   - `Waters.csv` (7 rows)
   - `Stations.csv` (15 rows)
   - `Surveys.csv` (15 rows)
2. If any of the following CSV files are present, import them too: `FishRecords.csv`, `ValidationIssues.csv`, `TrendData.csv`, `AppUsers.csv`. If they do not exist yet in the kit, you will create the data manually in a later step or generate them from `world.ts`.

### Step 16: Import Reference Tables (No Dependencies)

Import these tables first because other tables reference them via lookups.

#### Import Species.csv into cpw_Species

1. Navigate to [make.powerapps.com](https://make.powerapps.com) > select your environment.
2. Click **Tables** in the left navigation.
3. Click on the **Species** table to open it.
4. Click **Import** > **Import data** in the command bar.
5. In the Power Query dialog, click **Upload file** and select `07_seed_data/Species.csv`.
6. Review the preview. Map columns as follows:

   | CSV Column | Dataverse Column |
   |---|---|
   | Code | Code (primary name) |
   | CommonName | Common Name |
   | ScientificName | Scientific Name |
   | LengthMinMm | Length Min (mm) |
   | LengthMaxMm | Length Max (mm) |
   | WeightMinG | Weight Min (g) |
   | WeightMaxG | Weight Max (g) |

7. Click **Next** > **Publish**.
8. **Verify:** Open the Species table and confirm 7 rows (BNT, RBT, CTT, MWF, WHS, CRD, LMB).

#### Import Waters.csv into cpw_Water

1. Open the **Waters** table.
2. Click **Import** > **Import data** > upload `07_seed_data/Waters.csv`.
3. Map columns:

   | CSV Column | Dataverse Column |
   |---|---|
   | Name | Name (primary name) |
   | WaterId | Water ID |
   | Region | Region (choice -- map to label text) |
   | HUC12 | HUC12 |
   | YearsActiveStart | Years Active Start |
   | YearsActiveEnd | Years Active End |
   | PrimarySpecies | Primary Species |

4. For the **Region** column: Ensure the import maps the text values ("Northeast", "Comparison") to the corresponding choice labels. If the import wizard shows a choice mapping step, select "Map by label".
5. Click **Publish**.
6. **Verify:** Open the Waters table and confirm 7 rows. Spot-check that "South Platte Basin" has Region = "Northeast" and "Blue River" has Region = "Comparison".

### Step 17: Import Dependent Tables (Level 1)

#### Import Stations.csv into cpw_Station

1. Open the **Stations** table.
2. Click **Import** > **Import data** > upload `07_seed_data/Stations.csv`.
3. Map columns:

   | CSV Column | Dataverse Column |
   |---|---|
   | Name | Name (primary name) |
   | StationId | Station ID |
   | WaterId | Water (lookup) |
   | RiverMile | River Mile |
   | Latitude | Latitude |
   | Longitude | Longitude |

4. For the **WaterId** lookup column: The import wizard should offer to match the text value (e.g., "south-platte") against the Water ID column on the cpw_Water table. If automatic resolution fails, you may need to use the Dataverse Excel import method instead:
   - Open the Stations table > click **Edit data in Excel**.
   - In Excel Online, paste the CSV data.
   - For the Water column, type the Water display name (e.g., "South Platte Basin") -- Dataverse resolves lookups by primary name.
   - Click **Publish** in the Excel add-in.
5. **Verify:** Open the Stations table and confirm 15 rows. Click on "Deckers" and confirm its Water lookup shows "South Platte Basin".

### Step 18: Import Surveys

#### Import Surveys.csv into cpw_Survey

1. Open the **Surveys** table.
2. Click **Import** > **Import data** > upload `07_seed_data/Surveys.csv`.
3. Map columns:

   | CSV Column | Dataverse Column |
   |---|---|
   | SurveyId | Survey ID (primary name) |
   | WaterId | Water (lookup) |
   | StationId | Station (lookup) |
   | Date | Survey Date |
   | Protocol | Protocol (choice -- map by label) |
   | Uploader | Uploader |
   | Status | Status (choice -- map by label) |
   | FishCount | Fish Count |
   | SpeciesDetected | Species Detected |

4. Lookup columns (Water, Station) need to resolve against the parent table. If the CSV import cannot auto-resolve lookups, use the Excel import method described in Step 17.
5. For choice columns (Protocol, Status): Ensure labels map correctly. "Two-Pass Removal" should map to the Protocol choice, and "Pending Approval" should map to the Survey Status choice.
6. **Verify:** Open the Surveys table and confirm 15 rows. Key checks:
   - `SVY-2026-NE-0100` should show Status = "Pending Approval", Water = "South Platte Basin", Station = "Chatfield Reach".
   - `SVY-2025-BT-0009` should show Status = "Flagged Suspect".
   - `SVY-2025-SP-0005` should show Status = "Approved".

### Step 19: Import Remaining Data (If CSV Files Available)

If the following CSV files exist in `07_seed_data/`, import them in this order:

1. **AppUsers.csv** into cpw_AppUser (3 rows -- one per demo role)
2. **FishRecords.csv** into cpw_FishRecord (53 rows -- fish-level data for 3 hero surveys)
3. **ValidationIssues.csv** into cpw_ValidationIssue (12 rows -- issues for 5 surveys)
4. **TrendData.csv** into cpw_TrendData (50+ rows -- multi-year CPUE/biomass/population data)

If these files do not exist yet, you can create the records manually. For the demo to function at a basic level, the FishRecords and ValidationIssues for the three "hero" surveys are the most important. Refer to `src/app/data/world.ts` in the React source code for the exact values.

**Minimum manual data entry for demo functionality:**

For **cpw_AppUser** (create 3 rows manually):

| Display Name | Email | Role | Region |
|---|---|---|---|
| Demo Data Entry | dataentry@cpwdemo.onmicrosoft.com | Data Entry Assistant | Northeast |
| Demo Area Bio | areabio@cpwdemo.onmicrosoft.com | Area Biologist | Northeast |
| Demo Senior Bio | seniorbio@cpwdemo.onmicrosoft.com | Senior Biologist | Statewide |

> **Note:** Replace the email addresses with actual accounts in your tenant. For the demo, you can use your own email address and change the Role value to switch personas.

**Post-Import Verification Checklist:**

- [ ] Species table: 7 rows
- [ ] Waters table: 7 rows (5 Northeast, 2 Comparison)
- [ ] Stations table: 15 rows
- [ ] Surveys table: 15 rows
- [ ] Survey `SVY-2026-NE-0100` Water lookup resolves to "South Platte Basin"
- [ ] Survey `SVY-2026-NE-0102` Status shows "Pending Validation"
- [ ] Survey dates display correctly (hero surveys show February 2026)
- [ ] Choice columns show labels, not integer values

---

## Phase 4: Create Canvas App (Steps 20-25)

### Step 20: Create a Blank Canvas App

1. Navigate to [make.powerapps.com](https://make.powerapps.com) > select your environment.
2. In the left navigation, click **Apps**.
3. Click **+ New app** > **Canvas**.
4. In the dialog:
   - **App name:** `ADAMAS - CPW Fisheries Demo`
   - **Format:** Tablet
5. Click **Create**. The Power Apps Studio opens.
6. Immediately set the app dimensions:
   - Click **Settings** (gear icon in the top bar, or File > Settings).
   - Under **Display**, set:
     - **Width:** 1366
     - **Height:** 768
     - **Scale to fit:** On
     - **Lock aspect ratio:** On
   - Click the back arrow to return to the canvas.

### Step 21: Add Data Sources

Connect all Dataverse tables so they are available in formulas.

1. In the left panel, click the **Data** icon (cylinder icon).
2. Click **+ Add data**.
3. Search for and add each of these tables (type the name in the search box, then click the table):
   - `Species` (cpw_Species)
   - `Waters` (cpw_Water)
   - `Stations` (cpw_Station)
   - `App Users` (cpw_AppUser)
   - `Surveys` (cpw_Survey)
   - `Fish Records` (cpw_FishRecord)
   - `Validation Issues` (cpw_ValidationIssue)
   - `Trend Data` (cpw_TrendData)
   - `Status Histories` (cpw_StatusHistory)
4. Optionally, also add **Office365Users** connector if you want to resolve the current user's display name via `Office365Users.MyProfile().DisplayName`.
5. Verify all 9 tables appear in the Data panel.

### Step 22: Set App.OnStart Formula

The App.OnStart formula runs once when the app loads. It initializes global variables for the current user's role, the theme colors, and cached reference data.

1. In the left panel, click the **Tree view** icon.
2. Click on **App** at the top of the tree.
3. In the property dropdown (top-left of the formula bar), select **OnStart**.
4. Paste the following formula:

```
// ── Resolve current user's role ──────────────────────────────────
Set(
    varCurrentUser,
    LookUp(
        'App Users',
        cpw_Email = User().Email
    )
);

// Default to Area Biologist if user not found in AppUser table
Set(
    varCurrentRole,
    If(
        IsBlank(varCurrentUser),
        "Area Biologist",
        varCurrentUser.cpw_Role
    )
);

// ── Theme constants ──────────────────────────────────────────────
Set(varColorPrimary, ColorValue("#1B365D"));
Set(varColorSecondary, ColorValue("#2F6F73"));
Set(varColorBackground, ColorValue("#F5F6F4"));
Set(varColorSuccess, ColorValue("#34C759"));
Set(varColorWarning, ColorValue("#FF9500"));
Set(varColorDestructive, ColorValue("#FF3B30"));
Set(varColorMuted, ColorValue("#64748B"));
Set(varColorBorder, ColorValue("#E2E8F0"));

// ── Navigation context ──────────────────────────────────────────
Set(varSelectedWaterId, Blank());
Set(varSelectedSurveyId, Blank());

// ── Unit preference ─────────────────────────────────────────────
Set(varUnit, "mm");
```

5. Click the **Run OnStart** button (play icon next to the formula bar) to execute it once and verify no errors.

### Step 23: Configure Theme and Font

1. Click on **App** in the tree view.
2. In the property dropdown, select **Theme**. Set the app theme to a neutral/light theme.
3. Power Apps uses Segoe UI by default -- no font change is needed.
4. Set the app **Fill** property:
   ```
   varColorBackground
   ```
   This sets the default background color for the app.

### Step 24: Create a Role Switcher (Demo Only)

For demonstration purposes, add a role-switching mechanism so the presenter can change roles without logging in as different users.

1. On any screen (we will add it to the header later), you will place a **Dropdown** control named `drpRoleSwitcher`.
2. Set its **Items** property to:
   ```
   ["Area Biologist", "Data Entry Assistant", "Senior Biologist"]
   ```
3. Set its **Default** property to:
   ```
   If(
       varCurrentRole = cpw_UserRole.'Data Entry Assistant', "Data Entry Assistant",
       varCurrentRole = cpw_UserRole.'Senior Biologist', "Senior Biologist",
       "Area Biologist"
   )
   ```
4. Set its **OnChange** property to:
   ```
   Set(
       varCurrentRole,
       Switch(
           drpRoleSwitcher.Selected.Value,
           "Data Entry Assistant", cpw_UserRole.'Data Entry Assistant',
           "Senior Biologist", cpw_UserRole.'Senior Biologist',
           cpw_UserRole.'Area Biologist'
       )
   )
   ```

> **Note:** In a production app, you would remove this dropdown and resolve the role from the cpw_AppUser table using `User().Email`. The role switcher is for demo purposes only.

### Step 25: Create Global Navigation Component

The React demo uses a collapsible sidebar (64px collapsed, 288px expanded on hover) with a navy background (#1B365D). In Power Apps Canvas, you will simulate this with a component or a set of controls placed on every screen.

**Option A: Simple Left-Side Navigation (Recommended for Demo)**

On each screen, add a vertical container or group of buttons along the left edge:

1. Add a **Rectangle** control named `rectSidebar`:
   - **X:** 0, **Y:** 0, **Width:** 64, **Height:** 768
   - **Fill:** `varColorPrimary`

2. Add icon buttons inside the sidebar for each nav item. For each button:
   - **Width:** 64, **Height:** 48
   - **Icon:** Use the appropriate icon (Home, Water, Upload, CheckSquare, Search, BarChart)
   - **Color:** `White`
   - **OnSelect:** `Navigate(scrTargetScreen, ScreenTransition.None)`

3. Navigation items and their visibility by role:

   | Nav Item | Screen | Icon | Visible To |
   |---|---|---|---|
   | Dashboard | scrDashboard | Home | All roles |
   | Water Profile | scrWaterSelect | Waves/Water | All roles |
   | Upload Survey | scrSurveyUpload | Upload | All roles |
   | Validation | scrValidation | CheckSquare | All roles |
   | Query Builder | scrQueryBuilder | Search | Area Biologist, Senior Biologist |
   | Insights | scrInsights | BarChart | Area Biologist, Senior Biologist |
   | Activity Feed | scrActivityFeed | List | All roles |

4. Set the **Visible** property on Query Builder and Insights nav buttons to:
   ```
   varCurrentRole <> cpw_UserRole.'Data Entry Assistant'
   ```

**Option B: Component Library (Advanced)**

Create a Canvas Component named `cmpSidebar` with the navigation items, then add it to each screen. This approach avoids duplicating controls but requires more setup. Use Option A for the initial build, and refactor to a component later if desired.

---

## Phase 5: Build Screens (Steps 26-45)

### Screen Build Order and Rationale

Build screens in this order because later screens depend on navigation context set by earlier screens:

1. **scrDashboard** -- Landing page, sets navigation targets
2. **scrWaterSelect** -- Water picker, sets `varSelectedWaterId`
3. **scrWaterProfile** -- Reads `varSelectedWaterId`
4. **scrSurveyUpload** -- Standalone upload simulation
5. **scrValidation** -- Reads `varSelectedSurveyId`, core workflow screen
6. **scrActivityFeed** -- Filterable survey list
7. **scrQueryBuilder** -- Query interface
8. **scrInsights** -- Charts and analytics

### General Screen Pattern

Every screen follows this structure:

```
+--+--------------------------------------------------------+
|  | Header (bg white, title, subtitle, RoleSwitcher)        |
|S |                                                         |
|I | Regional Scope Strip (optional, role-dependent)         |
|D |                                                         |
|E | Main Content Area (bg #F5F6F4)                          |
|B |   Cards, Tables, Charts arranged in grids               |
|A |                                                         |
|R |                                                         |
+--+---------------------------------------------------------+
```

- **Sidebar:** 64px wide, navy (#1B365D), always present on the left
- **Header:** Starts at X=64, white background, 60px tall, contains title + role switcher
- **Content:** Starts at X=64, Y varies, fills remaining space

---

### Step 26: Create scrDashboard

1. The default Screen1 already exists. Rename it to `scrDashboard`:
   - In the tree view, right-click **Screen1** > **Rename** > type `scrDashboard`.

2. **Set OnVisible:**
   ```
   // No specific initialization needed -- dashboard reads directly from Dataverse
   ```

3. **Add sidebar controls** (see Step 25). Place the sidebar rectangle and nav buttons. Copy these to every subsequent screen, or use a component.

4. **Add Header:**
   - Add a **Rectangle** named `rectHeader`:
     - X: 64, Y: 0, Width: 1302, Height: 60, Fill: White
   - Add a **Label** named `lblTitle`:
     - X: 84, Y: 10, Width: 400, Height: 30
     - Text:
       ```
       Switch(
           varCurrentRole,
           cpw_UserRole.'Data Entry Assistant', "Assigned Waters -- Data Entry View",
           cpw_UserRole.'Senior Biologist', "Statewide Water Intelligence Overview",
           "Waters Overview"
       )
       ```
     - Font size: 18, Font weight: Semibold, Color: `varColorPrimary`
   - Add a **Label** named `lblSubtitle`:
     - X: 84, Y: 38, Width: 400, Height: 20
     - Text:
       ```
       Switch(
           varCurrentRole,
           cpw_UserRole.'Data Entry Assistant', "Upload and manage survey data for your supervising biologist",
           cpw_UserRole.'Senior Biologist', "Strategic cross-water analysis and federal reporting dashboard",
           "Statewide Operational Status"
       )
       ```
     - Font size: 11, Color: `varColorMuted`
   - Add the Role Switcher dropdown (from Step 24) at X: 1100, Y: 15.

5. **Add Stats Cards (Area Biologist view):**

   Create 4 cards in a horizontal row (X: 84, Y: 80, each card 290px wide, 100px tall, 20px gap):

   | Card | Title | Value Formula |
   |---|---|---|
   | Waters Active | "Current Season" | `CountRows(Filter(Waters, cpw_Region = cpw_Region.Northeast))` |
   | Pending Approval | "Surveys Requiring Review" | `CountRows(Filter(Surveys, cpw_Status = cpw_SurveyStatus.'Pending Validation' \|\| cpw_Status = cpw_SurveyStatus.'Pending Approval'))` |
   | Flagged Surveys | "Data Quality Review" | `CountRows(Filter(Surveys, cpw_Status = cpw_SurveyStatus.'Flagged Suspect'))` |
   | Federal Reporting | "Annual Compliance" | `"87%"` (static for demo) |

   Set each card group's **Visible** property to:
   ```
   varCurrentRole = cpw_UserRole.'Area Biologist'
   ```

6. **Add Review Queue Gallery:**

   - Add a **Data table** or **Gallery** control named `galReviewQueue`:
     - X: 84, Y: 200, Width: 830, Height: 400
     - **Items:**
       ```
       SortByColumns(
           Filter(
               Surveys,
               cpw_Status = cpw_SurveyStatus.'Pending Validation'
               || cpw_Status = cpw_SurveyStatus.'Returned for Correction'
               || cpw_Status = cpw_SurveyStatus.'Pending Approval'
               || cpw_Status = cpw_SurveyStatus.'Flagged Suspect'
           ),
           "cpw_SurveyDate",
           SortOrder.Descending
       )
       ```
   - Inside the gallery template, display: Survey ID, Water Name (via lookup), Protocol, Date, Status badge, and a "Review" button.
   - Set the "Review" button's **OnSelect** to:
     ```
     Set(varSelectedSurveyId, ThisItem.cpw_SurveyId);
     Set(varSelectedWaterId, ThisItem.cpw_Water.cpw_WaterId);
     Navigate(scrValidation, ScreenTransition.None)
     ```
   - Set the Review Queue section's **Visible** to:
     ```
     varCurrentRole = cpw_UserRole.'Area Biologist'
     ```

7. **Add Data Entry Dashboard content:**

   Create a separate set of controls (Quick Action upload button, Assigned Waters table, Recent Submissions table) that are visible only when `varCurrentRole = cpw_UserRole.'Data Entry Assistant'`. Reference the layout from `DataEntryDashboard.tsx` in the React source.

8. **Add Senior Biologist Dashboard content:**

   Create controls for the statewide overview (Regional Performance chart, Cross-Water Trends list, Federal Reporting compliance) visible only when `varCurrentRole = cpw_UserRole.'Senior Biologist'`. Reference `SeniorBiologistDashboard.tsx`.

> **Tip:** The simplest approach for role-dependent dashboards is to create three container groups (`grpAreaBio`, `grpDataEntry`, `grpSeniorBio`) and toggle their Visible property based on `varCurrentRole`.

---

### Step 27: Create scrWaterSelect

1. Click **+ New screen** > **Blank** in the top menu. Rename it to `scrWaterSelect`.

2. **Set OnVisible:** (no special logic needed)

3. **Add sidebar + header** (copy from scrDashboard or use component).
   - Title: `"Select Water Body"`
   - Subtitle: `"Choose a water to view survey history and status"`

4. **Add Water List Gallery:**
   - Add a **Gallery** control named `galWaters`:
     - X: 84, Y: 120, Width: 1200, Height: 600
     - Layout: Vertical, with each item showing water name, species, survey count, station count, and a chevron.
     - **Items:**
       ```
       Filter(Waters, cpw_Region = cpw_Region.Northeast)
       ```
   - Inside the gallery template:
     - **Water Name label:** `ThisItem.cpw_Name` (font size 14, bold)
     - **Species label:** `ThisItem.cpw_PrimarySpecies` (font size 12, gray)
     - **Survey count label:**
       ```
       CountRows(Filter(Surveys, cpw_Water.cpw_WaterId = ThisItem.cpw_WaterId)) & " surveys"
       ```
     - **Station count label:**
       ```
       CountRows(Filter(Stations, cpw_Water.cpw_WaterId = ThisItem.cpw_WaterId)) & " stations"
       ```
   - **OnSelect** for each gallery item:
     ```
     Set(varSelectedWaterId, ThisItem.cpw_WaterId);
     Navigate(scrWaterProfile, ScreenTransition.None)
     ```

---

### Step 28: Create scrWaterProfile

1. Click **+ New screen** > **Blank**. Rename to `scrWaterProfile`.

2. **Set OnVisible:**
   ```
   // Look up the selected water's details
   Set(
       varCurrentWater,
       LookUp(Waters, cpw_WaterId = varSelectedWaterId)
   );
   ```

3. **Add sidebar + header.**
   - Title: `"Water Profile"`
   - Subtitle: `"Comprehensive water body intelligence and survey history"`

4. **Add Water Banner:**
   A horizontal strip showing the water name, region, HUC12, station count, and survey count.
   - Water Name: `varCurrentWater.cpw_Name`
   - Region: `Text(varCurrentWater.cpw_Region)`
   - HUC12: `varCurrentWater.cpw_HUC12`
   - Station count: `CountRows(Filter(Stations, cpw_Water.cpw_WaterId = varSelectedWaterId))`
   - Survey count: `CountRows(Filter(Surveys, cpw_Water.cpw_WaterId = varSelectedWaterId))`

5. **Add Summary Cards (Area Biologist / Senior Biologist view):**
   Four cards showing Current Population (from TrendData), Primary Species, Last Survey date, and Water Status. Set **Visible** to `varCurrentRole <> cpw_UserRole.'Data Entry Assistant'`.

6. **Add CPUE Trend Chart:**
   - Add a **Line chart** control named `chtCPUE`:
     - **Items:**
       ```
       SortByColumns(
           Filter(
               'Trend Data',
               cpw_Water.cpw_WaterId = varSelectedWaterId,
               IsBlank(cpw_SpeciesCode)
           ),
           "cpw_Year",
           SortOrder.Ascending
       )
       ```
     - **Labels (X-axis):** `cpw_Year`
     - **Series 1:** `cpw_CPUE`

7. **Add Recent Surveys Gallery:**
   A gallery showing the most recent 4 surveys for this water. Each row links to scrValidation.
   - **Items:**
     ```
     FirstN(
         SortByColumns(
             Filter(Surveys, cpw_Water.cpw_WaterId = varSelectedWaterId),
             "cpw_SurveyDate",
             SortOrder.Descending
         ),
         4
     )
     ```

8. **Add Data Entry view** (Visible when `varCurrentRole = cpw_UserRole.'Data Entry Assistant'`):
   Show survey status counts (Uploaded, Pending Validation, Returned, Awaiting Approval) as 4 stat cards.

---

### Step 29: Create scrSurveyUpload

1. Click **+ New screen** > **Blank**. Rename to `scrSurveyUpload`.

2. **Set OnVisible:** (no special logic)

3. **Add sidebar + header.**
   - Title: `"Upload Survey Data"`
   - Subtitle: `"Import field data for validation and analysis"`

4. **Add Upload Simulation:**
   Since this is a demo, simulate the upload experience:
   - Add a large dashed-border rectangle with an upload icon and "Drag & Drop Survey File" text.
   - Add a **Button** named `btnSelectFile`:
     - Text: `"Select File"`
     - OnSelect:
       ```
       Set(varFileUploaded, true)
       ```
   - Below the button, add text: `"Supported: .xlsx, .csv, .xls (Max 50MB)"`

5. **Add Post-Upload Metadata Panel:**
   A group of controls that becomes visible when `varFileUploaded = true`, showing auto-detected metadata (water name, station, region, protocol, survey date) and a validation summary (valid records, warnings, errors).

6. **Add "Review & Correct Errors" button:**
   ```
   Navigate(scrValidation, ScreenTransition.None)
   ```

---

### Step 30-35: Create scrValidation

This is the most complex screen. It is the core of the workflow -- where users review fish data, see validation issues, and take status actions (approve, request correction, flag, publish).

#### Step 30: Create Screen and Set OnVisible

1. Click **+ New screen** > **Blank**. Rename to `scrValidation`.

2. **Set OnVisible:**
   ```
   // Load the survey to validate
   Set(
       varCurrentSurvey,
       If(
           !IsBlank(varSelectedSurveyId),
           LookUp(Surveys, cpw_SurveyId = varSelectedSurveyId),
           First(
               Filter(
                   Surveys,
                   cpw_Status = cpw_SurveyStatus.'Pending Validation'
                   || cpw_Status = cpw_SurveyStatus.'Pending Approval'
                   || cpw_Status = cpw_SurveyStatus.'Returned for Correction'
                   || cpw_Status = cpw_SurveyStatus.'Flagged Suspect'
               )
           )
       )
   );

   // Load related water
   Set(
       varCurrentWater,
       LookUp(Waters, cpw_WaterId = varCurrentSurvey.cpw_Water.cpw_WaterId)
   );

   // Count validation issues
   Set(
       varErrorCount,
       CountRows(
           Filter(
               'Validation Issues',
               cpw_Survey.cpw_SurveyId = varCurrentSurvey.cpw_SurveyId,
               cpw_Severity = cpw_IssueSeverity.'Error'
           )
       )
   );
   Set(
       varWarningCount,
       CountRows(
           Filter(
               'Validation Issues',
               cpw_Survey.cpw_SurveyId = varCurrentSurvey.cpw_SurveyId,
               cpw_Severity = cpw_IssueSeverity.'Warning'
           )
       )
   );
   ```

#### Step 31: Add Header and Action Buttons

1. **Add sidebar + header.**
   - Title: `"Survey Validation"`
   - Subtitle: `"Designed to prevent protocol errors and preserve scientific integrity"`

2. **Add unit toggle (mm / inches):**
   - Add a **Toggle** control named `tglUnit`:
     - X: 900, Y: 15
     - **FalseText:** `"mm"`
     - **TrueText:** `"inches"`
     - **OnChange:**
       ```
       Set(varUnit, If(tglUnit.Value, "inches", "mm"))
       ```

3. **Add role-specific action buttons in the header area:**

   **Data Entry Assistant buttons:**
   - Button `btnSubmitForReview`:
     - Text: `If(varCurrentSurvey.cpw_Status = cpw_SurveyStatus.'Returned for Correction', "Re-submit for Review", "Submit for Review")`
     - Visible: `varCurrentRole = cpw_UserRole.'Data Entry Assistant'`
     - DisplayMode:
       ```
       If(
           varCurrentSurvey.cpw_Status = cpw_SurveyStatus.'Draft'
           || varCurrentSurvey.cpw_Status = cpw_SurveyStatus.'Returned for Correction',
           DisplayMode.Edit,
           DisplayMode.Disabled
       )
       ```
     - OnSelect:
       ```
       // Write audit trail
       Patch(
           'Status Histories',
           Defaults('Status Histories'),
           {
               cpw_Survey: varCurrentSurvey,
               cpw_FromStatus: varCurrentSurvey.cpw_Status,
               cpw_ToStatus: cpw_SurveyStatus.'Pending Approval',
               cpw_ChangedOn: Now(),
               cpw_Reason: "Submitted for review by Data Entry Assistant"
           }
       );
       // Update survey status
       Patch(
           Surveys,
           varCurrentSurvey,
           { cpw_Status: cpw_SurveyStatus.'Pending Approval' }
       );
       Refresh(Surveys);
       Notify("Survey submitted for review.", NotificationType.Success);
       Navigate(scrDashboard, ScreenTransition.None)
       ```

   **Area Biologist buttons:**
   - Button `btnRequestCorrection`:
     - Text: `"Request Correction"`
     - Visible: `varCurrentRole = cpw_UserRole.'Area Biologist'`
     - DisplayMode:
       ```
       If(
           varCurrentSurvey.cpw_Status = cpw_SurveyStatus.'Pending Validation'
           || varCurrentSurvey.cpw_Status = cpw_SurveyStatus.'Pending Approval'
           || varCurrentSurvey.cpw_Status = cpw_SurveyStatus.'Flagged Suspect',
           DisplayMode.Edit,
           DisplayMode.Disabled
       )
       ```
     - OnSelect:
       ```
       Patch(
           'Status Histories',
           Defaults('Status Histories'),
           {
               cpw_Survey: varCurrentSurvey,
               cpw_FromStatus: varCurrentSurvey.cpw_Status,
               cpw_ToStatus: cpw_SurveyStatus.'Returned for Correction',
               cpw_ChangedOn: Now(),
               cpw_Reason: "Returned for correction by Area Biologist"
           }
       );
       Patch(
           Surveys,
           varCurrentSurvey,
           { cpw_Status: cpw_SurveyStatus.'Returned for Correction' }
       );
       Refresh(Surveys);
       Notify("Survey returned for correction.", NotificationType.Success);
       Navigate(scrDashboard, ScreenTransition.None)
       ```

   - Button `btnApproveSurvey`:
     - Text: `If(varCurrentSurvey.cpw_Status = cpw_SurveyStatus.'Approved', "Approved", "Approve Survey")`
     - Visible: `varCurrentRole = cpw_UserRole.'Area Biologist'`
     - DisplayMode:
       ```
       If(
           varCurrentSurvey.cpw_Status = cpw_SurveyStatus.'Pending Approval'
           && varErrorCount = 0,
           DisplayMode.Edit,
           DisplayMode.Disabled
       )
       ```
     - OnSelect:
       ```
       Patch(
           'Status Histories',
           Defaults('Status Histories'),
           {
               cpw_Survey: varCurrentSurvey,
               cpw_FromStatus: varCurrentSurvey.cpw_Status,
               cpw_ToStatus: cpw_SurveyStatus.'Approved',
               cpw_ChangedOn: Now(),
               cpw_Reason: "Approved by Area Biologist"
           }
       );
       Patch(
           Surveys,
           varCurrentSurvey,
           { cpw_Status: cpw_SurveyStatus.'Approved' }
       );
       Refresh(Surveys);
       Notify("Survey approved successfully.", NotificationType.Success);
       Navigate(scrDashboard, ScreenTransition.None)
       ```

   **Senior Biologist buttons:**
   - Button `btnFlagSuspect`:
     - Text: `"Flag as Suspect"`
     - Visible: `varCurrentRole = cpw_UserRole.'Senior Biologist'`
     - DisplayMode:
       ```
       If(
           varCurrentSurvey.cpw_Status = cpw_SurveyStatus.'Pending Approval'
           || varCurrentSurvey.cpw_Status = cpw_SurveyStatus.'Approved',
           DisplayMode.Edit,
           DisplayMode.Disabled
       )
       ```
     - OnSelect: (same pattern -- Patch StatusHistory, Patch Survey status to Flagged Suspect, Refresh, Notify, Navigate)

   - Button `btnPublish`:
     - Text: `If(varCurrentSurvey.cpw_Status = cpw_SurveyStatus.'Published', "Published", "Publish to Analysis")`
     - Visible: `varCurrentRole = cpw_UserRole.'Senior Biologist'`
     - DisplayMode:
       ```
       If(
           varCurrentSurvey.cpw_Status = cpw_SurveyStatus.'Approved'
           && varErrorCount = 0,
           DisplayMode.Edit,
           DisplayMode.Disabled
       )
       ```
     - OnSelect: (Patch to Published status, same pattern)

> **Full button visibility matrix:** See `02_workflow_and_status_model.md`, Section 11, for the complete role-status-button matrix. Implement all combinations listed there.

#### Step 32: Add Validation Summary Cards

Add 4 cards in a row below the header (Y: ~160):

| Card | Label | Value |
|---|---|---|
| Valid Rows | "VALID ROWS" | `CountRows(Filter('Fish Records', cpw_Survey.cpw_SurveyId = varCurrentSurvey.cpw_SurveyId, cpw_RecordStatus = cpw_RecordStatus.'Valid'))` |
| Warnings | "WARNINGS" | `varWarningCount` |
| Errors | "ERRORS" | `varErrorCount` |
| Total Records | "TOTAL RECORDS" | `varCurrentSurvey.cpw_FishCount` |

#### Step 33: Add Fish Data Grid

- Add a **Data table** or **Gallery** named `galFishData`:
  - X: 84, Y: 280, Width: 830, Height: 400
  - **Items:**
    ```
    SortByColumns(
        Filter(
            'Fish Records',
            cpw_Survey.cpw_SurveyId = varCurrentSurvey.cpw_SurveyId
        ),
        "cpw_Row",
        SortOrder.Ascending
    )
    ```
  - Columns to display: Row, Pass, Species, Length (with unit conversion), Weight, Status

- For the Length column, use this formula to handle mm/inches conversion:
  ```
  If(
      varUnit = "inches",
      Text(ThisItem.cpw_LengthMm / 25.4, "#.#"),
      Text(ThisItem.cpw_LengthMm)
  )
  ```

- For the Status column, color the background:
  ```
  Switch(
      ThisItem.cpw_RecordStatus,
      cpw_RecordStatus.'Error', RGBA(255, 59, 48, 0.05),
      cpw_RecordStatus.'Warning', RGBA(255, 149, 0, 0.05),
      Transparent
  )
  ```

#### Step 34: Add Validation Issues Panel

- Add a **Gallery** named `galIssues` on the right side:
  - X: 930, Y: 280, Width: 370, Height: 400
  - **Items:**
    ```
    Filter(
        'Validation Issues',
        cpw_Survey.cpw_SurveyId = varCurrentSurvey.cpw_SurveyId
    )
    ```
  - Each item shows: severity icon (red for Error, orange for Warning), row number, message, and suggestion.

#### Step 35: Add Survey Context Banner

Between the header and the data grid, add a strip showing:
- Station: `varCurrentSurvey.cpw_Station.cpw_StationId`
- Survey Date: `Text(varCurrentSurvey.cpw_SurveyDate, "mmm d, yyyy")`
- Protocol: `Text(varCurrentSurvey.cpw_Protocol)`
- Survey ID: `varCurrentSurvey.cpw_SurveyId`
- Uploader: `varCurrentSurvey.cpw_Uploader`

---

### Step 36-37: Create scrActivityFeed

#### Step 36: Create Screen

1. Click **+ New screen** > **Blank**. Rename to `scrActivityFeed`.

2. **Set OnVisible:** (no special initialization needed)

3. **Add sidebar + header.**
   - Title: `"All Survey Activity -- Northeast Region"`

#### Step 37: Add Filters and Grouped Survey List

1. **Add Filter Controls:**
   - **Water filter dropdown** (`drpWaterFilter`):
     - Items: `["All Waters"] & ForAll(Filter(Waters, cpw_Region = cpw_Region.Northeast), cpw_Name)`
     - Or use a dedicated collection approach.
   - **Status filter dropdown** (`drpStatusFilter`):
     - Items: `["All Statuses", "Pending / In Review", "Approved / Published", "Flagged Suspect", "Draft"]`
   - **Date From** (`dtpDateFrom`): Date picker control.

2. **Add Survey Gallery** (`galActivityFeed`):
   - **Items:**
     ```
     SortByColumns(
         Filter(
             Surveys,
             // Water filter
             (drpWaterFilter.Selected.Value = "All Waters"
               || cpw_Water.cpw_Name = drpWaterFilter.Selected.Value)
             &&
             // Status filter
             Switch(
                 drpStatusFilter.Selected.Value,
                 "Pending / In Review",
                     cpw_Status = cpw_SurveyStatus.'Pending Validation'
                     || cpw_Status = cpw_SurveyStatus.'Pending Approval'
                     || cpw_Status = cpw_SurveyStatus.'Returned for Correction',
                 "Approved / Published",
                     cpw_Status = cpw_SurveyStatus.'Approved'
                     || cpw_Status = cpw_SurveyStatus.'Published',
                 "Flagged Suspect",
                     cpw_Status = cpw_SurveyStatus.'Flagged Suspect',
                 "Draft",
                     cpw_Status = cpw_SurveyStatus.'Draft',
                 true
             )
             &&
             // Date filter
             (IsBlank(dtpDateFrom.SelectedDate) || cpw_SurveyDate >= dtpDateFrom.SelectedDate)
         ),
         "cpw_SurveyDate",
         SortOrder.Descending
     )
     ```

3. Each gallery item shows: Survey ID, Station, Protocol, Date, Status badge, and a Review/View/Continue button that navigates to scrValidation.

4. **Group by Water (optional enhancement):** To replicate the React demo's water-grouped layout, you can use a nested gallery pattern or simply sort by water name then date.

---

### Step 38-39: Create scrQueryBuilder

#### Step 38: Create Screen

1. Click **+ New screen** > **Blank**. Rename to `scrQueryBuilder`.

2. **Add sidebar + header.**
   - Title: `"Cross-Survey Analysis"`

#### Step 39: Add Query Interface

The QueryBuilder in the React demo has a left filter panel, center condition builder, and right live-results preview. Simplify for the Canvas App:

1. **Left panel:** Dropdowns for Water, Species, Region, Date Range, Protocol, and toggle switches for Exclude Young of Year and Measurement Units.

2. **Center panel:** A gallery of condition rows, each with Field, Operator, and Value dropdowns. Add/remove conditions with buttons.

3. **Right panel:** Live result counts:
   ```
   Set(
       varMatchingSurveyCount,
       CountRows(
           Filter(
               Surveys,
               // Apply condition logic here
               true
           )
       )
   )
   ```

4. **"Run Analysis" button:**
   ```
   Navigate(scrInsights, ScreenTransition.None)
   ```

---

### Step 40-42: Create scrInsights

#### Step 40: Create Screen

1. Click **+ New screen** > **Blank**. Rename to `scrInsights`.

2. **Set OnVisible:**
   ```
   If(
       IsBlank(varSelectedWaterId),
       Set(varSelectedWaterId, "south-platte")
   );
   Set(
       varCurrentWater,
       LookUp(Waters, cpw_WaterId = varSelectedWaterId)
   );
   ```

#### Step 41: Add Summary Metric Cards

Four cards: Population Estimate, CPUE Index, Biomass, Relative Weight Average.

- Population Estimate:
  ```
  LookUp(
      SortByColumns(
          Filter(
              'Trend Data',
              cpw_Water.cpw_WaterId = varSelectedWaterId,
              IsBlank(cpw_SpeciesCode)
          ),
          "cpw_Year",
          SortOrder.Descending
      )
  ).cpw_PopEstimate
  ```

#### Step 42: Add Trend Chart and Length-Frequency Histogram

1. **Multi-Year Trend Line Chart:**
   - Add a **Line chart** control.
   - Items: Trend Data filtered by selected water and blank species code, sorted by year ascending.
   - Add a metric selector dropdown (Population, CPUE, Biomass).

2. **Length-Frequency Bar Chart:**
   - For the demo, this can use static data or aggregate FishRecord lengths into bins using `GroupBy` and `CountRows`.

3. **Statistical Summary panel** (right side):
   - Mean Length, Std Deviation, Min, Max, Sample Size -- these can be static values for the demo or calculated from FishRecords if data is loaded.

4. **Compare Waters mode (Senior Biologist only):**
   - Add a view toggle (Single Water / Compare Waters) visible only when `varCurrentRole = cpw_UserRole.'Senior Biologist'`.
   - In compare mode, show multi-line chart with 3 water bodies (South Platte, Blue River, Colorado River).

---

### Steps 43-45: Final Screen Adjustments

#### Step 43: Add Breadcrumbs Where Needed

On scrWaterProfile and scrValidation, add breadcrumb labels:
- `Waters > [Water Name] > Survey Validation`
- Use **Label** controls with **OnSelect** for navigation:
  ```
  Navigate(scrWaterSelect, ScreenTransition.None)
  ```

#### Step 44: Add Status Badge Formatting

Create a helper function pattern for status badges. For every status display, use this Fill color pattern:

```
Switch(
    ThisItem.cpw_Status,
    cpw_SurveyStatus.'Approved', RGBA(52, 199, 89, 0.1),
    cpw_SurveyStatus.'Published', RGBA(48, 176, 80, 0.1),
    cpw_SurveyStatus.'Flagged Suspect', RGBA(255, 59, 48, 0.1),
    cpw_SurveyStatus.'Returned for Correction', RGBA(255, 149, 0, 0.1),
    RGBA(0, 122, 255, 0.1)
)
```

And this Color (text) pattern:

```
Switch(
    ThisItem.cpw_Status,
    cpw_SurveyStatus.'Approved', ColorValue("#34C759"),
    cpw_SurveyStatus.'Published', ColorValue("#30B050"),
    cpw_SurveyStatus.'Flagged Suspect', ColorValue("#FF3B30"),
    cpw_SurveyStatus.'Returned for Correction', ColorValue("#FF9500"),
    ColorValue("#007AFF")
)
```

#### Step 45: Copy Sidebar to All Screens

If you are not using a component, you need to copy the sidebar controls (rectSidebar + nav buttons) to every screen:

1. On scrDashboard, select all sidebar controls (hold Ctrl and click each one, or select the group).
2. Press Ctrl+C to copy.
3. Navigate to scrWaterSelect, press Ctrl+V to paste.
4. Repeat for all remaining screens.

Alternatively, create a **Canvas Component** named `cmpSidebar` containing all the sidebar controls, then add a single instance of that component to each screen.

---

## Phase 6: Create Power Automate Flows (Steps 46-48)

### Step 46: Create "Reset Demo Data" Flow

This flow resets all survey statuses back to their seed values so the demo can be run repeatedly.

1. Navigate to [make.powerautomate.com](https://make.powerautomate.com) (or click **Flows** in the left nav of make.powerapps.com).
2. Click **+ New flow** > **Instant cloud flow**.
3. Name the flow: `Reset ADAMAS Demo Data`
4. Under "Choose how to trigger this flow", select **PowerApps (V2)**.
5. Click **Create**.

6. Add the following actions in sequence:

   **Action 1: List Surveys**
   - Add action: **Dataverse** > **List rows**
   - Table name: `Surveys`
   - No filter (get all rows)

   **Action 2: Apply to Each**
   - Add action: **Control** > **Apply to each**
   - Select output: `value` from the List rows step

   **Inside the Apply to Each, add a Switch action or parallel branches to set each survey's status:**

   **Action 3: Update Row (inside Apply to Each)**
   - Add action: **Dataverse** > **Update a row**
   - Table name: `Surveys`
   - Row ID: `Survey ID` from the current item
   - Status: Use a **Switch** or **Condition** based on the Survey ID to set the correct seed status:

   ```
   SVY-2026-NE-0100 -> Pending Approval
   SVY-2026-NE-0101 -> Pending Approval
   SVY-2026-NE-0102 -> Pending Validation
   SVY-2025-SP-0007 -> Pending Approval
   SVY-2025-SP-0006 -> Returned for Correction
   SVY-2025-SP-0005 -> Approved
   SVY-2025-PDR-0012 -> Pending Validation
   SVY-2025-PDR-0011 -> Approved
   SVY-2025-SV-0004 -> Pending Approval
   SVY-2025-SV-0003 -> Approved
   SVY-2025-BT-0009 -> Flagged Suspect
   SVY-2025-BT-0008 -> Approved
   SVY-2025-BL-0002 -> Pending Approval
   SVY-2025-BR-0015 -> Approved
   SVY-2025-CR-0019 -> Approved
   ```

   > **Simpler alternative:** Instead of a Switch with 15 branches, create a small Dataverse table called `cpw_SeedStatus` with two columns (SurveyId, OriginalStatus). Import the seed status values once. Then in the flow, do a lookup against this table for each survey to get the original status.

   **Action 4 (optional): Delete Status History**
   - After resetting statuses, delete all rows from the `Status Histories` table to clear the audit trail:
   - Add: **Dataverse** > **List rows** on `Status Histories`
   - Add: **Apply to each** > **Dataverse** > **Delete a row** for each Status History row.

7. **Save** the flow.

### Step 47: Connect Flow to Canvas App

1. Return to the Canvas App in Power Apps Studio.
2. On the scrDashboard screen (or wherever you want the reset button), add a **Button** named `btnResetDemo`:
   - Text: `"Reset Demo Data"`
   - X: 1100, Y: 680, Width: 200, Height: 40
   - Fill: `varColorDestructive`
   - Color: `White`
3. Select the button and go to the **Action** tab in the ribbon.
4. Click **Power Automate** > select your `Reset ADAMAS Demo Data` flow.
5. Power Apps inserts a `Run()` call. Set the **OnSelect** to:
   ```
   'ResetADAMASDemoData'.Run();
   Refresh(Surveys);
   Refresh('Status Histories');
   Notify("Demo data has been reset to seed values.", NotificationType.Success);
   ```

### Step 48: Test the Reset Flow

1. In Power Apps Studio, hold **Alt** and click the "Reset Demo Data" button.
2. Wait for the flow to complete (10-30 seconds depending on the number of rows).
3. Verify in the Review Queue that surveys have returned to their original statuses:
   - `SVY-2026-NE-0100` should show "Pending Approval"
   - `SVY-2025-BT-0009` should show "Flagged Suspect"
   - `SVY-2025-SP-0005` should show "Approved" (and NOT appear in the Review Queue)

---

## Phase 7: Testing Checklist (Steps 49-55)

Work through each test scenario. If a test fails, fix the issue before proceeding.

### Step 49: Basic App Launch

- [ ] **49.1** App launches without errors and shows the Dashboard for the default role (Area Biologist).
- [ ] **49.2** All sidebar navigation items are visible (Dashboard, Water Profile, Upload, Validation, Query Builder, Insights, Activity Feed).
- [ ] **49.3** The header shows "Waters Overview" and "Statewide Operational Status".

### Step 50: Role Switching

- [ ] **50.1** Switch to "Data Entry Assistant" using the role switcher dropdown.
- [ ] **50.2** Dashboard title changes to "Assigned Waters -- Data Entry View".
- [ ] **50.3** Query Builder and Insights nav items disappear from the sidebar.
- [ ] **50.4** Switch to "Senior Biologist".
- [ ] **50.5** Dashboard title changes to "Statewide Water Intelligence Overview".
- [ ] **50.6** Query Builder and Insights nav items are visible again.
- [ ] **50.7** Switch back to "Area Biologist" and verify the Review Queue appears.

### Step 51: Review Queue and Survey Approval

- [ ] **51.1** Review Queue shows surveys with statuses: Pending Validation, Returned for Correction, Pending Approval, and Flagged Suspect.
- [ ] **51.2** Review Queue does NOT show surveys with statuses: Draft, Approved, Published.
- [ ] **51.3** Click "Review" on survey `SVY-2026-NE-0100` -- Validation screen opens with correct survey data.
- [ ] **51.4** Validation screen shows the correct Water name, Station, Protocol, and Date.
- [ ] **51.5** Fish data grid loads and displays rows (Row, Pass, Species, Length, Weight, Status).
- [ ] **51.6** Click "Approve Survey" button.
- [ ] **51.7** Success notification appears: "Survey approved successfully."
- [ ] **51.8** App navigates back to Dashboard.
- [ ] **51.9** Survey `SVY-2026-NE-0100` no longer appears in the Review Queue (this is correct -- Approved surveys are excluded).
- [ ] **51.10** Navigate to Activity Feed. Set Status filter to "Approved / Published". Survey `SVY-2026-NE-0100` appears with status "Approved".

### Step 52: Request Correction

- [ ] **52.1** As Area Biologist, click "Review" on a Pending Approval survey (e.g., `SVY-2026-NE-0101`).
- [ ] **52.2** Click "Request Correction".
- [ ] **52.3** Survey status changes to "Returned for Correction".
- [ ] **52.4** Switch role to Data Entry Assistant.
- [ ] **52.5** On the Dashboard or Activity Feed, the survey shows as "Returned for Correction".
- [ ] **52.6** Navigate to that survey's Validation screen.
- [ ] **52.7** The "Submit for Review" button label shows "Re-submit for Review".
- [ ] **52.8** Click "Re-submit for Review". Status changes to "Pending Approval".

### Step 53: Senior Biologist Actions

- [ ] **53.1** Switch to Senior Biologist role.
- [ ] **53.2** Navigate to Validation for an Approved survey.
- [ ] **53.3** "Publish to Analysis" button is enabled (if zero errors).
- [ ] **53.4** Click "Publish to Analysis". Status changes to "Published".
- [ ] **53.5** Navigate to an Approved or Pending Approval survey.
- [ ] **53.6** "Flag as Suspect" button is enabled.
- [ ] **53.7** Click "Flag as Suspect". Status changes to "Flagged Suspect".

### Step 54: Water Navigation and Profile

- [ ] **54.1** Navigate to Water Select screen.
- [ ] **54.2** Screen shows 5 Northeast region waters with correct survey counts and station counts.
- [ ] **54.3** Click on "South Platte Basin".
- [ ] **54.4** Water Profile screen loads with correct data: water name, region, HUC12, stations, surveys.
- [ ] **54.5** CPUE trend chart displays (if trend data was imported).
- [ ] **54.6** Recent surveys gallery shows the most recent surveys for this water.
- [ ] **54.7** Switch to Data Entry role. Water Profile shows simplified view (survey status counts instead of charts).

### Step 55: Activity Feed Filters and Reset

- [ ] **55.1** Navigate to Activity Feed.
- [ ] **55.2** Set Water filter to "South Platte Basin" -- only South Platte surveys appear.
- [ ] **55.3** Set Status filter to "Flagged Suspect" -- only flagged surveys appear.
- [ ] **55.4** Clear all filters. All NE surveys appear.
- [ ] **55.5** Set a Date From filter. Only surveys on or after that date appear.
- [ ] **55.6** Unit toggle on Validation screen works: fish lengths display in mm by default, switch to inches and values convert correctly (divide by 25.4).
- [ ] **55.7** Click "Reset Demo Data" button.
- [ ] **55.8** Wait for flow to complete. All survey statuses return to their seed values.
- [ ] **55.9** Review Queue shows the original set of pending/flagged surveys.
- [ ] **55.10** Charts display on Insights screen (if trend data was imported).

---

## Phase 8: Polish and Deploy (Steps 56-60)

### Step 56: Set App Icon and Splash Screen

1. In Power Apps Studio, click **Settings** (gear icon).
2. Under **General**:
   - **App name:** `ADAMAS - CPW Fisheries Demo`
   - **Description:** `Aquatic Data & Monitoring Analysis System. Fisheries survey data management for Colorado Parks & Wildlife.`
   - **App icon:** Upload a custom icon (a simple wave/water icon in navy #1B365D on white background, 245x245px). Or use the default.
   - **Background color:** `#1B365D`
3. Click the back arrow to save.

### Step 57: Add App Loading Screen (Optional)

1. Create a new screen named `scrSplash`.
2. Set it as the **StartScreen** in App properties:
   ```
   App.StartScreen = scrSplash
   ```
3. On the splash screen, add:
   - A navy background rectangle filling the entire screen.
   - A white "ADAMAS" title (font size 48, centered).
   - A subtitle: "Aquatic Data & Monitoring Analysis System" (font size 16, white).
   - A "Colorado Parks & Wildlife -- Fisheries Program" label (font size 12, white/60% opacity).
4. Add a **Timer** control:
   - Duration: 2000 (2 seconds)
   - AutoStart: true
   - OnTimerEnd: `Navigate(scrDashboard, ScreenTransition.Fade)`
   - Visible: false

### Step 58: Share the App

1. **Save** the app (Ctrl+S or File > Save).
2. **Publish** the app (File > Publish > Publish this version).
3. Click **Share** (or go to make.powerapps.com > Apps > find your app > Share).
4. Add the demo users or security group:
   - Search for the user or group by name or email.
   - Select the appropriate permissions:
     - **Can use:** For demo presenters and viewers.
     - **Co-owner:** For other builders who need to edit the app.
5. Ensure the Dataverse security roles allow the shared users to read/write the custom tables. The simplest approach for a demo:
   - Assign the **Basic User** Dataverse security role to all demo users.
   - Or create a custom security role with CRUD permissions on all `cpw_*` tables.

### Step 59: Set Up Demo User Accounts

For the best demo experience, create 3 Azure AD / Entra ID accounts:

| Account | Display Name | Role |
|---|---|---|
| dataentry@yourtenant.onmicrosoft.com | Alex Torres (Data Entry) | Data Entry Assistant |
| areabio@yourtenant.onmicrosoft.com | Jordan Martinez (Area Bio) | Area Biologist |
| seniorbio@yourtenant.onmicrosoft.com | Sam Chen (Senior Bio) | Senior Biologist |

1. Create these accounts in [admin.microsoft.com](https://admin.microsoft.com) > Users > Active users > Add a user.
2. Assign Power Apps licenses to each account.
3. Add corresponding rows in the cpw_AppUser table with the correct email and role.
4. Share the Canvas App with all three accounts.

> **Alternative for solo demos:** Use the role switcher dropdown (Step 24) with a single account. No additional user accounts needed.

### Step 60: Pre-Demo Preparation Checklist

Run through this checklist before every demo:

- [ ] **Reset demo data:** Click the "Reset Demo Data" button (or run the Power Automate flow manually). Verify all surveys are back to seed statuses.
- [ ] **Clear browser cache:** Open a fresh browser tab or Incognito/InPrivate window to avoid stale cached data.
- [ ] **Verify app loads:** Open the app via [apps.powerapps.com](https://apps.powerapps.com) or the direct link. Confirm the Dashboard loads with the Review Queue populated.
- [ ] **Set starting role:** Set the role switcher to "Area Biologist" (the default demo persona).
- [ ] **Prepare demo script:** Walk through the key demo flow:
  1. Show the Area Biologist Dashboard (Review Queue, Stats, Waters list).
  2. Click "Review" on a survey to open Validation.
  3. Approve the survey -- show it disappear from the Review Queue.
  4. Navigate to Activity Feed -- show the Approved filter includes the survey.
  5. Switch to Data Entry -- show the simplified dashboard and upload flow.
  6. Switch to Senior Biologist -- show statewide view, Insights, and Compare Waters.
  7. Reset demo data at the end.
- [ ] **Test connectivity:** Ensure stable internet connection for Dataverse queries.
- [ ] **Screen resolution:** Set your display to 1366x768 or higher for optimal layout.

---

## Appendix A: Quick Reference -- Table Creation Summary

| Order | Table Name | Display Name | Plural Name | Primary Column | Key Lookups |
|---|---|---|---|---|---|
| 1 | cpw_Species | Species | Species | Code | -- |
| 2 | cpw_Water | Water | Waters | Name | -- |
| 3 | cpw_Station | Station | Stations | Name | Water |
| 4 | cpw_AppUser | App User | App Users | Display Name | -- |
| 5 | cpw_Survey | Survey | Surveys | Survey ID | Water, Station |
| 6 | cpw_FishRecord | Fish Record | Fish Records | Record Label | Survey |
| 7 | cpw_ValidationIssue | Validation Issue | Validation Issues | Issue Label | Survey |
| 8 | cpw_TrendData | Trend Data | Trend Data | Trend Label | Water |
| 9 | cpw_StatusHistory | Status History | Status Histories | History Label | Survey, App User |

## Appendix B: Quick Reference -- Choice Sets Summary

| Choice Set | Values |
|---|---|
| cpw_SurveyStatus | Draft, Pending Validation, Returned for Correction, Pending Approval, Approved, Published, Flagged Suspect |
| cpw_Protocol | Two-Pass Removal, Single-Pass CPUE, Mark-Recapture, Electrofishing CPUE |
| cpw_Region | Northeast, Southeast, Northwest, Southwest, Central, Comparison |
| cpw_UserRole | Data Entry Assistant, Area Biologist, Senior Biologist |
| cpw_RecordStatus | Valid, Warning, Error |
| cpw_IssueSeverity | Error, Warning |

## Appendix C: Quick Reference -- Screen Map

| Screen Name | Purpose | Nav Items That Link Here |
|---|---|---|
| scrDashboard | Role-dependent landing page (3 variants) | Sidebar: Dashboard |
| scrWaterSelect | Water body picker list | Sidebar: Water Profile |
| scrWaterProfile | Water detail with charts and survey list | Water Select gallery items |
| scrSurveyUpload | File upload simulation | Sidebar: Upload Survey |
| scrValidation | Survey review, fish data grid, status actions | Review Queue "Review" button, Activity Feed items |
| scrActivityFeed | All surveys with status/water/date filters | Sidebar: Activity Feed (if added), Dashboard "View All" |
| scrQueryBuilder | Multi-condition query interface | Sidebar: Query Builder |
| scrInsights | Trend charts, length-frequency, statistics | Sidebar: Insights, QueryBuilder "Run Analysis" |

## Appendix D: Key Formulas Reference

### Review Queue Filter
```
Filter(
    Surveys,
    cpw_Status = cpw_SurveyStatus.'Pending Validation'
    || cpw_Status = cpw_SurveyStatus.'Returned for Correction'
    || cpw_Status = cpw_SurveyStatus.'Pending Approval'
    || cpw_Status = cpw_SurveyStatus.'Flagged Suspect'
)
```

### Status Change Pattern (Approve)
```
Patch(
    'Status Histories',
    Defaults('Status Histories'),
    {
        cpw_Survey: varCurrentSurvey,
        cpw_FromStatus: varCurrentSurvey.cpw_Status,
        cpw_ToStatus: cpw_SurveyStatus.'Approved',
        cpw_ChangedOn: Now(),
        cpw_Reason: "Approved by Area Biologist"
    }
);
Patch(
    Surveys,
    varCurrentSurvey,
    { cpw_Status: cpw_SurveyStatus.'Approved' }
);
Refresh(Surveys);
Notify("Survey approved successfully.", NotificationType.Success);
Navigate(scrDashboard, ScreenTransition.None)
```

### Activity Feed Status Filters
```
// "Approved" filter -- includes both Approved and Published
Filter(
    Surveys,
    cpw_Status = cpw_SurveyStatus.'Approved'
    || cpw_Status = cpw_SurveyStatus.'Published'
)
```

### Unit Conversion (mm to inches)
```
If(varUnit = "inches", ThisItem.cpw_LengthMm / 25.4, ThisItem.cpw_LengthMm)
```

---

*End of Builder Runbook. For questions about the workflow and status model, see `02_workflow_and_status_model.md`. For seed data details, see `07_seed_data/README.md`.*
