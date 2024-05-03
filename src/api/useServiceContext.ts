// import axios from "axios";
// import { createContext } from "react";

// export interface ServiceConfig {
//   elmTranslationService: {
//     baseUrl: string;
//   };
//   terminologyService: {
//     baseUrl: string;
//   };
// }

// export async function useServiceConfig(): ServiceConfig {
//   const serviceConfig: ServiceConfig = (
//     await axios.get<ServiceConfig>("/env-config/serviceConfig.json")
//   ).data;

//   if (
//     !(
//       serviceConfig?.elmTranslationService &&
//       serviceConfig.elmTranslationService.baseUrl
//     )
//   ) {
//     throw new Error("Invalid ELM Translation Service Config");
//   }

//   if (
//     !(
//       serviceConfig?.terminologyService &&
//       serviceConfig.terminologyService.baseUrl
//     )
//   ) {
//     throw new Error("Invalid Terminology Service Config");
//   }
//   return serviceConfig;
// }

// const ServiceContext = createContext<ServiceConfig>(null);

// export default ServiceContext;

// export const ApiContextProvider = ServiceContext.Provider;
// export const ApiContextConsumer = ServiceContext.Consumer;
