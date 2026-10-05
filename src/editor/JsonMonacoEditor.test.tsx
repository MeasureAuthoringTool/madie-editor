import * as React from "react";
import * as monaco from "monaco-editor";
import { act, fireEvent, render, screen } from "@testing-library/react";
import JsonMonacoEditor from "./JsonMonacoEditor";
import { registerJsonBasicLanguage } from "./language/jsonBasicLanguage";

const mockEditorState: {
  runFindAction: jest.Mock;
  updateOptions: jest.Mock;
  focusHandler?: () => void;
  keyDownHandler?: (event: { keyCode: number }) => void;
  emitUndefinedOnChange: boolean;
  shouldReturnInputNode: boolean;
} = {
  runFindAction: jest.fn(),
  updateOptions: jest.fn(),
  focusHandler: undefined,
  keyDownHandler: undefined,
  emitUndefinedOnChange: false,
  shouldReturnInputNode: true,
};

jest.mock("./language/jsonBasicLanguage", () => ({
  JSON_BASIC_LANGUAGE_ID: "json-basic",
  registerJsonBasicLanguage: jest.fn(),
}));

jest.mock("@monaco-editor/react", () => {
  const React = require("react");
  const monaco = require("monaco-editor");

  const MockMonacoEditor = ({
    value,
    onChange,
    onMount,
    beforeMount,
    options,
  }) => {
    const inputRef = React.useRef<HTMLTextAreaElement | null>(null);

    React.useEffect(() => {
      beforeMount?.(monaco);

      const fakeEditor = {
        getModel: () => ({ id: "model" }),
        createDecorationsCollection: () => ({ set: jest.fn() }),
        getDomNode: () => ({
          querySelector: () =>
            mockEditorState.shouldReturnInputNode ? inputRef.current : null,
        }),
        onDidFocusEditorText: (callback) => {
          mockEditorState.focusHandler = callback;
          return { dispose: jest.fn() };
        },
        onKeyDown: (callback) => {
          mockEditorState.keyDownHandler = callback;
          return { dispose: jest.fn() };
        },
        updateOptions: mockEditorState.updateOptions,
        getAction: () => ({ run: mockEditorState.runFindAction }),
      };

      onMount?.(fakeEditor, monaco);
    }, [beforeMount, onMount]);

    return React.createElement("textarea", {
      "aria-label": "Cql editor",
      ref: inputRef,
      value: value || "",
      readOnly: Boolean(options?.readOnly),
      onChange: (event) =>
        onChange?.(
          mockEditorState.emitUndefinedOnChange ? undefined : event.target.value
        ),
    });
  };

  return {
    __esModule: true,
    default: MockMonacoEditor,
  };
});

describe("JsonMonacoEditor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEditorState.runFindAction.mockClear();
    mockEditorState.updateOptions.mockClear();
    mockEditorState.focusHandler = undefined;
    mockEditorState.keyDownHandler = undefined;
    mockEditorState.emitUndefinedOnChange = false;
    mockEditorState.shouldReturnInputNode = true;
  });

  it("calls onChange when editor value changes", () => {
    const onChange = jest.fn();

    render(<JsonMonacoEditor value="" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("JSON editor"), {
      target: { value: '{"a": 1}' },
    });

    expect(onChange).toHaveBeenCalledWith('{"a": 1}');
  });

  it("coerces undefined change values to an empty string", () => {
    const onChange = jest.fn();
    mockEditorState.emitUndefinedOnChange = true;

    render(<JsonMonacoEditor value="" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("JSON editor"), {
      target: { value: "ignored" },
    });

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("applies readonly mode", () => {
    render(<JsonMonacoEditor value="{}" readOnly onChange={jest.fn()} />);

    expect(screen.getByLabelText("JSON editor")).toHaveAttribute("readonly");
  });

  it("ignores change events when onChange is not provided", () => {
    render(<JsonMonacoEditor value="{}" />);

    expect(() => {
      fireEvent.change(screen.getByLabelText("JSON editor"), {
        target: { value: '{"safe": true}' },
      });
    }).not.toThrow();
  });

  it("falls back to an empty value when value is undefined", () => {
    render(
      <JsonMonacoEditor
        value={undefined as unknown as string}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByLabelText("JSON editor")).toHaveValue("");
  });

  it("sets textarea attributes and mount hooks when input node exists", () => {
    const onEditorMount = jest.fn();

    render(
      <JsonMonacoEditor
        value="{}"
        ariaLabel="JSON editor input"
        inputTestId="json-editor-input"
        testId="json-editor-container"
        onEditorMount={onEditorMount}
      />
    );

    expect(screen.getByTestId("json-editor-container")).toBeInTheDocument();
    expect(screen.getByLabelText("JSON editor input")).toHaveAttribute(
      "data-testid",
      "json-editor-input"
    );
    expect(registerJsonBasicLanguage).toHaveBeenCalledTimes(1);
    expect(onEditorMount).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ KeyCode: monaco.KeyCode })
    );
  });

  it("skips input attribute updates when editor input node is unavailable", () => {
    mockEditorState.shouldReturnInputNode = false;

    render(<JsonMonacoEditor value="{}" ariaLabel="Custom JSON label" />);

    expect(
      screen.queryByLabelText("Custom JSON label")
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Cql editor")).toBeInTheDocument();
  });

  it("updates tab focus behavior on focus and escape key", () => {
    render(<JsonMonacoEditor value="{}" />);

    act(() => {
      mockEditorState.focusHandler?.();
    });

    expect(mockEditorState.updateOptions).toHaveBeenCalledWith({
      tabFocusMode: false,
    });

    act(() => {
      mockEditorState.keyDownHandler?.({ keyCode: 0 });
      mockEditorState.keyDownHandler?.({ keyCode: monaco.KeyCode.Escape });
    });

    expect(mockEditorState.updateOptions).toHaveBeenCalledWith({
      tabFocusMode: true,
    });
  });

  it("registers and unregisters search toggle event when enabled", () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

    const { unmount } = render(
      <JsonMonacoEditor value="{}" enableToggleSearchEvent />
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "toggleEditorSearchBox",
      expect.any(Function)
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "toggleEditorSearchBox",
      expect.any(Function)
    );

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it("registers custom search toggle event and runs find action", () => {
    const addEventListenerSpy = jest.spyOn(window, "addEventListener");
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

    const { unmount } = render(
      <JsonMonacoEditor
        value="{}"
        enableToggleSearchEvent={{ eventName: "customEditorSearch" }}
      />
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "customEditorSearch",
      expect.any(Function)
    );

    act(() => {
      window.dispatchEvent(new Event("customEditorSearch"));
    });

    expect(mockEditorState.runFindAction).toHaveBeenCalledTimes(1);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "customEditorSearch",
      expect.any(Function)
    );

    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });
});
