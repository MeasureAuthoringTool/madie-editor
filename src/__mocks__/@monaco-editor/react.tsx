import React from "react";

// Lightweight mock for @monaco-editor/react used in Jest/jsdom tests
const MonacoEditor = ({
  value,
  onChange,
  onMount,
  height,
  options,
}: {
  value?: string;
  onChange?: (val: string) => void;
  onMount?: (editor: any, monaco: any) => void;
  height?: string;
  options?: Record<string, any>;
}) => {
  React.useEffect(() => {
    if (onMount) {
      const fakeEditor = {
        getValue: () => value ?? "",
        getModel: () => null,
        getAction: () => null,
        addCommand: jest.fn(),
        getDomNode: () => null,
      };
      const fakeMonaco = {
        editor: { setModelMarkers: jest.fn() },
        KeyCode: { Escape: 27 },
        MarkerSeverity: { Error: 8 },
        languages: {
          getLanguages: () => [],
          register: jest.fn(),
          setMonarchTokensProvider: jest.fn(),
          setLanguageConfiguration: jest.fn(),
          registerCompletionItemProvider: jest.fn(),
          CompletionItemKind: {
            Keyword: 17,
            Function: 2,
            Constant: 14,
          },
        },
      };
      onMount(fakeEditor, fakeMonaco);
    }
  }, []);

  return (
    <div
      data-testid="monaco-editor"
      style={{ height: height ?? "100%", width: "100%" }}
    >
      <textarea
        aria-label="Cql editor"
        readOnly={options?.readOnly}
        value={value ?? ""}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
    </div>
  );
};

export default MonacoEditor;
export type Monaco = any;
