import React, { MouseEvent, useState } from "react";
import MadieAceEditor, { EditorPropsType } from "../AceEditor/madie-ace-editor";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "./CqlEditorWithTerminology.scss";
import CqlBuilderPanel from "../CqlBuilderPanel/CqlBuilderPanel";
import ExpansionIcon from "@mui/icons-material/KeyboardTabOutlined";
import { IconButton } from "@mui/material";
import Search from "@mui/icons-material/Search";

const CqlEditorWithTerminology = ({
  value,
  onChange,
  handleCodeDelete,
  handleDefinitionDelete,
  handleApplyCode,
  handleApplyParameter,
  handleApplyValueSet,
  handleApplyDefinition,
  handleApplyLibrary,
  handleEditLibrary,
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
  getCqlDefinitionReturnTypes,
}: EditorPropsType) => {
  const [expanded, setExpanded] = useState(true);
  const toggleSearch = () => {
    const event = new CustomEvent("toggleEditorSearchBox");
    window.dispatchEvent(event);
  };
  return (
    <div className="allotment-wrapper" id="cql-editor-with-terminology">
      <Allotment defaultSizes={[175, 125]} vertical={false}>
        <Allotment.Pane>
          <div id="header-editor-row">
            <IconButton
              data-testid="editor-search-button"
              aria-label="search button"
              style={{
                color: "#0073c8",
              }}
              onClick={toggleSearch}
            >
              <Search />
            </IconButton>
            {expanded && (
              <IconButton
                data-testid="expanded-button"
                aria-label="editor-expanded"
                style={{
                  color: "#0073c8",
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
              </IconButton>
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
              makeExpanded={() => {
                setExpanded(true);
              }}
              canEdit={!readOnly}
              measureStoreCql={measureStoreCql}
              cqlMetaData={cqlMetaData}
              measureModel={measureModel}
              handleCodeDelete={handleCodeDelete}
              setEditorVal={setEditorVal}
              setIsCQLUnchanged={setIsCQLUnchanged}
              isCQLUnchanged={isCQLUnchanged}
              handleApplyCode={handleApplyCode}
              handleApplyParameter={handleApplyParameter}
              handleApplyValueSet={handleApplyValueSet}
              handleApplyDefinition={handleApplyDefinition}
              handleDefinitionEdit={handleDefinitionEdit}
              handleDefinitionDelete={handleDefinitionDelete}
              handleApplyLibrary={handleApplyLibrary}
              handleEditLibrary={handleEditLibrary}
              handleDeleteLibrary={handleDeleteLibrary}
              resetCql={resetCql}
              getCqlDefinitionReturnTypes={getCqlDefinitionReturnTypes}
            />
          </Allotment.Pane>
        )}
      </Allotment>
    </div>
  );
};

export default CqlEditorWithTerminology;
