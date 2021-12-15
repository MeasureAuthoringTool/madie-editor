import * as React from "react";
import { act, render, screen } from "@testing-library/react";
import MadieAceEditor from "./madie-ace-editor";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-monokai";
import userEvent from "@testing-library/user-event";

describe("MadieAceEditor component", () => {
  it("should create madie editor", async () => {
    const props = {
      value: "",
      onChange: jest.fn(),
    };
    const container = render(<MadieAceEditor {...props} />);
    expect(container).toBeDefined();
  });

  it("should call AceEditor with expected props", async () => {
    jest.useFakeTimers("modern");
    const handleValueChanges = (val) => val;
    const outputProps = {
      value: "",
      onChange: handleValueChanges,
    };
    const result = render(<MadieAceEditor {...outputProps} />);
    const editorValue = "using FHIR version 4.0.1";
    let aceEditor: any = await result.container.querySelector(
      "#ace-editor-wrapper textarea"
    );
    userEvent.paste(aceEditor, editorValue);

    aceEditor = await result.container.querySelector(
      "#ace-editor-wrapper textarea"
    );

    expect(aceEditor.value).toContain(editorValue);
  });

  it("should call props handleValueChanges with the expected value", async () => {
    jest.useFakeTimers("modern");
    const handleValueChanges = jest.fn();
    const typedValue = "this is invalid CQL";
    const outputProps = {
      value: "",
      onChange: handleValueChanges,
      parseDebounceTime: 300,
    };

    await act(async () => {
      const result = render(<MadieAceEditor {...outputProps} />);
      let aceEditor: any = await result.container.querySelector(
        "#ace-editor-wrapper textarea"
      );
      userEvent.paste(aceEditor, typedValue);
      jest.advanceTimersByTime(600);
      expect(handleValueChanges).toBeCalledWith(typedValue);
    });
  });

  it("should display parsing feedback followed by valid feedback", async () => {
    jest.useFakeTimers("modern");
    const props = {
      value: "",
      onChange: jest.fn(),
      parseDebounceTime: 300,
    };
    const typedText = "using FHIR version '4.0.1'";

    await act(async () => {
      const { rerender } = render(<MadieAceEditor {...props} />);
      const aceEditorInput = await screen.findByRole("textbox");
      userEvent.paste(aceEditorInput, typedText);
      props.value = typedText;
      rerender(<MadieAceEditor {...props} />);

      const parsingMessage = await screen.findByText("Parsing...");
      expect(parsingMessage).toBeInTheDocument();
      jest.advanceTimersByTime(600);
      const parseSuccess = await screen.findByText(
        "Parsing complete, CQL is valid"
      );
      expect(parseSuccess).toBeInTheDocument();
    });
  });

  it("should display parsing feedback followed by errors feedback", async () => {
    jest.useFakeTimers("modern");
    const props = {
      value: "",
      onChange: jest.fn(),
      parseDebounceTime: 300,
    };
    const typedText = "using FHIR version 4.0.1";

    await act(async () => {
      const { rerender } = render(<MadieAceEditor {...props} />);
      const parseSuccess = await screen.findByText(
        "Parsing complete, CQL is valid"
      );
      expect(parseSuccess).toBeInTheDocument();

      const aceEditorInput = await screen.findByRole("textbox");
      userEvent.paste(aceEditorInput, typedText);
      props.value = typedText;
      rerender(<MadieAceEditor {...props} />);

      const parsingMessage = await screen.findByText("Parsing...");
      expect(parsingMessage).toBeInTheDocument();
      jest.advanceTimersByTime(600);
      const parseError = await screen.findByText(
        "Errors were encountered during CQL parsing..."
      );
      expect(parseError).toBeInTheDocument();
    });
  });

  it("should display user content in the editor", async () => {
    jest.useFakeTimers("modern");
    const props = {
      value: "", // initial value before data is loaded
      onChange: jest.fn(),
      parseDebounceTime: 300,
    };

    await act(async () => {
      const { rerender } = render(<MadieAceEditor {...props} />);
      const aceEditorInput = await screen.findByRole("textbox");
      const parseSuccess = await screen.findByText(
        "Parsing complete, CQL is valid"
      );
      expect(parseSuccess).toBeInTheDocument();
      props.value = "library MATGlobalCommonFunctionsFHIR4 version '6.1.000'";
      rerender(<MadieAceEditor {...props} />);
      // const parsingMessage = screen.getByText("Parsing...");
      // expect(parsingMessage).toBeInTheDocument();
      jest.advanceTimersByTime(600);
      const parseSuccess2 = await screen.findByText(
        "Parsing complete, CQL is valid"
      );
      expect(parseSuccess2).toBeInTheDocument();

      // const library = await screen.findByText(/library/i);
      // expect(library).toBeInTheDocument();

      // screen.debug();
    });
  });
});
