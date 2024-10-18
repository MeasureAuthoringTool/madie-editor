import useCqlLibraryServiceApi from "../../../api/useCqlLibraryServiceApi";
import { useCallback, useRef } from "react";

export const useMemoizedLibrarySet = () => {
  const libraryService = useCqlLibraryServiceApi();
  const cache = useRef(new Map());
  return useCallback(
    async (setId) => {
      if (cache.current.has(setId)) {
        return cache.current.get(setId);
      }
      const service = await libraryService;
      const result = await service.fetchLibrarySet(setId);
      cache.current.set(setId, result);
      return result;
    },
    [libraryService]
  );
};
