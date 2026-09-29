import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import CqlError from "@madie/cql-antlr-parser/dist/src/dto/CqlError";
import MadieMonacoEditor, {
  mapParserErrorsToMonacoAnnotations,
  mapParserErrorsToMonacoMarkers,
  parseEditorContent,
  updateEditorContent,
} from "./madie-monaco-editor";

describe("MadieMonacoEditor (Monaco-backed)", () => {
  it("renders the editor", () => {
    render(
      <MadieMonacoEditor serviceConfig={{}} value="" onChange={jest.fn()} />
    );
    expect(screen.getByLabelText("Cql editor")).toBeInTheDocument();
  });

  it("calls onChange when text updates", () => {
    const onChange = jest.fn();
    render(
      <MadieMonacoEditor serviceConfig={{}} value="" onChange={onChange} />
    );

    fireEvent.change(screen.getByLabelText("Cql editor"), {
      target: { value: "using QICore version '4.1.1'" },
    });

    expect(onChange).toHaveBeenCalledWith("using QICore version '4.1.1'");
  });

  it("applies readonly mode", () => {
    render(
      <MadieMonacoEditor
        serviceConfig={{}}
        value=""
        onChange={jest.fn()}
        readOnly
      />
    );
    expect(screen.getByLabelText("Cql editor")).toHaveAttribute("readonly");
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
});
