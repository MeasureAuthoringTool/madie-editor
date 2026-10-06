import type * as monaco from "monaco-editor";
import { CQL_EDITOR_LANGUAGE_ID } from "../MonacoEditorConfig";
import {
  cqlBuiltinConstants,
  cqlFunctionKeywords,
  cqlKeywords,
  cqlTimingKeywords,
} from "./cqlTokens";

type MonacoApi = typeof monaco;

const registeredMonacoInstances = new WeakSet<MonacoApi>();

export const registerCqlLanguage = (monacoInstance: MonacoApi) => {
  if (registeredMonacoInstances.has(monacoInstance)) {
    return;
  }

  monacoInstance.languages.register({ id: CQL_EDITOR_LANGUAGE_ID });

  monacoInstance.languages.setMonarchTokensProvider(CQL_EDITOR_LANGUAGE_ID, {
    defaultToken: "",
    ignoreCase: true,
    keywords: cqlKeywords,
    timingKeywords: cqlTimingKeywords,
    functionKeywords: cqlFunctionKeywords,
    builtinConstants: cqlBuiltinConstants,
    operators: [
      "+",
      "-",
      "/",
      "//",
      "*",
      "%",
      "<@>",
      "@>",
      "<@",
      "&",
      "^",
      "~",
      "!~",
      "<",
      ">",
      "<=",
      "=>",
      "==",
      "!=",
      "<>",
      "=",
    ],
    tokenizer: {
      root: [
        [/\/\/.*/, "comment"],
        [/\/\*/, { token: "comment", next: "@comment" }],
        [/"([^"\\]|\\.)*"/, "string"],
        [/'([^'\\]|\\.)*'/, "string"],
        [/[+-]?\d+(?:(?:\.\d*)?(?:[eE][+-]?\d+)?)?\b/, "number"],
        [
          /[a-zA-Z_][\w]*/,
          {
            cases: {
              "@keywords": "keyword",
              "@timingKeywords": "timingKeywords",
              "@functionKeywords": "functionKeywords",
              "@builtinConstants": "constant.language",
              "@default": "identifier",
            },
          },
        ],
        [/[+\-/*%<>=!~^&@]+/, "keyword.operator"],
      ],
      comment: [
        [/[^/*]+/, "comment"],
        [/\*\//, { token: "comment", next: "@pop" }],
        [/[/*]/, "comment"],
      ],
    },
  });

  monacoInstance.languages.setLanguageConfiguration(CQL_EDITOR_LANGUAGE_ID, {
    comments: {
      lineComment: "//",
      blockComment: ["/*", "*/"],
    },
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
  });

  // TODO: Enable other providers as needed
  // monaco.languages.registerHoverProvider(...)
  // monaco.languages.registerCompletionItemProvider(...)
  // monaco.languages.registerDocumentSemanticTokensProvider(...)
  // monaco.languages.registerFoldingRangeProvider(...)
  // monaco.languages.registerCodeActionProvider(...)
  // monaco.languages.registerDocumentFormattingEditProvider(...)

  registeredMonacoInstances.add(monacoInstance);
};
