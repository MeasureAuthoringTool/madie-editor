import { useState, useEffect } from "react";
import useTerminologyServiceApi, {
  CodeSystem,
} from "../../api/useTerminologyServiceApi";

export function useCodeSystems() {
  const [codeSystems, setCodeSystems] = useState<CodeSystem[]>([]);
  // const [loading, setLoading] = useState(true); maybe add later since this call is slow

  useEffect(() => {
    const useFetchCodeSystems = async () => {
      const terminologyService = await useTerminologyServiceApi();
      const fetchedCodeSystems = await terminologyService.getAllCodeSystems();
      setCodeSystems(fetchedCodeSystems);
      // setLoading(false); possibly add later
    };
    useFetchCodeSystems();
  }, []);

  return { codeSystems };
}
