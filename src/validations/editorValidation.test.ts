import { ValidationResult, useGetAllErrors } from "./editorValidation";
import axios from "axios";
import { ServiceConfig } from "../api/useServiceConfig";
import { FHIRValueSet, CustomCqlCode } from "../api/useTerminologyServiceApi";
import {
  ElmTranslation,
  ElmTranslationError,
} from "../api/useElmTranslationServiceApi";
import {
  useTerminologyServiceApi,
  TerminologyServiceApi,
} from "@madie/madie-util";
import { ElmTranslationExternalError } from "@madie/madie-editor";

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
jest.mock("@madie/madie-util", () => ({
  useTerminologyServiceApi: jest.fn(),
  useOktaTokens: () => ({
    getAccessToken: () => "test.jwt",
  }),
}));

const fhirValueset: FHIRValueSet = {
  resourceType: "ValueSet",
  id: "1-96",
  url: "http://testurl.com",
  status: "active",
  errorMsg: "",
};
const customCqlCodesValid: CustomCqlCode[] = [
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
      errorMessage: "",
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
    errorMessage: "",
    valid: true,
  },
];
const elmTransaltionErrors: ElmTranslationError[] = [
  {
    startLine: 24,
    startChar: 7,
    endLine: 24,
    endChar: 15,
    errorSeverity: "Warning",
    errorType: "",
    message: "Test Warning 456",
    targetIncludeLibraryId: "TestLibrary_QICore",
    targetIncludeLibraryVersionId: "5.0.000",
    type: "",
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
const elmTranslationWithNoErrors: ElmTranslation = {
  externalErrors: [],
  errorExceptions: [],
  library: elmTranslationLibraryWithValueSets,
};
const cqlToElmExternalErrors: ElmTranslationExternalError[] = [
  {
    libraryId: "SupplementalDataElements",
    libraryVersion: "1.0.000",
    startLine: 14,
    startChar: 1,
    endLine: 14,
    endChar: 52,
    message:
      "Could not resolve reference to library QICoreCommon, version 1.0.000 because version 2.0.000 is already loaded.",
    errorType: "include",
    errorSeverity: "Error",
    targetIncludeLibraryId: "QICoreCommon",
    targetIncludeLibraryVersionId: "1.0.000",
    type: "CqlToElmError",
  },
];

describe("Editor Validation Test", () => {
  beforeEach(() => {
    (useTerminologyServiceApi as jest.Mock).mockImplementation(() => {
      return {
        checkLogin: jest
          .fn()
          .mockRejectedValueOnce({ status: 404, data: false }),
      } as unknown as TerminologyServiceApi;
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("validate cql null input", async () => {
    const errorsResult: ValidationResult = await useGetAllErrors("");
    expect(errorsResult).toBeNull();
  });

  it("Validate editor content has no error", async () => {
    const editorContent: string =
      "library AdvancedIllnessandFrailtyExclusion_QICore4 version '5.0.000' \n" +
      "using QICore version '4.1.0' \n";

    mockedAxios.get.mockImplementation((args) => {
      if (
        args &&
        args.startsWith(mockServiceConfig.terminologyService.baseUrl)
      ) {
        return Promise.resolve({
          data: fhirValueset,
          status: 200,
        });
      }
    });
    mockedAxios.put.mockImplementation((args) => {
      if (
        args &&
        args.startsWith(mockServiceConfig.terminologyService.baseUrl)
      ) {
        return Promise.resolve({
          data: customCqlCodesValid,
          status: 200,
        });
      } else if (
        args &&
        args.startsWith(mockServiceConfig.elmTranslationService.baseUrl)
      ) {
        return Promise.resolve({
          data: {
            json: JSON.stringify(elmTranslationWithNoErrors),
          },
          status: 200,
        });
      }
    });
    const errorsResult: ValidationResult = await useGetAllErrors(editorContent);
    expect(errorsResult?.errors.length).toBe(0);
  });

  it("validate cql has validation errors", async () => {
    const editorContent: string =
      "library AdvancedIllnessandFrailtyExclusion_QICore4 version '5.0.000' \n" +
      "using QICore version '4.1.0' \n" +
      "include FHIRHelpers version '4.0.1' \n" +
      "codesystem \"ActPriority:HL7V3.0_2021-03\": 'http://terminology.hl7.org/CodeSystem/v3-ActPriority' version 'HL7V3.0_2021-03' \n" +
      "code \"preop\": 'p' from \"ActPriority:HL7V3.0_2021-03\" display 'preop' \n" +
      'valueset "ONC Administrative Sex": "http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1" "url": \'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.\' \n';

    const elmTranslationWithValuesetError: ElmTranslation = {
      externalErrors: [],
      errorExceptions: elmTransaltionErrors,
      library: elmTranslationLibraryWithValueSets,
    };

    mockedAxios.get.mockImplementation((args) => {
      if (
        args &&
        args.startsWith(mockServiceConfig.terminologyService.baseUrl)
      ) {
        return Promise.reject({
          data: fhirValuesetWithError,
          status: 404,
          error: { message: "Not found!" },
        });
      }
    });
    mockedAxios.put.mockImplementation((args) => {
      if (
        args &&
        args.startsWith(mockServiceConfig.terminologyService.baseUrl)
      ) {
        return Promise.reject({
          data: null,
          status: 404,
          error: { message: "Invalid code!" },
        });
      } else if (
        args &&
        args.startsWith(mockServiceConfig.elmTranslationService.baseUrl)
      ) {
        return Promise.resolve({
          data: {
            json: JSON.stringify(elmTranslationWithValuesetError),
          },
          status: 200,
        });
      }
    });
    const errorsResult = await useGetAllErrors(editorContent);
    expect(errorsResult.errors.length).toBe(4);
  });

  it("Translation result has null error exception", async () => {
    const editorContent: string =
      "library AdvancedIllnessandFrailtyExclusion_QICore4 version '5.0.000' \n" +
      "using QICore version '4.1.0' \n" +
      "include FHIRHelpers version '4.0.1' \n" +
      "codesystem \"ActPriority:HL7V3.0_2021-03\": 'http://terminology.hl7.org/CodeSystem/v3-ActPriority' version 'HL7V3.0_2021-03' \n" +
      "code \"preop\": 'p' from \"ActPriority:HL7V3.0_2021-03\" display 'preop' \n" +
      'valueset "ONC Administrative Sex": "http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1" "url": \'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.\' \n';

    const elmTranslationWithoutValuesetError: ElmTranslation = {
      externalErrors: [],
      errorExceptions: null,
      library: elmTranslationLibraryWithValueSets,
    };

    mockedAxios.get.mockImplementation((args) => {
      if (
        args &&
        args.startsWith(mockServiceConfig.terminologyService.baseUrl)
      ) {
        return Promise.reject({
          data: fhirValuesetWithError,
          status: 404,
          error: { message: "Not found!" },
        });
      }
    });
    mockedAxios.put.mockImplementation((args) => {
      if (
        args &&
        args.startsWith(mockServiceConfig.terminologyService.baseUrl)
      ) {
        return Promise.reject({
          data: null,
          status: 404,
          error: { message: "Invalid code!" },
        });
      } else if (
        args &&
        args.startsWith(mockServiceConfig.elmTranslationService.baseUrl)
      ) {
        return Promise.resolve({
          data: {
            json: JSON.stringify(elmTranslationWithoutValuesetError),
          },
          status: 200,
        });
      }
    });

    const errorsResult = await useGetAllErrors(editorContent);
    expect(errorsResult.errors.length).toBe(3);
  });

  it("Should return elm translation external errors", async () => {
    const elmTranslationWithExternalErrors: ElmTranslation = {
      externalErrors: cqlToElmExternalErrors,
      errorExceptions: [],
      library: elmTranslationLibraryWithValueSets,
    };
    mockedAxios.put.mockImplementation((args) => {
      if (
        args &&
        args.startsWith(mockServiceConfig.elmTranslationService.baseUrl)
      ) {
        return Promise.resolve({
          data: {
            json: JSON.stringify(elmTranslationWithExternalErrors),
          },
          status: 200,
        });
      }
    });
    const errorsResult = await useGetAllErrors("Library FHIR version 1.0.000");
    expect(errorsResult.externalErrors.length).toBe(1);
  });
});
