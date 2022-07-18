import axios from "axios";
import { ServiceConfig, useServiceConfig } from "../api/useServiceConfig";
import {
  useTerminologyServiceApi,
  TerminologyServiceApi,
} from "@madie/madie-util";
import CheckLogin from "./umlsLogin";

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

jest.mock("@madie/madie-util", () => ({
  useTerminologyServiceApi: jest.fn(),
  useOktaTokens: () => ({
    getAccessToken: () => "test.jwt",
  }),
}));

describe("UMLS Login test", () => {
  it("Logged in UMLS", async () => {
    (useTerminologyServiceApi as jest.Mock).mockImplementation(() => {
      return {
        checkLogin: jest
          .fn()
          .mockResolvedValueOnce({ status: 200, data: true }),
      } as unknown as TerminologyServiceApi;
    });
    const loggedIn = await CheckLogin();
    expect(loggedIn.valueOf).toBeTruthy();
  });

  it("Not logged in UMLS", async () => {
    (useTerminologyServiceApi as jest.Mock).mockImplementation(() => {
      return {
        checkLogin: jest
          .fn()
          .mockRejectedValueOnce({ status: 401, data: false }),
      } as unknown as TerminologyServiceApi;
    });
    const loggedIn = await CheckLogin();
    expect(loggedIn.valueOf()).toBeFalsy();
  });
});
