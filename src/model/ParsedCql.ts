export interface Statement {
  statement: string;
  index: number;
}
export interface ParsedCql {
  cqlArrayToBeFiltered?: Array<string>;
  libraryContent?: Statement;
  usingContent?: Statement;
}
