import * as monaco from "monaco-editor";
import {
  getSearchToggleEventName,
  toggleEditorSearchBox,
  registerEditorKeybindings,
} from "./EditorUtils";

type KeyEvent = {
  keyCode: number;
  metaKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  preventDefault: jest.Mock;
  stopPropagation: jest.Mock;
};

const buildKeyEvent = (
  keyCode: number,
  overrides: Partial<Omit<KeyEvent, "preventDefault" | "stopPropagation">> = {}
): KeyEvent => ({
  keyCode,
  metaKey: false,
  ctrlKey: false,
  shiftKey: false,
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  ...overrides,
});

describe("getSearchToggleEventName", () => {
  it("returns the event name when enabled", () => {
    expect(getSearchToggleEventName(true)).toBe("toggleEditorSearchBox");
  });

  it("returns undefined when disabled", () => {
    expect(getSearchToggleEventName(false)).toBeUndefined();
  });
});

describe("toggleEditorSearchBox", () => {
  it("does nothing when no editor is provided", () => {
    expect(() => toggleEditorSearchBox(null)).not.toThrow();
  });

  it("closes the find widget when it is already revealed", () => {
    const closeFindWidget = jest.fn();
    const runFind = jest.fn();
    const editor: any = {
      getContribution: () => ({
        getState: () => ({ isRevealed: true }),
        closeFindWidget,
      }),
      getAction: () => ({ run: runFind }),
    };

    toggleEditorSearchBox(editor);

    expect(closeFindWidget).toHaveBeenCalledTimes(1);
    expect(runFind).not.toHaveBeenCalled();
  });

  it("opens the find widget when it is not revealed", () => {
    const runFind = jest.fn();
    const editor: any = {
      getContribution: () => ({
        getState: () => ({ isRevealed: false }),
      }),
      getAction: () => ({ run: runFind }),
    };

    toggleEditorSearchBox(editor);

    expect(runFind).toHaveBeenCalledTimes(1);
  });
});

describe("registerEditorKeybindings", () => {
  const SELECTION = { id: "selection" };
  const FULL_RANGE = { id: "full-range" };

  let keyDownHandler: (event: KeyEvent) => void;
  let editor: any;
  let writeText: jest.Mock;
  let readText: jest.Mock;

  const mountHandler = (
    options?: Parameters<typeof registerEditorKeybindings>[2]
  ) => {
    registerEditorKeybindings(editor, monaco, options);
  };

  beforeEach(() => {
    writeText = jest.fn();
    readText = jest.fn().mockResolvedValue("pasted-text");

    Object.defineProperty(global.navigator, "clipboard", {
      configurable: true,
      value: { writeText, readText },
    });

    editor = {
      onKeyDown: jest.fn((cb) => {
        keyDownHandler = cb;
        return { dispose: jest.fn() };
      }),
      updateOptions: jest.fn(),
      getModel: jest.fn(() => ({
        getValueInRange: jest.fn(() => "selected-text"),
        getFullModelRange: jest.fn(() => FULL_RANGE),
      })),
      getSelection: jest.fn(() => SELECTION),
      executeEdits: jest.fn(),
      setSelection: jest.fn(),
      trigger: jest.fn(),
    };
  });

  it("returns the disposable from onKeyDown", () => {
    const disposable = registerEditorKeybindings(editor, monaco);

    expect(editor.onKeyDown).toHaveBeenCalledTimes(1);
    expect(disposable).toEqual({ dispose: expect.any(Function) });
  });

  it("restores tab navigation on Escape", () => {
    mountHandler();

    keyDownHandler(buildKeyEvent(monaco.KeyCode.Escape));

    expect(editor.updateOptions).toHaveBeenCalledWith({ tabFocusMode: true });
  });

  it("ignores key presses without ctrl/cmd modifier", () => {
    mountHandler();

    const event = buildKeyEvent(monaco.KeyCode.KeyC);
    keyDownHandler(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(writeText).not.toHaveBeenCalled();
  });

  it("copies the current selection to the clipboard (Cmd+C)", () => {
    mountHandler();

    const event = buildKeyEvent(monaco.KeyCode.KeyC, { metaKey: true });
    keyDownHandler(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(writeText).toHaveBeenCalledWith("selected-text");
    expect(editor.executeEdits).not.toHaveBeenCalled();
  });

  it("does not copy when there is no model or selection", () => {
    editor.getModel.mockReturnValue(null);
    mountHandler();

    const event = buildKeyEvent(monaco.KeyCode.KeyC, { ctrlKey: true });
    keyDownHandler(event);

    expect(writeText).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it("cuts the current selection (Ctrl+X) using the id prefix", () => {
    mountHandler({ idPrefix: "madie-cql" });

    const event = buildKeyEvent(monaco.KeyCode.KeyX, { ctrlKey: true });
    keyDownHandler(event);

    expect(writeText).toHaveBeenCalledWith("selected-text");
    expect(editor.executeEdits).toHaveBeenCalledWith("madie-cql-cut", [
      { range: SELECTION, text: "", forceMoveMarkers: true },
    ]);
  });

  it("pastes clipboard text at the current selection (Cmd+V)", async () => {
    mountHandler({ idPrefix: "madie-json" });

    const event = buildKeyEvent(monaco.KeyCode.KeyV, { metaKey: true });
    keyDownHandler(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(readText).toHaveBeenCalledTimes(1);

    // flush the clipboard read promise
    await Promise.resolve();
    await Promise.resolve();

    expect(editor.executeEdits).toHaveBeenCalledWith("madie-json-paste", [
      { range: SELECTION, text: "pasted-text", forceMoveMarkers: true },
    ]);
  });

  it("does not paste when the clipboard is empty", async () => {
    readText.mockResolvedValue("");
    mountHandler();

    keyDownHandler(buildKeyEvent(monaco.KeyCode.KeyV, { metaKey: true }));

    await Promise.resolve();
    await Promise.resolve();

    expect(editor.executeEdits).not.toHaveBeenCalled();
  });

  it("selects the full model range (Cmd+A)", () => {
    mountHandler();

    const event = buildKeyEvent(monaco.KeyCode.KeyA, { metaKey: true });
    keyDownHandler(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(editor.setSelection).toHaveBeenCalledWith(FULL_RANGE);
  });

  it("triggers undo (Cmd+Z)", () => {
    mountHandler();

    keyDownHandler(buildKeyEvent(monaco.KeyCode.KeyZ, { metaKey: true }));

    expect(editor.trigger).toHaveBeenCalledWith("keyboard", "undo", null);
  });

  it("triggers redo (Cmd+Shift+Z)", () => {
    mountHandler();

    keyDownHandler(
      buildKeyEvent(monaco.KeyCode.KeyZ, { metaKey: true, shiftKey: true })
    );

    expect(editor.trigger).toHaveBeenCalledWith("keyboard", "redo", null);
  });

  it("ignores unmapped ctrl/cmd key combinations", () => {
    mountHandler();

    const event = buildKeyEvent(monaco.KeyCode.KeyB, { metaKey: true });
    keyDownHandler(event);

    expect(editor.executeEdits).not.toHaveBeenCalled();
    expect(editor.setSelection).not.toHaveBeenCalled();
    expect(editor.trigger).not.toHaveBeenCalled();
    expect(writeText).not.toHaveBeenCalled();
  });
});
