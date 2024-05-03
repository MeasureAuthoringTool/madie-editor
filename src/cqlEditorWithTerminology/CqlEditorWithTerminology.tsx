import React, { useEffect, useState } from "react";
import MadieAceEditor, { EditorPropsType } from "../AceEditor/madie-ace-editor";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "./CqlEditorWithTerminology.scss";
import TerminologySectionPanel from "../terminologySectionPanel/TerminologySectionPanel";

const CqlEditorWithTerminology = ({
  value,
  onChange,
  height,
  parseDebounceTime = 1500,
  inboundAnnotations,
  inboundErrorMarkers,
  readOnly = false,
  validationsEnabled = true,
  setOutboundAnnotations,
  measureStoreCql,
}: EditorPropsType) => {
  // const [handleFormSubmit, setHandleFormSubmit] = useState<boolean>(false);

  // const handleEventReceived = (event) => {
  //   if (event && event.type === "submitButtonClicked") {
  //     setHandleFormSubmit(true);
  //   }
  // };

  // useEffect(() => {
  //   // Subscribe to the custom event
  //   window.addEventListener("submitButtonClicked", handleEventReceived);

  //   // Cleanup
  //   return () => {
  //     window.removeEventListener("submitButtonClicked", handleEventReceived);
  //   };
  // }, []);

  return (
    <div className="allotment-wrapper">
      <Allotment defaultSizes={[175, 125]} vertical={false}>
        <Allotment.Pane>
          <div style={{ borderWidth: "24px", borderColor: "#ededed" }} />
          <div className="left-panel">
            <div className="panel-content">
              <MadieAceEditor
                value={value}
                onChange={onChange}
                height={height}
                parseDebounceTime={parseDebounceTime}
                inboundAnnotations={inboundAnnotations}
                inboundErrorMarkers={inboundErrorMarkers}
                readOnly={readOnly}
                validationsEnabled={validationsEnabled}
                setOutboundAnnotations={setOutboundAnnotations}
              />
            </div>
          </div>
        </Allotment.Pane>
        <Allotment.Pane>
          <TerminologySectionPanel
            canEdit={!readOnly}
            //editorValue={value}
            // handleFormSubmit={handleFormSubmit}
            // setHandleFormSubmit={setHandleFormSubmit}
            measureStoreCql={measureStoreCql}
          />
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};

export default CqlEditorWithTerminology;
