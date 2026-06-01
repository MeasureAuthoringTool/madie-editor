import axios from "./axios-instance";
import { useServiceConfig } from "./useServiceConfig";
import { ServiceConfig } from "./ServiceContext";
import useOktaTokens from "./useOktaTokens";
import { ElmTranslation } from "./TranslatedElmModels";
import { AxiosResponse } from "axios";

export class FhirElmTranslationServiceApi {
  constructor(private baseUrl: string, private getAccessToken: () => string) {}

  async translateCqlToElm(
    cql: string,
    checkContext: boolean
  ): Promise<ElmTranslation> {
    if (this.baseUrl) {
      try {
        const resp = await axios.put(
          `${this.baseUrl}/fhir/cql/translator/cql`,
          cql,
          {
            headers: {
              Authorization: `Bearer ${this.getAccessToken()}`,
              "Content-Type": "text/plain",
            },
            params: {
              errorSeverity: "Info",
              annotations: true,
              locators: true,
              "disable-list-demotion": true,
              "disable-list-promotion": true,
              "validate-units": true,
              checkContext: checkContext,
            },
          }
        );
        if (resp.status === 200) {
          return JSON.parse(resp.data.json);
        }
      } catch (error) {
        console.warn(error.response.data.error, error.response.data.status);
        throw new Error(error.message);
      }
    } else {
      throw new Error(
        "Missing FHIR ELM translation service URL! Is it present in the service config?"
      );
    }
  }

  getCqlBuilderLookups(cql: string): Promise<AxiosResponse> {
    if (this.baseUrl) {
      return axios.put(`${this.baseUrl}/fhir/cql-builder-lookups`, cql, {
        headers: {
          Authorization: `Bearer ${this.getAccessToken()}`,
          "Content-Type": "text/plain",
        },
      });
    } else {
      throw new Error(
        "Missing FHIR ELM translation service URL! Is it present in the service config?"
      );
    }
  }
}

export default function useFhirElmTranslationServiceApi(): FhirElmTranslationServiceApi {
  const config: ServiceConfig = useServiceConfig();
  const serviceUrl: string = config?.fhirElmTranslationService?.baseUrl;
  const { getAccessToken } = useOktaTokens();
  return new FhirElmTranslationServiceApi(serviceUrl, getAccessToken);
}
