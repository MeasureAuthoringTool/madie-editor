import { editor } from "monaco-editor";

export const CQL_EDITOR_LANGUAGE_ID = "cql";
export const CQL_EDITOR_THEME_ID = "madie-cql-dark";

export const CQL_EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  fontSize: 14,
  lineNumbers: "on",
  minimap: { enabled: false },
  glyphMargin: true,
  scrollBeyondLastLine: false,
  tabSize: 2,
  wordWrap: "on",
};

export const CQL_EDITOR_THEME: editor.IStandaloneThemeData = {
  base: "vs-dark",
  inherit: true,
  rules: [
    { token: "keyword", foreground: "C586C0" },
    { token: "keyword.operator", foreground: "D4D4D4" },
    { token: "timingKeywords", foreground: "4EC9B0" },
    { token: "functionKeywords", foreground: "DCDCAA" },
    { token: "constant.language", foreground: "9CDCFE" },
    { token: "string", foreground: "CE9178" },
    { token: "comment", foreground: "6A9955" },
    { token: "number", foreground: "B5CEA8" },
  ],
  colors: {
    "editor.background": "#272822",
    "editorLineNumber.foreground": "#6e7681",
  },
};
