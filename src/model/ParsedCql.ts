import CqlResult from "@madie/cql-antlr-parser/dist/src/dto/CqlResult";

export interface Statement {
  statement: string;
  index: number;
}
export interface ParsedCql {
  cqlArrayToBeFiltered?: Array<string>;
  libraryContent?: Statement;
  usingContent?: Statement;
  parsedCql: CqlResult;
}
