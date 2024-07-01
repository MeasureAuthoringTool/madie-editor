import axios from "./axios-instance";
import { ServiceConfig, useServiceConfig } from "./useServiceConfig";
import { useOktaTokens } from "@madie/madie-util";
import { ElmTranslation } from "./TranslatedElmModels";

export class FhirElmTranslationServiceApi {
  constructor(private baseUrl: string, private getAccessToken: () => string) {}

  async translateCqlToElm(cql: string): Promise<ElmTranslation> {
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
              showWarnings: true,
              annotations: true,
              locators: true,
              "disable-list-demotion": true,
              "disable-list-promotion": true,
              "validate-units": true,
            },
            timeout: 15000,
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
}

export default async function useFhirElmTranslationServiceApi(): Promise<FhirElmTranslationServiceApi> {
  const config: ServiceConfig = await useServiceConfig();
  const serviceUrl: string = config?.fhirElmTranslationService?.baseUrl;
  const { getAccessToken } = useOktaTokens();
  return new FhirElmTranslationServiceApi(serviceUrl, getAccessToken);
}
