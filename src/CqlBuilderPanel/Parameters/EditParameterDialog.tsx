import React from "react";
import { MadieDialog } from "@madie/madie-design-system/dist/react";
import { Lookup } from "../../model/CqlBuilderLookup";
import ParameterBuilder, { Parameter } from "./ParameterBuilder";

interface PropTypes {
  open: boolean;
  parameter: Lookup;
  handleParameterEdit: Function;
  onClose: () => void;
  setOpenParameterDialog: Function;
}

const EditParameterDialog = ({
  open,
  parameter,
  handleParameterEdit,
  onClose,
  setOpenParameterDialog,
}: PropTypes) => {
  const updatedParameter = {
    parameterName: parameter?.name,
    expressionValue: parameter?.logic,
  } as Parameter;

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
      <ParameterBuilder
        canEdit={true}
        parameter={updatedParameter}
        handleParameterEdit={handleParameterEdit}
        onClose={onClose}
        setOpenParameterDialog={setOpenParameterDialog}
      />
    </MadieDialog>
  );
};

export default EditParameterDialog;
