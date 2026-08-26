import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import MadieAceEditor, {
  mapParserErrorsToAceAnnotations,
  mapParserErrorsToAceMarkers,
  updateEditorContent,
  setCommandEnabled,
  parseEditorContent,
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

  // TODO: fix this- MAT-7985
  it.skip("should should trigger parts of toggleSearch when events emitted", async () => {
    // Mock the editor and searchBox
    const editorMock = {
      execCommand: jest.fn(),
      searchBox: {
        active: false,
        show: jest.fn(),
        hide: jest.fn(),
      },
    };

    const aceRef = screen.getByRole("textbox");
    // @ts-ignore
    aceRef.editor = editorMock;
    const event = new CustomEvent("toggleEditorSearchBox");
    window.dispatchEvent(event);

    expect(editorMock.execCommand).toHaveBeenCalledWith("find");
    expect(editorMock.searchBox.show).not.toHaveBeenCalled();

    window.dispatchEvent(event);
    expect(editorMock.execCommand).not.toHaveBeenCalledWith("find");
    expect(editorMock.searchBox.show).toHaveBeenCalled();

    window.dispatchEvent(event);
    expect(editorMock.searchBox.hide).toHaveBeenCalled();
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

  it("should apply readonly attribute when none passed", () => {
    jest.useFakeTimers("modern");
    const consoleWarnMock = jest.spyOn(console, "warn").mockImplementation();
    const props = {
      value: "", // initial value before data is loaded
      onChange: jest.fn(),
      parseDebounceTime: 300,
      inboundAnnotations: [],
      validationsEnabled: true,
    };

    render(<MadieAceEditor {...props} />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute("readonly");
    expect(consoleWarnMock).toHaveBeenCalledWith(
      "Editor is not set! Cannot set annotations!",
      undefined
    );

    // Clean up the mock
    consoleWarnMock.mockRestore();
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
    expect(updatedContent.isValueSetChanged).toEqual(false);
  });

  it("should replace incorrect alias for FHIRHelpers ; alias has spaces", async () => {
    const expectValue =
      "library MAT7909TestDefaultAlias version '0.0.000' using QICore version '4.1.1' include FHIRHelpers version '4.3.000' called FHIRHelpers Helpers valueset \"Bicarbonate lab test\": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1045.139' context Patient define \"Initial Population\":   exists ( [Observation] O  where O.value < 5 'mg') ";
    const updatedContent = await updateEditorContent(
      "library MAT7909TestDefaultAlias version '0.0.000' using QICore version '4.1.1' include FHIRHelpers version '4.3.000' called F Helpers valueset \"Bicarbonate lab test\": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1045.139' context Patient define \"Initial Population\":   exists ( [Observation] O  where O.value < 5 'mg') ",
      "library MAT7909TestDefaultAlias version '0.0.000'",
      "MAT7909TestDefaultAlias",
      "",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "measureEditor"
    );
    expect(updatedContent.cql).toEqual(expectValue);
    expect(updatedContent.isFhirHelpersAliasChanged).toEqual(true);
  });

  it("should replace incorrect alias for FHIRHelpers ; multi line file alias has spaces", async () => {
    const expectValue =
      "library MAT7909TestDefaultAlias version '0.0.000'\n using QICore version '4.1.1'\n include FHIRHelpers version '4.3.000' called FHIRHelpers Helpers\n valueset \"Bicarbonate lab test\": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1045.139'\n context Patient\n define \"Initial Population\":   exists ( [Observation] O  where O.value < 5 'mg') ";
    const updatedContent = await updateEditorContent(
      "library MAT7909TestDefaultAlias version '0.0.000'\n using QICore version '4.1.1'\n include FHIRHelpers version '4.3.000' called F Helpers\n valueset \"Bicarbonate lab test\": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1045.139'\n context Patient\n define \"Initial Population\":   exists ( [Observation] O  where O.value < 5 'mg') ",
      "library MAT7909TestDefaultAlias version '0.0.000'",
      "MAT7909TestDefaultAlias",
      "",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "measureEditor"
    );
    expect(updatedContent.cql).toEqual(expectValue);
    expect(updatedContent.isFhirHelpersAliasChanged).toEqual(true);
  });

  it("should replace incorrect alias for FHIRHelpers single line CQL", async () => {
    const expectValue =
      "library MAT7909TestDefaultAlias version '0.0.000' using QICore version '4.1.1' include FHIRHelpers version '4.3.000' called FHIRHelpers  valueset \"Bicarbonate lab test\": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1045.139' context Patient define \"Initial Population\":   exists ( [Observation] O  where O.value < 5 'mg') ";
    const updatedContent = await updateEditorContent(
      "library MAT7909TestDefaultAlias version '0.0.000' using QICore version '4.1.1' include FHIRHelpers version '4.3.000' called Dummy  valueset \"Bicarbonate lab test\": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1045.139' context Patient define \"Initial Population\":   exists ( [Observation] O  where O.value < 5 'mg') ",
      "library MAT7909TestDefaultAlias version '0.0.000'",
      "MAT7909TestDefaultAlias",
      "",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "measureEditor"
    );
    expect(updatedContent.cql).toEqual(expectValue);
    expect(updatedContent.isFhirHelpersAliasChanged).toEqual(true);
  });

  it("should replace incorrect alias for FHIRHelpers; multiple line cql ", async () => {
    const expectValue =
      "library MAT7909TestDefaultAlias version '0.0.000'\n using QICore version '4.1.1'\n include FHIRHelpers version '4.3.000' called FHIRHelpers\n valueset \"Bicarbonate lab test\": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1045.139'\n context Patient\n define \"Initial Population\":\n   exists ( [Observation] O  where O.value < 5 'mg')\n ";
    const updatedContent = await updateEditorContent(
      "library MAT7909TestDefaultAlias version '0.0.000'\n using QICore version '4.1.1'\n include FHIRHelpers version '4.3.000' called Dummy\n valueset \"Bicarbonate lab test\": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1045.139'\n context Patient\n define \"Initial Population\":\n   exists ( [Observation] O  where O.value < 5 'mg')\n ",
      "library MAT7909TestDefaultAlias version '0.0.000'",
      "MAT7909TestDefaultAlias",
      "",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "measureEditor"
    );
    expect(updatedContent.cql).toEqual(expectValue);
    expect(updatedContent.isFhirHelpersAliasChanged).toEqual(true);
  });

  test("Not to replace the using FHIR statement for QICore measure if it is the only using statement with correct version", async () => {
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
    define "func":
        true
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
    const expectValue = `library Testing version '0.0.000'\n`;
    const updatedContents = await updateEditorContent(
      `library MesTest2 version '0.0.000'
  concept "lalala" { "test" }`,
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
    const expectValue = `library Testing version '0.0.000'\n`;
    const updatedContents = await updateEditorContent(
      `library MesTest2 version '0.0.000'
                    concept "lalala" { "test" }`,
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
  it("Replace concept declaration with comment", async () => {
    const expectValue = `library Testing version '0.0.000'\n`;
    const updatedContents = await updateEditorContent(
      `library MesTest2 version '0.0.000'
  concept "lalala" { "test" }`,
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
    const expectValue = `library Testing version '0.0.000'\n`;
    const updatedContents = await updateEditorContent(
      `library MesTest2 version '0.0.000'
                    concept "lalala" { "test" }`,
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

describe("parseEditorContent", () => {
  it("should should report an error when context is empty", async () => {
    const cql =
      "library SimpleEncounterMeasure version '0.0.000'\n" +
      "using QICore version '4.1.1'";
    const errors = parseEditorContent(cql);
    expect(errors.length).toEqual(1);
    expect(errors[0].message).toEqual("Measure Context must be 'Patient'.");
  });

  it("should should report an error when context is anything but Patient", async () => {
    const cql =
      "library SimpleEncounterMeasure version '0.0.000'\n" +
      "using QICore version '4.1.1'" +
      "context Encounter";
    const errors = parseEditorContent(cql);
    expect(errors.length).toEqual(1);
    expect(errors[0].message).toEqual("Measure Context must be 'Patient'.");
  });

  it("should should not report an error when context is Patient", async () => {
    const cql =
      "library SimpleEncounterMeasure version '0.0.000'\n" +
      "using QICore version '4.1.1'\n" +
      "context Patient";
    const errors = parseEditorContent(cql);
    expect(errors.length).toEqual(0);
  });
});

it("408 and keyboard events", () => {
  jest.useFakeTimers();

  // Mock requestAnimationFrame to run
  const rafCallbacks: FrameRequestCallback[] = [];
  jest
    .spyOn(window, "requestAnimationFrame")
    .mockImplementation((cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);
      return 1;
    });

  const execCommandMock = jest.fn();
  const showMock = jest.fn();
  const hideMock = jest.fn();

  render(<MadieAceEditor value="" onChange={() => {}} />);
  (window as any).aceRef = {
    current: {
      editor: {
        execCommand: execCommandMock,
        searchBox: { active: false, show: showMock, hide: hideMock },
      },
    },
  };

  // Don't know how to get the searchbox to show up. So we'll make a fake one
  const fakeInput = document.createElement("input");
  const fakeSpan = document.createElement("span");
  fakeSpan.setAttribute("action", "something");
  const fakeClose = document.createElement("span");
  fakeClose.className = "ace_searchbtn_close";

  document.body.append(fakeInput, fakeSpan, fakeClose);

  const findAllBtn = document.createElement("span");
  findAllBtn.setAttribute("action", "findAll");
  const hideBtn = document.createElement("span");
  hideBtn.setAttribute("action", "hide");
  const toggleReplaceBtn = document.createElement("span");
  toggleReplaceBtn.setAttribute("action", "toggleReplace");
  document.body.append(findAllBtn, hideBtn, toggleReplaceBtn);

  // Fire event to trigger toggleSearchBox
  window.dispatchEvent(new CustomEvent("toggleEditorSearchBox"));

  // Run the requestAnimationFrame callback now
  rafCallbacks.forEach((cb) => cb(0));

  fireEvent.keyDown(fakeInput, { key: "Enter" });

  // Trigger Space
  fireEvent.keyDown(fakeSpan, { key: " " });

  // Trigger Alt+Tab
  fireEvent.keyDown(findAllBtn, { key: "Tab", altKey: true });

  // Trigger Alt+Tab on hideBtn
  fireEvent.keyDown(hideBtn, { key: "Tab", altKey: true });
});
