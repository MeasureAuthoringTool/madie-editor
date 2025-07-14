import React from "react";
import { MadieDialog } from "@madie/madie-design-system";
import DefinitionBuilder, {
  Definition,
} from "../definitionBuilder/DefinitionBuilder";
import { CqlBuilderLookup, Lookup } from "../../../model/CqlBuilderLookup";

interface PropTypes {
  open: boolean;
  definition: Lookup;
  handleDefinitionEdit: Function;
  cqlBuilderLookup: CqlBuilderLookup;
  onClose: () => void;
  canEdit: boolean;
}

const getExpression = (definition: Lookup) => {
  if (definition?.logic) {
    return definition.logic
      .split(/define ["]?(.*)["]?:/)?.[2]
      .replace("\n", "");
  }
  return "";
};

const DefinitionBuilderDialog = ({
  open,
  definition,
  cqlBuilderLookup,
  handleDefinitionEdit,
  onClose,
  canEdit,
}: PropTypes) => {
  const updatedDefinition = {
    definitionName: definition?.name,
    comment: definition?.comment,
    expressionValue: getExpression(definition),
    returnType: definition?.returnType,
  } as Definition;

  return (
    <MadieDialog
      form
      title={canEdit ? "Edit" : "View"}
      dialogProps={{
        open,
        onClose: onClose,
        fullWidth: true,
        maxWidth: "md",
        "data-testid": "edit-definition-dialog",
      }}
    >
      <DefinitionBuilder
        canEdit={canEdit}
        definition={updatedDefinition}
        handleApplyDefinition={() => {}} // do nothing for now
        handleDefinitionEdit={handleDefinitionEdit}
        cqlBuilderLookup={cqlBuilderLookup}
        operation={"edit"}
        onClose={onClose}
      />
    </MadieDialog>
  );
};

export default DefinitionBuilderDialog;
