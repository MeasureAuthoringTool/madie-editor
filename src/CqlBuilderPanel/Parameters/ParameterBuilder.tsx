import React, { useState, useRef } from "react";
import "twin.macro";
import "styled-components/macro";
import { useFormik, FormikProvider } from "formik";
import { Button, TextField } from "@madie/madie-design-system/dist/react";
import "./Parameters.scss";
import { ParameterSchemaValidator } from "../../validations/ParameterSchemaValidator";
import AceEditor from "react-ace";

export interface Parameter {
  parameterName?: string;
  expressionValue?: string;
}

export interface ParameterProps {
  canEdit: boolean;
  handleParameterEdit?: Function;
  parameter?: Parameter;
  onClose?: Function;
  setOpenParameterDialog?: Function;
}

export default function ParameterBuilder({
  canEdit,
  handleParameterEdit,
  onClose,
  parameter,
  setOpenParameterDialog,
}: ParameterProps) {
  const [editorHeight, setEditorHeight] = useState("50px");
  const textAreaRef = useRef(null);
  const [expressionEditorValue, setExpressionEditorValue] = useState(
    parameter?.expressionValue || ""
  );

  const formik = useFormik({
    initialValues: {
      parameterName: parameter?.parameterName || "",
      expression: parameter?.expressionValue || "",
    },
    validationSchema: ParameterSchemaValidator,
    enableReinitialize: true,
    onSubmit: (values) => {},
  });
  const { resetForm } = formik;

  const isEditDialogFormDirty = () => {
    if (parameter?.expressionValue !== expressionEditorValue || formik.dirty) {
      return false;
    }
    return true;
  };

  return (
    <div>
      <form id="parameter-form" onSubmit={formik.handleSubmit}>
        <div tw="flex space-x-5">
          <div tw="w-1/2">
            <TextField
              required="required"
              id="parameter-name"
              name="parameterName"
              tw="w-full"
              readOnly={!canEdit}
              disabled={!canEdit}
              label="Paramter Name"
              placeholder=""
              inputProps={{
                "data-testid": "parameter-name-text-input",
              }}
              {...formik.getFieldProps("parameterName")}
              error={Boolean(formik.errors.parameterName)}
              helperText={formik.errors.parameterName}
            />
          </div>
        </div>
        <br />

        <FormikProvider value={formik}>
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
        </FormikProvider>
        <div style={{ marginTop: "24px" }}>
          <div className="form-actions">
            <Button
              variant="outline"
              data-testid="parameter-cancel-btn"
              disabled={
                (!formik.dirty &&
                  expressionEditorValue ===
                    (parameter?.expressionValue || "")) ||
                !canEdit
              }
              tw="mr-4"
              onClick={() => {
                resetForm();
                setOpenParameterDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button
              data-testid={`parameter-save-btn`}
              disabled={
                (!formik.dirty &&
                  expressionEditorValue ===
                    (parameter?.expressionValue || "")) ||
                !canEdit
              }
              onClick={() => {
                const parameterToApply: Parameter = {
                  parameterName: formik.values.parameterName,
                  expressionValue: expressionEditorValue,
                };
                resetForm();
                setExpressionEditorValue("");
                formik.setFieldValue("parameterName", "");
                // call handleParameterEdit
                onClose();
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
