import React from "react";
import { Stack } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import CodeOffOutlinedIcon from "@mui/icons-material/CodeOffOutlined";
import ToolTippedIcon from "../../../toolTippedIcon/ToolTippedIcon";

interface PropTypes {
  id: number;
  canEdit: boolean;
  showDeleteAction: boolean;
  onEdit: (id: number, readOnly: boolean) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}

const IncludeResultActions = ({
  id,
  canEdit,
  showDeleteAction,
  onEdit,
  onDelete,
  onView,
}: PropTypes) => {
  return (
    <Stack direction="row" alignItems="center">
      {canEdit && (
        <>
          {showDeleteAction && (
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
          )}
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
    </Stack>
  );
};

export default IncludeResultActions;
