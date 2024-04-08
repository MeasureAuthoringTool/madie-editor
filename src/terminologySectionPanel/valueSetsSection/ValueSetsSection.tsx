import React from "react";
import TerminologySection from "../../common/TerminologySection";
export default function ValueSetsSection() {
  return (
    <div>
      <TerminologySection title="Search" showHeaderContent={true} />
      <TerminologySection title="Filter" showHeaderContent={false} />
      <TerminologySection title="Results" showHeaderContent={false} />
    </div>
  );
}
