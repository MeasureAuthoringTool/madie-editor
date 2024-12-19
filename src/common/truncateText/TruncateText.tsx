import { IconButton } from "@mui/material";
import React, { useState } from "react";

const TruncateText = ({ text, maxLength = 120, dataTestId }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text || text.trim() === "") {
    return null;
  }

  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  const displayedText = isExpanded ? text : text.slice(0, maxLength);

  return (
    <div data-testid={`${dataTestId}-content`}>
      <span>{displayedText}</span>
      {text.length > maxLength && (
        <IconButton
          onClick={toggleExpanded}
          data-testid={`${dataTestId}-toggle-button`}
          color={"primary"}
          sx={{
            marginLeft: "3px",
            padding: "0",
            cursor: "pointer",
            textDecoration: "underline",
            fontSize: "0.8rem",
          }}
        >
          {isExpanded ? "Show less" : "Show more"}
        </IconButton>
      )}
    </div>
  );
};

export default TruncateText;
