import React, { MouseEvent, useState } from "react";
import MadieAceEditor, { EditorPropsType } from "../AceEditor/madie-ace-editor";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "./CqlEditorWithTerminology.scss";
import CqlBuilderPanel from "../CqlBuilderPanel/CqlBuilderPanel";
import ExpansionIcon from "@mui/icons-material/KeyboardTabOutlined";
import { IconButton } from "@mui/material";
import Search from "@mui/icons-material/Search";
import ChatIcon from "@mui/icons-material/ChatOutlined";
import ChatPanel from "../Chatbot/ChatPanel";

const CqlEditorWithTerminology = ({
  value,
  onChange,
  handleCodeDelete,
  handleDefinitionDelete,
  handleApplyCode,
  handleApplyParameter,
  handleParameterEdit,
  handleParameterDelete,
  handleApplyValueSet,
  handleApplyDefinition,
  handleApplyLibrary,
  handleEditLibrary,
  handleDeleteLibrary,
  handleDefinitionEdit,
  handleApplyFunction,
  handleFunctionDelete,
  handleFunctionEdit,
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
  hasCqlError,
}: EditorPropsType) => {
  const [expanded, setExpanded] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return !params.has("tab");
  });
  const [chatOpen, setChatOpen] = useState(false);

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
            <IconButton
              data-testid="editor-chat-button"
              aria-label="toggle chat"
              style={{
                color: chatOpen ? "#005a9e" : "#0073c8",
              }}
              onClick={() => setChatOpen((prev) => !prev)}
            >
              <ChatIcon />
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
          <div
            className="left-panel"
            style={{ display: "flex", flexDirection: "row" }}
          >
            <div
              className="panel-content"
              style={{ flex: chatOpen ? "1 1 50%" : "1 1 100%" }}
            >
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
            {chatOpen && (
              <div className="chat-panel-wrapper">
                <ChatPanel onChatToggle={() => setChatOpen(false)} />
              </div>
            )}
          </div>
        </Allotment.Pane>
        {!expanded && (
          <Allotment.Pane>
            <CqlBuilderPanel
              makeExpanded={() => {
                setExpanded(true);
                const url = new URL(window.location.href);
                url.searchParams.delete("tab");
                window.history.replaceState({}, "", url.toString());
              }}
              canEdit={!readOnly}
              measureStoreCql={measureStoreCql}
              cqlMetaData={cqlMetaData}
              measureModel={measureModel}
              handleCodeDelete={handleCodeDelete}
              setEditorVal={setEditorVal}
              setIsCQLUnchanged={setIsCQLUnchanged}
              isCQLUnchanged={isCQLUnchanged}
              editorVal={value}
              handleApplyCode={handleApplyCode}
              handleApplyParameter={handleApplyParameter}
              handleParameterEdit={handleParameterEdit}
              handleParameterDelete={handleParameterDelete}
              handleApplyValueSet={handleApplyValueSet}
              handleApplyDefinition={handleApplyDefinition}
              handleDefinitionEdit={handleDefinitionEdit}
              handleDefinitionDelete={handleDefinitionDelete}
              handleApplyLibrary={handleApplyLibrary}
              handleEditLibrary={handleEditLibrary}
              handleDeleteLibrary={handleDeleteLibrary}
              handleApplyFunction={handleApplyFunction}
              handleFunctionDelete={handleFunctionDelete}
              handleFunctionEdit={handleFunctionEdit}
              resetCql={resetCql}
              getCqlDefinitionReturnTypes={getCqlDefinitionReturnTypes}
              hasCqlError={hasCqlError}
            />
          </Allotment.Pane>
        )}
      </Allotment>
    </div>
  );
};

export default CqlEditorWithTerminology;
