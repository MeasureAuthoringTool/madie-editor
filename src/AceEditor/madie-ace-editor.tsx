import React, { useEffect, useRef, useState } from "react";
import AceEditor from "react-ace";
import * as _ from "lodash";
import tw from "twin.macro";
import { CqlAntlr } from "@madie/cql-antlr-parser/dist/src";

import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";
import CqlMode from "./cql-mode";
import { Ace, Range } from "ace-builds";
import CqlError from "@madie/cql-antlr-parser/dist/src/dto/CqlError";

import "./madie-custom.css";
import { ParsedCql, Statement } from "../model/ParsedCql";

export interface EditorPropsType {
  value: string;
  onChange?: (value: string) => void;
  parseDebounceTime?: number;
  inboundAnnotations?: Ace.Annotation[];
  inboundErrorMarkers?: Ace.MarkerLike[];
  height?: string;
  readOnly?: boolean;
  validationsEnabled?: boolean;

  // conditional props used to pass up annotations outside of the editor
  setOutboundAnnotations?: Function;
}

export const parseEditorContent = (content): CqlError[] => {
  let errors: CqlError[] = [];
  if (content) {
    const parseOutput = new CqlAntlr(content).parse();
    if (parseOutput.errors && parseOutput.errors.length > 0) {
      errors = parseOutput.errors;
    }
  }
  return errors;
};

const parsingCql = (editorVal): ParsedCql => {
  //TODO: post MVP, move to ANTLR Parser, possibly the listener?
  //look at/use enterConceptDefinition
  const conceptToRemove = editorVal.match(/^\s*concept .*/gm);
  if (conceptToRemove) {
    conceptToRemove.map((conceptLine) => {
      editorVal = editorVal.replace(
        conceptLine,
        "/*CONCEPT DECLARATION REMOVED: CQL concept construct shall NOT be used.*/"
      );
    });
  }
  const parsedCql = new CqlAntlr(editorVal).parse();
  const cqlArrayToBeFiltered = editorVal.split("\n");
  const libraryContent = parsingLibrary(parsedCql, cqlArrayToBeFiltered);
  const usingContent = parsingUsing(parsedCql, cqlArrayToBeFiltered);
  return {
    cqlArrayToBeFiltered,
    libraryContent,
    usingContent,
  };
};

const parsingLibrary = (parsedCql, cqlArrayToBeFiltered): Statement => {
  if (parsedCql?.library) {
    const libraryContentIndex =
      parsedCql?.library && parsedCql?.library.start.line - 1;
    const libraryContentStatement = cqlArrayToBeFiltered[libraryContentIndex];
    return {
      statement: libraryContentStatement,
      index: libraryContentIndex,
    };
  }
};

const parsingUsing = (parsedCql, cqlArrayToBeFiltered): Statement => {
  if (parsedCql?.using) {
    const usingContentIndex =
      parsedCql?.using && parsedCql?.using.start.line - 1;
    const usingContentStatement = cqlArrayToBeFiltered[usingContentIndex];
    return {
      statement: usingContentStatement,
      index: usingContentIndex,
    };
  }
};

const synchingCql = (
  parsedEditorCql,
  libraryName,
  versionString,
  usingName,
  usingVersion
) => {
  if (parsedEditorCql) {
    if (parsedEditorCql.libraryContent) {
      parsedEditorCql.cqlArrayToBeFiltered[
        parsedEditorCql.libraryContent?.index
      ] = `library ${libraryName} version '${versionString}'`;
    }

    if (parsedEditorCql.usingContent) {
      parsedEditorCql.cqlArrayToBeFiltered[
        parsedEditorCql.usingContent?.index
      ] = `using ${usingName.replace("-", "")} version '${usingVersion}'`;
    }
  }
  return parsedEditorCql?.cqlArrayToBeFiltered?.join("\n");
};

export const parsingEditorCqlContent = async (
  editorVal,
  existingCql,
  libraryName,
  existingCqlLibraryName,
  versionString,
  usingName,
  usingVersion,
  triggeredFrom
) => {
  if (
    triggeredFrom === "measureEditor" ||
    triggeredFrom === "updateCqlLibrary"
  ) {
    const parsedEditorCql = editorVal ? await parsingCql(editorVal) : "";

    return synchingCql(
      parsedEditorCql,
      libraryName,
      versionString,
      usingName,
      usingVersion
    );
  } else {
    if (existingCql && existingCqlLibraryName !== libraryName) {
      const parsedEditorCql = await parsingCql(existingCql);
      if (parsedEditorCql) {
        return synchingCql(
          parsedEditorCql,
          libraryName,
          versionString,
          usingName,
          usingVersion
        );
      }
      return existingCql;
    }
    return existingCql;
  }
};

export const isUsingStatementEmpty = (editorVal): boolean => {
  const parsedCql = parsingCql(editorVal);
  if (parsedCql.usingContent === undefined) {
    return true;
  }
  return false;
};

export const mapParserErrorsToAceAnnotations = (
  errors: CqlError[]
): Ace.Annotation[] => {
  let annotations: Ace.Annotation[] = [];
  if (errors) {
    annotations = errors.map((error) => ({
      row: error.start.line - 1,
      column: error.start.position,
      type: "error",
      text: `Parse: ${error.start.position}:${error.stop.position} | ${error.message}`,
    }));
  }
  return annotations;
};

export const mapParserErrorsToAceMarkers = (errors: CqlError[]) => {
  let markers = [];
  if (errors) {
    markers = errors.map((error) => ({
      range: new Range(
        error.start.line - 1,
        error.start.position,
        error.stop.line - 1,
        error.stop.position
      ),
      clazz: "editor-error-underline",
      type: "text",
    }));
  }
  return markers;
};

var originalCommands;
export const setCommandEnabled = (editor, name, enabled) => {
  var command = editor.commands.byName[name];
  var bindKeyOriginal;
  if (!originalCommands) {
    originalCommands = JSON.parse(JSON.stringify(editor.commands));
  }
  var bindKeyOriginal = originalCommands.byName[name].bindKey;
  command.bindKey = enabled ? bindKeyOriginal : null;
  editor.commands.addCommand(command);
};

// console.log('iace', IAceEditorProps)
const MadieAceEditor = ({
  value,
  onChange,
  height,
  parseDebounceTime = 1500,
  inboundAnnotations,
  inboundErrorMarkers,
  readOnly = false,
  validationsEnabled = true,

  setOutboundAnnotations,
}: EditorPropsType) => {
  const [editor, setEditor] = useState<Ace.Editor>();
  const [editorAnnotations, setEditorAnnotations] = useState<Ace.Annotation[]>(
    []
  );
  const [parserAnnotations, setParserAnnotations] = useState<Ace.Annotation[]>(
    []
  );

  const [parseErrorMarkers, setParseErrorMarkers] = useState<Ace.MarkerLike[]>(
    []
  );
  const [isParsing, setParsing] = useState<boolean>(undefined);
  const aceRef = useRef<AceEditor>(null);

  aceRef?.current?.editor?.on("focus", function () {
    setCommandEnabled(editor, "indent", true);
    setCommandEnabled(editor, "outdent", true);
  });
  aceRef?.current?.editor?.on("blur", function () {
    setCommandEnabled(editor, "indent", true);
    setCommandEnabled(editor, "outdent", true);
  });

  aceRef?.current?.editor?.commands.addCommand({
    name: "escape",
    bindKey: { win: "Esc", mac: "Esc" },
    exec: function () {
      setCommandEnabled(editor, "indent", false);
      setCommandEnabled(editor, "outdent", false);
    },
  });

  const customSetAnnotations = (annotations, editor) => {
    editor.getSession().setAnnotations(annotations);
    // pass all the annotations we have out
    if (setOutboundAnnotations) {
      setOutboundAnnotations(annotations);
    }
    setEditorAnnotations(annotations);
  };

  const debouncedParse: any = useRef(
    _.debounce(async (nextValue: string) => {
      const errors = parseEditorContent(nextValue);
      const annotations = mapParserErrorsToAceAnnotations(errors);
      const aceMarkers = mapParserErrorsToAceMarkers(errors);
      setParseErrorMarkers(aceMarkers);
      setParserAnnotations(annotations);
      setParsing(false);
    }, parseDebounceTime)
  ).current;

  const removeErrorMarkersFromEditor = (session) => {
    let currMarkers = session.getMarkers(true);
    for (const m in currMarkers) {
      if (currMarkers[m].clazz === "editor-error-underline") {
        session.removeMarker(currMarkers[m].id);
      }
    }
  };

  useEffect(() => {
    if (validationsEnabled) {
      const iann = inboundAnnotations || [];
      const allAnnotations = [...iann, ...parserAnnotations];
      if (editor) {
        customSetAnnotations(allAnnotations, editor);
      } else {
        console.warn("Editor is not set! Cannot set annotations!", editor);
      }
    }
  }, [parserAnnotations, inboundAnnotations, editor]);

  useEffect(() => {
    if (editor && validationsEnabled) {
      let session = editor.getSession();
      // Remove previous error markers to prevent duplicates
      // (Ace renders each dup as a new element)
      removeErrorMarkersFromEditor(editor.getSession());
      // Set latest parseErrorMarkers
      const inbound = inboundErrorMarkers || [];
      const allErrorMarkers = [...inbound, ...parseErrorMarkers];
      allErrorMarkers.forEach((marker) => {
        let range = Range.fromPoints(marker.range.start, marker.range.end);
        // Set inFront to true to display underline when line is selected
        session.addMarker(range, "editor-error-underline", "text", true);
      });
    }
  }, [editor, parseErrorMarkers, inboundErrorMarkers]);

  useEffect(() => {
    const cqlMode = new CqlMode();
    // @ts-ignore
    aceRef?.current?.editor?.getSession()?.setMode(cqlMode);

    return () => {
      if (debouncedParse && validationsEnabled) {
        debouncedParse.cancel();
      }
    };
  }, [debouncedParse]);

  useEffect(() => {
    if (!_.isNil(value) && editor && validationsEnabled) {
      setParsing(true);
      debouncedParse(value, editor);
    }
  }, [value, editor, debouncedParse]);

  useEffect(() => {
    // This is to set aria-label on textarea for accessibility
    aceRef.current.editor.container
      .getElementsByClassName("ace_text-input")[0]
      .setAttribute("aria-label", "Cql editor");
  });

  return (
    <div>
      <AceEditor
        mode="sql" // Temporary value of mode to prevent a dynamic search request.
        ref={aceRef}
        theme="monokai"
        value={value}
        onChange={(value) => {
          onChange(value);
        }}
        onLoad={(aceEditor) => {
          // On load we want to tell the ace editor that it's inside of a scrollabel page
          aceEditor.setOption("autoScrollEditorIntoView", true);
          setEditor(aceEditor);
        }}
        width="100%"
        height={height}
        wrapEnabled={true}
        readOnly={readOnly}
        name="ace-editor-wrapper"
        enableBasicAutocompletion={true}
      />
    </div>
  );
};

export default MadieAceEditor;
