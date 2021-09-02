import React, { Component } from "react";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/theme-monokai";

export default function MadieAceEditor() {
  // state = {
  //   editorText: '',
  // };
  return (
    <React.Fragment>
      <AceEditor
        mode="cql"
        theme="monokai"
        // onChange={(val) => {
        //   this.setState({ editorText: val });
        // }}
        name="ace-editor-wrapper"
        editorProps={{ $blockScrolling: true }}
      />
      {/* <div>{this.state.editorText}</div> */}
    </React.Fragment>
  );
}

// export default MadieAceEditor;
