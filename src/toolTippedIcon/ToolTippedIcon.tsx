import React from "react";
import { IconButton, Tooltip } from "@mui/material";

export default function ToolTippedIcon({
  tooltipMessage,
  buttonProps,
  children,
}: {
  tooltipMessage: string;
  buttonProps?: { [key: string]: any };
  children: any;
}) {
  return (
    <Tooltip title={tooltipMessage}>
      <IconButton {...buttonProps}>{children}</IconButton>
    </Tooltip>
  );
}
