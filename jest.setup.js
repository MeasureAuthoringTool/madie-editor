import util from "@madie/madie-util";

// Mock SystemJS
global.System = {
  import: jest.fn(mockImport),
};

function mockImport(importName) {
  if (importName === "@madie/madie-util") {
    return Promise.resolve(util);
  }
  console.warn("No mock module found");
  return Promise.resolve({});
}

jest.mock(
  "monaco-editor",
  () => {
    class Range {
      constructor(startLineNumber, startColumn, endLineNumber, endColumn) {
        this.startLineNumber = startLineNumber;
        this.startColumn = startColumn;
        this.endLineNumber = endLineNumber;
        this.endColumn = endColumn;
      }
    }

    return {
      MarkerSeverity: { Hint: 1, Info: 2, Warning: 4, Error: 8 },
      KeyCode: { Escape: 9 },
      Range,
      languages: {
        register: jest.fn(),
        setMonarchTokensProvider: jest.fn(),
        setLanguageConfiguration: jest.fn(),
      },
      editor: {
        defineTheme: jest.fn(),
        setTheme: jest.fn(),
        setModelMarkers: jest.fn(),
      },
    };
  },
  { virtual: true }
);

jest.mock(
  "@monaco-editor/react",
  () => {
    const React = require("react");
    const monaco = require("monaco-editor");

    return {
      __esModule: true,
      loader: {
        config: jest.fn(),
        init: jest.fn(() => Promise.resolve(monaco)),
      },
      default: ({ value, onChange, onMount, beforeMount, options }) => {
        React.useEffect(() => {
          if (beforeMount) {
            beforeMount(monaco);
          }

          const fakeEditor = {
            getModel: () => ({ id: "model" }),
            createDecorationsCollection: () => ({ set: jest.fn() }),
            onDidFocusEditorText: jest.fn(),
            onKeyDown: jest.fn(),
            updateOptions: jest.fn(),
            getAction: () => ({ run: jest.fn() }),
          };

          if (onMount) {
            onMount(fakeEditor, monaco);
          }
        }, [onMount, beforeMount]);

        return React.createElement("textarea", {
          "aria-label": "Cql editor",
          value: value || "",
          readOnly: Boolean(options?.readOnly),
          onChange: (event) => onChange?.(event.target.value),
        });
      },
    };
  },
  { virtual: true }
);

jest.setTimeout(30000);
