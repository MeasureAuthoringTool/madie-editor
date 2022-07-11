import axios from "axios";
import { ServiceConfig, useServiceConfig } from "../api/useServiceConfig";
import {
  ElmValueSet,
  ElmTranslationError,
} from "../api/useElmTranslationServiceApi";
import { FHIRValueSet } from "../api/useTerminologyServiceApi";
import getValueSetErrors from "./valuesetValidation";

const mockServiceConfig: ServiceConfig = {
  elmTranslationService: {
    baseUrl: "elm-translator.com",
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

const elmValueset: ElmValueSet[] = [
  {
    localId: 1,
    locator: "25:1-25:97",
    name: "ONC Administrative Sex",
    id: "ValueSet/2.16.840.1.113762.1.4.",
  },
];

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const fhirValueset: FHIRValueSet = {
  resourceType: "ValueSet",
  id: "1-96",
  url: "http://testurl.com",
  status: "active",
  errorMsg: "",
};

describe("Value Set validation", () => {
  it("should retrieve the service url", async () => {
    const actual = await useServiceConfig();
    expect(actual).toBe(mockServiceConfig);
  });

  it("get value set no error", async () => {
    mockedAxios.get.mockImplementation((args) => {
      if (
        args &&
        args.startsWith(mockServiceConfig.terminologyService.baseUrl)
      ) {
        return Promise.resolve({ data: fhirValueset });
      }
    });

    const valuesetErrors: ElmTranslationError[] = await getValueSetErrors(
      elmValueset
    );
    expect(valuesetErrors.length).toBe(0);
  });

  it("get value set null input", async () => {
    mockedAxios.get.mockImplementation((args) => {
      if (
        args &&
        args.startsWith(mockServiceConfig.terminologyService.baseUrl)
      ) {
        return Promise.resolve({ data: fhirValueset });
      }
    });

    const valuesetErrors: ElmTranslationError[] = await getValueSetErrors(null);
    expect(valuesetErrors === undefined).toBeTruthy();
  });

  it("get value set with error", async () => {
    mockedAxios.get.mockImplementation((args) => {
      if (
        args &&
        args.startsWith(mockServiceConfig.terminologyService.baseUrl)
      ) {
        return Promise.reject({
          data: null,
          status: 404,
          error: { message: "Not found!" },
        });
      }
    });

    const valuesetErrors: ElmTranslationError[] = await getValueSetErrors(
      elmValueset
    );
    expect(valuesetErrors.length).toBe(1);
  });
});
