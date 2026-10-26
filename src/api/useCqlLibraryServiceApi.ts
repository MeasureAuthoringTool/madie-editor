import axios from "./axios-instance";
import { useServiceConfig } from "./useServiceConfig";
import { ServiceConfig } from "./ServiceContext";
import useOktaTokens from "./useOktaTokens";
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
  librarySetId: string;
  ownerDisplayName: string;
  cql?: string;
  namespacePrefix?: string;
  externalLibrary?: boolean;
}

export interface LibrarySetDto {
  librarySet: LibrarySet;
  libraries: Array<CqlLibraryDto>;
}

const tryAgainMessage =
  "Please try again. If problem persists, contact MADiE Helpdesk";
export const fetchVersionedLibrariesErrorMessage =
  "An error occurred while fetching the CQL libraries. " + tryAgainMessage;
export const fetchCqlErrorMessage =
  "An error occurred while fetching the CQL. " + tryAgainMessage;

// NPM library versions do not follow the MADiE version format, so they are returned in externalVersion instead of version.
interface LibraryListItem extends Omit<CqlLibrary, "version"> {
  version?: string;
  externalVersion?: string;
}

export interface CqlLibraryDto extends CqlLibrary {
  external?: boolean;
  publisher?: string;
}

export class CqlLibraryServiceApi {
  constructor(private baseUrl: string, private getAccessToken: () => string) {}

  async fetchVersionedCqlLibrariesBySearchTermAndModel(
    searchTerm: string,
    model: string,
    usingModels: string[] = []
  ): Promise<CqlLibrary[]> {
    try {
      const response = await axios.get<LibraryListItem[]>(
        `${this.baseUrl}/cql-libraries/all-versioned`,
        {
          headers: {
            Authorization: `Bearer ${this.getAccessToken()}`,
          },
          params: {
            libraryName: searchTerm,
            model: model,
            usingModels: usingModels.join(","),
          },
        }
      );
      return response.data?.map((library) => {
        const { externalVersion, ...rest } = library;
        return {
          ...rest,
          version: library.externalLibrary ? externalVersion : library.version,
        } as CqlLibrary;
      });
    } catch (err) {
      console.error(fetchVersionedLibrariesErrorMessage, err);
      throw new Error(fetchVersionedLibrariesErrorMessage);
    }
  }

  getVersionedCqlLibraryByNameVersion(
    name: string,
    version: string,
    namespacePrefix?: string
  ): Promise<AxiosResponse<CqlLibraryDto>> {
    return axios.get(`${this.baseUrl}/cql-libraries/versioned`, {
      headers: {
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
      params: {
        name,
        version,
        includeElm: false,
        ...(namespacePrefix && { namespacePrefix }),
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

export default function useCqlLibraryServiceApi(): CqlLibraryServiceApi {
  const config: ServiceConfig = useServiceConfig();
  const serviceUrl: string = config?.cqlLibraryService?.baseUrl;
  const { getAccessToken } = useOktaTokens();
  return new CqlLibraryServiceApi(serviceUrl, getAccessToken);
}
