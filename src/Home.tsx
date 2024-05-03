import React, { Suspense, useEffect, useState } from "react";
import { ServiceConfig, ApiContextProvider } from "./api/ServiceContext";
import axios from "axios";
import CqlEditorWithTerminology from "./cqlEditorWithTerminology/CqlEditorWithTerminology";

export default function Home(props) {
  const [configError, setConfigError] = useState<boolean>(false);
  const [serviceConfig, setServiceConfig] = useState<ServiceConfig | null>(
    null
  );

  console.log('props', props)
  // Use an effect hook to fetch the serviceConfig and set the state
  useEffect(() => {
    axios
      .get<ServiceConfig>("/env-config/serviceConfig.json")
      .then((value) => {
        console.log('value is', value)
        if (value?.data?.elmTranslationService?.baseUrl) {
          console.log('true')
          setServiceConfig(value.data);
        } else {
            console.error("Invalid service config");
            setConfigError(true);
            // throw new Error("Invalid Terminology Service Config");
        }
      })
      .catch((reason) => {
        console.log('reason is', reason)
        console.error(reason);
        setConfigError(true);
      });
  }, []);
  const errorPage = <div>Error loading service config</div>;

  const loadingState = <div>Loading...</div>;

  const loadedState = (
      <ApiContextProvider value={serviceConfig}>
        <Suspense fallback={<div>loading</div>}>
          <CqlEditorWithTerminology {...props} />
        </Suspense>
      </ApiContextProvider>
  );

  let result = serviceConfig === null ? loadingState : loadedState;
  if (configError) {
    result = errorPage;
  }

  return result;
}
