// Re-export the domain types from madie-util so consumers in madie-editor
// can import them from a single local path.
export type {
  CodeReviewComment,
  CommentReply,
  CreateCommentPayload,
  AddReplyPayload,
} from "@madie/madie-util";
