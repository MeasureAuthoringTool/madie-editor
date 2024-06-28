export const mockMeasureStoreCql = `
library Bug7042 version '0.0.000'

using QDM version '5.6'

include MATGlobalCommonFunctionsQDM123 version '2.0.000' called Global
include AdultOutpatientEncountersQDM version '1.0.000' called AdultOutpatientEncounters
include HospiceQDM version '1.0.000' called Hospice
include PalliativeCareQDM version '1.0.000' called PalliativeCare
include AdvancedIllnessandFrailtyQDM version '1.0.000' called AIFrailLTCF 

codesystem "LOINC": 'urn:oid:2.16.840.1.113883.6.1'
codesystem "LOINC:2.76": 'urn:oid:2.16.840.1.113883.6.1' version 'urn:hl7:version:2.76'

valueset "Chronic Kidney Disease, Stage 5": 'urn:oid:2.16.840.1.113883.3.526.3.1002'
valueset "Dialysis Services": 'urn:oid:2.16.840.1.113883.3.464.1003.109.12.1013'
valueset "Emergency Department Evaluation and Management Visit": 'urn:oid:2.16.840.1.113883.3.464.1003.101.12.1010'
valueset "Encounter Inpatient": 'urn:oid:2.16.840.1.113883.3.666.5.307'
valueset "End Stage Renal Disease": 'urn:oid:2.16.840.1.113883.3.526.3.353'
valueset "ESRD Monthly Outpatient Services": 'urn:oid:2.16.840.1.113883.3.464.1003.109.12.1014'
valueset "Essential Hypertension": 'urn:oid:2.16.840.1.113883.3.464.1003.104.12.1011'
valueset "Ethnicity": 'urn:oid:2.16.840.1.114222.4.11.837'
valueset "Kidney Transplant": 'urn:oid:2.16.840.1.113883.3.464.1003.109.12.1012'
valueset "Kidney Transplant Recipient": 'urn:oid:2.16.840.1.113883.3.464.1003.109.12.1029'
valueset "ONC Administrative Sex": 'urn:oid:2.16.840.1.113762.1.4.1'
valueset "Payer Type": 'urn:oid:2.16.840.1.114222.4.11.3591'
valueset "Pregnancy": 'urn:oid:2.16.840.1.113883.3.526.3.378'
valueset "Race": 'urn:oid:2.16.840.1.114222.4.11.836'

code "Diastolic blood pressure (1)": '8462-4' from "LOINC:2.6" display 'Diastolic blood pressure'
code "Systolic blood pressure": '8480-6' from "LOINC" display 'Systolic blood pressure'




parameter "Measurement Period" Interval<DateTime>

context Patient

define "SDE Ethnicity":
  ["Patient Characteristic Ethnicity": "Ethnicity"]

define "SDE Payer":
  ["Patient Characteristic Payer": "Payer Type"]

define "SDE Race":
  ["Patient Characteristic Race": "Race"]

define "SDE Sex":
  ["Patient Characteristic Sex": "ONC Administrative Sex"]

define "Denominator":
  "Initial Population"

define "Has Diastolic Blood Pressure Less Than 90":
  "Lowest Diastolic Reading on Most Recent Blood Pressure Day".result < 90 'mm[Hg]'

define "Has Systolic Blood Pressure Less Than 140":
  "Lowest Systolic Reading on Most Recent Blood Pressure Day".result < 140 'mm[Hg]'

define "End Stage Renal Disease Procedures":
  ( ["Procedure, Performed": "Kidney Transplant"]
    union ["Procedure, Performed": "Dialysis Services"] ) ESRDProcedure
    where end of Global."NormalizeInterval" ( ESRDProcedure.relevantDatetime, ESRDProcedure.relevantPeriod ) on or before end of "Measurement Period"


define "End Stage Renal Disease Encounter":
  ["Encounter, Performed": "ESRD Monthly Outpatient Services"] ESRDEncounter
    where ESRDEncounter.relevantPeriod starts on or before end of "Measurement Period"

define "Blood Pressure Days":
  ( "Qualifying Diastolic Blood Pressure Reading" DBPExam
      return date from Global."LatestOf" ( DBPExam.relevantDatetime, DBPExam.relevantPeriod )
  )
    intersect ( "Qualifying Systolic Blood Pressure Reading" SBPExam
        return date from Global."LatestOf" ( SBPExam.relevantDatetime, SBPExam.relevantPeriod )
    )

define "Essential Hypertension Diagnosis":
  ["Diagnosis": "Essential Hypertension"] Hypertension
    where Hypertension.prevalencePeriod overlaps Interval[start of "Measurement Period", start of "Measurement Period" + 6 months )

define "Lowest Systolic Reading on Most Recent Blood Pressure Day":
  First("Qualifying Systolic Blood Pressure Reading" SBPReading
      where Global."LatestOf"(SBPReading.relevantDatetime, SBPReading.relevantPeriod) same day as "Most Recent Blood Pressure Day"
      sort by(result as Quantity)
  )

define "Lowest Diastolic Reading on Most Recent Blood Pressure Day":
  First("Qualifying Diastolic Blood Pressure Reading" DBPReading
      where Global."LatestOf"(DBPReading.relevantDatetime, DBPReading.relevantPeriod) same day as "Most Recent Blood Pressure Day"
      sort by(result as Quantity)
  )

define "Most Recent Blood Pressure Day":
  Last("Blood Pressure Days" BPDays
      sort asc
  )

define "Pregnancy or Renal Diagnosis":
  ( ["Diagnosis": "Pregnancy"]
    union ["Diagnosis": "End Stage Renal Disease"]
    union ["Diagnosis": "Kidney Transplant Recipient"]
    union ["Diagnosis": "Chronic Kidney Disease, Stage 5"] ) PregnancyESRDDiagnosis
    where PregnancyESRDDiagnosis.prevalencePeriod overlaps "Measurement Period"

define "Numerator":
  "Has Systolic Blood Pressure Less Than 140"
    and "Has Diastolic Blood Pressure Less Than 90"

define "Qualifying Diastolic Blood Pressure Reading":
  ["Physical Exam, Performed": "Diastolic blood pressure"] DiastolicBP
    without ( ["Encounter, Performed": "Encounter Inpatient"]
      union ["Encounter, Performed": "Emergency Department Evaluation and Management Visit"] ) DisqualifyingEncounter
      such that Global."LatestOf" ( DiastolicBP.relevantDatetime, DiastolicBP.relevantPeriod ) during day of DisqualifyingEncounter.relevantPeriod
    where DiastolicBP.result.unit = 'mm[Hg]'
      and Global."LatestOf" ( DiastolicBP.relevantDatetime, DiastolicBP.relevantPeriod ) during day of "Measurement Period"

define "Qualifying Systolic Blood Pressure Reading":
  ["Physical Exam, Performed": "Systolic blood pressure"] SystolicBP
    without ( ["Encounter, Performed": "Encounter Inpatient"]
      union ["Encounter, Performed": "Emergency Department Evaluation and Management Visit"] ) DisqualifyingEncounter
      such that Global."LatestOf" ( SystolicBP.relevantDatetime, SystolicBP.relevantPeriod ) during day of DisqualifyingEncounter.relevantPeriod
    where SystolicBP.result.unit = 'mm[Hg]'
      and Global."LatestOf" ( SystolicBP.relevantDatetime, SystolicBP.relevantPeriod ) during day of "Measurement Period"

define "Initial Population":
  AgeInYearsAt(date from 
    end of "Measurement Period"
  ) in Interval[18, 85]
    and exists "Essential Hypertension Diagnosis"
    and exists AdultOutpatientEncounters."Qualifying Encounters"

define "Denominator Exclusions":
  Hospice."Has Hospice Services"
    or exists ( "Pregnancy or Renal Diagnosis" )
    or exists ( "End Stage Renal Disease Procedures" )
    or exists ( "End Stage Renal Disease Encounter" )
    or AIFrailLTCF."Is Age 66 to 80 with Advanced Illness and Frailty or Is Age 81 or Older with Frailty"
    or AIFrailLTCF."Is Age 66 or Older Living Long Term in a Nursing Home"
    or PalliativeCare."Has Palliative Care in the Measurement Period"
`;
