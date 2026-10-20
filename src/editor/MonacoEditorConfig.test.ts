import { CQL_EDITOR_THEME } from "./MonacoEditorConfig";

describe("CQL editor line numbers", () => {
  it("uses white for both normal and active line numbers", () => {
    expect(CQL_EDITOR_THEME.colors["editorLineNumber.foreground"]).toBe(
      "#ffffff"
    );
    expect(CQL_EDITOR_THEME.colors["editorLineNumber.activeForeground"]).toBe(
      "#ffffff"
    );
  });

  it("meets the WCAG AA contrast threshold for normal text", () => {
    const luminance = (hex: string) => {
      const channels = [1, 3, 5].map((offset) => {
        const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
        return value <= 0.04045
          ? value / 12.92
          : Math.pow((value + 0.055) / 1.055, 2.4);
      });
      return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
    };
    const background = luminance(CQL_EDITOR_THEME.colors["editor.background"]);
    for (const key of [
      "editorLineNumber.foreground",
      "editorLineNumber.activeForeground",
    ]) {
      const foreground = luminance(CQL_EDITOR_THEME.colors[key]);
      const ratio =
        (Math.max(foreground, background) + 0.05) /
        (Math.min(foreground, background) + 0.05);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });
});
