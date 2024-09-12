import React from "react";
import { MadieDialog } from "@madie/madie-design-system/dist/react";
import DefinitionBuilder, {
  Definition,
} from "../definitionBuilder/DefinitionBuilder";
import { CqlBuilderLookup, Lookup } from "../../../model/CqlBuilderLookup";

interface PropTypes {
  open: boolean;
  definition: Lookup;
  cqlBuilderLookup: CqlBuilderLookup;
  onClose: () => void;
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
  onClose,
}: PropTypes) => {
  const updatedDefinition = {
    definitionName: definition?.name,
    expressionValue: getExpression(definition),
  } as Definition;

  return (
    <MadieDialog
      title="Edit"
      dialogProps={{
        open,
        onClose: onClose,
        fullWidth: true,
        maxWidth: "md",
        "data-testid": "edit-definition-dialog",
      }}
    >
      <DefinitionBuilder
        canEdit={true}
        definition={updatedDefinition}
        handleApplyDefinition={() => {}} // do nothing for now
        cqlBuilderLookup={cqlBuilderLookup}
      />
    </MadieDialog>
  );
};

export default DefinitionBuilderDialog;
