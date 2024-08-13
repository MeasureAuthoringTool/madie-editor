import axios from "./axios-instance";
import {
  CqlLibrary,
  CqlLibraryServiceApi,
  fetchVersionedLibrariesErrorMessage,
} from "./useCqlLibraryServiceApi";
import { mockServiceConfig } from "../__mocks__/mockServiceConfig";

jest.mock("../api/axios-instance");
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock("./useServiceConfig", () => {
  return {
    useServiceConfig: jest.fn(() => Promise.reject(mockServiceConfig)),
  };
});

const mockGetAccessToken = jest.fn().mockImplementation(() => {
  return Promise.resolve("test.jwt");
});

const cqlLibraries = [
  {
    id: "1",
    cqlLibraryName: "Test_1",
    version: "1.1.111",
    owner: "John",
  },
  {
    id: "2",
    cqlLibraryName: "Test_0",
    version: "1.1.110",
    owner: "Jane",
  },
] as Array<CqlLibrary>;

describe("CqlLibraryServiceApi Tests", () => {
  const cqlLibraryServiceApi = new CqlLibraryServiceApi(
    mockServiceConfig.cqlLibraryService.baseUrl,
    mockGetAccessToken
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should fetch versioned cql libraries", async () => {
    mockedAxios.get.mockImplementation((url) =>
      Promise.resolve({ data: cqlLibraries })
    );
    const response = await cqlLibraryServiceApi.fetchVersionedCqlLibraries(
      "test",
      "QDM"
    );
    expect(response.length).toBe(2);
    expect(response[0].cqlLibraryName).toEqual(cqlLibraries[0].cqlLibraryName);
    expect(response[0].version).toEqual(cqlLibraries[0].version);
    expect(response[1].cqlLibraryName).toEqual(cqlLibraries[1].cqlLibraryName);
    expect(response[1].version).toEqual(cqlLibraries[1].version);
  });

  it("Should return error if fetch cql libraries failed", async () => {
    mockedAxios.get.mockImplementation((url) =>
      Promise.reject({ status: 400 })
    );
    try {
      await cqlLibraryServiceApi.fetchVersionedCqlLibraries("test", "");
    } catch (e) {
      expect(e.message).toEqual(fetchVersionedLibrariesErrorMessage);
    }
  });
});
