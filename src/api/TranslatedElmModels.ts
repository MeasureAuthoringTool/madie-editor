export type ElmTranslationError = {
  startLine: number;
  startChar: number;
  endChar: number;
  endLine: number;
  errorSeverity: string;
  errorType: string;
  message: string;
  targetIncludeLibraryId: string;
  targetIncludeLibraryVersionId: string;
  type: string;
};

export interface ElmTranslationExternalError extends ElmTranslationError {
  libraryId: string;
  libraryVersion: string;
}

export type ElmTranslationLibrary = {
  annotation: any[];
  contexts: any;
  identifier: any;
  parameters: any;
  schemaIdentifier: any;
  statements: any;
  usings: any;
  valueSets?: any;
};

export type ElmValueSet = {
  localId: any;
  locator: any;
  name: any;
  id: any;
};

export type ElmTranslation = {
  errorExceptions: ElmTranslationError[];
  externalErrors: ElmTranslationExternalError[];
  library: ElmTranslationLibrary;
};
