import axios from "./axios-instance";
import { ServiceConfig, useServiceConfig } from "./useServiceConfig";
import { useOktaTokens } from "@madie/madie-util";
import { AxiosResponse } from "axios";

interface LibrarySet {
  librarySetId: string;
  owner: string;
}
export interface CqlLibrary {
  id: string;
  cqlLibraryName: string;
  version: string;
  librarySet: LibrarySet;
  draft: boolean;
  alias?: string;
}

export interface LibrarySetDto {
  librarySet: LibrarySet;
  libraries: Array<CqlLibrary>;
}

const tryAgainMessage =
  "Please try again. If problem persists, contact MADiE Helpdesk";
export const fetchVersionedLibrariesErrorMessage =
  "An error occurred while fetching the CQL libraries. " + tryAgainMessage;
export const fetchCqlErrorMessage =
  "An error occurred while fetching the CQL. " + tryAgainMessage;

export class CqlLibraryServiceApi {
  constructor(private baseUrl: string, private getAccessToken: () => string) {}

  async fetchVersionedCqlLibrariesBySearchTermAndModel(
    searchTerm: string,
    model: string
  ): Promise<CqlLibrary[]> {
    try {
      const response = await axios.get<CqlLibrary[]>(
        `${this.baseUrl}/cql-libraries/all-versioned`,
        {
          headers: {
            Authorization: `Bearer ${this.getAccessToken()}`,
          },
          params: {
            libraryName: searchTerm,
            model: model,
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error(fetchVersionedLibrariesErrorMessage, err);
      throw new Error(fetchVersionedLibrariesErrorMessage);
    }
  }

  getVersionedCqlLibraryByNameVersionAndModel(
    name: string,
    version: string,
    model: string
  ): Promise<AxiosResponse<CqlLibrary>> {
    return axios.get(`${this.baseUrl}/cql-libraries/versioned`, {
      headers: {
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
      params: {
        name,
        version,
        model,
        includeElm: false,
      },
    });
  }

  async fetchLibrarySet(setId: string): Promise<LibrarySetDto> {
    try {
      const response = await axios.get<LibrarySetDto>(
        `${this.baseUrl}/cql-libraries/library-set/${setId}`,
        {
          headers: {
            Authorization: `Bearer ${this.getAccessToken()}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error(fetchCqlErrorMessage, err);
      throw new Error(fetchCqlErrorMessage);
    }
  }
}

export default async function useCqlLibraryServiceApi(): Promise<CqlLibraryServiceApi> {
  const config: ServiceConfig = await useServiceConfig();
  const serviceUrl: string = config?.cqlLibraryService?.baseUrl;
  const { getAccessToken } = useOktaTokens();
  return new CqlLibraryServiceApi(serviceUrl, getAccessToken);
}
