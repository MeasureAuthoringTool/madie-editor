import { ServiceConfig } from "../api/ServiceContext";
export const mockServiceConfig: ServiceConfig = {
  measureService: {
    baseUrl: "measure-service.com",
  },
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
  fhirService: {
    baseUrl: "fhir-service.com",
  },
  excelExportService: {
    baseUrl: "exportService.com",
  },
};
