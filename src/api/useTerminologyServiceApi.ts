import axios, { AxiosResponse } from "axios";
import { ServiceConfig, useServiceConfig } from "./useServiceConfig";
import { useOktaTokens } from "@madie/madie-util";
import { CqlCode, CqlCodeSystem } from "@madie/cql-antlr-parser/dist/src";

// customCqlCode contains validation result from VSAC
// This object can be cached in future, to avoid calling VSAC everytime.
export interface CustomCqlCodeSystem extends CqlCodeSystem {
  valid?: boolean;
  errorMessage?: string;
}
export interface CustomCqlCode extends Omit<CqlCode, "codeSystem"> {
  codeSystem: CustomCqlCodeSystem;
  valid?: boolean;
  errorMessage?: string;
}

export type ValueSet = {
  resourceType: string;
  id: string;
  url: string;
  status: string;
  errorMsg: string;
};

export interface CodeSystem {
  id: string;
  lastUpdated: string;
  lastUpdatedUpstream?: string;
  name?: string;
  title?: string;
  version?: string;
  versionId?: string;
}

export enum CodeStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  NA = "NA",
}
export interface Code {
  name: string;
  display: string;
  codeSystem: string;
  version: string;
  status: CodeStatus;
  codeSystemOid?: string;
}

export class TerminologyServiceApi {
  constructor(private baseUrl: string, private getAccessToken: () => string) {}

  async getValueSet(
    oid: string,
    locator: string,
    loggedInUMLS: boolean
  ): Promise<ValueSet> {
    let valueset: ValueSet = null;
    if (!loggedInUMLS) {
      valueset = {
        resourceType: "ValueSet",
        id: oid,
        url: locator,
        status: "unauthorized",
        errorMsg: "Please log in to UMLS",
      };
      return valueset;
    }
    await axios
      .get(`${this.baseUrl}/vsac/valueset`, {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
          "Content-Type": "text/plain",
        },
        params: {
          oid: oid,
        },
        timeout: 15000,
      })
      .then((resp) => {
        valueset = resp.data;
        valueset = { ...valueset, status: resp.statusText };
      })
      .catch((error) => {
        const message =
          error.message + " for oid = " + oid + " location = " + locator;
        valueset = {
          resourceType: "ValueSet",
          id: oid,
          url: locator,
          status: error.status,
          errorMsg: message,
        };
      });
    return valueset;
  }

  async validateCodes(
    customCqlCodes: CustomCqlCode[],
    loggedInUMLS: boolean,
    model: string
  ): Promise<CustomCqlCode[]> {
    if (!loggedInUMLS) {
      return processCodeSystemErrors(
        customCqlCodes,
        "Please Login to UMLS",
        false
      );
    }
    try {
      const response = await axios.put(
        `${this.baseUrl}/vsac/validations/codes?model=${model}`,
        customCqlCodes,
        {
          headers: {
            Authorization: `Bearer ${this.getAccessToken()}`,
          },
        }
      );
      if (response.status === 200) {
        return response.data;
      } else {
        return processCodeSystemErrors(
          customCqlCodes,
          "Unable to validate code, Please contact HelpDesk",
          false
        );
      }
    } catch (err) {
      return processCodeSystemErrors(
        customCqlCodes,
        "Unable to validate code, Please contact HelpDesk",
        false
      );
    }
  }

  async getAllCodeSystems(): Promise<CodeSystem[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/terminology/get-code-systems`,
        {
          headers: {
            Authorization: `Bearer ${this.getAccessToken()}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error("Error retrieving getAllCodeSystems: ", err);
    }
  }

  getCodeDetails(
    code: string,
    codeSystem: string,
    version: string
  ): Promise<AxiosResponse<Code>> {
    return axios.get<Code>(`${this.baseUrl}/terminology/code`, {
      params: { code: code, codeSystem: codeSystem, version: version },
      headers: {
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
    });
  }

  async getCodesListDetails(codesList): Promise<AxiosResponse<Code[]>> {
    return await axios.post<any>(
      `${this.baseUrl}/terminology/codesList`,
      codesList,
      {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
        },
      }
    );
  }
}

const processCodeSystemErrors = (
  cqlCodes: CustomCqlCode[],
  errorMessage: string,
  valid: boolean
): CustomCqlCode[] => {
  return cqlCodes.map((code) => {
    return {
      ...code,
      errorMessage: errorMessage,
      valid: valid,
      ...(code.codeSystem && {
        codeSystem: {
          ...code.codeSystem,
          errorMessage: errorMessage,
          valid: valid,
        },
      }),
    };
  });
};

export default async function useTerminologyServiceApi(): Promise<TerminologyServiceApi> {
  const config: ServiceConfig = await useServiceConfig();
  const serviceUrl: string = config?.terminologyService?.baseUrl;
  const { getAccessToken } = useOktaTokens();
  return new TerminologyServiceApi(serviceUrl, getAccessToken);
}
