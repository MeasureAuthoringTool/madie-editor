import React from "react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/theme-monokai";

export default function MadieAceEditor({ props }) {
  return (
    <AceEditor
      mode="cql"
      theme="monokai"
      onChange={(val) => {
        props.handleValueChanges(val);
      }}
      data-testid="ace-editor-wrapper"
      name="ace-editor-wrapper"
      editorProps={{ $blockScrolling: true }}
    />
  );
}
