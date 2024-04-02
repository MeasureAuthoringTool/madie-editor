import React, { useState, useEffect } from "react";
import CodeSection from "./CodeSection";
import ResultsSection from "./ResultsSection";
import "./CodeSubSection.scss";

export default function CodeSubSection({ canEdit, allCodeSystems }) {
  const [showResultsTable, setShowResultsTable] = useState(false);
  const handleFormSubmit = (values) => {
    setShowResultsTable(true);
  };

  return (
    <>
      <CodeSection
        handleFormSubmit={handleFormSubmit}
        allCodeSystems={allCodeSystems}
        canEdit={canEdit}
      />
      <ResultsSection
        showResultsTable={showResultsTable}
        setShowResultsTable={setShowResultsTable}
      />
    </>
  );
}
