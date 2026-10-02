import { FC } from "react";
import MadieCqlEditor, {
  EditorPropsType,
  parseEditorContent,
  isUsingStatementEmpty,
  updateEditorContent,
  UpdatedCqlObject,
} from "./madieCqlEditor/MadieCqlEditor";
import CqlEditorWithTerminology from "./cqlEditorWithTerminology/CqlEditorWithTerminology";
import JsonMonacoEditor, {
  JsonMonacoEditorProps,
} from "./editor/JsonMonacoEditor";
import CqlError from "@madie/cql-antlr-parser/dist/src/dto/CqlError";
import { ElmTranslationError } from "./api/TranslatedElmModels";
import { ValidationResult, getAllErrors } from "./validations/editorValidation";
import { TerminologyServiceApi } from "./api/useTerminologyServiceApi";
import { QdmElmTranslationServiceApi } from "./api/useQdmElmTranslationServiceApi";
import { FhirElmTranslationServiceApi } from "./api/useFhirElmTranslationServiceApi";
import {
  EditorAnnotation,
  EditorErrorMarker,
} from "./editor/markers/markerMapper";

export const MadieTerminologyEditor: FC<EditorPropsType> =
  CqlEditorWithTerminology;
export { MadieCqlEditor };
export const MadieJsonEditor: FC<JsonMonacoEditorProps> = JsonMonacoEditor;
export const parseContent: (content: string) => CqlError[] = parseEditorContent;

export type { ElmTranslationError };
export const validateContent: (
  content: string,
  checkContext: boolean,
  terminologyServiceApi: TerminologyServiceApi,
  qdmApi: QdmElmTranslationServiceApi,
  fhirApi: FhirElmTranslationServiceApi
) => Promise<ValidationResult> = getAllErrors;

export const synchingEditorCqlContent: (
  editorVal: string,
  existingCql: string,
  libraryName: string,
  existingCqlLibraryName: string,
  versionString: string,
  usingName: string,
  usingVersion: string,
  triggeredFrom: string
) => Promise<UpdatedCqlObject> = updateEditorContent;

export const isUsingEmpty: (editorVal: string) => boolean =
  isUsingStatementEmpty;

export type { EditorPropsType as MadieEditorPropsType };
export type { JsonMonacoEditorProps };
export type { EditorAnnotation, EditorErrorMarker };
