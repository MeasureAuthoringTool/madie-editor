import { CqlBuilderLookup, Lookup } from "../../model/CqlBuilderLookup";

const tjcMeasurementPeriod = {
  name: "Measurement Period",
  libraryName: "TJC",
  libraryAlias: "TJC",
  logic: "define",
  comment: "",
} as unknown as Lookup;
const sdeSex = {
  name: "SDE Sex",
  logic: "define",
  comment: "",
} as unknown as Lookup;
const inpatientEncounter = {
  name: "Inpatient Encounter",
  libraryName: "Global",
  libraryAlias: "Global",
  logic: "define",
  comment: "",
} as unknown as Lookup;
const ischemicStroke = {
  name: "Ischemic Stroke Encounters with Discharge Disposition",
  libraryName: "TJC",
  libraryAlias: "TJC",
  logic: "define",
  comment: "",
} as unknown as Lookup;
const sdeRace = {
  name: "SDE Race",
  logic: "define",
  comment: "",
} as unknown as Lookup;
const nonElectiveEncounter = {
  name: "Non Elective Encounter with Age",
  libraryName: "TJC",
  libraryAlias: "TJC",
  logic: "define",
  comment: "",
} as unknown as Lookup;
const encounterWithComfort = {
  name: "Encounter with Comfort Measures during Hospitalization",
  libraryName: "TJC",
  libraryAlias: "TJC",
  logic: "define",
  comment: "",
} as unknown as Lookup;
const initialPop = {
  name: "Initial Population",
  logic: "define",
  comment: "",
} as unknown as Lookup;
const denominator = {
  name: "denominator",
  logic: "define",
  comment: "",
} as unknown as Lookup;
const denominatorExclusion = {
  name: "denominatorExclusion",
  logic: "define",
  comment: "",
} as unknown as Lookup;
const numerator = {
  name: "numerator",
  logic: "define",
  comment: "",
} as unknown as Lookup;
const edEncounter = {
  name: "ED Encounter",
  libraryName: "Global",
  libraryAlias: "Global",
  logic: "define",
  comment: "",
} as unknown as Lookup;
export const cqlBuilderLookupsTypes = {
  parameters: [tjcMeasurementPeriod],
  definitions: [
    sdeSex,
    inpatientEncounter,
    ischemicStroke,
    sdeRace,
    nonElectiveEncounter,
    encounterWithComfort,
    initialPop,
    denominator,
    denominatorExclusion,
    numerator,
    edEncounter,
  ],
  functions: [],
  fluentFunctions: [],
} as unknown as CqlBuilderLookup;
