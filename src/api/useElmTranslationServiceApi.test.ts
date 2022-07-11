import * as React from "react";
import useElmTranslationServiceApi, {
  ElmTranslationServiceApi,
  ElmTranslation,
} from "./useElmTranslationServiceApi";
import { ServiceConfig } from "./useServiceConfig";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockConfig: ServiceConfig = {
  elmTranslationService: {
    baseUrl: "elm.com",
  },
  terminologyService: {
    baseUrl: "terminology.com",
  },
};
jest.mock("./useServiceConfig", () => {
  return {
    useServiceConfig: jest.fn(() => Promise.reject(mockConfig)),
  };
});

const elmTranslationWithNoErrors: ElmTranslation = {
  externalErrors: [],
  errorExceptions: [],
  library: null,
};

const mockGetAccessToken = jest.fn().mockImplementation(() => {
  return Promise.resolve("test.jwt");
});

jest.mock("@madie/madie-util", () => {
  return {
    useOktaTokens: () => {
      return mockGetAccessToken();
    },
  };
});

describe("useELMTranslationServiceApi", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("useTerminologyServiceApi returns TerminologyServiceApi", () => {
    const actual: ElmTranslationServiceApi = useElmTranslationServiceApi();
    expect(actual).toBeTruthy();
  });

  it("translateCqlToElm failure", async () => {
    const resp = {
      data: { json: JSON.stringify(elmTranslationWithNoErrors) },
      status: 404,
    };
    mockedAxios.put.mockRejectedValueOnce(resp);
    const elmTranslationService: ElmTranslationServiceApi =
      useElmTranslationServiceApi();
    try {
      const translate = await elmTranslationService.translateCqlToElm("test");
      expect(mockedAxios.get).toBeCalledTimes(1);
      expect(mockedAxios.put).toBeCalledTimes(1);
      expect(translate).toBeFalsy();
    } catch (error) {}
  });
});
