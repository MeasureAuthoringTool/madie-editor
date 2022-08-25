import * as React from "react";
import { act, render, screen } from "@testing-library/react";
import MadieAceEditor, {
  mapParserErrorsToAceAnnotations,
  mapParserErrorsToAceMarkers,
  parsingEditorCqlContent,
} from "./madie-ace-editor";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-monokai";
import userEvent from "@testing-library/user-event";
import CqlError from "@madie/cql-antlr-parser/dist/src/dto/CqlError";

describe("MadieAceEditor component", () => {
  it("should create madie editor", async () => {
    const props = {
      value: "",
      onChange: jest.fn(),
      handleClick: true,
    };
    const container = render(<MadieAceEditor {...props} />);
    expect(container).toBeDefined();
  });

  it("should create madie editor without default value prop", async () => {
    const props = {
      value: "",
      onChange: jest.fn(),
      setParseErrors: jest.fn(),
      handleClick: true,
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
      setParseErrors: jest.fn(),
      handleClick: true,
      parseDebounceTime: 300,
      inboundAnnotations: [],
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
      setParseErrors: jest.fn(),
      handleClick: true,
      inboundAnnotations: [],
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
      setParseErrors: jest.fn(),
      handleClick: true,
      inboundAnnotations: [],
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
        "1 issues were found with CQL..."
      );
      expect(parseError).toBeInTheDocument();
    });
  });

  it("should display parsing feedback followed by errors feedback with inbound errors included", async () => {
    jest.useFakeTimers("modern");
    const props = {
      value: "",
      onChange: jest.fn(),
      parseDebounceTime: 300,
      setParseErrors: jest.fn(),
      handleClick: true,
      inboundAnnotations: [
        {
          row: 0,
          column: 15,
          type: "error",
          text: `ELM: ${15}:${25} | ELM translation error`,
        },
      ],
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
        "2 issues were found with CQL..."
      );
      expect(parseError).toBeInTheDocument();
    });
  });

  it("should display user content in the editor", async () => {
    jest.useFakeTimers("modern");
    const props = {
      value: "", // initial value before data is loaded
      onChange: jest.fn(),
      setParseErrors: jest.fn(),
      handleClick: true,
      parseDebounceTime: 300,
      inboundAnnotations: [],
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

  it("should apply readonly attribute", () => {
    jest.useFakeTimers("modern");
    const props = {
      value: "", // initial value before data is loaded
      onChange: jest.fn(),
      parseDebounceTime: 300,
      inboundAnnotations: [],
      readOnly: true,
    };

    render(<MadieAceEditor {...props} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
  });
});

describe("mapParserErrorsToAceAnnotations", () => {
  test("that the function returns an empty array with null input", () => {
    const annotations = mapParserErrorsToAceAnnotations(null);
    expect(annotations).toEqual([]);
  });

  test("that the function returns an empty array with undefined input", () => {
    const annotations = mapParserErrorsToAceAnnotations(undefined);
    expect(annotations).toEqual([]);
  });

  test("that the function maps parser errors to annotations", () => {
    const errors: CqlError[] = [
      {
        text: "error text",
        name: "error name",
        start: { line: 5, position: 10 },
        stop: { line: 5, position: 12 },
        message: `Cannot find symbol "Measurement Period"`,
      },
      {
        text: "error text",
        name: "error name",
        start: { line: 8, position: 24 },
        stop: { line: 8, position: 33 },
        message: `Cannot find symbol "LengthInDays"`,
      },
    ];

    const source = "Parse";
    const annotations = mapParserErrorsToAceAnnotations(errors);
    expect(annotations).toHaveLength(2);
    expect(annotations).toEqual([
      {
        row: 4,
        column: 10,
        type: "error",
        text: `${source}: 10:12 | Cannot find symbol "Measurement Period"`,
      },
      {
        row: 7,
        column: 24,
        type: "error",
        text: `${source}: 24:33 | Cannot find symbol "LengthInDays"`,
      },
    ]);
  });
});

describe("map parser errors to ace markers", () => {
  test("that the function returns an empty array with null input", () => {
    const markers = mapParserErrorsToAceMarkers(null);
    expect(markers).toEqual([]);
  });

  test("that the function returns an empty array with undefined input", () => {
    const markers = mapParserErrorsToAceMarkers(undefined);
    expect(markers).toEqual([]);
  });

  test("that the function maps parser errors to annotations", () => {
    const errors: CqlError[] = [
      {
        text: "error text",
        name: "error name",
        start: { line: 5, position: 10 },
        stop: { line: 5, position: 12 },
        message: `Cannot find symbol "Measurement Period"`,
      },
      {
        text: "error text",
        name: "error name",
        start: { line: 8, position: 24 },
        stop: { line: 8, position: 33 },
        message: `Cannot find symbol "LengthInDays"`,
      },
    ];

    const markers = mapParserErrorsToAceMarkers(errors);
    expect(markers).toHaveLength(errors.length);
    expect(markers).toEqual([
      {
        range: {
          start: {
            row: 4,
            column: 10,
          },
          end: {
            row: 4,
            column: 12,
          },
        },
        clazz: "editor-error-underline",
        type: "text",
      },
      {
        range: {
          start: {
            row: 7,
            column: 24,
          },
          end: {
            row: 7,
            column: 33,
          },
        },
        clazz: "editor-error-underline",
        type: "text",
      },
    ]);
  });
});

describe("", () => {
  test("replacing the error containing library content line to actual library content ", async () => {
    const expectValue = "library Test version '0.0.000'";
    const inSyncCql = await parsingEditorCqlContent(
      "library Test versionsdwds '0.0.000'",
      "library Test version '0.0.000'",
      "Test",
      "",
      "0.0.000",
      "measureEditor"
    );
    expect(inSyncCql).toEqual(expectValue);
  });

  test("not replacing the cql when there are errors in the cql library content ", async () => {
    const inSyncCql = await parsingEditorCqlContent(
      "test",
      "library Test version '0.0.000'",
      "Testing",
      "Test",
      "0.0.000",
      "measureEditor"
    );

    expect(inSyncCql).toEqual("test");
  });

  test("generated Cql has updated cql library name", async () => {
    const expectValue = "library Testing version '0.0.000'";
    const inSyncCql = await parsingEditorCqlContent(
      "",
      "library Test version '0.0.000'",
      "Testing",
      "Test",
      "0.0.000",
      "measureInformation"
    );

    expect(inSyncCql).toEqual(expectValue);
  });

  test("generated Cql has no change in cql library name when other contents in the measureninformation are saved", async () => {
    const expectValue = "library Test version '0.0.000'";
    const inSyncCql = await parsingEditorCqlContent(
      "",
      "library Test version '0.0.000'",
      "Test",
      "Test",
      "0.0.000",
      "measureInformation"
    );

    expect(inSyncCql).toEqual(expectValue);
  });

  test("MeasureInformation3", async () => {
    const inSyncCql = await parsingEditorCqlContent(
      "",
      "test",
      "Testing",
      "Test",
      "0.0.000",
      "measureInformation"
    );

    expect(inSyncCql).toEqual("test");
  });
});
