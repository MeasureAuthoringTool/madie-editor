import axios from "axios";
import useTerminologyServiceApi, {
  Code,
  CodeStatus,
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
  status: CodeStatus.ACTIVE,
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
      service
        .getCodeDetails(mockCode.name, mockCode.codeSystem, mockCode.version)
        .then((response) => {
          expect(response.data.name).toEqual(mockCode.name);
          expect(response.data.display).toEqual(mockCode.display);
          expect(response.data.codeSystem).toEqual(mockCode.codeSystem);
          expect(response.data.version).toEqual(mockCode.version);
        });
    });
  });
});
