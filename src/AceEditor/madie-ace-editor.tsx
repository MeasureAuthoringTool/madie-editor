import React, { useEffect, useRef } from "react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";
import CqlMode from "./cql-mode";

export default function MadieAceEditor({ props }) {
  const aceRef = useRef<AceEditor>(null);
  useEffect(() => {
    const cqlMode = new CqlMode();
    // @ts-ignore
    aceRef?.current?.editor?.getSession()?.setMode(cqlMode);
  }, []);

  return (
    <AceEditor
      mode="sql" // Temporary value of mode to prevent a dynamic search request.
      ref={aceRef}
      theme="monokai"
      defaultValue={props.defaultValue}
      onChange={(val) => {
        props.handleValueChanges(val);
      }}
      width="100%"
      name="ace-editor-wrapper"
      enableBasicAutocompletion={true}
      editorProps={{ $blockScrolling: true }}
    />
  );
}
