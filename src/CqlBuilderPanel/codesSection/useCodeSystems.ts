import { useState, useEffect, useRef } from "react";
import useTerminologyServiceApi, {
  CodeSystem,
} from "../../api/useTerminologyServiceApi";

export function useCodeSystems() {
  console.log("callingUseCodeSystem");
  const [codeSystems, setCodeSystems] = useState<CodeSystem[]>([]);
  // const [loading, setLoading] = useState(true); maybe add later since this call is slow

  const terminologyService = useRef(useTerminologyServiceApi());

  useEffect(() => {
    const fetchCodeSystems = async () => {
      // eslint-disable-next-line
      // eslint-disable-next-line
      const fetchedCodeSystems =
        await terminologyService.current.getAllCodeSystems();
      setCodeSystems(fetchedCodeSystems);
      // setLoading(false); possibly add later
    };
    fetchCodeSystems();
  }, []);

  return { codeSystems };
}
