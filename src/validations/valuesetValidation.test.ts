import axios from "axios";
import { ServiceConfig, useServiceConfig } from "../api/useServiceConfig";
import { ElmTranslationError } from "../api/useElmTranslationServiceApi";
import { ValueSet } from "../api/useTerminologyServiceApi";
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

describe("Value Set validation", () => {
  describe("FHIR Value Set validation", () => {
    const fhirModel = "FHIR";
    const fhirValueSet: ValueSet = {
      resourceType: "ValueSet",
      id: "1-96",
      url: "http://testurl.com",
      status: "active",
      errorMsg: "",
    };

    const cqlValueSet: CqlValueSet[] = [
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
          return Promise.resolve({ data: fhirValueSet });
        }
      });

      const valuesetErrors: ElmTranslationError[] = await GetValueSetErrors(
        cqlValueSet,
        true,
        fhirModel
      );
      expect(valuesetErrors.length).toBe(0);
    });

    it("get value set null input", async () => {
      mockedAxios.get.mockImplementation((args) => {
        if (
          args &&
          args.startsWith(mockServiceConfig.terminologyService.baseUrl)
        ) {
          return Promise.resolve({ data: fhirValueSet });
        }
      });

      const valuesetErrors: ElmTranslationError[] = await GetValueSetErrors(
        null,
        true,
        fhirModel
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
        true,
        fhirModel
      );
      expect(valuesetErrors.length).toBe(2);
      expect(valuesetErrors[0].message).toEqual(
        "Value set not found for oid = '' location = 9:0-9:22"
      );
      expect(valuesetErrors[1].message).toEqual(
        "Value set not found for oid = 1.2.3.4 location = 11:0-11:29"
      );
    });

    it("get value set when user is not logged in to UMLS", async () => {
      const valuesetErrors: ElmTranslationError[] = await GetValueSetErrors(
        cqlValueSet,
        false,
        fhirModel
      );
      expect(valuesetErrors.length).toBe(1);
    });
  });

  describe("QDM Value Set validation", () => {
    const qdmModel = "QDM";
    const qdmValueSet = {
      resourceType: "ValueSet",
      id: "1-96",
      url: "urn:oid:1.2.2.2",
      status: "active",
      errorMsg: "",
    } as ValueSet;

    const cqlValueSet: CqlValueSet[] = [
      {
        text: "valueset \"ONC Administrative Sex\": 'urn:oid:1.2.2.2'",
        start: {
          line: 1,
          position: 0,
        },
        stop: {
          line: 1,
          position: 20,
        },
        name: '"ONC Administrative Sex"',
        url: "'urn:oid:1.2.2.2'",
        hits: 0,
      },
    ];

    it("validates value set successfully", async () => {
      mockedAxios.get.mockImplementation((args) => {
        if (
          args &&
          args.startsWith(mockServiceConfig.terminologyService.baseUrl)
        ) {
          return Promise.resolve({ data: qdmValueSet });
        }
      });

      const errors: ElmTranslationError[] = await GetValueSetErrors(
        cqlValueSet,
        true,
        qdmModel
      );
      expect(errors.length).toBe(0);
    });

    it("validates value set and reports error", async () => {
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

      const errors: ElmTranslationError[] = await GetValueSetErrors(
        cqlValueSet,
        true,
        qdmModel
      );
      expect(errors.length).toBe(1);
      expect(errors[0].message).toEqual(
        "Value set not found for oid = 1.2.2.2 location = 1:0-1:20"
      );
    });
  });
});
