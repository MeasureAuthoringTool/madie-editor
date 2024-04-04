import React, { useState } from "react";
import CodeSection from "./CodeSection";
import ResultsSection from "./ResultsSection";
import { CodeSystem } from "../../../../api/useTerminologyServiceApi";
import "./CodeSubSection.scss";

interface CodeSectionProps {
  canEdit: boolean;
  allCodeSystems: CodeSystem[];
}

export default function CodeSubSection({
  canEdit,
  allCodeSystems,
}: CodeSectionProps) {
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
