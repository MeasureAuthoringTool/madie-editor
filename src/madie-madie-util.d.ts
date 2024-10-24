declare module "@madie/madie-util" {
  import { LifeCycleFn } from "single-spa";

  interface FeatureFlags {
    CQLBuilderIncludes: boolean;
    QDMValueSetSearch: boolean;
    CQLBuilderDefinitions: boolean;
    CQLBuilderParameters: boolean;
    qdmCodeSearch: boolean;
  }

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

  export function wafIntercept(): void;

  export const bootstrap: LifeCycleFn<void>;
  export const mount: LifeCycleFn<void>;
  export const unmount: LifeCycleFn<void>;
}
