import React, { useState, useRef, useEffect } from "react";
import { useFormik } from "formik";
import ExpandingSection from "../../common/ExpandingSection";
import { TextField, Button } from "@madie/madie-design-system/dist/react";
import AceEditor from "react-ace";
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

export default function ParameterPane({ handleApplyParameter }) {
  const textAreaRef = useRef(null);
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
    if (textAreaRef.current) {
      const lineCount = textAreaRef.current.editor.session.getLength();
      const newHeight = Math.max(lineCount * 20, 100) + "px";
      setEditorHeight(newHeight);
    }
  }, [formik.values.expression]);
  return (
    <>
      <div className="row">
        <TextField
          label="Parameter Name"
          id="parameter-name"
          required
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
        <AceEditor
          mode="sql"
          ref={textAreaRef}
          theme="monokai"
          value={formik.values.expression}
          onChange={(value) => {
            formik.setFieldValue("expression", value);
          }}
          onLoad={(aceEditor) => {
            // On load we want to tell the ace editor that it's inside of a scrollabel page
            aceEditor.setOption("autoScrollEditorIntoView", true);
          }}
          width="100%"
          height={editorHeight}
          wrapEnabled={true}
          readOnly={false}
          name="ace-editor-wrapper"
          enableBasicAutocompletion={true}
          //@ts-ignore
        />
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
