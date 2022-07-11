import axios from "axios";
import { ServiceConfig, useServiceConfig } from "./useServiceConfig";
import { useOktaTokens } from "@madie/madie-util";

export type ElmTranslationError = {
  startLine: number;
  startChar: number;
  endChar: number;
  endLine: number;
  errorSeverity: string;
  errorType: string;
  message: string;
  targetIncludeLibraryId: string;
  targetIncludeLibraryVersionId: string;
  type: string;
};

export type ElmTranslationLibrary = {
  annotation: any[];
  contexts: any;
  identifier: any;
  parameters: any;
  schemaIdentifier: any;
  statements: any;
  usings: any;
  valueSets?: any;
};

export type ElmValueSet = {
  localId: any;
  locator: any;
  name: any;
  id: any;
};

export type ElmTranslation = {
  errorExceptions: ElmTranslationError[];
  externalErrors: any[];
  library: ElmTranslationLibrary;
};

export class ElmTranslationServiceApi {
  constructor(private getAccessToken: () => string) {}

  async translateCqlToElm(cql: string): Promise<ElmTranslation> {
    let baseUrl = null;
    try {
      baseUrl = await GetServiceUrl();
    } catch (error) {
      console.error(error);
    }
    if (baseUrl) {
      const resp = await axios.put(`${baseUrl}/cql/translator/cql`, cql, {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
          "Content-Type": "text/plain",
        },
        params: {
          showWarnings: true,
          annotations: true,
          locators: true,
          "disable-list-demotion": true,
          "disable-list-promotion": true,
          "validate-units": true,
        },
        timeout: 15000,
      });
      if (resp.status === 200) {
        return JSON.parse(resp.data.json);
      } else {
        const message = "received non-OK response for CQL-to-ELM translation";
        console.warn(message, resp.status);
        throw new Error(message);
      }
    } else {
      throw new Error(
        "Missing ELM translation service URL! Is it present in the service config?"
      );
    }
  }
}

export const GetServiceUrl = async () => {
  const config: ServiceConfig = await useServiceConfig();
  const serviceUrl: string = config?.elmTranslationService?.baseUrl;
  return serviceUrl;
};

export default function useElmTranslationServiceApi(): ElmTranslationServiceApi {
  const { getAccessToken } = useOktaTokens();
  return new ElmTranslationServiceApi(getAccessToken);
}
