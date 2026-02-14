# Control Name Checklist

> Extracted from `powerapps_kit/05_powerfx_formulas.md`.
> Every control name below is referenced in at least one Power Fx formula.
> When building screens in Power Apps, **rename controls to match** before pasting formulas.

## Buttons
| Control Name | Screen | Purpose |
|---|---|---|
| `btnAction` | scrDashboard, scrActivityFeed | Primary action per gallery row (Review / Continue / View) |
| `btnApprove` | scrValidation | Approve survey (Area Biologist) |
| `btnCompareWaters` | scrInsights | Toggle compare mode (Senior Biologist) |
| `btnExportExcel` | scrInsights | Export to Excel (Senior Biologist) |
| `btnFlagSuspect` | scrValidation | Flag survey as suspect (Senior Biologist) |
| `btnOpenTableau` | scrInsights, scrDashboard (Senior) | Open in Tableau |
| `btnPublish` | scrValidation | Publish to analysis (Senior Biologist) |
| `btnRequestCorrection` | scrValidation | Return for correction (Area Biologist) |
| `btnRevalidate` | scrValidation | Re-run validation rules |
| `btnRunQuery` | scrQueryBuilder | Execute query |
| `btnSingleWater` | scrInsights | Toggle single-water mode |
| `btnSubmitForReview` | scrValidation | Submit for biologist review (Data Entry) |
| `btnUploadSubmit` | scrSurveyUpload | Submit uploaded survey |
| `btnViewAll` | scrDashboard | Navigate to Activity Feed |
| `btnViewAnalytics` | scrWaterProfile | Navigate to Insights |

## Dropdowns
| Control Name | Screen | Purpose |
|---|---|---|
| `drpFeedStatus` | scrActivityFeed | Status filter dropdown |
| `drpFeedWater` | scrActivityFeed | Water filter dropdown |
| `drpInsMetric` | scrInsights | Metric selector (Population / CPUE / Biomass) |
| `drpProtocol` | scrSurveyUpload | Protocol type selector |
| `drpUploadStation` | scrSurveyUpload | Station selector |
| `drpUploadWater` | scrSurveyUpload | Water selector |

## Galleries
| Control Name | Screen | Purpose |
|---|---|---|
| `galActivityFeed` | scrActivityFeed | Filtered survey list |
| `galFishRecords` | scrValidation | Fish data grid |
| `galQueryResults` | scrQueryBuilder | Query result gallery |
| `galRecentSurveys` | scrWaterProfile | Recent survey list |
| `galReviewQueue` | scrDashboard | Review queue table |
| `galSpeciesRef` | scrValidation | Species reference panel |
| `galStationsInBasin` | scrWaterProfile | Station list |
| `galValIssues` | scrValidation | Validation issues panel |
| `galWaterList` | scrWaterSelect | Water body picker |
| `galWatersInRegion` | scrDashboard | Waters in region table |

## Groups (visibility containers)
| Control Name | Screen | Purpose |
|---|---|---|
| `grpAnalyticsView` | scrWaterProfile | Biologist analytics view container |
| `grpAreaBiologistDashboard` | scrDashboard | Area Biologist dashboard container |
| `grpCompareChart` | scrInsights | Compare mode chart container |
| `grpDataEntryDashboard` | scrDashboard | Data Entry dashboard container |
| `grpDataEntryView` | scrWaterProfile | Data Entry simplified view container |
| `grpSeniorDashboard` | scrDashboard | Senior Biologist dashboard container |
| `grpSingleChart` | scrInsights | Single-water chart container |

## Labels
| Control Name | Screen | Purpose |
|---|---|---|
| `lblActionMessage` | scrValidation | Action confirmation banner |
| `lblCode` | scrValidation (galSpeciesRef) | Species code |
| `lblCommon` | scrValidation (galSpeciesRef) | Species common name |
| `lblCurrentStatus` | scrValidation | Current survey status badge |
| `lblDE_Approval` | scrWaterProfile | Data Entry: awaiting approval count |
| `lblDE_Pending` | scrWaterProfile | Data Entry: pending validation count |
| `lblDE_Returned` | scrWaterProfile | Data Entry: returned for correction count |
| `lblDE_Uploaded` | scrWaterProfile | Data Entry: uploaded count |
| `lblDate` | scrDashboard, scrActivityFeed | Survey date |
| `lblDeltaBR` | scrInsights | Blue River delta |
| `lblDeltaCR` | scrInsights | Colorado River delta |
| `lblDeltaSP` | scrInsights | South Platte delta |
| `lblErrorCount` | scrValidation | Error count |
| `lblFilteredCount` | scrActivityFeed | Filtered survey count |
| `lblFlaggedSubtitle` | scrDashboard | Flagged surveys subtitle |
| `lblFlaggedSurveys` | scrDashboard | Flagged surveys count |
| `lblHUC` | scrWaterProfile | HUC12 watershed code |
| `lblInsBiomass` | scrInsights | Biomass value |
| `lblInsBiomassChange` | scrInsights | Biomass change % |
| `lblInsCI` | scrInsights | Confidence interval |
| `lblInsCPUE` | scrInsights | CPUE value |
| `lblInsCPUEChange` | scrInsights | CPUE change % |
| `lblInsContextBanner` | scrInsights | Context summary text |
| `lblInsPopChange` | scrInsights | Population change % |
| `lblInsPopulation` | scrInsights | Population estimate |
| `lblIssueMessage` | scrValidation (galValIssues) | Issue description |
| `lblIssueRow` | scrValidation (galValIssues) | Issue row reference |
| `lblIssueSeverity` | scrValidation (galValIssues) | Error / Warning label |
| `lblIssueSuggestion` | scrValidation (galValIssues) | Suggested fix |
| `lblLastSurvey` | scrWaterProfile | Last survey date |
| `lblLength` | scrValidation (galFishRecords) | Fish length value |
| `lblLengthHeader` | scrValidation | Length column header with unit |
| `lblPass` | scrValidation (galFishRecords) | Pass number |
| `lblPendingApproval` | scrDashboard | Pending approval count |
| `lblPendingSubtitle` | scrDashboard | Pending subtitle text |
| `lblPopTrend` | scrWaterProfile | Population trend direction |
| `lblPopulation` | scrWaterProfile | Population estimate |
| `lblPrimarySpecies` | scrWaterProfile | Primary species code |
| `lblPrimarySpeciesSubtitle` | scrWaterProfile | Primary species name |
| `lblProtocol` | scrDashboard, scrActivityFeed | Protocol type |
| `lblRecordStatus` | scrValidation (galFishRecords) | Valid / Warning / Error |
| `lblRegion` | scrWaterProfile | Region name |
| `lblRegionalScope` | scrWaterProfile | Regional scope strip |
| `lblRoleIndicator` | Shared | Current role label |
| `lblRow` | scrValidation (galFishRecords) | Row number |
| `lblSpecies` | scrValidation (galFishRecords), scrWaterSelect | Species code / names |
| `lblStation` | scrActivityFeed | Station ID |
| `lblStationCount` | scrWaterSelect | Station count |
| `lblStationCountBanner` | scrWaterProfile | Station count in banner |
| `lblStationDate` | scrWaterProfile (galRecentSurveys) | Station + date combined |
| `lblStationId` | scrWaterProfile (galStationsInBasin) | Station ID |
| `lblStatus` | scrDashboard, scrActivityFeed | Survey status badge |
| `lblSurveyCount` | scrWaterSelect | Survey count |
| `lblSurveyId` | Multiple screens | Survey ID |
| `lblTotalRecords` | scrValidation | Total fish record count |
| `lblTotalSurveys` | scrWaterProfile | Total surveys in banner |
| `lblUnitLeft` | scrValidation | "mm" label |
| `lblUnitRight` | scrValidation | "inches" label |
| `lblValDate` | scrValidation | Survey date |
| `lblValProtocol` | scrValidation | Protocol type |
| `lblValStation` | scrValidation | Station ID |
| `lblValUploader` | scrValidation | Uploader name |
| `lblValWaterName` | scrValidation | Water name |
| `lblValidCount` | scrValidation | Valid row count |
| `lblWarningCount` | scrValidation | Warning count |
| `lblWaterName` | Multiple screens | Water name |
| `lblWatersActive` | scrDashboard | Active waters count |
| `lblWatersActiveSubtitle` | scrDashboard | Active waters subtitle |
| `lblWeight` | scrValidation (galFishRecords) | Fish weight |
| `lblYears` | scrWaterSelect | Years active range |
| `lblYearsActive` | scrWaterProfile | Years active in banner |

## Other Controls
| Control Name | Screen | Purpose |
|---|---|---|
| `icoTrendArrow` | scrWaterProfile | Trend direction icon |
| `tglUnit` | scrValidation | mm / inches toggle |
| `dtpFeedDateFrom` | scrActivityFeed | Date-from picker |
| `dtpSurveyDate` | scrSurveyUpload | Survey date picker |
| `recRowStrip` | scrValidation (galFishRecords) | Row status color strip |
| `Timer1` | scrValidation | Auto-clear action message |

---

> **If anything in the formulas (`powerapps_kit/05_powerfx_formulas.md`) references a control name not listed here, add it to this file.**
