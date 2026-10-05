import * as monaco from "monaco-editor";
import {
  EditorAnnotation,
  EditorErrorMarker,
  mapToMonacoMarkers,
} from "./markerMapper";

describe("markerMapper", () => {
  it("returns an empty list when no inputs are provided", () => {
    expect(mapToMonacoMarkers()).toEqual([]);
  });

  it("maps annotation severities for error, warning, and info", () => {
    const annotations: EditorAnnotation[] = [
      { row: 0, column: 0, type: "error", text: "error msg" },
      { row: 1, column: 2, type: "warning", text: "warning msg" },
      { row: 2, column: 3, type: "info", text: "info msg" },
    ];

    const result = mapToMonacoMarkers(annotations, []);

    expect(result).toEqual([
      {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 1,
        message: "error msg",
        severity: monaco.MarkerSeverity.Error,
      },
      {
        startLineNumber: 2,
        startColumn: 3,
        endLineNumber: 2,
        endColumn: 3,
        message: "warning msg",
        severity: monaco.MarkerSeverity.Warning,
      },
      {
        startLineNumber: 3,
        startColumn: 4,
        endLineNumber: 3,
        endColumn: 4,
        message: "info msg",
        severity: monaco.MarkerSeverity.Info,
      },
    ]);
  });

  it("maps unknown annotation type to error severity", () => {
    const result = mapToMonacoMarkers([
      { row: 0, column: 0, type: "other", text: "fallback severity" },
    ]);

    expect(result[0].severity).toEqual(monaco.MarkerSeverity.Error);
  });

  it("maps parsed markers and uses clazz fallback message", () => {
    const parsedMarkers: EditorErrorMarker[] = [
      {
        range: {
          start: { row: 3, column: 4 },
          end: { row: 3, column: 9 },
        },
        clazz: "custom message",
      },
      {
        range: {
          start: { row: 4, column: 5 },
          end: { row: 4, column: 5 },
        },
      },
    ];

    const result = mapToMonacoMarkers([], parsedMarkers);

    expect(result).toEqual([
      {
        startLineNumber: 4,
        startColumn: 5,
        endLineNumber: 4,
        endColumn: 10,
        message: "custom message",
        severity: monaco.MarkerSeverity.Error,
      },
      {
        startLineNumber: 5,
        startColumn: 6,
        endLineNumber: 5,
        endColumn: 7,
        message: "CQL validation error",
        severity: monaco.MarkerSeverity.Error,
      },
    ]);
  });

  it("falls back from missing end positions and enforces one-based minimum", () => {
    const parsedMarkers: EditorErrorMarker[] = [
      {
        range: {
          start: { row: -1, column: -1 },
          end: {} as any,
        },
      },
    ];

    const result = mapToMonacoMarkers([], parsedMarkers);

    expect(result[0]).toEqual({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: 2,
      message: "CQL validation error",
      severity: monaco.MarkerSeverity.Error,
    });
  });

  it("returns annotation markers first, then parsed markers", () => {
    const annotations: EditorAnnotation[] = [
      { row: 0, column: 0, type: "error", text: "annotation first" },
    ];
    const parsedMarkers: EditorErrorMarker[] = [
      {
        range: {
          start: { row: 0, column: 0 },
          end: { row: 0, column: 1 },
        },
      },
    ];

    const result = mapToMonacoMarkers(annotations, parsedMarkers);

    expect(result[0].message).toEqual("annotation first");
    expect(result[1].message).toEqual("CQL validation error");
  });
});
