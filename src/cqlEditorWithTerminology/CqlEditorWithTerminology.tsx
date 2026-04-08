import React, { useState, useCallback } from "react";
import MadieAceEditor, { EditorPropsType } from "../AceEditor/madie-ace-editor";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import "./CqlEditorWithTerminology.scss";
import "./CommentsPanel.scss";
import CqlBuilderPanel from "../CqlBuilderPanel/CqlBuilderPanel";
import ExpansionIcon from "@mui/icons-material/KeyboardTabOutlined";
import { IconButton, Tooltip } from "@mui/material";
import Search from "@mui/icons-material/Search";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CommentsPanel from "./CommentsPanel";
import AddCommentPopup from "./AddCommentPopup";
import { useCodeReview } from "../hooks/useCodeReview";
import { useOktaTokens } from "@madie/madie-util";

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
  measureId,
}: EditorPropsType & { measureId?: string }) => {
  const [expanded, setExpanded] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return !params.has("tab");
  });

  // ── Comments Panel state ────────────────────────────────────────────────
  const [commentsPanelOpen, setCommentsPanelOpen] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  // ── Add Comment Popup state ─────────────────────────────────────────────
  const [addCommentPopup, setAddCommentPopup] = useState<{
    open: boolean;
    lineNumber: number;
    lineContent: string;
    position: { top: number; left: number };
  }>({
    open: false,
    lineNumber: 0,
    lineContent: "",
    position: { top: 0, left: 0 },
  });

  // ── Auth ────────────────────────────────────────────────────────────────
  const { getUserName } = useOktaTokens();
  const currentUser = getUserName() ?? "Unknown User";

  // ── Code Review Hook ────────────────────────────────────────────────────
  const { comments, loading, postComment, postReply, deleteComment } =
    useCodeReview(measureId ?? "");

  // Lines with comments (1-based)
  const commentedLines = comments.map((c) => c.lineNumber);

  const toggleSearch = () => {
    const event = new CustomEvent("toggleEditorSearchBox");
    window.dispatchEvent(event);
  };

  // Called from MadieAceEditor when + gutter icon is clicked
  const handleAddCommentRequest = useCallback(
    (
      lineNumber: number,
      lineContent: string,
      position: { top: number; left: number }
    ) => {
      // If there's already a comment on this line, open the panel and highlight it
      const existing = comments.find((c) => c.lineNumber === lineNumber);
      if (existing) {
        setActiveCommentId(existing.id);
        setCommentsPanelOpen(true);
        return;
      }
      setAddCommentPopup({ open: true, lineNumber, lineContent, position });
    },
    [comments]
  );

  const handlePostComment = async (text: string) => {
    if (!measureId) return;
    await postComment({
      measureId,
      lineNumber: addCommentPopup.lineNumber,
      lineContent: addCommentPopup.lineContent,
      author: currentUser,
      text,
    });
    setAddCommentPopup((prev) => ({ ...prev, open: false }));
    setCommentsPanelOpen(true);
  };

  const handlePostReply = async (commentId: string, text: string) => {
    await postReply(commentId, text, currentUser);
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
  };

  return (
    <div className="allotment-wrapper" id="cql-editor-with-terminology">
      <Allotment
        defaultSizes={
          commentsPanelOpen
            ? expanded
              ? [175, 60]
              : [140, 80, 60]
            : expanded
            ? [175]
            : [175, 125]
        }
        vertical={false}
      >
        {/* ── Left Pane: Editor ─────────────────────────────────────────── */}
        <Allotment.Pane minSize={200}>
          <div id="header-editor-row">
            <IconButton
              data-testid="editor-search-button"
              aria-label="search button"
              style={{ color: "#0073c8" }}
              onClick={toggleSearch}
            >
              <Search />
            </IconButton>

            {/* Comments Toggle */}
            <Tooltip
              title={commentsPanelOpen ? "Hide Comments" : "Show Comments"}
              placement="bottom"
            >
              <IconButton
                data-testid="comments-toggle-button"
                aria-label="toggle comments panel"
                style={{
                  color: commentsPanelOpen ? "#e8a020" : "#0073c8",
                  position: "relative",
                }}
                onClick={() => setCommentsPanelOpen((v) => !v)}
              >
                <ChatBubbleOutlineIcon />
                {comments.length > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 4,
                      background: "#e8a020",
                      color: "#fff",
                      borderRadius: "50%",
                      width: 14,
                      height: 14,
                      fontSize: 9,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                    }}
                  >
                    {comments.length > 9 ? "9+" : comments.length}
                  </span>
                )}
              </IconButton>
            </Tooltip>

            {expanded && (
              <IconButton
                data-testid="expanded-button"
                aria-label="editor-expanded"
                style={{ color: "#0073c8" }}
                onClick={() => setExpanded(false)}
              >
                <ExpansionIcon style={{ transform: "rotate(180deg)" }} />
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
                commentedLines={commentedLines}
                onAddComment={handleAddCommentRequest}
              />
            </div>
          </div>
        </Allotment.Pane>

        {/* ── Middle Pane: CQL Builder ─────────────────────────────────── */}
        {!expanded && (
          <Allotment.Pane minSize={120}>
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
        {commentsPanelOpen && (
          <Allotment.Pane minSize={240} preferredSize={320}>
            <CommentsPanel
              comments={comments}
              loading={loading}
              currentUser={currentUser}
              onReply={handlePostReply}
              onDelete={handleDeleteComment}
              activeCommentId={activeCommentId}
              onClose={() => {
                setCommentsPanelOpen(false);
                setActiveCommentId(null);
              }}
            />
          </Allotment.Pane>
        )}
      </Allotment>
      {addCommentPopup.open && (
        <AddCommentPopup
          lineNumber={addCommentPopup.lineNumber}
          lineContent={addCommentPopup.lineContent}
          anchorPosition={addCommentPopup.position}
          onSubmit={handlePostComment}
          onCancel={() =>
            setAddCommentPopup((prev) => ({ ...prev, open: false }))
          }
        />
      )}
    </div>
  );
};

export default CqlEditorWithTerminology;
