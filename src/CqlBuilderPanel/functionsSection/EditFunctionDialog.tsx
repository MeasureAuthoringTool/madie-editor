import React from "react";
import { MadieDialog } from "@madie/madie-design-system/dist/react";
import FunctionBuilder from "./functionBuilder/FunctionBuilder";

interface PropTypes {
  open: boolean;
  onClose: () => void;
  cqlBuilderLookupsTypes?: any;
  funct?: any;
  setEditFunctionDialogOpen: Function;
  handleApplyFunction: Function;
  handleFunctionEdit: Function;
}

export const parseArgumentsFromLogicString = (logicString) => {
  // `s` flag for multiline content
  const argumentListRegex = /\(([^)]*)\)/s;
  const match = logicString.match(argumentListRegex);

  // Nobody in parenthesis
  if (!match) {
    return [];
  }

  const argumentsString = match[1].trim();
  // no args
  if (!argumentsString) {
    return [];
  }

  // Regex to match argument and data type pairs
  const argumentRegex = /([\w]+)\s+"([^"]+)"/g;
  const results = [];

  let argumentMatch;
  while ((argumentMatch = argumentRegex.exec(argumentsString)) !== null) {
    const [, argumentName, dataType] = argumentMatch;
    results.push({ argumentName, dataType });
  }
  return results;
};

const EditFunctionDialog = ({
  funct,
  handleFunctionEdit,
  onClose,
  open,
  setEditFunctionDialogOpen,
  cqlBuilderLookupsTypes,
  handleApplyFunction,
}: PropTypes) => {
  // a property is passed called argument names that does not seem to work for anything with commas.
  // the following is regex to grab arguments and dataTypes using a matcher and add them to the function to edit.

  const updatedFunction = {
    ...funct,
    fluentFunction: funct?.isFluent === "Yes" ? true : false,
    functionsArguments: funct?.arguments,
    expressionEditorValue: funct?.expressionEditorValue,
  };

  return (
    <MadieDialog
      title="Edit"
      dialogProps={{
        open,
        onClose: onClose,
        fullWidth: true,
        maxWidth: "md",
        "data-testid": "edit-parameter-dialog",
      }}
    >
      <FunctionBuilder
        cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
        canEdit={true}
        handleApplyFunction={handleApplyFunction}
        funct={updatedFunction}
        operation="edit"
        handleFunctionEdit={handleFunctionEdit}
        onClose={onClose}
        setEditFunctionDialogOpen={setEditFunctionDialogOpen}
      />
    </MadieDialog>
  );
};

export default EditFunctionDialog;
