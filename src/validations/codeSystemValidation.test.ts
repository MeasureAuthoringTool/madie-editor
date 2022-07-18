import axios from "axios";
import { ServiceConfig, useServiceConfig } from "../api/useServiceConfig";
import { ElmTranslationError } from "../api/useElmTranslationServiceApi";
import ValidateCustomCqlCodes, {
  getCustomCqlCodes,
  mapCodeSystemErrorsToTranslationErrors,
} from "./codesystemValidation";
import { CustomCqlCode } from "../api/useTerminologyServiceApi";
import {
  CqlResult,
  CqlInclude,
  CqlCode,
  CqlCodeSystem,
} from "@madie/cql-antlr-parser/dist/src";

const customCqlCodes: CustomCqlCode[] = [
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
    errorMessage: null,
    valid: true,
  },
];

const customCqlCodesWithCodeSystemValid: CustomCqlCode[] = [
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

const customCqlCodesWithCodeSystemInvalid: CustomCqlCode[] = [
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
      errorMessage: "test",
      valid: false,
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
    errorMessage: "valid code",
    valid: true,
  },
];

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

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Code System validation", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should retrieve the service url", async () => {
    const actual = await useServiceConfig();
    expect(actual).toBe(mockServiceConfig);
  });

  it("Code System validation no error", async () => {
    mockedAxios.put.mockImplementation((args) => {
      if (
        args &&
        args.startsWith(mockServiceConfig.terminologyService.baseUrl)
      ) {
        return Promise.resolve({
          data: customCqlCodes,
          status: 200,
        });
      }
    });

    const codesystemValidations: CustomCqlCode[] = await ValidateCustomCqlCodes(
      customCqlCodes,
      true
    );
    codesystemValidations.forEach((codesystem) => {
      expect(codesystem.valid).toBeTruthy();
    });
  });

  it("Code System validation has errors when Code System is invalid", async () => {
    mockedAxios.put.mockImplementation((args) => {
      if (
        args &&
        args.startsWith(mockServiceConfig.terminologyService.baseUrl)
      ) {
        return Promise.resolve({
          data: customCqlCodesWithCodeSystemInvalid,
          status: 404,
        });
      }
    });

    const codesystemErrors: CustomCqlCode[] = await ValidateCustomCqlCodes(
      customCqlCodes,
      true
    );
    expect(codesystemErrors.length).toBe(1);
  });

  it("Code System validation has errors when CQL is invalid", async () => {
    mockedAxios.put.mockImplementation((args) => {
      if (
        args &&
        args.startsWith(mockServiceConfig.terminologyService.baseUrl)
      ) {
        return Promise.reject({
          data: customCqlCodesWithCodeSystemValid,
          status: 404,
        });
      }
    });

    const codesystemErrors: CustomCqlCode[] = await ValidateCustomCqlCodes(
      customCqlCodes,
      true
    );
    expect(codesystemErrors.length).toBe(1);
  });

  it("Code System validation when user is not logged in to UMLS", async () => {
    const codesystemErrors: CustomCqlCode[] = await ValidateCustomCqlCodes(
      customCqlCodes,
      false
    );
    expect(
      JSON.stringify(codesystemErrors).includes("Please Login to UMLS")
    ).toBeTruthy();
    expect(codesystemErrors.length).toBe(1);
  });
});

describe("Code System validation", () => {
  const cql =
    "code \"Congenital absence of cervix (disorder)\": '37687000' from \"SNOMEDCT:2017-09\" display 'Congenital absence of cervix (disorder)'";
  const cql2 =
    "codesystem \"ActPriority:HL7V3.0_2021-03\": 'http://terminology.hl7.org/CodeSystem/v3-ActPriority' version 'HL7V3.0_2021-03'" +
    "code \"preop\": 'p' from \"ActPriority:HL7V3.0_2021-03\" display 'preop'";
  const cqlResult: CqlResult = {
    includes: [
      {
        text: "include FHIRHelpers version '4.0.1'",
        start: { line: 5, position: 0 },
        stop: { line: 5, position: 34 },
        name: "FHIRHelpers",
        version: "'4.0.1'",
        hits: 0,
      },
    ],
    codeSystems: [
      {
        text: "codesystem \"ActPriority:HL7V3.0_2021-03\": 'http://terminology.hl7.org/CodeSystem/v3-ActPriority’ version ‘HL7V3.0_2021-03'",
        start: { line: 10, position: 0 },
        stop: { line: 10, position: 121 },
        oid: "'http://terminology.hl7.org/CodeSystem/v3-ActPriority’ version ‘HL7V3.0_2021-03'",
        name: '"ActPriority:HL7V3.0_2021-03"',
      },
    ],
    valueSets: [
      {
        text: "valueset \"ONC Administrative Sex\": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1'",
        start: { line: 13, position: 0 },
        stop: { line: 13, position: 96 },
        name: '"ONC Administrative Sex"',
        url: "'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1'",
        hits: 0,
      },
      {
        text: "valueset \"ONC Administrative Race type\": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.'",
        start: { line: 14, position: 0 },
        stop: { line: 14, position: 101 },
        name: '"ONC Administrative Race type"',
        url: "'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.'",
        hits: 0,
      },
    ],
    codes: [
      {
        text: "code \"preop\": 'p' from \"ActPriority:HL7V3.0_2021-03\" display 'preop'",
        start: { line: 11, position: 0 },
        stop: { line: 11, position: 67 },
        name: '"preop"',
        codeId: "'p'",
        codeSystem: '"ActPriority:HL7V3.0_2021-03"',
      },
    ],
    parameters: [],
    identifiers: [],
    expressionDefinitions: [],
    errors: [],
    library: {
      text: "library AdvancedIllnessandFrailtyExclusion_QICore4 version '5.0.000'",
      start: { line: 1, position: 0 },
      stop: { line: 1, position: 67 },
      name: "AdvancedIllnessandFrailtyExclusion_QICore4",
      version: "'5.0.000'",
    },
    using: {
      text: "using QICore version '4.1.0'",
      start: { line: 3, position: 0 },
      stop: { line: 3, position: 27 },
      name: "QICore",
      version: "'4.1.0'",
    },
  };

  const cqlInclude: CqlInclude = {
    hits: 0,
  };
  const includes: CqlInclude[] = [cqlInclude];
  const cqlCode: CqlCode = {
    codeId: "testCodeId",
    codeSystem: "testCodeSystem",
    hits: 1,
    name: "ActPriority:HL7V3.0_2021-03",
  };
  const cqlCodes: CqlCode[] = [cqlCode];
  const cqlResultNoCodeSystem: CqlResult = {
    includes: includes,
    codeSystems: [],
    valueSets: [],
    codes: cqlCodes,
    parameters: [],
    identifiers: [],
    expressionDefinitions: [],
    errors: [],
  };

  const cqlCodeSystem: CqlCodeSystem = {
    hits: 1,
    text: "testText",
    name: "ActPriority:HL7V3.0_2021-03",
  };
  const cqlCodeSystems: CqlCodeSystem[] = [cqlCodeSystem];
  const cqlResultWithNoCodes: CqlResult = {
    includes: includes,
    codeSystems: cqlCodeSystems,
    valueSets: [],
    codes: [],
    parameters: [],
    identifiers: [],
    expressionDefinitions: [],
    errors: [],
  };

  it("getCustomCqlCodes input cql does not have code system", () => {
    const result: CustomCqlCode[] = getCustomCqlCodes(
      cql,
      cqlResultNoCodeSystem
    );
    expect(result).not.toBeNull();
    expect(result.length).toBe(1);
    expect(JSON.stringify(result).includes("codeSystem")).toBeFalsy();
  });

  it("getCustomCqlCodes input cql is null", () => {
    const result: CustomCqlCode[] = getCustomCqlCodes(
      "test",
      cqlResultWithNoCodes
    );
    expect(result.length).toBe(0);
  });

  it("getCustomCqlCodes input cql has valid code system", () => {
    const result: CustomCqlCode[] = getCustomCqlCodes(cql2, cqlResult);
    expect(result).not.toBeNull();
    expect(result.length).toBe(1);
    expect(JSON.stringify(result).includes("codeSystem")).toBeTruthy();
  });

  it("mapCodeSystemErrorsToTranslationErrors no error", () => {
    const elmTranslationErrors: ElmTranslationError[] =
      mapCodeSystemErrorsToTranslationErrors(customCqlCodes);
    expect(elmTranslationErrors.length).toBe(0);
  });

  it("mapCodeSystemErrorsToTranslationErrors has errors when code system is valid and code is invalid", () => {
    const elmTranslationErrors: ElmTranslationError[] =
      mapCodeSystemErrorsToTranslationErrors(customCqlCodesWithCodeSystemValid);
    expect(elmTranslationErrors.length).toBe(1);
  });

  it("mapCodeSystemErrorsToTranslationErrors has errors when code system is invalid and code is valid", () => {
    const elmTranslationErrors: ElmTranslationError[] =
      mapCodeSystemErrorsToTranslationErrors(
        customCqlCodesWithCodeSystemInvalid
      );
    expect(elmTranslationErrors.length).toBe(1);
  });
});
