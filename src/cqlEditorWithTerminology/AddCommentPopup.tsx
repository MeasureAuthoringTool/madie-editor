import React, { useEffect, useRef, useState } from "react";
import "./CommentsPanel.scss";

interface AddCommentPopupProps {
  lineNumber: number;
  lineContent: string;
  anchorPosition: { top: number; left: number };
  onSubmit: (text: string) => Promise<void>;
  onCancel: () => void;
}

const AddCommentPopup: React.FC<AddCommentPopupProps> = ({
  lineNumber,
  lineContent,
  anchorPosition,
  onSubmit,
  onCancel,
}) => {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus textarea on open
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCancel]);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
    } finally {
      setSubmitting(false);
    }
  };

  // Clamp popup so it stays on screen
  const popupWidth = 340;
  const viewportWidth = window.innerWidth;
  let left = anchorPosition.left;
  if (left + popupWidth > viewportWidth - 16) {
    left = viewportWidth - popupWidth - 16;
  }
  if (left < 8) left = 8;

  return (
    <>
      {/* Backdrop */}
      <div
        role="presentation"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
        }}
        onClick={onCancel}
      />

      {/* Popup dialog */}
      <div
        className="add-comment-popup"
        role="dialog"
        aria-modal="true"
        aria-label="Add comment"
        style={{
          top: anchorPosition.top,
          left,
        }}
      >
        <div className="add-comment-popup__header">
          <span>Add Comment</span>
          <button
            className="add-comment-popup__close"
            onClick={onCancel}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Line preview */}
        <div className="add-comment-popup__line-preview">
          <span className="add-comment-popup__line-num">L{lineNumber}</span>
          <span className="add-comment-popup__line-text">
            {lineContent || "(empty line)"}
          </span>
        </div>

        <textarea
          ref={textareaRef}
          className="add-comment-popup__textarea"
          placeholder="Leave a comment… (Ctrl+Enter to post)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />

        <div className="add-comment-popup__actions">
          <button
            className="comment-btn comment-btn--secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className="comment-btn comment-btn--primary"
            onClick={handleSubmit}
            disabled={submitting || !text.trim()}
          >
            {submitting ? "Posting…" : "Post Comment"}
          </button>
        </div>
      </div>
    </>
  );
};

export default AddCommentPopup;
