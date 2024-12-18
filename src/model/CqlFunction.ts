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
