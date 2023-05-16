declare module "@madie/madie-util" {
  import { LifeCycleFn } from "single-spa";

  export const useOktaTokens: (storageKey?: string) => {
    getAccessToken: () => any;
    getAccessTokenObj: () => any;
    getUserName: () => any;
    getIdToken: () => any;
    getIdTokenObj: () => any;
  };

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
