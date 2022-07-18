import {
  ElmTranslationError,
  ElmValueSet,
} from "../../api/useElmTranslationServiceApi";

export const useOktaTokens = (storageKey = "okta-token-storage") => {
  return {
    getAccessToken: () => "test-token",
    getAccessTokenObj: () => {},
    getUserName: () => "test-fake-user@email.com", //#nosec
    getIdToken: () => "test-id-token",
    getIdTokenObj: () => {},
  };
};
