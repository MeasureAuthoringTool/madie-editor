import {
  JSON_BASIC_LANGUAGE_ID,
  registerJsonBasicLanguage,
} from "./jsonBasicLanguage";

describe("registerJsonBasicLanguage", () => {
  it("registers json-basic language once", () => {
    const languages: Array<{ id: string }> = [];

    const monacoInstance = {
      languages: {
        getLanguages: jest.fn(() => languages),
        register: jest.fn((language: { id: string }) => {
          languages.push(language);
        }),
        setMonarchTokensProvider: jest.fn(),
        setLanguageConfiguration: jest.fn(),
      },
    } as any;

    registerJsonBasicLanguage(monacoInstance);
    registerJsonBasicLanguage(monacoInstance);

    expect(monacoInstance.languages.register).toHaveBeenCalledTimes(1);
    expect(
      monacoInstance.languages.setMonarchTokensProvider
    ).toHaveBeenCalledTimes(1);
    expect(
      monacoInstance.languages.setLanguageConfiguration
    ).toHaveBeenCalledTimes(1);
    expect(monacoInstance.languages.register).toHaveBeenCalledWith({
      id: JSON_BASIC_LANGUAGE_ID,
    });
  });
});
