import React, { useState } from "react";
import CodeSection from "./CodeSection";
import ResultsSection from "./ResultsSection";
import useTerminologyServiceApi, {
  Code,
  CodeSystem,
} from "../../../../api/useTerminologyServiceApi";
import "./CodeSubSection.scss";
import { Toast } from "@madie/madie-design-system/dist/react";

interface CodeSectionProps {
  canEdit: boolean;
  allCodeSystems: CodeSystem[];
}

export default function CodeSubSection({
  canEdit,
  allCodeSystems,
}: CodeSectionProps) {
  const [code, setCode] = useState<Code>();
  const [showResultsTable, setShowResultsTable] = useState(false);
  // toast utilities
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const onToastClose = () => {
    setToastMessage("");
    setToastOpen(false);
  };

  const handleFormSubmit = async (values) => {
    // eslint-disable-next-line
    const terminologyService = await useTerminologyServiceApi();
    if (values && values.code && values.codeSystemName && values.version) {
      try {
        const code = await terminologyService.getCodeDetails(
          values.code,
          values.codeSystemName,
          values.version
        );
        setCode(code);
      } catch (error) {
        setCode(undefined);
        setToastMessage(error.message);
        setToastOpen(error.message);
      }
      setShowResultsTable(true);
    }
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
        code={code}
      />
      <Toast
        toastKey="library-cql-editor-toast"
        toastType={"danger"}
        testId="fetch-code-error-message"
        open={toastOpen}
        message={toastMessage}
        onClose={onToastClose}
        autoHideDuration={8000}
      />
    </>
  );
}
