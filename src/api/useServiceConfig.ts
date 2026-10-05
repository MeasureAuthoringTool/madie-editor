import { useContext } from "react";
import ServiceContext, { ServiceConfig } from "./ServiceContext";

export const useServiceConfig = (): ServiceConfig => {
  const context = useContext(ServiceContext);

  if (!context) {
    throw new Error(
      "useServiceConfig must be used within an ApiContextProvider"
    );
  }

  return context;
};
