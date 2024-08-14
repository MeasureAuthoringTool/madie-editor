export interface CqlBuilderLookup {
  parameters: Array<Lookup>;
  definitions: Array<Lookup>;
  functions: Array<Lookup>;
  fluentFunctions: Array<Lookup>;
}
export interface Lookup {
  name: string;
  libraryName: string;
  libraryAlias: string;
  logic: string;
}
export interface CqlBuilderAvailableLookupData {
  parameters: string[];
  definitions: string[];
  functions: string[];
  fluentFunctions: string[];
}
