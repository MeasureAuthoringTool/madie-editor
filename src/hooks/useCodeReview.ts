import { useState, useCallback, useEffect, useRef } from "react";
import {
  useCodeReviewServiceApi,
  type CodeReviewComment,
  type CreateCommentPayload,
  type AddReplyPayload,
} from "@madie/madie-util";

// All comments created in the CQL editor are prefixed with this string.
// This lets the backend (and other pages) scope comments by origin page.
const CQL_EDITOR_PREFIX = "cql-editor-";

/** Generate a unique id with the cql-editor prefix */
export const generateCqlEditorCommentId = (): string =>
  `${CQL_EDITOR_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/** Generate a unique reply id */
export const generateReplyId = (): string =>
  `reply-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export interface PostCommentInput {
  measureId: string;
  lineNumber: number;
  lineContent: string;
  author: string;
  text: string;
}

export interface UseCodeReviewReturn {
  comments: CodeReviewComment[];
  loading: boolean;
  error: string | null;
  postComment: (input: PostCommentInput) => Promise<CodeReviewComment>;
  postReply: (commentId: string, text: string, author: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  refreshComments: () => Promise<void>;
}

export const useCodeReview = (measureId: string): UseCodeReviewReturn => {
  const apiRef = useRef(useCodeReviewServiceApi());
  const [comments, setComments] = useState<CodeReviewComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshComments = useCallback(async () => {
    if (!measureId) return;
    setLoading(true);
    setError(null);
    try {
      const all = await apiRef.current.getCommentsByMeasureId(measureId);
      // Only show comments that originated from the CQL editor
      const cqlEditorComments = all.filter((c) =>
        c.commentId.startsWith(CQL_EDITOR_PREFIX)
      );
      setComments(cqlEditorComments);
    } catch (e) {
      setError("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  }, [measureId]);

  useEffect(() => {
    refreshComments();
  }, [refreshComments]);

  const postComment = useCallback(
    async (input: PostCommentInput): Promise<CodeReviewComment> => {
      setError(null);
      const payload: CreateCommentPayload = {
        commentId: generateCqlEditorCommentId(),
        commentType: "CQL",
        measureId: input.measureId,
        lineNumber: input.lineNumber,
        lineContent: input.lineContent,
        author: input.author,
        text: input.text,
        replies: [],
        resolved: false,
      };
      const created = await apiRef.current.createComment(payload);
      setComments((prev) => [...prev, created]);
      return created;
    },
    []
  );

  const postReply = useCallback(
    async (commentId: string, text: string, author: string): Promise<void> => {
      setError(null);
      const payload: AddReplyPayload = {
        id: generateReplyId(),
        text,
        author,
      };
      const updated = await apiRef.current.addReply(commentId, payload);
      setComments((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    },
    []
  );

  const deleteComment = useCallback(async (mongoId: string): Promise<void> => {
    setError(null);
    await apiRef.current.deleteComment(mongoId);
    // Remove from local state by MongoDB id
    setComments((prev) => prev.filter((c) => c.id !== mongoId));
  }, []);

  return {
    comments,
    loading,
    error,
    postComment,
    postReply,
    deleteComment,
    refreshComments,
  };
};
