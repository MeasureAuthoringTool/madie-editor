declare module "@madie/madie-util" {
  import { LifeCycleFn } from "single-spa";

  export const useOktaTokens: (storageKey?: string) => {
    getAccessToken: () => any;
    getAccessTokenObj: () => any;
    getUserName: () => any;
    getIdToken: () => any;
    getIdTokenObj: () => any;
    useFeatureFlags: () => any;
  };
  export function useFeatureFlags(): FeatureFlags;

  export function getOidFromString(
    oidString: string,
    dataModel: string
  ): string;

  export class TerminologyServiceApi {
    constructor(baseUrl: string, getAccessToken: () => string);
    checkLogin(): Promise<Boolean>;
  }
  export function useTerminologyServiceApi(): TerminologyServiceApi;

  export function wafIntercept(): void;

  // ── Code Review ────────────────────────────────────────────────────────────

  export interface CommentReply {
    id: string;
    author?: string;
    text: string;
    createdAt?: string;
  }

  export interface CodeReviewComment {
    id?: string; // MongoDB ObjectId — assigned by backend
    commentId: string; // UI-generated, e.g. "cql-editor-..."
    commentType: string;
    measureId: string;
    lineNumber: number;
    lineContent: string;
    author?: string;
    text: string;
    createdAt?: string;
    replies: CommentReply[];
    resolved: boolean;
  }

  export interface CreateCommentPayload {
    commentId: string; // UI-generated, prefixed with "cql-editor-"
    commentType: string;
    measureId: string;
    lineNumber: number;
    lineContent: string;
    author?: string;
    text: string;
    replies: [];
    resolved: boolean;
  }

  export interface AddReplyPayload {
    id: string;
    text: string;
    author?: string;
  }

  export class CodeReviewServiceApi {
    constructor(baseUrl: string, getAccessToken: () => string);
    getCommentsByMeasureId(measureId: string): Promise<CodeReviewComment[]>;
    createComment(payload: CreateCommentPayload): Promise<CodeReviewComment>;
    addReply(
      commentId: string,
      payload: AddReplyPayload
    ): Promise<CodeReviewComment>;
    deleteComment(commentId: string): Promise<void>;
  }

  export function useCodeReviewServiceApi(): CodeReviewServiceApi;

  export const bootstrap: LifeCycleFn<void>;
  export const mount: LifeCycleFn<void>;
  export const unmount: LifeCycleFn<void>;
}
