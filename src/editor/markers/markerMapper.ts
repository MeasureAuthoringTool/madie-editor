import * as monaco from "monaco-editor";

export interface EditorAnnotation {
  row: number;
  column: number;
  type: string;
  text: string;
}

export interface EditorMarkerPoint {
  row: number;
  column: number;
}

export interface EditorMarkerRange {
  start: EditorMarkerPoint;
  end: EditorMarkerPoint;
}

export interface EditorErrorMarker {
  range: EditorMarkerRange;
  clazz?: string;
  type?: string;
}

const toSeverity = (type?: string): monaco.MarkerSeverity => {
  switch (type?.toLowerCase()) {
    case "warning":
      return monaco.MarkerSeverity.Warning;
    case "info":
      return monaco.MarkerSeverity.Info;
    default:
      return monaco.MarkerSeverity.Error;
  }
};

const toOneBased = (value?: number, fallback = 0): number =>
  Math.max(1, (value ?? fallback) + 1);

export const mapToMonacoMarkers = (
  annotations: EditorAnnotation[] = [],
  errorMarkers: EditorErrorMarker[] = []
): monaco.editor.IMarkerData[] => {
  const annotationMarkers = annotations.map((annotation) => ({
    startLineNumber: toOneBased(annotation.row),
    startColumn: toOneBased(annotation.column),
    endLineNumber: toOneBased(annotation.row),
    endColumn: toOneBased(annotation.column, 1),
    message: annotation.text,
    severity: toSeverity(annotation.type),
  }));

  const parsedMarkers = errorMarkers.map((marker) => {
    const startLineNumber = toOneBased(marker?.range?.start?.row);
    const endLineNumber = toOneBased(
      marker?.range?.end?.row,
      marker?.range?.start?.row
    );
    const startColumn = toOneBased(marker?.range?.start?.column);
    const endColumn = Math.max(
      startColumn + 1,
      toOneBased(marker?.range?.end?.column, marker?.range?.start?.column)
    );

    return {
      startLineNumber,
      startColumn,
      endLineNumber,
      endColumn,
      message: marker?.clazz || "CQL validation error",
      severity: monaco.MarkerSeverity.Error,
    };
  });

  return [...annotationMarkers, ...parsedMarkers];
};
