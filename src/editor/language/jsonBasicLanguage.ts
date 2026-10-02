import type * as monaco from "monaco-editor";

export const JSON_BASIC_LANGUAGE_ID = "json-basic";

type MonacoApi = typeof monaco;

// Keep JSON highlighting on the main thread to avoid JSON worker version conflicts
// across micro-frontends that may bundle different Monaco instances.
export const registerJsonBasicLanguage = (monacoInstance: MonacoApi): void => {
  const getLanguages = monacoInstance.languages?.getLanguages;
  const languages = typeof getLanguages === "function" ? getLanguages() : [];
  const alreadyRegistered = languages.some(
    (language) => language.id === JSON_BASIC_LANGUAGE_ID
  );

  if (alreadyRegistered) {
    return;
  }

  monacoInstance.languages.register({ id: JSON_BASIC_LANGUAGE_ID });

  monacoInstance.languages.setMonarchTokensProvider(JSON_BASIC_LANGUAGE_ID, {
    tokenizer: {
      root: [
        [/"(?:[^"\\]|\\.)*"\s*(?=:)/, "type"],
        [/"(?:[^"\\]|\\.)*"/, "string"],
        [/\b(?:true|false|null)\b/, "keyword"],
        [/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/, "number"],
        [/[{}[\]]/, "delimiter.bracket"],
        [/[,:]/, "delimiter"],
      ],
    },
  } as monaco.languages.IMonarchLanguage);

  monacoInstance.languages.setLanguageConfiguration(JSON_BASIC_LANGUAGE_ID, {
    brackets: [
      ["{", "}"],
      ["[", "]"],
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: '"', close: '"' },
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: '"', close: '"' },
    ],
  });
};
