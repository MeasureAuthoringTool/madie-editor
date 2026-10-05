import axios from "../api/axios-instance";
import { ServiceConfig } from "../api/ServiceContext";
import { useServiceConfig } from "../api/useServiceConfig";
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

jest.mock("../api/useServiceConfig", () => ({
  useServiceConfig: jest.fn(() => mockServiceConfig),
}));

jest.mock("../api/axios-instance");
const mockedAxios = axios as jest.Mocked<typeof axios>;

/** ✅ NEW: injected API mocks */
const mockFhirApi = {
  translateCqlToElm: jest.fn(),
};

const mockQdmApi = {
  translateCqlToElm: jest.fn(),
};

describe("ELM Translation validation", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve the service url", async () => {
    const actual = useServiceConfig();
    expect(actual).toBe(mockServiceConfig);
  });

  it("translate CQL to ELM no error", async () => {
    mockFhirApi.translateCqlToElm.mockResolvedValueOnce(
      elmTranslationWithNoErrors
    );

    const elmErrors: ElmTranslation = await TranslateCql(
      "test",
      "QICore",
      false,
      mockQdmApi,
      mockFhirApi
    );

    expect(elmErrors.errorExceptions.length).toBe(0);
    expect(elmErrors.externalErrors.length).toBe(0);
  });

  it("translate CQL to ELM with errors", async () => {
    mockFhirApi.translateCqlToElm.mockResolvedValueOnce(
      elmTranslationWithErrors
    );

    const elmErrors: ElmTranslation = await TranslateCql(
      "test",
      "QICore",
      false,
      mockQdmApi,
      mockFhirApi
    );

    expect(elmErrors.errorExceptions.length).toBe(2);
    expect(elmErrors.externalErrors.length).toBe(0);
  });

  it("translate CQL to ELM request rejected", async () => {
    mockFhirApi.translateCqlToElm.mockRejectedValueOnce(
      new Error("Network Error")
    );

    try {
      await TranslateCql("test", "QICore", false, mockQdmApi, mockFhirApi);
    } catch (error) {
      expect(error.message).toBe("Network Error");
    }
  });

  it("translate CQL to ELM no input CQL", async () => {
    const elmErrors: ElmTranslation = await TranslateCql(
      null,
      "QICore",
      false,
      mockQdmApi,
      mockFhirApi
    );
    expect(elmErrors).toBeNull();
  });

  it("translate CQL to ELM received non-OK response for CQL-to-ELM translation", async () => {
    mockFhirApi.translateCqlToElm.mockRejectedValueOnce(
      new Error("Bad Request")
    );

    try {
      const elmErrors: ElmTranslation = await TranslateCql(
        "test",
        "QICore",
        false,
        mockQdmApi,
        mockFhirApi
      );
      expect(elmErrors).toBeNull();
    } catch (error) {}
  });

  it("translate CQL to ELM no error QDM", async () => {
    mockQdmApi.translateCqlToElm.mockResolvedValueOnce(
      elmTranslationWithNoErrors
    );

    const elmErrors: ElmTranslation = await TranslateCql(
      "test",
      "QDM",
      false,
      mockQdmApi,
      mockFhirApi
    );

    expect(elmErrors.errorExceptions.length).toBe(0);
    expect(elmErrors.externalErrors.length).toBe(0);
  });
});
