import axios from "axios";
import { ServiceConfig, useServiceConfig } from "../api/useServiceConfig";
import { ElmTranslationError } from "../api/useElmTranslationServiceApi";
import useValidateCustomeCqlCodes from "./codesystemValidation";
import { CustomCqlCode } from "../api/useTerminologyServiceApi";

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

    const codesystemErrors: ElmTranslationError[] =
      await useValidateCustomeCqlCodes(customCqlCodes, true);
    expect(codesystemErrors.length).toBe(0);
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

    const codesystemErrors: ElmTranslationError[] =
      await useValidateCustomeCqlCodes(customCqlCodes, true);
    expect(codesystemErrors.length).toBe(2);
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

    const codesystemErrors: ElmTranslationError[] =
      await useValidateCustomeCqlCodes(customCqlCodes, true);
    expect(codesystemErrors.length).toBe(2);
  });

  it("Code System validation when user is not logged in to UMLS", async () => {
    const codesystemErrors: ElmTranslationError[] =
      await useValidateCustomeCqlCodes(customCqlCodes, false);
    codesystemErrors.forEach((error) => {
      expect(error.message).toBe("Please Login to UMLS");
    });
    expect(codesystemErrors.length).toBe(2);
  });
});
