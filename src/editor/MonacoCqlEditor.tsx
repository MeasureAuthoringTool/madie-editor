import React, { useEffect, useMemo, useRef, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";
import * as _ from "lodash";
import * as monaco from "monaco-editor";
import {
  CQL_EDITOR_LANGUAGE_ID,
  CQL_EDITOR_OPTIONS,
  CQL_EDITOR_THEME,
  CQL_EDITOR_THEME_ID,
} from "./MonacoEditorConfig";
import { registerCqlLanguage } from "./language/cqlLanguage";
import {
  EditorAnnotation,
  EditorErrorMarker,
  mapToMonacoMarkers,
} from "./markers/markerMapper";
import { buildDecorations } from "./decorations/decorationManager";
import "./monaco-custom.css";
import { getSearchToggleEventName } from "./EditorUtils";

// Make @monaco-editor/react use the bundled monaco instance instead of
// lazy-loading a separate copy from a CDN. Without this, the imported
// `monaco` (used for themes, language registration and markers) is a
// DIFFERENT instance than the one the <Editor /> renders, so none of that
// configuration (including the theme) takes effect.
loader?.config?.({ monaco });

type MonacoApi = typeof monaco;

export interface MonacoParseResult {
  annotations: EditorAnnotation[];
  markers: EditorErrorMarker[];
}

export interface MonacoEditorCursorPosition {
  row: number;
  column: number;
}

interface MonacoCqlEditorProps {
  value: string;
  onChange?: (value: string) => void;
  height?: string;
  parseDebounceTime?: number;
  inboundAnnotations?: EditorAnnotation[];
  inboundErrorMarkers?: EditorErrorMarker[];
  readOnly?: boolean;
  validationsEnabled?: boolean;
  enableToggleSearchEvent?: boolean;
  setOutboundAnnotations?: Function;
  onMountEditor?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  onCursorPositionChange?: (position: MonacoEditorCursorPosition) => void;
  parseValue: (nextValue: string) => MonacoParseResult;
}

const MonacoCqlEditor = ({
  value,
  onChange,
  height = "100%",
  parseDebounceTime = 1500,
  inboundAnnotations = [],
  inboundErrorMarkers = [],
  readOnly = false,
  validationsEnabled = true,
  enableToggleSearchEvent = false,
  setOutboundAnnotations,
  onMountEditor,
  onCursorPositionChange,
  parseValue,
}: MonacoCqlEditorProps) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const modelRef = useRef<monaco.editor.ITextModel | null>(null);
  const decorationsRef =
    useRef<monaco.editor.IEditorDecorationsCollection | null>(null);

  const searchToggleEventName = useMemo(
    () => getSearchToggleEventName(enableToggleSearchEvent),
    [enableToggleSearchEvent]
  );

  const [parserAnnotations, setParserAnnotations] = useState<
    EditorAnnotation[]
  >([]);
  const [parseErrorMarkers, setParseErrorMarkers] = useState<
    EditorErrorMarker[]
  >([]);

  const allAnnotations = useMemo(
    () => [...inboundAnnotations, ...parserAnnotations],
    [inboundAnnotations, parserAnnotations]
  );

  const allErrorMarkers = useMemo(
    () => [...inboundErrorMarkers, ...parseErrorMarkers],
    [inboundErrorMarkers, parseErrorMarkers]
  );

  const debouncedParse = useRef(
    _.debounce((nextValue: string) => {
      const result = parseValue(nextValue);
      setParserAnnotations(result.annotations);
      setParseErrorMarkers(result.markers);
    }, parseDebounceTime)
  ).current;

  useEffect(() => {
    return () => {
      debouncedParse.cancel();
    };
  }, [debouncedParse]);

  useEffect(() => {
    if (validationsEnabled) {
      debouncedParse(value || "");
    }
  }, [value, validationsEnabled, debouncedParse]);

  useEffect(() => {
    if (!modelRef.current || !validationsEnabled) {
      return;
    }

    monaco.editor.setModelMarkers(
      modelRef.current,
      "madie-cql",
      mapToMonacoMarkers(allAnnotations, allErrorMarkers)
    );

    if (setOutboundAnnotations) {
      setOutboundAnnotations(allAnnotations);
    }

    if (decorationsRef.current) {
      decorationsRef.current.set(
        buildDecorations(allAnnotations, allErrorMarkers)
      );
    }
  }, [
    allAnnotations,
    allErrorMarkers,
    validationsEnabled,
    setOutboundAnnotations,
  ]);

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
    <Editor
      language={CQL_EDITOR_LANGUAGE_ID}
      theme={CQL_EDITOR_THEME_ID}
      value={value}
      options={{ ...CQL_EDITOR_OPTIONS, readOnly }}
      height={height}
      onChange={(nextValue: string | undefined) => onChange?.(nextValue ?? "")}
      beforeMount={(monacoInstance: MonacoApi) => {
        registerCqlLanguage();
        monacoInstance.editor.defineTheme(
          CQL_EDITOR_THEME_ID,
          CQL_EDITOR_THEME
        );
      }}
      onMount={(
        editor: monaco.editor.IStandaloneCodeEditor,
        modelMonaco: MonacoApi
      ) => {
        editorRef.current = editor;
        modelRef.current = editor.getModel?.() ?? null;
        decorationsRef.current =
          editor.createDecorationsCollection?.([]) ?? null;
        onMountEditor?.(editor);

        editor.onDidFocusEditorText?.(() => {
          editor.updateOptions({ tabFocusMode: false });
        });

        editor.onDidChangeCursorPosition?.((event) => {
          onCursorPositionChange?.({
            row: event.position.lineNumber - 1,
            column: event.position.column - 1,
          });
        });

        // Press Esc to return tab behavior to page navigation.
        editor.onKeyDown?.((event: monaco.IKeyboardEvent) => {
          if (event.keyCode === modelMonaco.KeyCode.Escape) {
            editor.updateOptions({ tabFocusMode: true });
          }
        });
      }}
    />
  );
};

export default MonacoCqlEditor;
