import React from "react";
import { IconButton, Tooltip } from "@mui/material";

export default function ToolTippedIcon({
  tooltipMessage,
  children,
}: {
  tooltipMessage: string;
  children: any;
}) {
  return (
    <Tooltip title={tooltipMessage}>
      <IconButton>{children}</IconButton>
    </Tooltip>
  );
}
