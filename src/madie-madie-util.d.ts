declare module "@madie/madie-util" {
  import { LifeCycleFn } from "single-spa";

  interface FeatureFlags {
    QDMValueSetSearch: boolean;
  }

  export const measureStore: {
    subscribe: (
      setMeasureState: React.Dispatch<React.SetStateAction<Measure>>
    ) => import("rxjs").Subscription;
    updateMeasure: (measure: Measure | null) => void;
    initialState: null;
    state: Measure;
  };

  export const useOktaTokens: (storageKey?: string) => {
    getAccessToken: () => any;
    getAccessTokenObj: () => any;
    getUserName: () => any;
    getIdToken: () => any;
    getIdTokenObj: () => any;
    useFeatureFlags: () => any;
  };
  export function useFeatureFlags(): FeatureFlags;

  export function getOidFromString(
    oidString: string,
    dataModel: string
  ): string;

  export class TerminologyServiceApi {
    constructor(baseUrl: string, getAccessToken: () => string);
    checkLogin(): Promise<Boolean>;
  }
  export function useTerminologyServiceApi(): TerminologyServiceApi;

  export const bootstrap: LifeCycleFn<void>;
  export const mount: LifeCycleFn<void>;
  export const unmount: LifeCycleFn<void>;
}
