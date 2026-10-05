import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import CqlError from "@madie/cql-antlr-parser/dist/src/dto/CqlError";
import MadieCqlEditor, {
  isUsingStatementEmpty,
  mapParserErrorsToMonacoAnnotations,
  mapParserErrorsToMonacoMarkers,
  parseEditorContent,
  setCommandEnabled,
  updateEditorContent,
} from "./MadieCqlEditor";

describe("MadieCqlEditor rendering", () => {
  it("renders editor textbox", () => {
    render(<MadieCqlEditor serviceConfig={{}} value="" onChange={jest.fn()} />);
    expect(screen.getByLabelText("Cql editor")).toBeInTheDocument();
  });

  it("calls onChange when text updates", () => {
    const onChange = jest.fn();
    render(<MadieCqlEditor serviceConfig={{}} value="" onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Cql editor"), {
      target: { value: 'define "A": true' },
    });

    expect(onChange).toHaveBeenCalledWith('define "A": true');
  });

  it("applies readonly mode", () => {
    render(
      <MadieCqlEditor
        serviceConfig={{}}
        value=""
        onChange={jest.fn()}
        readOnly
      />
    );
    expect(screen.getByLabelText("Cql editor")).toHaveAttribute("readonly");
  });

  it("runs the debounced parseValue callback for invalid CQL", () => {
    jest.useFakeTimers();
    try {
      const invalidCql =
        "library Test version '0.0.000'\nusing QICore version '4.1.1'";
      render(
        <MadieCqlEditor
          serviceConfig={{}}
          value={invalidCql}
          onChange={jest.fn()}
        />
      );

      // Flush the internal parse debounce so parseValue executes.
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(screen.getByLabelText("Cql editor")).toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });
});

describe("parser mapping", () => {
  it("maps parser errors to annotations", () => {
    const errors: CqlError[] = [
      {
        text: "error text",
        name: "error name",
        start: { line: 5, position: 10 },
        stop: { line: 5, position: 12 },
        message: 'Cannot find symbol "Measurement Period"',
      },
    ];

    expect(mapParserErrorsToMonacoAnnotations(errors)).toEqual([
      {
        row: 4,
        column: 10,
        type: "error",
        text: 'Parse: 10:12 | Cannot find symbol "Measurement Period"',
      },
    ]);

    expect(mapParserErrorsToMonacoMarkers(errors)).toEqual([
      {
        range: {
          start: { row: 4, column: 10 },
          end: { row: 4, column: 12 },
        },
        clazz: "editor-error-underline",
        type: "text",
      },
    ]);
  });

  it("handles empty error arrays", () => {
    expect(mapParserErrorsToMonacoAnnotations([])).toEqual([]);
    expect(mapParserErrorsToMonacoMarkers([])).toEqual([]);
  });

  it("defaults missing positions and stop values to zero/start", () => {
    const errors: CqlError[] = [
      {
        text: "error text",
        name: "error name",
        // no start/stop provided
        message: "missing positions",
      } as unknown as CqlError,
    ];

    expect(mapParserErrorsToMonacoAnnotations(errors)).toEqual([
      {
        row: 0,
        column: 0,
        type: "error",
        text: "Parse: 0:0 | missing positions",
      },
    ]);

    expect(mapParserErrorsToMonacoMarkers(errors)).toEqual([
      {
        range: {
          start: { row: 0, column: 0 },
          end: { row: 0, column: 0 },
        },
        clazz: "editor-error-underline",
        type: "text",
      },
    ]);
  });
});

describe("parseEditorContent", () => {
  it("returns no errors for empty content", () => {
    expect(parseEditorContent()).toEqual([]);
    expect(parseEditorContent("")).toEqual([]);
  });

  it("collects parser syntax errors without duplicating the context error", () => {
    const cql =
      "library Test version '0.0.000'\n" +
      "using QICore version '4.1.1'\n" +
      "context Patient\n" +
      "define %%%invalid";

    const errors = parseEditorContent(cql);
    expect(errors.length).toBeGreaterThan(0);
    // Patient context is present, so no "Measure Context" error is added.
    expect(
      errors.some((e) => e.message === "Measure Context must be 'Patient'.")
    ).toBe(false);
  });
});

describe("isUsingStatementEmpty", () => {
  it("returns true when there is no using statement", () => {
    expect(isUsingStatementEmpty("library Test version '0.0.000'")).toBe(true);
    expect(isUsingStatementEmpty("")).toBe(true);
  });

  it("returns false when a using statement exists", () => {
    const cql = "library Test version '0.0.000'\nusing QICore version '4.1.1'";
    expect(isUsingStatementEmpty(cql)).toBe(false);
  });
});

describe("setCommandEnabled", () => {
  it("disables and re-enables a command while preserving its shortcut", () => {
    const addCommand = jest.fn();
    const command: any = { name: "find", bindKey: "Ctrl-F" };
    const editor: any = {
      commands: { byName: { find: command }, addCommand },
    };

    setCommandEnabled(editor, "find", false);
    expect(command.bindKey).toBeNull();
    expect(command.__originalBindKey).toEqual("Ctrl-F");

    setCommandEnabled(editor, "find", true);
    expect(command.bindKey).toEqual("Ctrl-F");
    expect(addCommand).toHaveBeenCalledTimes(2);
  });

  it("is a no-op when the command or editor is missing", () => {
    const addCommand = jest.fn();
    const editor: any = { commands: { byName: {}, addCommand } };

    expect(() => setCommandEnabled(editor, "missing", true)).not.toThrow();
    expect(() => setCommandEnabled(undefined, "find", true)).not.toThrow();
    expect(addCommand).not.toHaveBeenCalled();
  });
});

describe("CQL sync and parser behavior", () => {
  it("overwrites incorrect library statement", async () => {
    const result = await updateEditorContent(
      "library Test versionsdwds '0.0.000''",
      "library Test version '0.0.000'",
      "Test",
      "",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "measureEditor"
    );

    expect(result.cql).toEqual("library Test version '0.0.000'");
    expect(result.isLibraryStatementChanged).toEqual(true);
  });

  it("flags missing Patient context", () => {
    const cql =
      "library SimpleEncounterMeasure version '0.0.000'\n" +
      "using QICore version '4.1.1'";

    const errors = parseEditorContent(cql);
    expect(errors.length).toEqual(1);
    expect(errors[0].message).toEqual("Measure Context must be 'Patient'.");
  });

  it("removes concept blocks and reports the change", async () => {
    const cql =
      "library Test version '0.0.000'\n" +
      "using QICore version '4.1.1'\n" +
      "concept \"Foo\": { bar } display 'x'";

    const result = await updateEditorContent(
      cql,
      "",
      "Test",
      "",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "measureEditor"
    );

    expect(result.isConceptRemoved).toEqual(true);
  });

  it("corrects a mismatched FHIRHelpers alias", async () => {
    const cql =
      "library Test version '0.0.000'\n" +
      "using QICore version '4.1.1'\n" +
      "include FHIRHelpers version '4.1.1' called Helpers";

    const result = await updateEditorContent(
      cql,
      "",
      "Test",
      "",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "measureEditor"
    );

    expect(result.isFhirHelpersAliasChanged).toEqual(true);
    expect(result.cql).toContain("called FHIRHelpers");
  });

  it("removes valueset version declarations and flags the change", async () => {
    const cql =
      "library Test version '0.0.000'\n" +
      "using QDM version '5.6'\n" +
      "valueset \"Test VS\":  'urn:oid:2.16.840.1.113762.1.4.1260.162' version 'urn:hl7:version:20240307'\n" +
      "context Patient";

    const result = await updateEditorContent(
      cql,
      "",
      "Test",
      "",
      "0.0.000",
      "QDM",
      "5.6",
      "measureEditor"
    );

    const valueSetLine = result.cql
      .split("\n")
      .find((line) => line.startsWith('valueset "Test VS":'));

    expect(result.isValueSetChanged).toEqual(true);
    expect(valueSetLine).toBe(
      "valueset \"Test VS\": 'urn:oid:2.16.840.1.113762.1.4.1260.162'"
    );
    expect(valueSetLine).not.toContain("version");
  });

  it("handles CQL without a library statement", async () => {
    const cql = "using QICore version '4.1.1'\ncontext Patient";

    const result = await updateEditorContent(
      cql,
      "",
      "Test",
      "",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "measureEditor"
    );

    // No library line to rename, so it is left unchanged.
    expect(result.isLibraryStatementChanged).toEqual(false);
    expect(result.cql).toContain("using QICore version '4.1.1'");
  });

  it("returns early when there is nothing to parse", async () => {
    const result = await updateEditorContent(
      "",
      "",
      "Test",
      "",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "measureEditor"
    );

    expect(result.cql).toEqual("");
    expect(result.isLibraryStatementChanged).toEqual(false);
  });

  it("updates existing CQL when the library name changes (non-editor trigger)", async () => {
    const existingCql =
      "library OldLib version '0.0.000'\nusing QICore version '4.1.1'";

    const result = await updateEditorContent(
      "ignored editor value",
      existingCql,
      "NewLib",
      "OldLib",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "someOtherTrigger"
    );

    expect(result.isLibraryStatementChanged).toEqual(true);
    expect(result.cql).toContain("library NewLib version '0.0.000'");
  });

  it("returns existing CQL unchanged when names match on a non-editor trigger", async () => {
    const result = await updateEditorContent(
      "editor value",
      "",
      "SameLib",
      "SameLib",
      "0.0.000",
      "QI-Core",
      "4.1.1",
      "someOtherTrigger"
    );

    expect(result.cql).toEqual("");
  });
});
