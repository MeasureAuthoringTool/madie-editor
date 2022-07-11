import axios from "axios";
import { ServiceConfig, useServiceConfig } from "./useServiceConfig";
import { processCodeSystemErrors } from "../validations/editorUtil";
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

export type FHIRValueSet = {
  resourceType: string;
  id: string;
  url: string;
  status: string;
  errorMsg: string;
};

export class TerminologyServiceApi {
  constructor(private getAccessToken: () => string) {}

  async getValueSet(oid: string, locator: string): Promise<FHIRValueSet> {
    let fhirValueset: FHIRValueSet = null;
    const baseUrl = await GetServiceUrl();
    const resp = await axios
      .get(`${baseUrl}/vsac/valueset`, {
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
        fhirValueset = resp.data;
        fhirValueset = { ...fhirValueset, status: resp.statusText };
      })
      .catch((error) => {
        const message =
          error.message + " for oid = " + oid + " location = " + locator;
        fhirValueset = {
          resourceType: "ValueSet",
          id: oid,
          url: locator,
          status: error.status,
          errorMsg: message,
        };
      });
    return fhirValueset;
  }

  async validateCodes(
    customCqlCodes: CustomCqlCode[]
  ): Promise<CustomCqlCode[]> {
    const baseUrl = await GetServiceUrl();
    try {
      const response = await axios.put(
        `${baseUrl}/vsac/validations/codes`,
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
}

export const GetServiceUrl = async () => {
  const config: ServiceConfig = await useServiceConfig();
  const serviceUrl: string = config?.terminologyService?.baseUrl;

  return serviceUrl;
};

export default function useTerminologyServiceApi(): TerminologyServiceApi {
  const { getAccessToken } = useOktaTokens();
  return new TerminologyServiceApi(getAccessToken);
}
