export type EditorAnnotation = {
  row?: number;
  column?: number;
  text: string;
  type: string;
};

export interface Point {
  row: number;
  column: number;
}

export interface Range {
  start: Point;
  end: Point;
}

export type EditorErrorMarker = {
  range: Range;
  clazz: string;
  type: "text" | null;
};

export interface CQLFunctionArgument {
  argumentName?: string;
  dataType?: string;
}

export interface CQLFunction {
  functionName?: string;
  expression?: string;
  comment?: string;
  fluentFunction?: boolean;
  expressionValue?: string;
  functionsArguments?: CQLFunctionArgument[];
}
