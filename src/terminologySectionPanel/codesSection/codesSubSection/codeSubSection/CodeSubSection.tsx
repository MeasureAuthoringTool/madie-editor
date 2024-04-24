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
  handleChange: string;
}

export default function CodeSubSection({
  canEdit,
  allCodeSystems,
  handleChange,
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
    if (values && values.code && values.title && values.version) {
      terminologyService
        .getCodeDetails(values.code, values.title, values.version)
        .then((response) => {
          setCode(response.data);
        })
        .catch((error) => {
          if (error.response?.status === 404) {
            setCode(undefined);
          } else {
            console.error(error);
            setToastMessage(
              "An issue occurred while retrieving the code from VSAC. Please try again. If the issue continues, please contact helpdesk."
            );
            setToastOpen(true);
          }
        })
        .finally(() => setShowResultsTable(true));
    }
  };

  const blankResults = () => {
    setShowResultsTable(false);
    setCode(undefined);
  };

  return (
    <>
      <CodeSection
        handleFormSubmit={handleFormSubmit}
        allCodeSystems={allCodeSystems}
        canEdit={canEdit}
        blankResults={blankResults}
      />
      <ResultsSection
        showResultsTable={showResultsTable}
        setShowResultsTable={setShowResultsTable}
        code={code}
        handleChange={handleChange}
      />
      <Toast
        toastKey="fetch-code-toast"
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
