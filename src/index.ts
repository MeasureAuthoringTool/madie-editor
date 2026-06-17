import React, { FC } from "react";
import MadieAceEditor, {
  EditorPropsType,
  parseEditorContent,
  isUsingStatementEmpty,
  updateEditorContent,
  UpdatedCqlObject,
} from "./AceEditor/madie-ace-editor";
import CqlEditorWithTerminology from "./cqlEditorWithTerminology/CqlEditorWithTerminology";
import CqlError from "@madie/cql-antlr-parser/dist/src/dto/CqlError";
import { ElmTranslationError } from "./api/TranslatedElmModels";
import {
  ValidationResult,
  useGetAllErrors,
} from "../src/validations/editorValidation";
import { TerminologyServiceApi } from "./api/useTerminologyServiceApi";

export const MadieTerminologyEditor: FC<EditorPropsType> =
  CqlEditorWithTerminology;
export const MadieEditor: FC<EditorPropsType> = MadieAceEditor;
export const parseContent: (content: string) => CqlError[] = parseEditorContent;

export type { ElmTranslationError };
export const validateContent: (
  content: string,
  checkContext: boolean,
  terminologyServiceApi: TerminologyServiceApi
) => Promise<ValidationResult> = useGetAllErrors;

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
