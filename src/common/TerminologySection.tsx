import React, { useState } from "react";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import "./TerminologySection.scss";

interface TerminologySectionProps {
  title: string;
  children?: any;
}

const TerminologySection = (props: TerminologySectionProps) => {
  const { title, children } = props;
  const [open, setOpen] = useState(true);
  const chevronClass = open ? "chevron-display open" : "chevron-display";
  const growingDivClass = open ? "growing-div open" : "growing-div";

  return (
    <div
      className="terminology-section-tab-heading"
      data-testid={`terminology-section-${props.title}-sub-heading`}
    >
      <div
        onClick={() => {
          setOpen(!open);
        }}
        tabIndex={0}
        role="button"
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            setOpen(!open);
          }
        }}
        className="heading-row"
      >
        <h4 className="header">{props.title}</h4>
        <ChevronRightIcon className={chevronClass} />
      </div>

      <div className={growingDivClass}>
        {open && (
          <div data-testid={`terminology-section-sub-header-content-${title}`}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminologySection;
