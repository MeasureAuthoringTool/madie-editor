import React from "react";
import MadieAceEditor from "./AceEditor/ace-editor";

export default function Root(props) {
  return (
    <React.Fragment>
      <section>{props.name} is mounted!</section>
      <MadieAceEditor />
    </React.Fragment>
  );
}
