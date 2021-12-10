import * as React from "react";
import { render } from "@testing-library/react";
import MadieAceEditor from "./madie-ace-editor";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-monokai";
import userEvent from "@testing-library/user-event";

describe("MadieAceEditor component", () => {
  it("should create madie editor", async () => {
    const props = {
      defaultValue: "",
      handleValueChanges: jest.fn(),
    };
    const container = render(<MadieAceEditor {...props} />);
    expect(container).toBeDefined();
  });

  it("should call AceEditor withe expected props", async () => {
    const handleValueChanges = (val) => val;
    const outputProps = {
      defaultValue: "",
      handleValueChanges,
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

  jest.useFakeTimers("modern");
  it("should call props handleValueChanges with the expected value", async () => {
    const handleValueChanges = jest.fn();
    const typedValue = "if (1==1) {}";
    const outputProps = {
      defaultValue: "",
      handleValueChanges,
    };
    const result = render(<MadieAceEditor {...outputProps} />);
    // let aceEditor: any = await result.container.querySelectorAll(".ace_text-input");
    let aceEditor: any = await result.container.querySelector(
      "#ace-editor-wrapper textarea"
    );
    userEvent.paste(aceEditor, typedValue);
    jest.advanceTimersByTime(600);
    // aceEditor.simulate("change", { target: { value: typedValue } });
    expect(aceEditor.value).toContain(typedValue);
    expect(handleValueChanges).toBeCalledWith(typedValue);
  });
});
