import { useState, useEffect, useRef } from "react";
import useTerminologyServiceApi, {
  CodeSystem,
} from "../../api/useTerminologyServiceApi";

export function useCodeSystems() {
  const [codeSystems, setCodeSystems] = useState<CodeSystem[]>([]);
  // const [loading, setLoading] = useState(true); maybe add later since this call is slow

  const terminologyService = useRef(useTerminologyServiceApi());

  useEffect(() => {
    const fetchCodeSystems = async () => {
      const fetchedCodeSystems =
        await terminologyService.current.getAllCodeSystems();
      setCodeSystems(fetchedCodeSystems);
      // setLoading(false); possibly add later
    };
    fetchCodeSystems();
  }, []);

  return { codeSystems };
}
