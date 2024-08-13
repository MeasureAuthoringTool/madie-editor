import { ServiceConfig } from "../api/useServiceConfig";

export const mockServiceConfig: ServiceConfig = {
  qdmElmTranslationService: {
    baseUrl: "qdm-elm-translator.com",
  },
  fhirElmTranslationService: {
    baseUrl: "fhir-elm-translator.com",
  },
  terminologyService: {
    baseUrl: "terminology-service.com",
  },
  cqlLibraryService: {
    baseUrl: "library-service.com",
  },
};
