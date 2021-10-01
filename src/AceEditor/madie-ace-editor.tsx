import React, { useEffect, useRef } from "react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";
import CqlMode from "./cql-mode";

export default function MadieAceEditor({ props }) {
  const aceRef = useRef<AceEditor>(null);
  const localStorageKey = props.localStorageKey ?? "cql";
  const [cql, setCql] = React.useState(localStorage.getItem(localStorageKey));

  useEffect(() => {
    const cqlMode = new CqlMode();
    // @ts-ignore
    aceRef?.current?.editor?.getSession()?.setMode(cqlMode);
    localStorage.setItem(localStorageKey, cql);
  }, [cql, localStorageKey]);

  return (
    <AceEditor
      mode="sql" // Temporary value of mode to prevent a dynamic search request.
      ref={aceRef}
      theme="monokai"
      defaultValue={props.defaultValue}
      onChange={(val) => {
        setCql(aceRef?.current?.editor?.getValue());
        props.handleValueChanges(val);
      }}
      width="100%"
      name="ace-editor-wrapper"
      enableBasicAutocompletion={true}
      value={cql}
      editorProps={{ $blockScrolling: true }}
    />
  );
}
