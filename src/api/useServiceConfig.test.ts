import { useServiceConfig } from "./useServiceConfig";
import axios from "../api/axios-instance";
import { mockServiceConfig } from "../__mocks__/mockServiceConfig";

jest.mock("../api/axios-instance");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Test Service Config", () => {
  it("should retrieve service configuration info", () => {
    expect.assertions(1);
    const resp = { data: mockServiceConfig };
    mockedAxios.get.mockResolvedValue(resp);
    useServiceConfig().then((result) =>
      expect(result).toEqual(mockServiceConfig)
    );
  });

  it("should error if the qdm elm translation service config is inaccessible", async () => {
    expect.assertions(1);
    const resp = {
      data: {
        ...mockServiceConfig,
        qdmElmTranslationService: {
          baseUrl: "",
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
        ...mockServiceConfig,
        fhirElmTranslationService: {
          baseUrl: "",
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
        ...mockServiceConfig,
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
