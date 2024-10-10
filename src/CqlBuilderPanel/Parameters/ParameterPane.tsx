import React, { useState, useRef, useEffect } from "react";
import { useFormik } from "formik";
import ExpandingSection from "../../common/ExpandingSection";
import { TextField, Button } from "@madie/madie-design-system/dist/react";
import AceEditor from "react-ace";

export default function ParameterPane() {
  const textAreaRef = useRef(null);
  const [editorHeight, setEditorHeight] = useState("100px");
  const [showEditor, setShowEditor] = useState(false);
  const formik = useFormik({
    initialValues: {
      parameterName: "",
      expressionEditorValue: "",
    },
    enableReinitialize: true,
    onSubmit: (values) => {},
  });
  const { resetForm } = formik;
  // adjusting the height of the editor based on the inserted text
  useEffect(() => {
    if (textAreaRef.current) {
      const lineCount = textAreaRef.current.editor.session.getLength();
      const newHeight = Math.max(lineCount * 20, 100) + "px";
      setEditorHeight(newHeight);
    }
  }, [formik.values.expressionEditorValue]);
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
          value={formik.values.expressionEditorValue}
          onChange={(value) => {
            formik.setFieldValue("expressionEditorValue", value);
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
        />
      </ExpandingSection>
      <div className="form-actions">
        <Button
          variant="outline"
          data-testid="clear-parameter-btn"
          tw="mr-4"
          disabled={!formik.values.parameterName}
          onClick={resetForm}
        >
          Clear
        </Button>
        <Button
          data-testId="apply-parameter"
          disabled={!formik.values.parameterName}
        >
          Apply
        </Button>
      </div>
    </>
  );
}
