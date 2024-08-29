import React, { useState } from "react";
import MadieAceEditor, { EditorPropsType } from "../AceEditor/madie-ace-editor";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "./CqlEditorWithTerminology.scss";
import CqlBuilderPanel from "../CqlBuilderPanel/CqlBuilderPanel";
import ExpansionIcon from "@mui/icons-material/KeyboardTabOutlined";

const CqlEditorWithTerminology = ({
  value,
  onChange,
  handleCodeDelete,
  handleApplyCode,
  handleApplyValueSet,
  handleApplyDefinition,
  handleApplyLibrary,
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
  setEditorVal,
  setIsCQLUnchanged,
  isCQLUnchanged,
}: EditorPropsType) => {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="allotment-wrapper" id="cql-editor-with-terminology">
      <Allotment defaultSizes={[175, 125]} vertical={false}>
        <Allotment.Pane>
          <div style={{ borderWidth: "24px", borderColor: "#ededed" }}>
            {expanded && (
              <ExpansionIcon
                style={{
                  float: "right",
                  color: "#0073c8",
                  transform: "rotate(180deg)",
                }}
                data-testid="expanded"
                aria-label="editor-expanded"
                onClick={() => {
                  setExpanded(false);
                }}
              />
            )}
            {!expanded && (
              <ExpansionIcon
                style={{ float: "right", color: "#0073c8" }}
                data-testid="collapsed"
                aria-label="editor-collapsed"
                onClick={() => {
                  setExpanded(true);
                }}
              />
            )}
          </div>
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
        {!expanded && (
          <Allotment.Pane>
            <CqlBuilderPanel
              canEdit={!readOnly}
              measureStoreCql={measureStoreCql}
              cqlMetaData={cqlMetaData}
              measureModel={measureModel}
              handleCodeDelete={handleCodeDelete}
              setEditorVal={setEditorVal}
              setIsCQLUnchanged={setIsCQLUnchanged}
              isCQLUnchanged={isCQLUnchanged}
              handleApplyCode={handleApplyCode}
              handleApplyValueSet={handleApplyValueSet}
              handleApplyDefinition={handleApplyDefinition}
              handleApplyLibrary={handleApplyLibrary}
            />
          </Allotment.Pane>
        )}
      </Allotment>
    </div>
  );
};

export default CqlEditorWithTerminology;
