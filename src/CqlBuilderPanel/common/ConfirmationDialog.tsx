import React from "react";
import { MadieDialog } from "@madie/madie-design-system/dist/react";
import ErrorIcon from "@mui/icons-material/Error";

const ConfirmationDialog = ({ open, onClose, onSubmit }) => {
  return (
    <MadieDialog
      title="Are you sure?"
      dialogProps={{
        onClose,
        open,
      }}
      cancelButtonProps={{
        variant: "secondary",
        cancelText: "Cancel",
        "data-testid": "confirmation-cancel-button",
      }}
      continueButtonProps={{
        variant: "cyan",
        type: "submit",
        "data-testid": "confirmation-clear-button",
        continueText: "Clear",
        onClick: onSubmit,
      }}
    >
      <div id="discard-changes-dialog-body">
        <section className="dialog-warning-body">
          <p>You are about to clear this function, including all arguments.</p>
        </section>
        <section className="dialog-warning-action">
          <ErrorIcon />
          <p>This action cannot be undone!</p>
        </section>
      </div>
    </MadieDialog>
  );
};

export default ConfirmationDialog;
