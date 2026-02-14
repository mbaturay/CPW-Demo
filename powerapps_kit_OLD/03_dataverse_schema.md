# 03 - Dataverse Schema

> ADAMAS CPW Fisheries - Power Apps Build Kit
> Document version: 1.1 | Date: 2026-02-13

---

## 1. Overview

This document defines every Dataverse table, column, choice set, relationship, and index required to support the ADAMAS CPW Fisheries Canvas App. The schema is designed to be created in a Dataverse environment with solution publisher prefix `cpw`.

**Publisher Prefix:** `cpw`
**Solution Name:** `CPWFisheries`

> **Authoritative column names:** The column schema names in this document match `08_builder_runbook.md` (the step-by-step build guide) and `07_seed_data/` (CSV headers). The Power Fx formulas in `05_powerfx_formulas.md` also use these names.

---

## 2. Global Choice Sets

Define these as **global choices** in the Dataverse solution so they can be reused across tables.

### 2.1 cpw_SurveyStatus

| Label                     | Value (Int) |
|---------------------------|-------------|
| Draft                     | 100000000   |
| Pending Validation        | 100000001   |
| Returned for Correction   | 100000002   |
| Pending Approval          | 100000003   |
| Approved                  | 100000004   |
| Published                 | 100000005   |
| Flagged Suspect           | 100000006   |

### 2.2 cpw_Protocol

| Label                   | Value (Int) |
|-------------------------|-------------|
| Two-Pass Removal        | 100000000   |
| Single-Pass CPUE        | 100000001   |
| Mark-Recapture          | 100000002   |
| Electrofishing CPUE     | 100000003   |

### 2.3 cpw_Region

| Label       | Value (Int) |
|-------------|-------------|
| Northeast   | 100000000   |
| Southeast   | 100000001   |
| Northwest   | 100000002   |
| Southwest   | 100000003   |
| Central     | 100000004   |
| Comparison  | 100000005   |

### 2.4 cpw_UserRole

| Label                  | Value (Int) |
|------------------------|-------------|
| Data Entry Assistant   | 100000000   |
| Area Biologist         | 100000001   |
| Senior Biologist       | 100000002   |

### 2.5 cpw_RecordStatus

| Label   | Value (Int) |
|---------|-------------|
| Valid   | 100000000   |
| Warning | 100000001   |
| Error   | 100000002   |

### 2.6 cpw_IssueSeverity

| Label   | Value (Int) |
|---------|-------------|
| Error   | 100000000   |
| Warning | 100000001   |

---

## 3. Tables

Create tables in the order listed (reference tables first, then dependent tables).

---

### 3.1 cpw_Species

**Display Name:** Species
**Plural Display Name:** Species
**Description:** Fish species reference data. Small table (~7 rows).
**Primary Name Column:** cpw_Code
**Ownership:** Organization

#### Columns

| Schema Name          | Display Name       | Type              | Required | Description                                                       |
|----------------------|--------------------|-------------------|----------|-------------------------------------------------------------------|
| cpw_Code             | Code               | Text (10)         | Yes      | **Primary name column.** Three-letter CPW species code. E.g., "BNT", "RBT". |
| cpw_CommonName       | Common Name        | Text (100)        | Yes      | Common name. E.g., "Brown Trout".                                 |
| cpw_ScientificName   | Scientific Name    | Text (200)        | No       | Latin binomial. E.g., "Salmo trutta".                             |
| cpw_LengthMinMm      | Length Min (mm)    | Whole Number      | No       | Minimum plausible total length in millimeters for this species.   |
| cpw_LengthMaxMm      | Length Max (mm)    | Whole Number      | No       | Maximum plausible total length in millimeters for this species.   |
| cpw_WeightMinG       | Weight Min (g)     | Whole Number      | No       | Minimum plausible weight in grams for this species.               |
| cpw_WeightMaxG       | Weight Max (g)     | Whole Number      | No       | Maximum plausible weight in grams for this species.               |

#### Sample Rows

| cpw_Code | cpw_CommonName     | cpw_ScientificName        | cpw_LengthMinMm | cpw_LengthMaxMm |
|----------|--------------------|---------------------------|-----------------|-----------------|
| BNT      | Brown Trout        | Salmo trutta              | 50              | 860             |
| RBT      | Rainbow Trout      | Oncorhynchus mykiss       | 50              | 760             |
| CTT      | Cutthroat Trout    | Oncorhynchus clarkii      | 50              | 650             |
| MWF      | Mountain Whitefish | Prosopium williamsoni      | 80              | 510             |
| WHS      | White Sucker       | Catostomus commersonii    | 60              | 510             |
| CRD      | Creek Chub         | Semotilus atromaculatus    | 30              | 305             |
| LMB      | Largemouth Bass    | Micropterus salmoides     | 50              | 640             |

---

### 3.2 cpw_Water

**Display Name:** Water
**Plural Display Name:** Waters
**Description:** Water bodies (lakes, reservoirs, rivers) where fisheries surveys are conducted.
**Primary Name Column:** cpw_Name
**Ownership:** Organization

#### Columns

| Schema Name          | Display Name         | Type                | Required | Description                                                       |
|----------------------|----------------------|---------------------|----------|-------------------------------------------------------------------|
| cpw_Name             | Name                 | Text (200)          | Yes      | **Primary name column.** Display name. E.g., "South Platte Basin". |
| cpw_WaterId          | Water ID             | Text (50)           | Yes      | Slug identifier used for navigation. E.g., "south-platte".       |
| cpw_Region           | Region               | Choice (cpw_Region) | Yes      | Geographic region. E.g., Northeast, Comparison.                   |
| cpw_HUC12            | HUC12                | Text (20)           | No       | 12-digit hydrologic unit code.                                    |
| cpw_YearsActiveStart | Years Active Start   | Whole Number        | No       | First year of monitoring. E.g., 1998.                             |
| cpw_YearsActiveEnd   | Years Active End     | Whole Number        | No       | Most recent monitoring year. E.g., 2025.                          |
| cpw_PrimarySpecies   | Primary Species      | Text (100)          | No       | Comma-separated species codes. E.g., "BNT,RBT,WHS".             |

#### Sample Rows

| cpw_Name               | cpw_WaterId      | cpw_Region  |
|------------------------|------------------|-------------|
| South Platte Basin     | south-platte     | Northeast   |
| Cache la Poudre River  | cache-la-poudre  | Northeast   |
| Big Thompson River     | big-thompson     | Northeast   |
| St. Vrain Creek        | st-vrain         | Northeast   |
| Boyd Lake (Reservoir)  | boyd-lake        | Northeast   |
| Blue River             | blue-river       | Comparison  |
| Colorado River (Middle)| colorado-river   | Comparison  |

---

### 3.3 cpw_Station

**Display Name:** Station
**Plural Display Name:** Stations
**Description:** Specific survey stations/sites within a water body.
**Primary Name Column:** cpw_Name
**Ownership:** Organization

#### Columns

| Schema Name          | Display Name       | Type                | Required | Description                                                       |
|----------------------|--------------------|---------------------|----------|-------------------------------------------------------------------|
| cpw_Name             | Name               | Text (200)          | Yes      | **Primary name column.** E.g., "Deckers".                        |
| cpw_StationId        | Station ID         | Text (20)           | Yes      | Short code. E.g., "SP-01".                                       |
| cpw_Water            | Water              | Lookup (cpw_Water)  | Yes      | The water body this station belongs to.                           |
| cpw_RiverMile        | River Mile         | Decimal (2 dp)      | No       | River mile marker. Blank for reservoir stations.                  |
| cpw_Latitude         | Latitude           | Decimal (5 dp)      | No       | GPS latitude.                                                     |
| cpw_Longitude        | Longitude          | Decimal (5 dp)      | No       | GPS longitude.                                                    |

#### Relationships

| Type | Related Table | Schema Name         | Description                          |
|------|---------------|---------------------|--------------------------------------|
| N:1  | cpw_Water     | cpw_Water_Stations  | Many stations belong to one water.   |

---

### 3.4 cpw_AppUser

**Display Name:** App User
**Plural Display Name:** App Users
**Description:** Application user records with role assignments. Maps to Office 365 / Azure AD identities.
**Primary Name Column:** cpw_DisplayName
**Ownership:** Organization

#### Columns

| Schema Name          | Display Name       | Type                    | Required | Description                                                       |
|----------------------|--------------------|-------------------------|----------|-------------------------------------------------------------------|
| cpw_DisplayName      | Display Name       | Text (200)              | Yes      | **Primary name column.** E.g., "Maria Garcia".                   |
| cpw_Email            | Email              | Text (200)              | Yes      | Email address matching the Office 365 / Azure AD UPN.             |
| cpw_Role             | Role               | Choice (cpw_UserRole)   | Yes      | The user's role in the ADAMAS application.                        |
| cpw_AppUserRegion    | Region             | Text (50)               | No       | Region text. E.g., "Northeast" or "Statewide".                   |

#### Sample Rows

| cpw_DisplayName | cpw_Email                          | cpw_Role               | cpw_AppUserRegion |
|-----------------|-------------------------------------|------------------------|-------------------|
| Maria Garcia    | maria.garcia@cpw.state.co.us       | Data Entry Assistant   | Northeast         |
| John Smith      | john.smith@cpw.state.co.us         | Area Biologist         | Northeast         |
| Sarah Chen      | sarah.chen@cpw.state.co.us         | Senior Biologist       | Statewide         |

#### Notes on Authentication

The `cpw_AppUser` table stores the **role assignment** and profile data. Authentication is handled by Power Apps' built-in Azure AD integration. At app launch, the Canvas App runs:

```
Set(
    gblCurrentUser,
    LookUp(cpw_AppUsers, cpw_Email = User().Email)
);
```

---

### 3.5 cpw_Survey

**Display Name:** Survey
**Plural Display Name:** Surveys
**Description:** Individual fisheries survey events. This is the central record that drives the workflow.
**Primary Name Column:** cpw_SurveyId
**Ownership:** Organization

#### Columns

| Schema Name          | Display Name       | Type                      | Required | Description                                                       |
|----------------------|--------------------|---------------------------|----------|-------------------------------------------------------------------|
| cpw_SurveyId         | Survey ID          | Text (30)                 | Yes      | **Primary name column.** Coded identifier. E.g., "SVY-2026-NE-0100". |
| cpw_Water            | Water              | Lookup (cpw_Water)        | Yes      | The water body where this survey was conducted.                   |
| cpw_Station          | Station            | Lookup (cpw_Station)      | No       | The specific station where this survey was conducted.             |
| cpw_SurveyDate       | Survey Date        | Date Only                 | Yes      | Date the survey was conducted in the field.                       |
| cpw_Protocol         | Protocol           | Choice (cpw_Protocol)     | Yes      | Sampling protocol used.                                           |
| cpw_Uploader         | Uploader           | Text (100)                | No       | Name of the person who uploaded the data.                         |
| cpw_Status           | Status             | Choice (cpw_SurveyStatus) | Yes     | Current workflow status. Default: Draft.                          |
| cpw_FishCount        | Fish Count         | Whole Number              | No       | Total number of fish records in this survey.                      |
| cpw_SpeciesDetected  | Species Detected   | Text (200)                | No       | Comma-separated species codes found. E.g., "BNT,RBT,WHS".       |

#### Relationships

| Type | Related Table       | Schema Name                    | Description                                      |
|------|---------------------|--------------------------------|--------------------------------------------------|
| N:1  | cpw_Water           | cpw_Water_Surveys              | Many surveys belong to one water body.           |
| N:1  | cpw_Station         | cpw_Station_Surveys            | Many surveys belong to one station.              |
| 1:N  | cpw_FishRecord      | cpw_Survey_FishRecords         | One survey has many fish records.                |
| 1:N  | cpw_ValidationIssue | cpw_Survey_ValidationIssues    | One survey has many validation issues.           |
| 1:N  | cpw_StatusHistory   | cpw_Survey_StatusHistory       | One survey has many status history entries.       |

#### Indexes

| Name                        | Columns                       | Purpose                                      |
|-----------------------------|-------------------------------|----------------------------------------------|
| idx_Survey_Status           | cpw_Status                    | Fast filtering for Review Queue and Activity Feed. |
| idx_Survey_Water_Date       | cpw_Water, cpw_SurveyDate     | Fast filtering by water body and date range.  |

#### Sample Rows

| cpw_SurveyId       | cpw_Water (Name)       | cpw_Protocol         | cpw_Status           | cpw_SurveyDate |
|---------------------|------------------------|----------------------|----------------------|----------------|
| SVY-2026-NE-0100   | South Platte Basin     | Two-Pass Removal     | Pending Approval     | 2026-02-07     |
| SVY-2026-NE-0101   | Cache la Poudre River  | Single-Pass CPUE     | Pending Approval     | 2026-02-06     |
| SVY-2026-NE-0102   | South Platte Basin     | Electrofishing CPUE  | Pending Validation   | 2026-02-04     |
| SVY-2025-BT-0009   | Big Thompson River     | Mark-Recapture       | Flagged Suspect      | 2025-08-20     |
| SVY-2025-SP-0005   | South Platte Basin     | Two-Pass Removal     | Approved             | 2025-06-15     |

---

### 3.6 cpw_FishRecord

**Display Name:** Fish Record
**Plural Display Name:** Fish Records
**Description:** Individual fish measurement records captured during a survey.
**Primary Name Column:** cpw_RecordLabel
**Ownership:** Organization

#### Columns

| Schema Name          | Display Name       | Type                      | Required | Description                                                       |
|----------------------|--------------------|---------------------------|----------|-------------------------------------------------------------------|
| cpw_RecordLabel      | Record Label       | Text (50)                 | Yes      | **Primary name column.** Auto-generated or "Row X" format.       |
| cpw_Survey           | Survey             | Lookup (cpw_Survey)       | Yes      | The survey this fish was captured in.                             |
| cpw_Row              | Row                | Whole Number              | Yes      | Row number within the survey (sequential).                        |
| cpw_Pass             | Pass               | Whole Number              | No       | Electrofishing pass number (1, 2, etc.).                          |
| cpw_Species          | Species            | Text (10)                 | Yes      | Species code. E.g., "BNT". Plain text, not a lookup.             |
| cpw_LengthMm        | Length (mm)        | Whole Number              | Yes      | Fish total length in millimeters.                                 |
| cpw_WeightG          | Weight (g)         | Whole Number              | No       | Fish weight in grams.                                             |
| cpw_RecordStatus     | Record Status      | Choice (cpw_RecordStatus) | No       | Validation status: Valid, Warning, or Error. Default: Valid.      |
| cpw_ErrorMessage     | Error Message      | Multiline Text (2000)     | No       | Description of the validation error or warning.                   |

> **Design note:** The `cpw_Species` column is **plain text** (the 3-letter species code), not a Lookup to the `cpw_Species` table. This simplifies CSV import and formula references. Validation against the species reference table is done in the Canvas App or Power Automate flow.

#### Relationships

| Type | Related Table | Schema Name              | Description                                    |
|------|---------------|--------------------------|------------------------------------------------|
| N:1  | cpw_Survey    | cpw_Survey_FishRecords   | Many fish records belong to one survey.        |

#### Indexes

| Name                        | Columns            | Purpose                                      |
|-----------------------------|--------------------|----------------------------------------------|
| idx_FishRecord_Survey       | cpw_Survey         | Fast retrieval of all fish in a survey.      |

---

### 3.7 cpw_ValidationIssue

**Display Name:** Validation Issue
**Plural Display Name:** Validation Issues
**Description:** Data quality issues (errors and warnings) identified during survey validation.
**Primary Name Column:** cpw_IssueLabel
**Ownership:** Organization

#### Columns

| Schema Name          | Display Name       | Type                        | Required | Description                                                       |
|----------------------|--------------------|-----------------------------|----------|-------------------------------------------------------------------|
| cpw_IssueLabel       | Issue Label        | Text (200)                  | Yes      | **Primary name column.** Auto-generated from Code + Row.          |
| cpw_Survey           | Survey             | Lookup (cpw_Survey)         | Yes      | The survey this issue belongs to.                                 |
| cpw_Severity         | Severity           | Choice (cpw_IssueSeverity)  | Yes      | Error or Warning.                                                 |
| cpw_Code             | Code               | Text (50)                   | Yes      | Rule code. E.g., "SPECIES_CODE_INVALID", "LENGTH_OUT_OF_RANGE".  |
| cpw_Message          | Message            | Multiline Text (2000)       | Yes      | Human-readable description of the issue.                          |
| cpw_IssueRow         | Row                | Whole Number                | No       | Row number in the survey data. Blank for survey-level issues.     |
| cpw_Field            | Field              | Text (50)                   | No       | Column name with the issue. E.g., "species_code", "length_mm".   |
| cpw_Suggestion       | Suggestion         | Multiline Text (2000)       | No       | Recommended fix or explanation.                                   |

#### Relationships

| Type | Related Table | Schema Name                      | Description                                      |
|------|---------------|----------------------------------|--------------------------------------------------|
| N:1  | cpw_Survey    | cpw_Survey_ValidationIssues      | Many issues belong to one survey.                |

#### Indexes

| Name                             | Columns                          | Purpose                                          |
|----------------------------------|----------------------------------|--------------------------------------------------|
| idx_ValidationIssue_Survey       | cpw_Survey                       | Fast retrieval of all issues for a survey.       |

---

### 3.8 cpw_TrendData

**Display Name:** Trend Data
**Plural Display Name:** Trend Data
**Description:** Population trend data points per water body, used for the Insights/Analytics charts.
**Primary Name Column:** cpw_TrendLabel
**Ownership:** Organization

#### Columns

| Schema Name          | Display Name       | Type                  | Required | Description                                                       |
|----------------------|--------------------|-----------------------|----------|-------------------------------------------------------------------|
| cpw_TrendLabel       | Trend Label        | Text (100)            | Yes      | **Primary name column.** E.g., "south-platte-2024".              |
| cpw_Water            | Water              | Lookup (cpw_Water)    | Yes      | The water body this trend data applies to.                        |
| cpw_Year             | Year               | Whole Number          | Yes      | The year of this data point.                                      |
| cpw_CPUE             | CPUE               | Decimal (2 dp)        | Yes      | Catch per unit effort.                                            |
| cpw_BiomassKg        | Biomass (kg)       | Decimal (2 dp)        | No       | Total biomass in kilograms.                                       |
| cpw_PopEstimate      | Pop Estimate       | Whole Number          | No       | Population estimate (when available).                             |
| cpw_SpeciesCode      | Species Code       | Text (10)             | No       | Species code for per-species trends. Blank for overall trends.    |

#### Relationships

| Type | Related Table | Schema Name             | Description                                      |
|------|---------------|-------------------------|--------------------------------------------------|
| N:1  | cpw_Water     | cpw_Water_TrendData     | Many trend data points belong to one water body. |

#### Indexes

| Name                        | Columns                   | Purpose                                      |
|-----------------------------|---------------------------|----------------------------------------------|
| idx_TrendData_Water_Year    | cpw_Water, cpw_Year       | Fast retrieval of trend lines per water.     |

---

### 3.9 cpw_StatusHistory

**Display Name:** Status History
**Plural Display Name:** Status Histories
**Description:** Audit log of every status change on a survey. One row per transition.
**Primary Name Column:** cpw_HistoryLabel
**Ownership:** Organization

#### Columns

| Schema Name          | Display Name       | Type                        | Required | Description                                                       |
|----------------------|--------------------|-----------------------------|----------|-------------------------------------------------------------------|
| cpw_HistoryLabel     | History Label      | Text (200)                  | Yes      | **Primary name column.** Auto-generated.                          |
| cpw_Survey           | Survey             | Lookup (cpw_Survey)         | Yes      | The survey whose status changed.                                  |
| cpw_FromStatus       | From Status        | Choice (cpw_SurveyStatus)   | No       | The status before the transition.                                 |
| cpw_ToStatus         | To Status          | Choice (cpw_SurveyStatus)   | Yes      | The status after the transition.                                  |
| cpw_ChangedBy        | Changed By         | Lookup (cpw_AppUser)        | No       | The user who triggered the transition.                            |
| cpw_ChangedOn        | Changed On         | Date and Time               | Yes      | Timestamp of the transition.                                      |
| cpw_Reason           | Reason             | Text (500)                  | No       | Free-text reason or system-generated label.                       |

#### Relationships

| Type | Related Table | Schema Name                | Description                                      |
|------|---------------|----------------------------|--------------------------------------------------|
| N:1  | cpw_Survey    | cpw_Survey_StatusHistory   | Many status history entries belong to one survey.|
| N:1  | cpw_AppUser   | cpw_AppUser_StatusChanges  | The user who made the change.                    |

#### Indexes

| Name                             | Columns            | Purpose                                          |
|----------------------------------|--------------------|--------------------------------------------------|
| idx_StatusHistory_Survey         | cpw_Survey         | Fast retrieval of history for a specific survey. |
| idx_StatusHistory_ChangedOn      | cpw_ChangedOn      | Sort by most recent changes.                     |

---

## 4. Relationship Summary Diagram

```
cpw_Water (1) ──────────── (N) cpw_Station
    │                              │
    │ (1:N)                        │ (1:N)
    │                              │
    ├──── (N) cpw_Survey ──────────┘
    │            │
    │            ├──── (N) cpw_FishRecord
    │            │
    │            ├──── (N) cpw_ValidationIssue
    │            │
    │            └──── (N) cpw_StatusHistory ──── (N:1) cpw_AppUser
    │
    └──── (N) cpw_TrendData

cpw_AppUser ──── referenced by StatusHistory (ChangedBy)
```

### Full Relationship List

| Parent Table (1)    | Child Table (N)       | Relationship Schema Name             | FK Column in Child      | Cascade Delete? |
|---------------------|-----------------------|--------------------------------------|-------------------------|-----------------|
| cpw_Water           | cpw_Station           | cpw_Water_Stations                   | cpw_Water               | Restrict        |
| cpw_Water           | cpw_Survey            | cpw_Water_Surveys                    | cpw_Water               | Restrict        |
| cpw_Water           | cpw_TrendData         | cpw_Water_TrendData                  | cpw_Water               | Cascade         |
| cpw_Station         | cpw_Survey            | cpw_Station_Surveys                  | cpw_Station             | Restrict        |
| cpw_Survey          | cpw_FishRecord        | cpw_Survey_FishRecords               | cpw_Survey              | Cascade         |
| cpw_Survey          | cpw_ValidationIssue   | cpw_Survey_ValidationIssues          | cpw_Survey              | Cascade         |
| cpw_Survey          | cpw_StatusHistory     | cpw_Survey_StatusHistory             | cpw_Survey              | Cascade         |
| cpw_AppUser         | cpw_StatusHistory     | cpw_AppUser_StatusChanges            | cpw_ChangedBy           | Remove Link     |

### Cascade Delete Behavior Explanation

| Behavior      | Meaning                                                                                       |
|---------------|-----------------------------------------------------------------------------------------------|
| Cascade       | Deleting the parent automatically deletes all child rows. Used for owned data (e.g., deleting a survey deletes its fish records). |
| Restrict      | Prevent deleting the parent if child rows exist. Used for reference data (e.g., cannot delete a water body if surveys reference it). |
| Remove Link   | Deleting the parent sets the child's FK to null. Used for optional references (e.g., deleting an AppUser nullifies the lookup). |

---

## 5. Column Type Reference

For Dataverse builders unfamiliar with specific column types:

| Type Used in This Doc      | Dataverse Column Type        | Notes                                                     |
|---------------------------|------------------------------|-----------------------------------------------------------|
| Text (N)                  | Single Line of Text          | Max characters = N.                                       |
| Multiline Text (N)        | Multiple Lines of Text       | Max characters = N. Format: Text.                         |
| Whole Number              | Whole Number                 | Format: None. Min/Max set per column.                     |
| Decimal (N dp)            | Decimal Number               | Precision = N decimal places.                             |
| Yes/No                    | Two Options (Boolean)        | Values: Yes/No. Default specified per column.             |
| Date Only                 | Date Only                    | No time component. Format: Date Only.                     |
| Date and Time             | Date and Time                | Includes time. Behavior: User Local.                      |
| Choice                    | Choice (Option Set)          | References a global choice set. Single value.             |
| Lookup                    | Lookup                       | Foreign key to another table. Creates a relationship.     |

---

## 6. Business Rules (Dataverse-Level)

These rules run server-side, independent of the Canvas App, providing a safety net against invalid data.

### 6.1 Survey Status Lock

**Table:** cpw_Survey
**Rule:** If `cpw_Status` = `Published`, lock `cpw_Status` field (set as read-only). Prevents any client from modifying a published survey's status.

### 6.2 Require Survey Date

**Table:** cpw_Survey
**Rule:** If `cpw_SurveyDate` is blank, show error "Survey date is required."

### 6.3 Fish Record Length Range

**Table:** cpw_FishRecord
**Rule:** If `cpw_LengthMm` < 10 or `cpw_LengthMm` > 1200, show warning "Fish length appears outside normal range (10-1200mm)."

---

## 7. Views (Dataverse Saved Views)

Pre-create these views for use in the model-driven admin interface and for developer reference.

| Table               | View Name                     | Filter                                                    | Sort               |
|---------------------|-------------------------------|-----------------------------------------------------------|--------------------|
| cpw_Survey          | Active Surveys                | Status != Published                                       | Modified On DESC   |
| cpw_Survey          | Review Queue                  | Status IN (Pending Validation, Returned, Pending Approval, Flagged) | Modified On DESC |
| cpw_Survey          | Published Surveys             | Status = Published                                        | Survey Date DESC   |
| cpw_FishRecord      | Fish Records by Survey        | (grouped by cpw_Survey)                                   | Species, Length    |
| cpw_ValidationIssue | Open Issues                   | (all)                                                     | Severity, Survey   |
| cpw_StatusHistory   | Recent Changes                | (all)                                                     | Changed On DESC    |
| cpw_TrendData       | Trends by Water               | (grouped by cpw_Water)                                    | Year DESC          |
| cpw_AppUser         | All Users                     | (all)                                                     | Display Name ASC   |

---

## 8. Security Roles (Dataverse)

Define three custom security roles mirroring the application roles:

### 8.1 CPW Data Entry Assistant

| Table               | Create | Read   | Update | Delete | Append | Append To |
|---------------------|--------|--------|--------|--------|--------|-----------|
| cpw_Water           | None   | Org    | None   | None   | None   | Org       |
| cpw_Station         | None   | Org    | None   | None   | None   | Org       |
| cpw_Species         | None   | Org    | None   | None   | None   | Org       |
| cpw_Survey          | Org    | Org    | Org    | None   | Org    | Org       |
| cpw_FishRecord      | Org    | Org    | Org    | Org    | Org    | Org       |
| cpw_ValidationIssue | None   | Org    | None   | None   | None   | Org       |
| cpw_StatusHistory   | Org    | Org    | None   | None   | Org    | Org       |
| cpw_TrendData       | None   | Org    | None   | None   | None   | None      |
| cpw_AppUser         | None   | Org    | None   | None   | None   | Org       |

### 8.2 CPW Area Biologist

| Table               | Create | Read   | Update | Delete | Append | Append To |
|---------------------|--------|--------|--------|--------|--------|-----------|
| cpw_Water           | None   | Org    | None   | None   | None   | Org       |
| cpw_Station         | None   | Org    | None   | None   | None   | Org       |
| cpw_Species         | None   | Org    | None   | None   | None   | Org       |
| cpw_Survey          | Org    | Org    | Org    | None   | Org    | Org       |
| cpw_FishRecord      | Org    | Org    | Org    | Org    | Org    | Org       |
| cpw_ValidationIssue | Org    | Org    | Org    | Org    | Org    | Org       |
| cpw_StatusHistory   | Org    | Org    | None   | None   | Org    | Org       |
| cpw_TrendData       | None   | Org    | None   | None   | None   | None      |
| cpw_AppUser         | None   | Org    | None   | None   | None   | Org       |

### 8.3 CPW Senior Biologist

| Table               | Create | Read   | Update | Delete | Append | Append To |
|---------------------|--------|--------|--------|--------|--------|-----------|
| cpw_Water           | Org    | Org    | Org    | None   | Org    | Org       |
| cpw_Station         | Org    | Org    | Org    | None   | Org    | Org       |
| cpw_Species         | Org    | Org    | Org    | None   | Org    | Org       |
| cpw_Survey          | Org    | Org    | Org    | Org    | Org    | Org       |
| cpw_FishRecord      | Org    | Org    | Org    | Org    | Org    | Org       |
| cpw_ValidationIssue | Org    | Org    | Org    | Org    | Org    | Org       |
| cpw_StatusHistory   | Org    | Org    | None   | None   | Org    | Org       |
| cpw_TrendData       | Org    | Org    | Org    | Org    | Org    | Org       |
| cpw_AppUser         | Org    | Org    | Org    | Org    | Org    | Org       |

> **Key:** None = no access, Org = organization-level access (all rows). For a multi-region deployment, replace Org with BU (Business Unit) and assign users to region-specific business units.

---

## 9. Data Volume Estimates

For capacity planning and delegation threshold awareness in Canvas Apps:

| Table               | Expected Row Count (Initial Seed) | Growth Rate         | Delegation Concern?                         |
|---------------------|-----------------------------------|---------------------|---------------------------------------------|
| cpw_Species         | 7                                 | Rare                | No                                          |
| cpw_Water           | 7                                 | ~1-2 per year       | No                                          |
| cpw_Station         | 15                                | ~5-10 per year      | No                                          |
| cpw_AppUser         | 3                                 | Rare                | No                                          |
| cpw_Survey          | 15 (seed), ~200/year              | ~200 per year       | No (under 2000 threshold for years)         |
| cpw_FishRecord      | 53 (seed), ~5000/year             | ~5000 per year      | Yes - use delegable queries (Filter, Sort)  |
| cpw_ValidationIssue | 12 (seed), ~500/year              | ~500 per year       | Borderline - use delegable queries          |
| cpw_TrendData       | 50 (seed), ~100/year              | ~100 per year       | No                                          |
| cpw_StatusHistory   | 0 (purged on reset), ~600/year    | ~3x survey count    | No initially, monitor over time             |

> **Canvas App Delegation:** The default delegation limit in Power Apps is 500 rows. Set it to 2000 in App Settings. For `cpw_FishRecord`, always filter by `cpw_Survey` first (delegable) to keep result sets small. Avoid `Search()` on large tables; use `Filter()` with equality or comparison operators.

---

## 10. Table Creation Summary (Quick Reference)

| Order | Table Name          | Display Name     | Plural Name       | Primary Column    | Key Lookups       |
|-------|---------------------|------------------|--------------------|-------------------|-------------------|
| 1     | cpw_Species         | Species          | Species            | cpw_Code          | --                |
| 2     | cpw_Water           | Water            | Waters             | cpw_Name          | --                |
| 3     | cpw_Station         | Station          | Stations           | cpw_Name          | cpw_Water         |
| 4     | cpw_AppUser         | App User         | App Users          | cpw_DisplayName   | --                |
| 5     | cpw_Survey          | Survey           | Surveys            | cpw_SurveyId      | cpw_Water, cpw_Station |
| 6     | cpw_FishRecord      | Fish Record      | Fish Records       | cpw_RecordLabel   | cpw_Survey        |
| 7     | cpw_ValidationIssue | Validation Issue | Validation Issues  | cpw_IssueLabel    | cpw_Survey        |
| 8     | cpw_TrendData       | Trend Data       | Trend Data         | cpw_TrendLabel    | cpw_Water         |
| 9     | cpw_StatusHistory   | Status History   | Status Histories   | cpw_HistoryLabel  | cpw_Survey, cpw_AppUser |

> **Note:** This is 9 tables (not 10). The original schema included a `cpw_ReviewComment` table, but it is not used by any screen, formula, or flow in this kit. It may be added in a future version for in-app review annotations.
