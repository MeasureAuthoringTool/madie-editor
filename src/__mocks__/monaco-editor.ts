// Mock for monaco-editor used in Jest/jsdom tests

export const MarkerSeverity = {
  Hint: 1,
  Info: 2,
  Warning: 4,
  Error: 8,
};

export const languages = {
  getLanguages: () => [],
  register: jest.fn(),
  setMonarchTokensProvider: jest.fn(),
  setLanguageConfiguration: jest.fn(),
  registerCompletionItemProvider: jest.fn(),
  CompletionItemKind: {
    Keyword: 17,
    Function: 2,
    Constant: 14,
  },
};

export const editor = {
  setModelMarkers: jest.fn(),
  create: jest.fn(),
  createModel: jest.fn(),
};

export const KeyCode = {
  Escape: 27,
};
