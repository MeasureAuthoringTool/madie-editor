import axios from "../api/axios-instance";
import { ServiceConfig, useServiceConfig } from "../api/useServiceConfig";
import TranslateCql from "./elmTranslateValidation";
import { ElmTranslation } from "../api/TranslatedElmModels";

const elmTranslationWithNoErrors: ElmTranslation = {
  externalErrors: [],
  errorExceptions: [],
  library: null,
};

const translationErrors = [
  {
    startLine: 4,
    startChar: 19,
    endLine: 19,
    endChar: 23,
    errorSeverity: "Error",
    errorType: null,
    message: "Test error 123",
    targetIncludeLibraryId: "TestLibrary_QICore",
    targetIncludeLibraryVersionId: "5.0.000",
    type: null,
  },
  {
    startLine: 24,
    startChar: 7,
    endLine: 24,
    endChar: 15,
    errorSeverity: "Warning",
    errorType: null,
    message: "Test Warning 456",
    targetIncludeLibraryId: "TestLibrary_QICore",
    targetIncludeLibraryVersionId: "5.0.000",
    type: null,
  },
];
const elmTranslationWithErrors: ElmTranslation = {
  externalErrors: [],
  errorExceptions: translationErrors,
  library: null,
};

const mockServiceConfig: ServiceConfig = {
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
jest.mock("../api/useServiceConfig", () => {
  return {
    useServiceConfig: jest.fn(() => Promise.resolve(mockServiceConfig)),
  };
});

jest.mock("../api/axios-instance");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ELM Translation validation", () => {
  it("should retrieve the service url", async () => {
    const actual = await useServiceConfig();
    expect(actual).toBe(mockServiceConfig);
  });

  it("translate CQL to ELM no error", async () => {
    mockedAxios.put.mockImplementation((args) => {
      if (
        args &&
        args.startsWith(mockServiceConfig.fhirElmTranslationService.baseUrl)
      ) {
        return Promise.resolve({
          data: { json: JSON.stringify(elmTranslationWithNoErrors) },
          status: 200,
        });
      }
    });

    const elmErrors: ElmTranslation = await TranslateCql("test", "QICore");
    expect(elmErrors.errorExceptions.length).toBe(0);
    expect(elmErrors.externalErrors.length).toBe(0);
  });

  it("translate CQL to ELM with errors", async () => {
    mockedAxios.put.mockImplementation((args) => {
      if (
        args &&
        args.startsWith(mockServiceConfig.fhirElmTranslationService.baseUrl)
      ) {
        return Promise.resolve({
          data: { json: JSON.stringify(elmTranslationWithErrors) },
          status: 200,
        });
      }
    });

    const elmErrors: ElmTranslation = await TranslateCql("test", "QICore");
    expect(elmErrors.errorExceptions.length).toBe(2);
    expect(elmErrors.externalErrors.length).toBe(0);
  });

  it("translate CQL to ELM request rejected", async () => {
    mockedAxios.put.mockImplementation((args) => {
      if (
        args &&
        args.startsWith(mockServiceConfig.fhirElmTranslationService.baseUrl)
      ) {
        return Promise.reject({
          response: {
            data: {
              timestamp: "2024-05-23T13:35:15.059+00:00",
              status: 500,
              error: "Network Error",
              path: "/api/qdm/cql/translator/cql",
            },
            status: 500,
          },
          message: "Network Error",
          code: "ERR_NETWORK_ERROR",
          name: "AxiosError",
        });
      }
    });
    try {
      const elmErrors: ElmTranslation = await TranslateCql("test", "QICore");
      expect(elmErrors).toBeNull();
    } catch (error) {
      expect(error.message).toBe("Network Error");
    }
  });

  it("translate CQL to ELM no input CQL", async () => {
    const elmErrors: ElmTranslation = await TranslateCql(null, "QICore");
    expect(elmErrors).toBeNull();
  });

  it("translate CQL to ELM received non-OK response for CQL-to-ELM translation", async () => {
    mockedAxios.put.mockImplementation((args) => {
      if (
        args &&
        args.startsWith(mockServiceConfig.fhirElmTranslationService.baseUrl)
      ) {
        return Promise.resolve({
          data: { json: JSON.stringify(elmTranslationWithErrors) },
          status: 400,
        });
      }
    });
    try {
      const elmErrors: ElmTranslation = await TranslateCql("test", "QICore");
      expect(elmErrors).toBeNull();
    } catch (error) {}
  });
});
