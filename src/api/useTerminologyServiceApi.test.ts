import axios from "../api/axios-instance";
import useTerminologyServiceApi, {
  Code,
  CodeStatus,
  TerminologyServiceApi,
} from "./useTerminologyServiceApi";
import { ServiceConfig } from "./useServiceConfig";

jest.mock("../api/axios-instance");
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock("@madie/madie-util", () => ({
  useOktaTokens: () => ({
    getAccessToken: () => "test.jwt",
  }),
}));

const mockConfig: ServiceConfig = {
  qdmElmTranslationService: {
    baseUrl: "qdm-elm.com",
  },
  fhirElmTranslationService: {
    baseUrl: "fhir-elm.com",
  },
  terminologyService: {
    baseUrl: "terminology.com",
  },
  cqlLibraryService: {
    baseUrl: "library-service.com",
  },
};

const mockCode: Code = {
  fhirVersion: "https://test.org/2.40",
  name: "1963-8",
  display: "this is test code",
  codeSystem: "LOINC",
  status: CodeStatus.ACTIVE,
  svsVersion: "2.40",
};

describe("TerminologyServiceApi test", () => {
  it("should return an instance of TerminologyServiceApi", async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url === "/env-config/serviceConfig.json") {
        return Promise.resolve({ data: mockConfig });
      }
    });
    const service: TerminologyServiceApi = await useTerminologyServiceApi();
    expect(service).not.toBeNull();
  });

  describe("Code Search tests", () => {
    it("should return a code object for given code and code system", async () => {
      mockedAxios.get.mockImplementation((url) => {
        if (url === "/env-config/serviceConfig.json") {
          return Promise.resolve({ data: mockConfig });
        }
        if (
          url === `${mockConfig.terminologyService.baseUrl}/terminology/code`
        ) {
          return Promise.resolve({ data: mockCode });
        }
      });
      const service: TerminologyServiceApi = await useTerminologyServiceApi();
      service
        .getCodeDetails(mockCode.name, mockCode.codeSystem, mockCode.svsVersion)
        .then((response) => {
          expect(response.data.name).toEqual(mockCode.name);
          expect(response.data.display).toEqual(mockCode.display);
          expect(response.data.codeSystem).toEqual(mockCode.codeSystem);
          expect(response.data.svsVersion).toEqual(mockCode.svsVersion);
        });
    });
  });

  describe("Saved Codes", () => {
    it("should return a code object for given code and code system", async () => {
      const mockCodeList = [
        {
          code: "8462-4",
          codeSystem: "LOINC",
          oid: "'urn:oid:2.16.840.1.113883.6.1'",
        },
        {
          code: "8480-6",
          codeSystem: "LOINC",
          oid: "'urn:oid:2.16.840.1.113883.6.1'",
        },
      ];

      const mockeCodeDetailsList = [
        {
          name: "8462-4",
          display: "Diastolic blood pressure",
          version: "2.72",
          codeSystem: "LOINC",
          codeSystemOid: "2.16.840.1.113883.6.1",
          status: "ACTIVE",
        },
        {
          name: "8480-6",
          display: "Systolic blood pressure",
          version: "2.72",
          codeSystem: "LOINC",
          codeSystemOid: "2.16.840.1.113883.6.1",
          status: "ACTIVE",
        },
      ];
      mockedAxios.get.mockImplementation((url) => {
        if (url === "/env-config/serviceConfig.json") {
          return Promise.resolve({ data: mockConfig });
        }
      });
      mockedAxios.post.mockImplementation((url) => {
        if (
          url === `${mockConfig.terminologyService.baseUrl}/terminology/codes`
        ) {
          return Promise.resolve({ data: mockeCodeDetailsList });
        }
      });

      const service: TerminologyServiceApi = await useTerminologyServiceApi();
      service.getCodesAndCodeSystems(mockCodeList).then((response) => {
        expect(response.data).toEqual(mockeCodeDetailsList);
        expect(response.data).toHaveLength(2);
      });
    });
  });
});
