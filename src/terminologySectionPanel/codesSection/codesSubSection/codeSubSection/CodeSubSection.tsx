import React, { useState } from "react";
import CodeSection from "./CodeSection";
import ResultsSection from "./ResultsSection";
import { useFormik } from "formik";
import "./CodeSubSection.scss";
import { CodeSubSectionSchemaValidator } from "../../../../validations/CodeSubSectionSchemaValidator";

export default function CodeSubSection() {
  const [showResultsTable, setShowResultsTable] = useState(false);

  const formik = useFormik({
    initialValues: {
      codeSystem: "",
      codeSystemVersion: "",
      code: "",
    },
    validationSchema: CodeSubSectionSchemaValidator,
    onSubmit: (values) => {
      handleSubmit();
    },
  });

  const handleSubmit = () => {
    setShowResultsTable(true);
  };
  return (
    <>
      <CodeSection formik={formik} />
      <ResultsSection />
    </>
  );
}
