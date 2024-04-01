import React from "react";
import TerminologySection from "../../../../common/TerminologySection";

export default function ResultsSection({
  showResultsTable,
  setShowResultsTable,
}) {
  return (
    <div style={{ marginTop: "30px" }}>
      <TerminologySection
        title="Results"
        showHeaderContent={showResultsTable}
        setShowHeaderContent={setShowResultsTable}
      />
    </div>
  );
}
