import React, { useEffect, useRef, useState } from "react";
import AceEditor from "react-ace";
import * as _ from "lodash";
import tw from "twin.macro";
import { CqlAntlr } from "@madie/cql-antlr-parser/dist/src";

import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";
import CqlMode from "./cql-mode";
import { Ace } from "ace-builds";
import CqlError from "@madie/cql-antlr-parser/dist/src/dto/CqlError";

export interface EditorPropsType {
  value: string;
  onChange: (value: string) => void;
  parseDebounceTime?: number;
  inboundAnnotations?: Ace.Annotation[];
}

export const parseEditorContent = (content): any[] => {
  let errors: CqlError[] = [];
  const parseOutput = new CqlAntlr(content).parse();
  if (parseOutput.errors && parseOutput.errors.length > 0) {
    errors = parseOutput.errors;
  }
  return errors;
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

const FooterDiv = tw.div`border border-gray-300 sm:text-sm`;

const MadieAceEditor = ({
  value,
  onChange,
  parseDebounceTime = 1500,
  inboundAnnotations,
}: EditorPropsType) => {
  const [editor, setEditor] = useState<any>();
  const [editorAnnotations, setEditorAnnotations] = useState<Ace.Annotation[]>(
    []
  );
  const [parserAnnotations, setParserAnnotations] = useState<Ace.Annotation[]>(
    []
  );
  const [isParsing, setParsing] = useState(false);
  const aceRef = useRef<AceEditor>(null);

  const customSetAnnotations = (annotations, editor) => {
    editor.getSession().setAnnotations(annotations);
    setEditorAnnotations(annotations);
  };

  const debouncedParse: any = useRef(
    _.debounce(async (nextValue: string) => {
      const errors = parseEditorContent(nextValue);
      const annotations = mapParserErrorsToAceAnnotations(errors);
      setParserAnnotations(annotations);
      setParsing(false);
    }, parseDebounceTime)
  ).current;

  useEffect(() => {
    const iann = inboundAnnotations || [];
    const allAnnotations = [...iann, ...parserAnnotations];
    if (editor) {
      customSetAnnotations(allAnnotations, editor);
    } else {
      console.warn("Editor is not set! Cannot set annotations!", editor);
    }
  }, [parserAnnotations, inboundAnnotations]);

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
          setEditor(aceEditor);
        }}
        width="100%"
        name="ace-editor-wrapper"
        enableBasicAutocompletion={true}
        editorProps={{ $blockScrolling: true }}
      />
      <FooterDiv>{renderFooterMsg()}</FooterDiv>
    </div>
  );
};

export default MadieAceEditor;
