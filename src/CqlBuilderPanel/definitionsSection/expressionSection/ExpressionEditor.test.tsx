import * as React from "react";
import { Formik } from "formik";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import ExpressionEditor from "./ExpressionEditor";

const mockEditor = {
  setValue: jest.fn(),
  setPosition: jest.fn(),
  getPosition: jest.fn(),
  setSelection: jest.fn(),
  onDidChangeCursorPosition: jest.fn(),
};

jest.mock("@monaco-editor/react", () => {
  const React = require("react");

  const MockMonacoEditor = ({ value, onChange, onMount }) => {
    React.useEffect(() => {
      onMount?.(mockEditor);
    }, [onMount]);

    return React.createElement("textarea", {
      "aria-label": "Cql editor",
      value: value || "",
      onChange: (event) => onChange?.(event.target.value),
    });
  };

  return {
    __esModule: true,
    default: MockMonacoEditor,
  };
});

const cqlBuilderLookupsTypes = {
  parameters: [],
  definitions: [],
  functions: [],
  fluentFunctions: [],
};

const renderExpressionEditor = (props = {}) => {
  const defaultProps: any = {
    canEdit: true,
    expressionEditorOpen: true,
    cqlBuilderLookupsTypes,
    textAreaRef: React.createRef<any>(),
    expressionEditorValue: "line 1\nline 2",
    setExpressionEditorValue: jest.fn(),
    setCursorPosition: jest.fn(),
    setAutoInsert: jest.fn(),
  };

  const allProps = { ...defaultProps, ...props };

  const rendered = render(
    <Formik initialValues={{ type: "", name: "" }} onSubmit={jest.fn()}>
      <ExpressionEditor {...allProps} />
    </Formik>
  );

  return { ...rendered, props: allProps };
};

describe("ExpressionEditor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEditor.getPosition.mockReturnValue({ lineNumber: 3, column: 4 });
  });

  it("exposes editor ref methods and maps them to monaco", () => {
    const textAreaRef = React.createRef<any>();
    renderExpressionEditor({ textAreaRef });

    expect(textAreaRef.current).toBeTruthy();
    expect(textAreaRef.current.editor.session.getLength()).toBe(2);

    textAreaRef.current.editor.setValue("a\nb\nc");
    expect(mockEditor.setValue).toHaveBeenCalledWith("a\nb\nc");
    expect(textAreaRef.current.editor.session.getLength()).toBe(3);

    textAreaRef.current.editor.moveCursorTo(5, 6);
    expect(mockEditor.setPosition).toHaveBeenCalledWith({
      lineNumber: 6,
      column: 7,
    });

    textAreaRef.current.editor.clearSelection();
    expect(mockEditor.setSelection).toHaveBeenCalledWith({
      startLineNumber: 3,
      startColumn: 4,
      endLineNumber: 3,
      endColumn: 4,
    });
  });

  it("clears the ref on unmount", () => {
    const textAreaRef = React.createRef<any>();
    const { unmount } = renderExpressionEditor({ textAreaRef });

    expect(textAreaRef.current).toBeTruthy();
    unmount();

    expect(textAreaRef.current).toBeNull();
  });
});
