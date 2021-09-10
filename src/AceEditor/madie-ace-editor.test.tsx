import * as React from "react";
import { render } from "@testing-library/react";
import MadieAceEditor from "./madie-ace-editor";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-monokai";
import userEvent from "@testing-library/user-event";

describe("MadieAceEditor component", () => {
  it("should create madie editor", async () => {
    const container = render(<MadieAceEditor props="" />);
    expect(container).toBeDefined();
  });

  it("should call AceEditor withe expected props", async () => {
    const handleValueChanges = (val) => val;
    const outputProps = {
      props: {
        handleValueChanges,
      },
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
});
