import axios from "axios";
import { ServiceConfig, useServiceConfig } from "../api/useServiceConfig";
import { ElmTranslationError } from "../api/useElmTranslationServiceApi";
import { FHIRValueSet } from "../api/useTerminologyServiceApi";
import GetValueSetErrors from "./valuesetValidation";
import CqlValueSet from "@madie/cql-antlr-parser/dist/src/dto/CqlValueSet";

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

const cqlValueset: CqlValueSet[] = [
  {
    text: "valueset \"ONC Administrative Sex\": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1'",
    start: {
      line: 13,
      position: 0,
    },
    stop: {
      line: 13,
      position: 96,
    },
    name: '"ONC Administrative Sex"',
    url: "'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1'",
    hits: 0,
  },
];

const invalidValueSets: CqlValueSet[] = [
  {
    text: "valueset \"HPV Test\": ''",
    start: {
      line: 9,
      position: 0,
    },
    stop: {
      line: 9,
      position: 22,
    },
    name: '"HPV Test"',
    url: "''",
    hits: 0,
  },
  {
    text: "valueset \"ONC Administrative Sex\": 'ValueSet/1.2.3.4'",
    start: {
      line: 11,
      position: 0,
    },
    stop: {
      line: 11,
      position: 29,
    },
    name: '"ONC Administrative Sex"',
    url: "'ValueSet/1.2.3.4'",
    hits: 0,
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

    const valuesetErrors: ElmTranslationError[] = await GetValueSetErrors(
      cqlValueset,
      true
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

    const valuesetErrors: ElmTranslationError[] = await GetValueSetErrors(
      null,
      true
    );
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
          message: "Value set not found",
        });
      }
    });

    const valuesetErrors: ElmTranslationError[] = await GetValueSetErrors(
      invalidValueSets,
      true
    );
    expect(valuesetErrors.length).toBe(2);
    expect(valuesetErrors[0].message).toEqual(
      "Value set not found for oid = undefined location = 9:0-9:22"
    );
    expect(valuesetErrors[1].message).toEqual(
      "Value set not found for oid = 1.2.3.4 location = 11:0-11:29"
    );
  });

  it("get value set when user is not logged in to UMLS", async () => {
    const valuesetErrors: ElmTranslationError[] = await GetValueSetErrors(
      cqlValueset,
      false
    );
    expect(valuesetErrors.length).toBe(1);
  });
});
