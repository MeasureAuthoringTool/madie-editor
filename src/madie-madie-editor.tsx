import React, { FC } from "react";
import ReactDOM from "react-dom";
import singleSpaReact from "single-spa-react";
import Root from "./root.component";
import MadieAceEditor, {
  EditorPropsType,
  parseEditorContent,
  isUsingStatementEmpty,
  parsingEditorCqlContent,
} from "./AceEditor/madie-ace-editor";
import CqlEditorWithTerminology from "./cqlEditorWithTerminology/CqlEditorWithTerminology";
import CqlError from "@madie/cql-antlr-parser/dist/src/dto/CqlError";
import { ElmTranslationError } from "./api/useElmTranslationServiceApi";
import {
  ValidationResult,
  useGetAllErrors,
} from "../src/validations/editorValidation";
import { ParsedCql } from "./model/ParsedCql";

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: Root,
  errorBoundary(err, info, props) {
    // Customize the root error boundary for your microfrontend here.
    return null;
  },
});

export const MadieTerminologyEditor: FC<EditorPropsType> =
  CqlEditorWithTerminology;
export const MadieEditor: FC<EditorPropsType> = MadieAceEditor;
export const parseContent: (content: string) => CqlError[] = parseEditorContent;

export type { ElmTranslationError };
export const validateContent: (content: string) => Promise<ValidationResult> =
  useGetAllErrors;

export const synchingEditorCqlContent: (
  editorVal: string,
  existingCql: string,
  libraryName: string,
  existingCqlLibraryName: string,
  versionString: string,
  usingName: string,
  usingVersion: string,
  triggeredFrom: string
) => any = parsingEditorCqlContent;

export const isUsingEmpty: (editorVal: string) => boolean =
  isUsingStatementEmpty;

export type { EditorPropsType as MadieEditorPropsType };

export const { bootstrap, mount, unmount } = lifecycles;
