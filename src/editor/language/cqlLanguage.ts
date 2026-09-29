import * as monaco from "monaco-editor";
import { CQL_EDITOR_LANGUAGE_ID } from "../MonacoEditorConfig";
import {
  cqlBuiltinConstants,
  cqlFunctionKeywords,
  cqlKeywords,
  cqlTimingKeywords,
} from "./cqlTokens";

let languageRegistered = false;

export const registerCqlLanguage = () => {
  if (languageRegistered) {
    return;
  }

  monaco.languages.register({ id: CQL_EDITOR_LANGUAGE_ID });

  monaco.languages.setMonarchTokensProvider(CQL_EDITOR_LANGUAGE_ID, {
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

  monaco.languages.setLanguageConfiguration(CQL_EDITOR_LANGUAGE_ID, {
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

  languageRegistered = true;
};
