import React from "react";
import { MadieDialog } from "@madie/madie-design-system/dist/react";
import DefinitionBuilder, {
  Definition,
} from "../definitionBuilder/DefinitionBuilder";
import { CqlBuilderLookupData } from "../../../model/CqlBuilderLookup";

interface PropTypes {
  open: boolean;
  definition: Definition;
  cqlBuilderLookupsTypes: CqlBuilderLookupData;
  onClose: () => void;
}

const DefinitionBuilderDialog = ({
  open,
  definition,
  cqlBuilderLookupsTypes,
  onClose,
}: PropTypes) => {
  return (
    <MadieDialog
      title="Edit"
      dialogProps={{
        open,
        onClose: onClose,
        fullWidth: true,
        maxWidth: "md",
        "data-testid": "view-details-dialog",
      }}
    >
      <DefinitionBuilder
        canEdit={true}
        definition={definition}
        handleApplyDefinition={() => {}} // do nothing for now
        cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
      />
    </MadieDialog>
  );
};

export default DefinitionBuilderDialog;
