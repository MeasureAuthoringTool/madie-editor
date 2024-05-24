import { useServiceConfig, ServiceConfig } from "./useServiceConfig";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Test Service Config", () => {
  it("should retrieve service configuration info", () => {
    expect.assertions(1);
    const config: ServiceConfig = {
      qdmElmTranslationService: {
        baseUrl: "qdm-elm-translator.com",
      },
      fhirElmTranslationService: {
        baseUrl: "fhir-elm-translator.com",
      },
      terminologyService: {
        baseUrl: "url",
      },
    };
    const resp = { data: config };
    mockedAxios.get.mockResolvedValue(resp);
    useServiceConfig().then((result) => expect(result).toEqual(config));
  });

  it("should error if the qdm elm translation service config is inaccessible", async () => {
    expect.assertions(1);
    const resp = {
      data: {
        qdmElmTranslationService: {
          baseUrl: "",
        },
        fhirElmTranslationService: {
          baseUrl: "fhir-elm-translator.com",
        },
        terminologyService: {
          baseUrl: "url",
        },
      },
    };
    mockedAxios.get.mockResolvedValue(resp);
    try {
      await useServiceConfig();
    } catch (err) {
      expect(err.message).toBe("Invalid QDM ELM Translation Service Config");
    }
  });

  it("should error if the fhir elm translation service config is inaccessible", async () => {
    expect.assertions(1);
    const resp = {
      data: {
        qdmElmTranslationService: {
          baseUrl: "qdm-elm-translator.com",
        },
        fhirElmTranslationService: {
          baseUrl: "",
        },
        terminologyService: {
          baseUrl: "url",
        },
      },
    };
    mockedAxios.get.mockResolvedValue(resp);
    try {
      await useServiceConfig();
    } catch (err) {
      expect(err.message).toBe("Invalid FHIR ELM Translation Service Config");
    }
  });

  it("should error if the terminology service config is inaccessible", async () => {
    expect.assertions(1);
    const resp = {
      data: {
        qdmElmTranslationService: {
          baseUrl: "qdm-elm-translator.com",
        },
        fhirElmTranslationService: {
          baseUrl: "fhir-elm-translator.com",
        },
        terminologyService: {
          baseUrl: "",
        },
      },
    };
    mockedAxios.get.mockResolvedValue(resp);
    try {
      await useServiceConfig();
    } catch (err) {
      expect(err.message).toBe("Invalid Terminology Service Config");
    }
  });
});
