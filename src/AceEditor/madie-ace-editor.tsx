import React, { useEffect, useRef } from "react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-eclipse";
import CqlMode from "./cql-mode";

export default function MadieAceEditor({ props }) {
  const aceRef = useRef<AceEditor>(null);
  // const { width, height } = useResizeDetector({ aceRef });

  useEffect(() => {
    const cqlMode = new CqlMode();
    // @ts-ignore
    aceRef?.current?.editor?.getSession()?.setMode(cqlMode);
  }, []);

  return (
    <AceEditor
      mode="sql" // Temp value of mode
      ref={aceRef}
      theme="eclipse"
      defaultValue={props.defaultValue}
      onChange={(val) => {
        props.handleValueChanges(val);
      }}
      width="100%"
      name="ace-editor-wrapper"
      editorProps={{ $blockScrolling: true }}
    />
  );
}
