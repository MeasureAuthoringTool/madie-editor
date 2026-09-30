import { buildDecorations } from "./decorationManager";

describe("decorationManager", () => {
  it("returns an empty list when no inputs are provided", () => {
    expect(buildDecorations()).toEqual([]);
  });

  it("maps annotation severities including case-insensitive values and default fallback", () => {
    const decorations = buildDecorations([
      { row: 0, column: 0, type: "warning", text: "warn" },
      { row: 1, column: 0, type: "INFO", text: "info" },
      { row: 2, column: 0, type: "other", text: "fallback" },
    ] as any);

    expect(decorations.map((d) => d.options.glyphMarginClassName)).toEqual([
      "madie-cql-glyph-warning",
      "madie-cql-glyph-info",
      "madie-cql-glyph-error",
    ]);
    expect(decorations[0].options.glyphMarginHoverMessage).toEqual([
      { value: "warn" },
    ]);
    expect(decorations[1].options.isWholeLine).toBe(true);
  });

  it("maps annotation rows to one-based line numbers and enforces a minimum of 1", () => {
    const decorations = buildDecorations([
      { row: -3, column: 0, type: "error", text: "negative row" },
      { row: 0, column: 0, type: "warning", text: "zero row" },
      { row: 5, column: 0, type: "info", text: "positive row" },
      { row: undefined, column: 0, type: undefined, text: "undefined row" },
    ] as any);

    expect(
      decorations.map((d) => [
        d.range.startLineNumber,
        d.range.startColumn,
        d.range.endLineNumber,
        d.range.endColumn,
      ])
    ).toEqual([
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [6, 1, 6, 1],
      [1, 1, 1, 1],
    ]);
    expect(decorations[3].options.glyphMarginClassName).toBe(
      "madie-cql-glyph-error"
    );
  });

  it("maps error markers to error glyphs and falls back to line 1 for missing rows", () => {
    const decorations = buildDecorations([], [
      { range: { start: { row: 2, column: 1 }, end: { row: 2, column: 2 } } },
      { range: { start: {} as any, end: {} as any } },
    ] as any);

    expect(decorations).toHaveLength(2);
    expect(decorations[0].options.glyphMarginClassName).toBe(
      "madie-cql-glyph-error"
    );
    expect(decorations[0].range.startLineNumber).toBe(3);
    expect(decorations[1].range.startLineNumber).toBe(1);
    expect(decorations[1].options.glyphMarginHoverMessage).toBeUndefined();
  });

  it("returns annotation decorations first, then marker decorations", () => {
    const decorations = buildDecorations(
      [{ row: 0, column: 0, type: "info", text: "annotation" }] as any,
      [
        {
          range: { start: { row: 0, column: 0 }, end: { row: 0, column: 1 } },
        },
      ] as any
    );

    expect(decorations).toHaveLength(2);
    expect(decorations[0].options.glyphMarginHoverMessage).toEqual([
      { value: "annotation" },
    ]);
    expect(decorations[1].options.glyphMarginHoverMessage).toBeUndefined();
  });
});
