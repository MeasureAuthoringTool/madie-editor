import React, { MouseEvent, useState } from "react";
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
  handleDefinitionDelete,
  handleApplyCode,
  handleApplyValueSet,
  handleApplyDefinition,
  handleApplyLibrary,
  handleDeleteLibrary,
  handleDefinitionEdit,
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
  resetCql,
}: EditorPropsType) => {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="allotment-wrapper" id="cql-editor-with-terminology">
      <Allotment defaultSizes={[175, 125]} vertical={false}>
        <Allotment.Pane>
          <div style={{ borderWidth: "24px", borderColor: "#ededed" }}>
            {expanded && (
              <button
                data-testid="expanded-button"
                aria-label="editor-expanded"
                style={{
                  float: "right",
                  color: "#0073c8",
                  marginTop: "-15px",
                }}
                onClick={() => {
                  setExpanded(false);
                }}
              >
                <ExpansionIcon
                  style={{
                    transform: "rotate(180deg)",
                  }}
                />
              </button>
            )}
            {!expanded && (
              <button
                data-testid="collapsed-button"
                aria-label="editor-collapsed"
                style={{
                  float: "right",
                  color: "#0073c8",
                  marginTop: "-15px",
                }}
                onClick={() => {
                  setExpanded(true);
                }}
              >
                <ExpansionIcon />
              </button>
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
              handleDefinitionEdit={handleDefinitionEdit}
              handleDefinitionDelete={handleDefinitionDelete}
              handleApplyLibrary={handleApplyLibrary}
              handleDeleteLibrary={handleDeleteLibrary}
              resetCql={resetCql}
            />
          </Allotment.Pane>
        )}
      </Allotment>
    </div>
  );
};

export default CqlEditorWithTerminology;
