import React, { useEffect, useMemo, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import type * as monaco from "monaco-editor";
import {
  JSON_BASIC_LANGUAGE_ID,
  registerJsonBasicLanguage,
} from "./language/jsonBasicLanguage";

type MonacoApi = typeof monaco;

type ToggleSearchEventConfig = false | true | { eventName: string };

export interface JsonMonacoEditorProps {
  value: string;
  onChange?: (value: string) => void;
  height?: string | number;
  width?: string | number;
  readOnly?: boolean;
  theme?: string;
  ariaLabel?: string;
  testId?: string;
  inputTestId?: string;
  enableToggleSearchEvent?: ToggleSearchEventConfig;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
  onEditorMount?: (
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: MonacoApi
  ) => void;
}

const DEFAULT_EDITOR_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions =
  {
    minimap: { enabled: false },
    lineNumbers: "on",
    scrollBeyondLastLine: false,
    tabSize: 2,
    automaticLayout: true,
    wordWrap: "on",
  };

const getSearchToggleEventName = (
  enableToggleSearchEvent: ToggleSearchEventConfig | undefined
): string | undefined => {
  if (!enableToggleSearchEvent) {
    return undefined;
  }

  if (enableToggleSearchEvent === true) {
    return "toggleEditorSearchBox";
  }

  return enableToggleSearchEvent.eventName;
};

const JsonMonacoEditor = ({
  value,
  onChange,
  height = "100%",
  width = "100%",
  readOnly = false,
  theme = "vs-dark",
  ariaLabel = "JSON editor",
  testId,
  inputTestId,
  enableToggleSearchEvent = false,
  options,
  onEditorMount,
}: JsonMonacoEditorProps) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const searchToggleEventName = useMemo(
    () => getSearchToggleEventName(enableToggleSearchEvent),
    [enableToggleSearchEvent]
  );

  useEffect(() => {
    if (!searchToggleEventName) {
      return;
    }

    const toggleSearchBox = () => {
      editorRef.current?.getAction("actions.find")?.run();
    };

    window.addEventListener(searchToggleEventName, toggleSearchBox);
    return () => {
      window.removeEventListener(searchToggleEventName, toggleSearchBox);
    };
  }, [searchToggleEventName]);

  return (
    <div data-testid={testId} style={{ width, height }}>
      <MonacoEditor
        language={JSON_BASIC_LANGUAGE_ID}
        theme={theme}
        value={value ?? ""}
        width={width}
        height={height}
        options={{ ...DEFAULT_EDITOR_OPTIONS, ...options, readOnly }}
        beforeMount={(monacoInstance: MonacoApi) => {
          registerJsonBasicLanguage(monacoInstance);
        }}
        onChange={(nextValue: string | undefined) =>
          onChange?.(nextValue ?? "")
        }
        onMount={(
          editor: monaco.editor.IStandaloneCodeEditor,
          monacoInstance: MonacoApi
        ) => {
          editorRef.current = editor;

          const input = editor
            .getDomNode?.()
            ?.querySelector("textarea.inputarea") as HTMLTextAreaElement | null;

          if (input) {
            input.setAttribute("aria-label", ariaLabel);
            if (inputTestId) {
              input.setAttribute("data-testid", inputTestId);
            }
          }

          editor.onDidFocusEditorText?.(() => {
            editor.updateOptions?.({ tabFocusMode: false });
          });

          // Press Esc to return tab behavior to page navigation.
          editor.onKeyDown?.((event: monaco.IKeyboardEvent) => {
            if (event.keyCode === monacoInstance.KeyCode.Escape) {
              editor.updateOptions?.({ tabFocusMode: true });
            }
          });

          onEditorMount?.(editor, monacoInstance);
        }}
      />
    </div>
  );
};

export default JsonMonacoEditor;
