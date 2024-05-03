import { useState, useEffect, useRef } from "react";
import useTerminologyServiceApi, {
  CodeSystem,
} from "../../api/useTerminologyServiceApi";

export function useCodeSystems() {
  const terminologyService = useRef(useTerminologyServiceApi());
  const [codeSystems, setCodeSystems] = useState<CodeSystem[]>([]);
  const fetchCodeSystems = async () => {
    terminologyService.current
      .getAllCodeSystems()
      .then((fetchedCodeSystems) => {
        setCodeSystems(fetchedCodeSystems);
      });
  };

  useEffect(() => {
    fetchCodeSystems();
  }, []);

  return { codeSystems };
}
