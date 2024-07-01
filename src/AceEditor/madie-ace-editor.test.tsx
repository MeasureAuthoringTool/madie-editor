import * as React from "react";
import { act, render, screen } from "@testing-library/react";
import MadieAceEditor, {
  mapParserErrorsToAceAnnotations,
  mapParserErrorsToAceMarkers,
  updateEditorContent,
  setCommandEnabled,
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

  it("should add/remove commands", () => {
    const aceEditor = {
      commands: {
        byName: {
          indent: {
            bindKey: "tab",
            enabled: true,
          },
          outdent: {
            bindKey: "shift+tab",
            enabled: true,
          },
        },
        addCommand: (command) =>
          (aceEditor.commands.byName[command] = {
            bindKey: command.bindKey,
            enabled: command.enabled,
          }),
      },
    };

    setCommandEnabled(aceEditor, "indent", false);
    expect(aceEditor.commands.byName["indent"].bindKey).toBeNull();

    setCommandEnabled(aceEditor, "indent", true);
    expect(aceEditor.commands.byName["indent"].bindKey).not.toBeNull();
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

describe("synching the cql", () => {
  test("replacing the error containing library content line to actual library content", async () => {
    const expectValue = "library Test version '0.0.000'";
    const updatedContent = await updateEditorContent(
      "library Test versionsdwds '0.0.000''",
      "library Test version '0.0.000'",
      "Test",
      "",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "measureEditor"
    );
    expect(updatedContent.cql).toEqual(expectValue);
    expect(updatedContent.isLibraryStatementChanged).toEqual(true);
    expect(updatedContent.isUsingStatementChanged).toEqual(false);
    expect(updatedContent.isValueSetChanged).toEqual(false);
  });

  test("replacing the error containing using content line to actual using content", async () => {
    const expectValue = "using QICore version '4.1.1'";
    const updatedContent = await updateEditorContent(
      "using QIasdf version '4.1.1'",
      "",
      "Test",
      "",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "measureEditor"
    );
    expect(updatedContent.cql).toEqual(expectValue);
    expect(updatedContent.isUsingStatementChanged).toEqual(true);
  });

  test("replacing the error containing using content line to actual using content with FHIR", async () => {
    const expectValue = "using FHIR version '4.0.1'";
    const updatedContent = await updateEditorContent(
      "using FHIR version '4.0.1'",
      "",
      "Test",
      "",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "measureEditor"
    );
    expect(updatedContent.cql).toEqual(expectValue);
  });

  test("generated Cql has updated cql library name", async () => {
    const expectValue = "library Testing version '0.0.000'";
    const updatedContent = await updateEditorContent(
      "",
      "library Test version '0.0.000'",
      "Testing",
      "Test",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "measureInformation"
    );
    expect(updatedContent.cql).toEqual(expectValue);
  });

  test("remove value set version if exists in cql", async () => {
    const cql = `
    library Testing version '0.0.000'
    using QDM version '5.6'
    valueset "Adolescent depression screening assessment with version":  'urn:oid:2.16.840.1.113762.1.4.1260.162' version 'urn:hl7:version:20240307'
    `;
    const updatedContent = await updateEditorContent(
      cql,
      "library Test version '0.0.000'",
      "Test",
      "Test",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "measureEditor"
    );
    expect(updatedContent.isValueSetChanged).toEqual(true);
    expect(updatedContent.cql).not.toContain(
      "version 'urn:hl7:version:20240307'"
    );
  });

  test("generated Cql has no change in cql library name when other contents in the measure information are saved", async () => {
    const expectValue = "library Test version '0.0.000'";
    const updatedContents = await updateEditorContent(
      "",
      "library Test version '0.0.000'",
      "Test",
      "Test",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "measureInformation"
    );

    expect(updatedContents.cql).toEqual(expectValue);
  });

  test("generated Cql has no change in cql library name  when library content is missing in the cql", async () => {
    const updatedContents = await updateEditorContent(
      "",
      "test",
      "Testing",
      "Test",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "measureInformation"
    );

    expect(updatedContents.cql).toEqual("test");
  });
});
describe("ParsingCQL Function, Kill Concept Declaration", () => {
  it("Replace concept declaration with comment", async () => {
    const expectValue = `library Testing version '0.0.000'
/*CONCEPT DECLARATION REMOVED: CQL concept construct shall NOT be used.*/`;
    const updatedContents = await updateEditorContent(
      `library MesTest2 version '0.0.000'
  concept lalala`,
      "",
      "Testing",
      "Test",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "measureEditor"
    );

    expect(updatedContents.cql).toEqual(expectValue);
  });
  it('Only replaces concept declaration, not just lines that contain the word "concept"', async () => {
    const expectValue = `library Testing version '0.0.000'
I want to decalre a concept lalala`;
    const updatedContents = await updateEditorContent(
      `library MesTest2 version '0.0.000'
I want to decalre a concept lalala`,
      "",
      "Testing",
      "Test",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "measureEditor"
    );

    expect(updatedContents.cql).toEqual(expectValue);
  });

  it("Replace concept declaration with comment even with a LOT of spaces", async () => {
    const expectValue = `library Testing version '0.0.000'
/*CONCEPT DECLARATION REMOVED: CQL concept construct shall NOT be used.*/`;
    const updatedContents = await updateEditorContent(
      `library MesTest2 version '0.0.000'
                    concept lalala`,
      "",
      "Testing",
      "Test",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "measureEditor"
    );

    expect(updatedContents.cql).toEqual(expectValue);
  });
});

describe("isUsingStatementEmpty", () => {
  test("Replace concept declaration with comment", async () => {
    const expectValue = `library Testing version '0.0.000'
/*CONCEPT DECLARATION REMOVED: CQL concept construct shall NOT be used.*/`;
    const updatedContents = await updateEditorContent(
      `library MesTest2 version '0.0.000'
  concept lalala`,
      "",
      "Testing",
      "Test",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "measureEditor"
    );

    expect(updatedContents.cql).toEqual(expectValue);
  });

  it("Replace concept declaration with comment even with a LOT of spaces", async () => {
    const expectValue = `library Testing version '0.0.000'
/*CONCEPT DECLARATION REMOVED: CQL concept construct shall NOT be used.*/`;
    const updatedContents = await updateEditorContent(
      `library MesTest2 version '0.0.000'
                    concept lalala`,
      "",
      "Testing",
      "Test",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "measureEditor"
    );

    expect(updatedContents.cql).toEqual(expectValue);
  });

  it("Blank cql will return a blank string", async () => {
    const expectValue = "";
    const updatedContents = await updateEditorContent(
      "",
      "",
      "Testing",
      "Test",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "measureEditor"
    );

    expect(updatedContents.cql).toEqual(expectValue);
  });
});
