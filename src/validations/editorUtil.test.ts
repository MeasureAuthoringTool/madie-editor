import axios from "axios";
import { ServiceConfig } from "../api/useServiceConfig";
import {
  ElmTranslationError,
  ElmTranslation,
  ElmTranslationLibrary,
} from "../api/useElmTranslationServiceApi";
import { FHIRValueSet, CustomCqlCode } from "../api/useTerminologyServiceApi";
import {
  mapTranslationAndVsacErrorsToCqlErrors,
  getVsacErrors,
} from "./editorUtil";
import CqlError from "@madie/cql-antlr-parser/dist/src/dto/CqlError";

const elmTranslationNoErrors: ElmTranslation = {
  errorExceptions: [],
  externalErrors: [],
  library: null,
};

const elmTranslationErrors: ElmTranslationError[] = [
  {
    startLine: 16,
    startChar: 1,
    endLine: 16,
    endChar: 35,
    errorType: null,
    errorSeverity: "Error",
    targetIncludeLibraryId: "EXM124v7QICore4",
    targetIncludeLibraryVersionId: "7.0.000",
    type: null,
    message: "Could not load source for library FHIRHelpers, version 4.0.1.",
  },
];

const elmTranslationLibraryWithValueSets: ElmTranslationLibrary = {
  annotation: [],
  contexts: undefined,
  identifier: undefined,
  parameters: undefined,
  schemaIdentifier: undefined,
  statements: undefined,
  usings: undefined,
  valueSets: {
    def: [
      {
        localId: "test1",
        locator: "25:1-25:97",
        id: "https://test.com/ValueSet/2.16.840.1.113762.1.4.1",
      },
      {
        localId: "test2",
        locator: "26:1-26:81",
        id: "https://test.com/ValueSet/2.16.840.1.114222.4.11.836",
      },
    ],
  },
};

const elmTranslationWithErrors: ElmTranslation = {
  errorExceptions: elmTranslationErrors,
  externalErrors: [],
  library: elmTranslationLibraryWithValueSets,
};

const cql =
  "include FHIRHelpers version '4.0.1'\nvalueset \"ONC Administrative Sex\": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.'";
const cql2 =
  "codesystem \"ActPriority:HL7V3.0_2021-03\": 'http://terminology.hl7.org/CodeSystem/v3-ActPriority' version 'HL7V3.0_2021-03'" +
  "code \"preop\": 'p' from \"ActPriority:HL7V3.0_2021-03\" display 'preop'";

const fhirValuesetWithError: FHIRValueSet = {
  resourceType: "test",
  id: "2",
  url: "http://testurl.com",
  status: "active",
  errorMsg:
    "Request failed with status code 404 for oid = 2.16.840.1.113762.1.4. location = 26:1-26:96",
};

const customCqlCodesWithErrors: CustomCqlCode[] = [
  {
    codeId: "'P'",
    codeSystem: {
      oid: "'https://terminology.hl7.org/CodeSystem/v3-ActPriority'",
      hits: 0,
      version: "'HL7V3.0_2021-03'",
      text:
        "codesystem 'ActPriority:HL7V3.0_2021-03':" +
        " 'https://terminology.hl7.org/CodeSystem/v3-ActPriority' version 'HL7V3.0_2021-03'",
      name: '"ActPriority:HL7V3.0_2021-03"',
      start: {
        line: 9,
        position: 0,
      },
      stop: {
        line: 9,
        position: 121,
      },
      errorMessage: null,
      valid: true,
    },
    hits: 0,
    text: "code 'preop': 'P' from 'ActPriority:HL7V3.0_2021-03' display 'preop'",
    name: '"preop"',
    start: {
      line: 11,
      position: 0,
    },
    stop: {
      line: 11,
      position: 67,
    },
    errorMessage: "invalid code",
    valid: false,
  },
];

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
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

describe("Editor Util tests", () => {
  it("mapTranslationAndVsacErrorsToCqlErrors when there is ELM translation error", async () => {
    const cqlErrors: CqlError[] =
      mapTranslationAndVsacErrorsToCqlErrors(elmTranslationErrors);
    expect(cqlErrors.length).toBe(1);
  });

  it("mapTranslationAndVsacErrorsToCqlErrors when there is no ELM translation error", async () => {
    const cqlErrors: CqlError[] = mapTranslationAndVsacErrorsToCqlErrors([]);
    expect(cqlErrors.length).toBe(0);
  });

  it("Get Value Set validation errors", async () => {
    mockedAxios.get.mockImplementation((args) => {
      if (
        args &&
        args.startsWith(mockServiceConfig.terminologyService.baseUrl)
      ) {
        return Promise.reject({
          data: fhirValuesetWithError,
          status: 404,
        });
      }
    });

    const vsacErrors: ElmTranslationError[] = await getVsacErrors(
      cql,
      elmTranslationWithErrors,
      true
    );
    expect(vsacErrors.length).toBe(2);
  });

  it("getVsacErrors input has no value set", async () => {
    const vsacErrors: ElmTranslationError[] = await getVsacErrors(
      cql,
      elmTranslationNoErrors,
      true
    );
    expect(vsacErrors.length).toBe(0);
  });

  it("Get Code System errors", async () => {
    mockedAxios.put.mockImplementation((args) => {
      if (
        args &&
        args.startsWith(mockServiceConfig.terminologyService.baseUrl)
      ) {
        return Promise.resolve({
          data: customCqlCodesWithErrors,
          status: 200,
        });
      }
    });

    const vsacErrors: ElmTranslationError[] = await getVsacErrors(
      cql,
      elmTranslationWithErrors,
      true
    );

    expect(vsacErrors.length).toBe(3);
  });

  it("Get Code System errors when custom Cql Codes has errors", async () => {
    mockedAxios.put.mockImplementation((args) => {
      if (
        args &&
        args.startsWith(mockServiceConfig.terminologyService.baseUrl)
      ) {
        return Promise.resolve({
          data: customCqlCodesWithErrors,
          status: 200,
        });
      }
    });

    const vsacErrors: ElmTranslationError[] = await getVsacErrors(
      cql2,
      elmTranslationWithErrors,
      true
    );

    expect(vsacErrors.length).toBe(3);
  });
});
