import axios from "axios";
import useTerminologyServiceApi, {
  Code,
  TerminologyServiceApi,
} from "./useTerminologyServiceApi";
import { ServiceConfig } from "./useServiceConfig";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock("@madie/madie-util", () => ({
  useOktaTokens: () => ({
    getAccessToken: () => "test.jwt",
  }),
}));

const mockConfig: ServiceConfig = {
  elmTranslationService: {
    baseUrl: "elm.com",
  },
  terminologyService: {
    baseUrl: "terminology.com",
  },
};

const mockCode: Code = {
  name: "1963-8",
  display: "this is test code",
  codeSystem: "LOINC",
  version: "2.40",
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
      const code: Code = await service.getCodeDetails(
        mockCode.name,
        mockCode.codeSystem,
        mockCode.version
      );
      expect(code.name).toEqual(mockCode.name);
      expect(code.display).toEqual(mockCode.display);
      expect(code.codeSystem).toEqual(mockCode.codeSystem);
      expect(code.version).toEqual(mockCode.version);
    });

    it("should return 404 if code not found for given code and code system", async () => {
      mockedAxios.get.mockImplementation((url) => {
        if (url === "/env-config/serviceConfig.json") {
          return Promise.resolve({ data: mockConfig });
        }
        if (
          url === `${mockConfig.terminologyService.baseUrl}/terminology/code`
        ) {
          return Promise.reject({ response: { status: 404 } });
        }
      });
      const service: TerminologyServiceApi = await useTerminologyServiceApi();
      try {
        await service.getCodeDetails(
          mockCode.name,
          mockCode.codeSystem,
          mockCode.version
        );
      } catch (error) {
        expect(error.message)
          .toEqual(`Code ${mockCode.name} not found for code system ${mockCode.codeSystem} and version ${mockCode.version} in VSAC.
          Please make sure code exists for selected code system and version`);
      }
    });

    it("should return generic error if there is internal server errors", async () => {
      mockedAxios.get.mockImplementation((url) => {
        if (url === "/env-config/serviceConfig.json") {
          return Promise.resolve({ data: mockConfig });
        }
        if (
          url === `${mockConfig.terminologyService.baseUrl}/terminology/code`
        ) {
          return Promise.reject({ response: { status: 500 } });
        }
      });
      const service: TerminologyServiceApi = await useTerminologyServiceApi();
      try {
        await service.getCodeDetails(
          mockCode.name,
          mockCode.codeSystem,
          mockCode.version
        );
      } catch (error) {
        expect(error.message).toEqual(
          "An issue occurred while retrieving the code from VSAC. Please try again. If issue continues, please contact helpdesk."
        );
      }
    });
  });
});
