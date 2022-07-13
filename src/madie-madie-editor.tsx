import React, { FC } from "react";
import ReactDOM from "react-dom";
import singleSpaReact from "single-spa-react";
import Root from "./root.component";
import MadieAceEditor, {
  EditorPropsType,
  parseEditorContent,
  useTranslateCqlToElm,
  useValidateCodes,
  validateValueSets,
} from "./AceEditor/madie-ace-editor";
import CqlError from "@madie/cql-antlr-parser/dist/src/dto/CqlError";
import {
  ElmTranslation,
  ElmTranslationError,
  ElmValueSet,
} from "./api/useElmTranslationServiceApi";
import { CustomCqlCode } from "./api/useTerminologyServiceApi";

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: Root,
  errorBoundary(err, info, props) {
    // Customize the root error boundary for your microfrontend here.
    return null;
  },
});

export const MadieEditor: FC<EditorPropsType> = MadieAceEditor;
export const parseContent: (content: string) => CqlError[] = parseEditorContent;

export const translateContentCqlToElm: (
  content: string
) => Promise<ElmTranslation> = useTranslateCqlToElm;

export const validateContentCodes: (
  customCqlCodes: CustomCqlCode[],
  loggedInUMLS: boolean
) => Promise<ElmTranslationError[]> = useValidateCodes;

export const validateContentValueSets: (
  valuesetsArray: ElmValueSet[],
  loggedInUMLS: boolean
) => Promise<ElmTranslationError[]> = validateValueSets;

export type { EditorPropsType as MadieEditorPropsType };

export const { bootstrap, mount, unmount } = lifecycles;
