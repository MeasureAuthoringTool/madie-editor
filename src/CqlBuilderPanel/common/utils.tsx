// import { formatExpressionName } from "../definitionsSection/definitionBuilder/DefinitionBuilder";

export const formatExpressionName = (values) => {
  return values?.type !== "Timing" && values?.type !== "Pre-Defined Functions"
    ? values?.type === "Functions" || values?.type === "Fluent Functions"
      ? values?.name?.replace(/([\w\s]+)\(\)/g, '"$1"()')
      : values?.name.includes(".")
      ? values?.name.replace(/(.*\.)(.*)/, '$1"$2"')
      : `"${values?.name}"`
    : values?.name;
};
// given
export const getNewExpressionsAndLines = (
  values: any,
  cursorPosition: any,
  expressionEditorValue: any,
  autoInsert: boolean
) => {
  const formattedExpression = formatExpressionName(values);
  let editorExpressionValue = expressionEditorValue;
  let newCursorPosition = cursorPosition;

  if (cursorPosition && !autoInsert) {
    // Insert at cursor position
    const { row, column } = cursorPosition;
    const lines = expressionEditorValue.split("\n");
    const currentLine = lines[row];
    lines[row] =
      currentLine.slice(0, column) +
      formattedExpression +
      currentLine.slice(column);
    editorExpressionValue = lines.join("\n");
    newCursorPosition = {
      row,
      column: column + formattedExpression.length,
    } as unknown;
  } else {
    // Append to a new line
    const lines = editorExpressionValue.split("\n");
    const newLineIndex = lines.length;
    editorExpressionValue +=
      (editorExpressionValue ? "\n" : "") + formattedExpression;
    newCursorPosition = {
      row: newLineIndex,
      column: formattedExpression.length,
    };
  }
  return [editorExpressionValue, newCursorPosition];
};
