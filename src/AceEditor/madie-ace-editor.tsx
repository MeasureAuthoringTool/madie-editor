import React from "react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-monokai";

export default function MadieAceEditor({ props }) {
  return (
    <AceEditor
      mode="java"
      theme="monokai"
      onChange={(val) => {
        props.handleValueChanges(val);
      }}
      name="ace-editor-wrapper"
      editorProps={{ $blockScrolling: true }}
    />
  );
}
