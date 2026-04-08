import React, { useState } from "react";
import { CodeReviewComment, CommentReply } from "@madie/madie-util";
import "./CommentsPanel.scss";
import _ from "lodash";

interface CommentThreadProps {
  comment: CodeReviewComment;
  currentUser: string;
  onReply: (commentId: string, text: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  isActive: boolean;
  onActivate: () => void;
}

const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  currentUser,
  onReply,
  onDelete,
  isActive,
  onActivate,
}) => {
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleReply = async () => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await onReply(comment.id, trimmed);
      setReplyText("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!comment.id) return;
    setDeleting(true);
    try {
      await onDelete(comment.id);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const initials = (name: string) =>
    (name ?? "?")
      .split(/[\s@.]+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? "")
      .join("");

  const isAuthor =
    comment.author && _.toLower(comment.author) === _.toLower(currentUser);

  return (
    <div
      className={`comment-thread ${isActive ? "comment-thread--active" : ""}`}
      onClick={onActivate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onActivate()}
    >
      {/* Line Snippet */}
      <div className="comment-thread__line-snippet">
        <div className="comment-thread__line-code-block">
          <span className="comment-thread__line-badge">
            L{comment.lineNumber}
          </span>
          <code className="comment-thread__line-code">
            {comment.lineContent || "(empty line)"}
          </code>
        </div>
      </div>

      {/* Root comment */}
      <div className="comment-entry">
        <div className="comment-entry__avatar" title={comment.author}>
          {initials(comment.author ?? "")}
        </div>
        <div className="comment-entry__body">
          <div className="comment-entry__meta">
            <span className="comment-entry__author">
              {comment.author ?? "Unknown"}
            </span>
            <span className="comment-entry__date">
              {formatDate(comment.createdAt ?? "")}
            </span>
            {/* Delete — only shown to the comment author */}
            {isAuthor && (
              <button
                className="comment-btn comment-btn--danger comment-btn--xs"
                onClick={handleDelete}
                disabled={deleting}
                title="Delete comment"
                aria-label="Delete comment"
              >
                {deleting ? "…" : "Delete"}
              </button>
            )}
          </div>
          <p className="comment-entry__text">{comment.text}</p>
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div className="comment-thread__replies">
          {comment.replies.map((reply: CommentReply) => (
            <div key={reply.id} className="comment-entry comment-entry--reply">
              <div
                className="comment-entry__avatar comment-entry__avatar--sm"
                title={reply.author}
              >
                {initials(reply.author ?? "")}
              </div>
              <div className="comment-entry__body">
                <div className="comment-entry__meta">
                  <span className="comment-entry__author">
                    {reply.author ?? "Unknown"}
                  </span>
                  <span className="comment-entry__date">
                    {formatDate(reply.createdAt ?? "")}
                  </span>
                </div>
                <p className="comment-entry__text">{reply.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Input */}
      {isActive && (
        <div
          className="comment-thread__reply-box"
          onClick={(e) => e.stopPropagation()}
          role="presentation"
        >
          <textarea
            className="comment-thread__reply-input"
            placeholder="Write a reply…"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleReply();
              }
            }}
          />
          <div className="comment-thread__reply-actions">
            <span className="comment-thread__hint">Ctrl+Enter to submit</span>
            <button
              className="comment-btn comment-btn--secondary"
              onClick={() => {
                setReplyText("");
              }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              className="comment-btn comment-btn--primary"
              onClick={handleReply}
              disabled={submitting || !replyText.trim()}
            >
              {submitting ? "Posting…" : "Reply"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface CommentsPanelProps {
  comments: CodeReviewComment[];
  loading: boolean;
  currentUser: string;
  onReply: (commentId: string, text: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  activeCommentId?: string | null;
  onClose: () => void;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({
  comments,
  loading,
  currentUser,
  onReply,
  onDelete,
  activeCommentId,
  onClose,
}) => {
  const [activeThread, setActiveThread] = useState<string | null>(
    activeCommentId ?? null
  );

  React.useEffect(() => {
    if (activeCommentId) {
      setActiveThread(activeCommentId);
    }
  }, [activeCommentId]);

  const sortedComments = [...comments].sort(
    (a, b) => a.lineNumber - b.lineNumber
  );

  return (
    <div className="comments-panel" data-testid="comments-panel">
      <div className="comments-panel__header">
        <div className="comments-panel__header-left">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Review Comments</span>
          {comments.length > 0 && (
            <span className="comments-panel__count">{comments.length}</span>
          )}
        </div>
        <button
          className="comments-panel__close"
          onClick={onClose}
          aria-label="Close comments panel"
          title="Close"
        >
          ✕
        </button>
      </div>

      <div className="comments-panel__body">
        {loading && (
          <div className="comments-panel__empty">
            <div className="comments-panel__spinner" />
            <p>Loading comments…</p>
          </div>
        )}
        {!loading && sortedComments.length === 0 && (
          <div className="comments-panel__empty">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c0c0c0"
              strokeWidth="1.5"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p>No comments yet.</p>
            <small>
              Click the <strong>+</strong> icon in the editor gutter to add a
              comment on a line.
            </small>
          </div>
        )}
        {!loading &&
          sortedComments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onReply={onReply}
              onDelete={onDelete}
              isActive={activeThread === comment.id}
              onActivate={() =>
                setActiveThread(activeThread === comment.id ? null : comment.id)
              }
            />
          ))}
      </div>
    </div>
  );
};

export default CommentsPanel;
