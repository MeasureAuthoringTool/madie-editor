import React from "react";
import { Stack } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import CodeOffOutlinedIcon from "@mui/icons-material/CodeOffOutlined";
import ToolTippedIcon from "../../../toolTippedIcon/ToolTippedIcon";
import { Button } from "@madie/madie-design-system";

interface PropTypes {
  id: number;
  canEdit: boolean;
  showDeleteAction: boolean;
  onEdit: (id: number, readOnly: boolean) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
  operation: string;
}

const IncludeResultActions = ({
  id,
  canEdit,
  showDeleteAction,
  onEdit,
  onDelete,
  onView,
  operation,
}: PropTypes) => {
  return (
    <Stack direction="row" alignItems="center">
      {showDeleteAction && canEdit && (
        <>
          <ToolTippedIcon
            tooltipMessage="Delete"
            buttonProps={{
              "data-testid": `delete-button-${id}`,
              "aria-label": `delete-button-${id}`,
              size: "small",
              onClick: () => onDelete(id),
            }}
          >
            <DeleteOutlineIcon color="error" />
          </ToolTippedIcon>
          <ToolTippedIcon
            tooltipMessage="Edit"
            buttonProps={{
              "data-testid": `edit-button-${id}`,
              "aria-label": `edit-button-${id}`,
              size: "small",
              onClick: () => onEdit(id, true),
            }}
          >
            <BorderColorOutlinedIcon color="primary" />
          </ToolTippedIcon>
        </>
      )}
      {operation === "edit" && !canEdit && (
        <ToolTippedIcon
          tooltipMessage="View"
          buttonProps={{
            "data-testid": `view-button-${id}`,
            "aria-label": `view-button-${id}`,
            size: "small",
            onClick: () => onView(id),
          }}
        >
          <CodeOffOutlinedIcon color="primary" />
        </ToolTippedIcon>
      )}
      {!showDeleteAction && (
        <Button
          variant="outline"
          data-testid={`edit-button-${id}`}
          disabled={false}
          tw="mr-4"
          onClick={() => {
            onEdit(id, canEdit);
          }}
        >
          View / Apply
        </Button>
      )}
    </Stack>
  );
};

export default IncludeResultActions;
