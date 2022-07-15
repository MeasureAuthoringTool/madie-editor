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
import {
  ElmTranslation,
  ElmTranslationError,
} from "../api/useElmTranslationServiceApi";
import TranslateCql from "../validations/elmTranslateValidation";
import ValidateCustomCqlCodes, {
  getCustomCqlCodes,
  mapCodeSystemErrorsToTranslationErrors,
} from "../validations/codesystemValidation";
import { CustomCqlCode } from "../api/useTerminologyServiceApi";
import GetValueSetErrors from "../validations/valuesetValidation";
import CheckLogin from "../validations/umlsLogin";
import CqlResult from "@madie/cql-antlr-parser/dist/src/dto/CqlResult";
import "./madie-custom.css";

export interface EditorPropsType {
  value: string;
  onChange: (value: string) => void;
  parseDebounceTime?: number;
  inboundAnnotations?: Ace.Annotation[];
  inboundErrorMarkers?: Ace.MarkerLike[];
  height?: string;
  readOnly?: boolean;
}

export const parseEditorContent = (content): CqlError[] => {
  let errors: CqlError[] = [];
  const parseOutput = new CqlAntlr(content).parse();
  if (parseOutput.errors && parseOutput.errors.length > 0) {
    errors = parseOutput.errors;
  }
  let errorsWithType: CqlError[] = [];
  errors.forEach((error) => {
    error.name = "Parse";
    errorsWithType.push(error);
  });
  return errorsWithType;
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
      text: `${error.name}: ${error.start.position}:${error.stop.position} | ${error.message}`,
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

const FooterDiv = tw.div`border border-gray-300 sm:text-sm`;
// console.log('iace', IAceEditorProps)
const MadieAceEditor = ({
  value,
  onChange,
  height,
  parseDebounceTime = 1500,
  inboundAnnotations,
  inboundErrorMarkers,
  readOnly = false,
}: EditorPropsType) => {
  const [editor, setEditor] = useState<any>();
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

  const [testAnnotations, setTestAnnotations] =
    useState<Ace.Annotation[]>(inboundAnnotations);

  const customSetAnnotations = (annotations, editor) => {
    editor.getSession().setAnnotations(annotations);
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
    const iann = inboundAnnotations || [];
    const allAnnotations = [...iann, ...parserAnnotations];
    if (editor) {
      customSetAnnotations(allAnnotations, editor);
    } else {
      console.warn("Editor is not set! Cannot set annotations!", editor);
    }
  }, [parserAnnotations, inboundAnnotations, editor]);

  useEffect(() => {
    if (editor) {
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
      if (debouncedParse) {
        debouncedParse.cancel();
      }
    };
  }, [debouncedParse]);

  useEffect(() => {
    if (!_.isNil(value) && editor) {
      setParsing(true);
      debouncedParse(value, editor);
    }
  }, [value, editor, debouncedParse]);

  const renderFooterMsg = () => {
    if (isParsing) {
      return <span>Parsing...</span>;
    } else if (editorAnnotations && editorAnnotations.length > 0) {
      return (
        <span>{editorAnnotations.length} issues were found with CQL...</span>
      );
    } else {
      return <span>Parsing complete, CQL is valid</span>;
    }
  };

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
      <FooterDiv>{renderFooterMsg()}</FooterDiv>
    </div>
  );
};

export const useGetAllErrors = async (
  cql: string
): Promise<ElmTranslationError[]> => {
  if (cql && cql.trim().length > 0) {
    const cqlResult: CqlResult = new CqlAntlr(cql).parse();
    const customCqlCodes: CustomCqlCode[] = getCustomCqlCodes(cql, cqlResult);
    const isLoggedInUMLS = await Promise.resolve(CheckLogin());
    const [validatedCodes, translationResults, valuesetsErrors] =
      await Promise.all([
        ValidateCustomCqlCodes(customCqlCodes, isLoggedInUMLS.valueOf()),
        TranslateCql(cql),
        GetValueSetErrors(cqlResult.valueSets, isLoggedInUMLS.valueOf()),
      ]);
    const codeSystemCqlErrors =
      mapCodeSystemErrorsToTranslationErrors(validatedCodes);

    let allErrorsArray: ElmTranslationError[] =
      setErrorsToElmTranslationError(translationResults);

    codeSystemCqlErrors.forEach((codeError) => {
      allErrorsArray.push(codeError);
    });

    if (valuesetsErrors && valuesetsErrors.length > 0) {
      valuesetsErrors.map((valueSet) => {
        allErrorsArray.push(valueSet);
      });
    }
    return allErrorsArray;
  }
  return null;
};
const setErrorsToElmTranslationError = (
  translationResults: ElmTranslation
): ElmTranslationError[] => {
  let allErrorsArray: ElmTranslationError[] = [];
  const translationErrors: ElmTranslationError[] =
    translationResults?.errorExceptions
      ? translationResults?.errorExceptions
      : [];
  translationErrors.forEach((translationError) => {
    translationError.errorType = "ELM";
    allErrorsArray.push(translationError);
  });
  return allErrorsArray;
};

export default MadieAceEditor;
