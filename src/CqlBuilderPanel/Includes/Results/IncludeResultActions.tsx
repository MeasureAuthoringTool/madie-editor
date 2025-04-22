import React from "react";
import { Stack } from "@mui/material";
import { Button } from "@madie/madie-design-system/dist/react";

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
            <Button
              variant="outline"
              data-testid={`delete-button-${id}`}
              disabled={false}
              tw="mr-4"
              onClick={() => {
                onDelete(id);
              }}
            >
              Delete
            </Button>
          )}
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
        </>
      )}
    </Stack>
  );
};

export default IncludeResultActions;
