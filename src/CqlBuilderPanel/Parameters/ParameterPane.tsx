import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import ExpandingSection from "../../common/ExpandingSection";
import { TextField, Button } from "@madie/madie-design-system/dist/react";
import Editor from "@monaco-editor/react";
import * as Yup from "yup";

const validationSchema = Yup.object({
  parameterName: Yup.string()
    .matches(
      /^[a-zA-Z0-9]*$/,
      "Only alphanumeric characters are allowed, no spaces."
    )
    .required("Parameter Name is required"),
  parameterExpression: Yup.string(),
});

interface ParameterPaneProps {
  handleApplyParameter: Function;
  canEdit: boolean;
}

export default function ParameterPane({
  handleApplyParameter,
  canEdit,
}: ParameterPaneProps) {
  const [editorHeight, setEditorHeight] = useState("100px");
  const [showEditor, setShowEditor] = useState(false);
  const formik = useFormik({
    initialValues: {
      parameterName: "",
      expression: "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const result = handleApplyParameter(values);
      if (result === "success") {
        formik.resetForm();
      }
    },
  });

  const { resetForm } = formik;

  // adjusting the height of the editor based on the inserted text
  useEffect(() => {
    const lineCount = (formik.values.expression || "").split("\n").length;
    const newHeight = Math.max(lineCount * 20, 100) + "px";
    setEditorHeight(newHeight);
  }, [formik.values.expression]);

  return (
    <>
      <div className="row">
        <TextField
          label="Parameter Name"
          id="parameter-name"
          required
          disabled={!canEdit}
          {...formik.getFieldProps("parameterName")}
          onChange={(e) => {
            if (!formik.values.parameterName) {
              setShowEditor(true);
            }
            formik.setFieldValue("parameterName", e.target.value);
          }}
          helperText={formik.errors["parameterName"]}
          error={Boolean(formik.errors.parameterName)}
        />
        <div className="spacer" />
      </div>

      <ExpandingSection
        title="Expression Editor"
        showHeaderContent={showEditor}
      >
        <div id="monaco-editor-wrapper">
          <Editor
            language="sql"
            value={formik.values.expression}
            height={editorHeight}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              wordWrap: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              readOnly: !canEdit,
            }}
            onChange={(value: string | undefined) => {
              formik.setFieldValue("expression", value || "");
            }}
          />
        </div>
      </ExpandingSection>
      <div className="form-actions">
        <Button
          variant="outline"
          data-testid="clear-parameter-btn"
          tw="mr-4"
          disabled={!formik.dirty || !formik.isValid}
          onClick={resetForm}
        >
          Clear
        </Button>
        <Button
          data-testId="apply-parameter-btn"
          disabled={!formik.dirty || !formik.isValid}
          onClick={formik.handleSubmit}
        >
          Apply
        </Button>
      </div>
    </>
  );
}
