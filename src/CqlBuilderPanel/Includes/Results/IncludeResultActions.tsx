import React from "react";
import { IconButton, Stack } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import CodeOffOutlinedIcon from "@mui/icons-material/CodeOffOutlined";

interface PropTypes {
  id: number;
  canEdit: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}

const IncludeResultActions = ({
  id,
  canEdit,
  onEdit,
  onDelete,
  onView,
}: PropTypes) => {
  return (
    <Stack direction="row" alignItems="center">
      {canEdit && (
        <>
          <IconButton
            data-testid={`delete-btn-${id}`}
            aria-label={`delete-btn-${id}`}
            size="small"
            onClick={() => onDelete(id)}
          >
            <DeleteOutlineIcon color="error" />
          </IconButton>
          <IconButton
            data-testid={`edit-btn-${id}`}
            aria-label={`edit-btn-${id}`}
            size="small"
            onClick={() => onEdit(id)}
          >
            <BorderColorOutlinedIcon color="primary" />
          </IconButton>
        </>
      )}
      <IconButton
        data-testid={`view-btn-${id}`}
        aria-label={`view-btn-${id}`}
        size="small"
        onClick={() => onView(id)}
      >
        <CodeOffOutlinedIcon color="primary" />
      </IconButton>
    </Stack>
  );
};

export default IncludeResultActions;
