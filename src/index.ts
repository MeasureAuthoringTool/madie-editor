// ─── Components ──────────────────────────────────────────────────────────────
export { default as MadieEditor } from "./AceEditor/madie-ace-editor";
export { default as MadieTerminologyEditor } from "./cqlEditorWithTerminology/CqlEditorWithTerminology";

// ─── Functions ────────────────────────────────────────────────────────────────
export {
  parseEditorContent as parseContent,
  updateEditorContent as synchingEditorCqlContent,
  isUsingStatementEmpty as isUsingEmpty,
} from "./AceEditor/madie-ace-editor";

export { useGetAllErrors as validateContent } from "./validations/editorValidation";

// ─── Component types ──────────────────────────────────────────────────────────
export type {
  EditorPropsType,
  UpdatedCqlObject,
  ParsedCqlObject,
} from "./AceEditor/madie-ace-editor";

// ─── Editor utility types ─────────────────────────────────────────────────────
export type {
  EditorAnnotation,
  EditorErrorMarker,
  CQLFunction,
  CQLFunctionArgument,
  Point,
  Range,
} from "./types";

// ─── Domain types ─────────────────────────────────────────────────────────────
export type { Definition } from "./CqlBuilderPanel/definitionsSection/definitionBuilder/DefinitionBuilder";
export type { SelectedLibrary } from "./CqlBuilderPanel/Includes/CqlLibraryDetailsDialog";

// ─── API types ────────────────────────────────────────────────────────────────
export type {
  Code,
  CqlMetaData,
  Parameter,
  ValueSetForSearch,
  ValueSet,
} from "./api/useTerminologyServiceApi";

export type {
  ElmTranslationError,
  ElmTranslationExternalError,
  ElmTranslation,
  ElmTranslationLibrary,
} from "./api/TranslatedElmModels";

export type { ValidationResult } from "./validations/editorValidation";
