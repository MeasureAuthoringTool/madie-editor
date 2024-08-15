import axios from "./axios-instance";
import { ServiceConfig, useServiceConfig } from "./useServiceConfig";
import { useOktaTokens } from "@madie/madie-util";

interface LibrarySet {
  id: string;
  librarySetId: string;
  owner: string;
}
export interface CqlLibrary {
  id: string;
  cqlLibraryName: string;
  version: string;
  librarySet: LibrarySet;
  draft: boolean;
}

export const fetchVersionedLibrariesErrorMessage =
  "An error occurred while fetching the CQL libraries. Please try again. If problem persists, contact MADiE Helpdesk";

export class CqlLibraryServiceApi {
  constructor(private baseUrl: string, private getAccessToken: () => string) {}

  async fetchVersionedCqlLibraries(
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
}

export default async function useCqlLibraryServiceApi(): Promise<CqlLibraryServiceApi> {
  const config: ServiceConfig = await useServiceConfig();
  const serviceUrl: string = config?.cqlLibraryService?.baseUrl;
  const { getAccessToken } = useOktaTokens();
  return new CqlLibraryServiceApi(serviceUrl, getAccessToken);
}
