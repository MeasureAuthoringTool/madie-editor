import React, { useEffect, useRef } from "react";
import AceEditor from "react-ace";

// import * as Ace from "ace-builds"
// import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-eclipse";
import CqlMode from "./cql-mode";
// import "ace-builds/src-noconflict/mode-python";
// import "ace-builds/src-noconflict/mode-cql";
export default function MadieAceEditor({ props }) {
  const aceRef = useRef<AceEditor>(null);

  useEffect(() => {
    const cqlMode = new CqlMode();
    // @ts-ignore
    aceRef?.current?.editor?.getSession()?.setMode(cqlMode);
  }, []);

  // useMemo(() => {
  //   // @ts-ignore
  //   aceRef?.current?.editor?.getSession()?.setMode(CqlMode);
  // }, []);

  return (
    <AceEditor
      // mode="java"
      ref={aceRef}
      theme="eclipse"
      defaultValue={props.defaultValue}
      onChange={(val) => {
        props.handleValueChanges(val);
      }}
      name="ace-editor-wrapper"
      editorProps={{ $blockScrolling: true }}
    />
  );
}
