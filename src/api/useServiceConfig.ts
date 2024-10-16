import axios from "./axios-instance";

export interface ServiceConfig {
  qdmElmTranslationService: {
    baseUrl: string;
  };
  fhirElmTranslationService: {
    baseUrl: string;
  };
  terminologyService: {
    baseUrl: string;
  };
  cqlLibraryService: {
    baseUrl: string;
  };
}

export async function useServiceConfig(): Promise<ServiceConfig> {
  const serviceConfig: ServiceConfig = (
    await axios.get<ServiceConfig>("/env-config/serviceConfig.json")
  ).data;

  if (
    !(
      serviceConfig?.qdmElmTranslationService &&
      serviceConfig.qdmElmTranslationService.baseUrl
    )
  ) {
    throw new Error("Invalid QDM ELM Translation Service Config");
  }

  if (
    !(
      serviceConfig?.fhirElmTranslationService &&
      serviceConfig.fhirElmTranslationService.baseUrl
    )
  ) {
    throw new Error("Invalid FHIR ELM Translation Service Config");
  }

  if (
    !(
      serviceConfig?.terminologyService &&
      serviceConfig.terminologyService.baseUrl
    )
  ) {
    throw new Error("Invalid Terminology Service Config");
  }
  return serviceConfig;
}
