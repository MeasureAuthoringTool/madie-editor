import React, { FC } from "react";
import ReactDOM from "react-dom";
import singleSpaReact from "single-spa-react";
import Root from "./root.component";
import MadieAceEditor, {
  EditorPropsType,
  parseEditorContent,
} from "./AceEditor/madie-ace-editor";
import CqlError from "@madie/cql-antlr-parser/dist/src/dto/CqlError";

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
export type { EditorPropsType as MadieEditorPropsType };

export const { bootstrap, mount, unmount } = lifecycles;
