import React, { useState, useEffect } from "react";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import "./TerminologySection.scss";

interface TerminologySectionProps {
  title: string;
  children?: any;
  showHeaderContent?: boolean;
  setShowHeaderContent?: Function;
}

const TerminologySection = (props: TerminologySectionProps) => {
  const {
    title,
    children,
    showHeaderContent = true,
    setShowHeaderContent,
  } = props;
  const [open, setOpen] = useState(showHeaderContent);
  const chevronClass = open ? "chevron-display open" : "chevron-display";
  const growingDivClass = open ? "growing-div open" : "growing-div";

  useEffect(() => {
    setOpen(showHeaderContent);
  }, [showHeaderContent]);

  return (
    <div
      className="terminology-section-tab-heading"
      data-testid={`terminology-section-${props.title}-sub-heading`}
    >
      <div
        onClick={() => {
          setOpen(!open);
          if (setShowHeaderContent) {
            setShowHeaderContent(!showHeaderContent);
          }
        }}
        tabIndex={0}
        role="button"
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            setOpen(!open);
            if (setShowHeaderContent) {
              setShowHeaderContent(!showHeaderContent);
            }
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
