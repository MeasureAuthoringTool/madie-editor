import React from "react";
import MadieAceEditor, { EditorPropsType } from "../AceEditor/madie-ace-editor";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "./CqlEditorWithTerminology.scss";
import TerminologySectionPanel from "../terminologySectionPanel/TerminologySectionPanel";

const CqlEditorWithTerminology = ({
  value,
  onChange,
  onTerminologyChange,
  handleCodeDelete,
  height,
  parseDebounceTime = 1500,
  inboundAnnotations,
  inboundErrorMarkers,
  readOnly = false,
  validationsEnabled = true,
  setOutboundAnnotations,
  measureStoreCql,
  cqlMetaData,
  measureModel,
}: EditorPropsType) => {
  return (
    <div className="allotment-wrapper" id="cql-editor-with-terminology">
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
            measureStoreCql={measureStoreCql}
            cqlMetaData={cqlMetaData}
            measureModel={measureModel}
            handleChange={onTerminologyChange}
            handleCodeDelete={handleCodeDelete}
          />
        </Allotment.Pane>
      </Allotment>
    </div>
  );
};

export default CqlEditorWithTerminology;
