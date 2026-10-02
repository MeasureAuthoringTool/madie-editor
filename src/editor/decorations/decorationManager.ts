import * as monaco from "monaco-editor";
import { EditorAnnotation, EditorErrorMarker } from "../markers/markerMapper";

const toSeverityClass = (type?: string): string => {
  switch (type?.toLowerCase()) {
    case "warning":
      return "madie-cql-glyph-warning";
    case "info":
      return "madie-cql-glyph-info";
    default:
      return "madie-cql-glyph-error";
  }
};

const toLine = (row?: number): number => Math.max(1, (row ?? 0) + 1);

export const buildDecorations = (
  annotations: EditorAnnotation[] = [],
  errorMarkers: EditorErrorMarker[] = []
): monaco.editor.IModelDeltaDecoration[] => {
  const fromAnnotations = annotations.map((annotation) => ({
    range: new monaco.Range(
      toLine(annotation.row),
      1,
      toLine(annotation.row),
      1
    ),
    options: {
      glyphMarginClassName: toSeverityClass(annotation.type),
      glyphMarginHoverMessage: [{ value: annotation.text }],
      isWholeLine: true,
    },
  }));

  const fromMarkers = errorMarkers.map((marker) => ({
    range: new monaco.Range(
      toLine(marker?.range?.start?.row),
      1,
      toLine(marker?.range?.start?.row),
      1
    ),
    options: {
      glyphMarginClassName: "madie-cql-glyph-error",
      isWholeLine: true,
    },
  }));

  return [...fromAnnotations, ...fromMarkers];
};
