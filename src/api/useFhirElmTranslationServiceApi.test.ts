import { FhirElmTranslationServiceApi } from "./useFhirElmTranslationServiceApi";
import { ServiceConfig } from "./useServiceConfig";
import axios from "axios";
import { ElmTranslation } from "./TranslatedElmModels";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockConfig: ServiceConfig = {
  qdmElmTranslationService: {
    baseUrl: "qdm-elm-translator.com",
  },
  fhirElmTranslationService: {
    baseUrl: "fhir-elm-translator.com",
  },
  terminologyService: {
    baseUrl: "terminology-service.com",
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

describe("Test FhirElmTranslationServiceApi", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should error when service config url is null", async () => {
    const successResponse = {
      data: { json: JSON.stringify(elmTranslationWithNoErrors) },
      status: 200,
    };
    mockedAxios.put.mockResolvedValue(successResponse);
    const fhirElmTranslationServiceApi: FhirElmTranslationServiceApi =
      new FhirElmTranslationServiceApi(null, mockGetAccessToken);

    try {
      const translate = await fhirElmTranslationServiceApi.translateCqlToElm(
        "test"
      );
      expect(translate).toBe(elmTranslationWithNoErrors);
    } catch (error) {
      expect(error).not.toBeNull();
    }
  });

  it("Should error when service config url is null", async () => {
    const fhirElmTranslationServiceApi: FhirElmTranslationServiceApi =
      new FhirElmTranslationServiceApi(null, mockGetAccessToken);

    try {
      await fhirElmTranslationServiceApi.translateCqlToElm("test");
    } catch (error) {
      expect(error).not.toBeNull();
      expect(error.message).toBe(
        "Missing FHIR ELM translation service URL! Is it present in the service config?"
      );
    }
  });

  it("Should error when qdm elm translation service is not found", async () => {
    const rejectedResponse = {
      response: {
        data: {
          timestamp: "2024-05-23T13:35:15.059+00:00",
          status: 404,
          error: "Not Found",
          path: "/api/qdm/cql/translator/cql",
        },
        status: 404,
      },
      message: "Request failed with status code 404",
      code: "ERR_BAD_REQUEST",
      name: "AxiosError",
    };
    mockedAxios.put.mockRejectedValueOnce(rejectedResponse);
    const fhirElmTranslationServiceApi: FhirElmTranslationServiceApi =
      new FhirElmTranslationServiceApi("test", mockGetAccessToken);

    try {
      await fhirElmTranslationServiceApi.translateCqlToElm("test");
    } catch (error) {
      expect(error).not.toBeNull();
      expect(error.message).toBe("Request failed with status code 404");
    }
  });
});
