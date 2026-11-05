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
    librarySet: { owner: "John" },
  },
  {
    id: "2",
    cqlLibraryName: "Test_0",
    version: "1.1.110",
    librarySet: { owner: "John" },
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
    const response =
      await cqlLibraryServiceApi.fetchVersionedCqlLibrariesBySearchTermAndModel(
        "test",
        "QDM"
      );
    expect(response.length).toBe(2);
    expect(response[0].cqlLibraryName).toEqual(cqlLibraries[0].cqlLibraryName);
    expect(response[0].version).toEqual(cqlLibraries[0].version);
    expect(response[1].cqlLibraryName).toEqual(cqlLibraries[1].cqlLibraryName);
    expect(response[1].version).toEqual(cqlLibraries[1].version);
  });

  it("Should use the external version for NPM libraries in search results", async () => {
    mockedAxios.get.mockImplementation(() =>
      Promise.resolve({
        data: [
          ...cqlLibraries,
          {
            id: "3",
            cqlLibraryName: "FHIRCommon",
            namespacePrefix: "hl7.fhir.uv.cql",
            externalLibrary: true,
            externalVersion: "2.0.0",
            librarySetId: "ext-set",
          },
        ],
      })
    );
    const response =
      await cqlLibraryServiceApi.fetchVersionedCqlLibrariesBySearchTermAndModel(
        "common",
        "US Quality Core v0.5.0"
      );
    expect(response.length).toBe(3);
    expect(response[0].version).toEqual(cqlLibraries[0].version);
    expect(response[2].version).toEqual("2.0.0");
    expect(response[2].namespacePrefix).toEqual("hl7.fhir.uv.cql");
    expect(response[2].externalLibrary).toBe(true);
    expect(response[2]).not.toHaveProperty("externalVersion");
  });

  it("Should pass namespace prefix when fetching a versioned NPM library", async () => {
    mockedAxios.get.mockImplementation(() =>
      Promise.resolve({ data: {}, status: 200 })
    );
    await cqlLibraryServiceApi.getVersionedCqlLibraryByNameVersion(
      "FHIRCommon",
      "2.0.0",
      "hl7.fhir.uv.cql"
    );
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${mockServiceConfig.cqlLibraryService.baseUrl}/cql-libraries/versioned`,
      expect.objectContaining({
        params: {
          name: "FHIRCommon",
          version: "2.0.0",
          includeElm: false,
          namespacePrefix: "hl7.fhir.uv.cql",
        },
      })
    );
  });

  it("Should send the declared models when searching libraries", async () => {
    mockedAxios.get.mockImplementation(() => Promise.resolve({ data: [] }));
    await cqlLibraryServiceApi.fetchVersionedCqlLibrariesBySearchTermAndModel(
      "common",
      "US Quality Core v0.5.0",
      ["USQualityCore:0.5.0", "FHIR:4.0.1"]
    );
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${mockServiceConfig.cqlLibraryService.baseUrl}/cql-libraries/all-versioned`,
      expect.objectContaining({
        params: {
          libraryName: "common",
          model: "US Quality Core v0.5.0",
          usingModels: "USQualityCore:0.5.0,FHIR:4.0.1",
        },
      })
    );
  });

  it("Should return error if fetch cql libraries failed", async () => {
    mockedAxios.get.mockImplementation((url) =>
      Promise.reject({ status: 400 })
    );
    try {
      await cqlLibraryServiceApi.fetchVersionedCqlLibrariesBySearchTermAndModel(
        "test",
        ""
      );
    } catch (e) {
      expect(e.message).toEqual(fetchVersionedLibrariesErrorMessage);
    }
  });

  it("Should return versioned cql library for given name and version", async () => {
    mockedAxios.get.mockImplementation((url) =>
      Promise.resolve({ data: cqlLibraries[0], status: 200 })
    );
    const response =
      await cqlLibraryServiceApi.getVersionedCqlLibraryByNameVersion(
        "Test_1",
        "1.1.111"
      );
    expect(response.status).toEqual(200);
    expect(response.data.cqlLibraryName).toEqual(
      cqlLibraries[0].cqlLibraryName
    );
    expect(response.data.version).toEqual(cqlLibraries[0].version);
    expect(response.data.librarySet.owner).toEqual(
      cqlLibraries[0].librarySet.owner
    );
  });
});
