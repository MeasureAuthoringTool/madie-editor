import React, { useState } from "react";
import "twin.macro";
import "styled-components/macro";
import { useFormik, FormikProvider } from "formik";
import { Button, TextField } from "@madie/madie-design-system/dist/react";
import "./Parameters.scss";
import { ParameterSchemaValidator } from "../../validations/ParameterSchemaValidator";
import MonacoCqlEditor, {
  MonacoParseResult,
} from "../../editor/MonacoCqlEditor";

export interface Parameter {
  parameterName?: string;
  expression?: string;
}

export interface ParameterProps {
  canEdit: boolean;
  handleParameterEdit?: Function;
  parameter?: Parameter;
  onClose?: Function;
  setOpenParameterDialog?: Function;
}

const emptyParseResult: MonacoParseResult = { annotations: [], markers: [] };

export default function ParameterBuilder({
  canEdit,
  handleParameterEdit,
  onClose,
  parameter,
  setOpenParameterDialog,
}: ParameterProps) {
  const [editorHeight] = useState("180px");

  const formik = useFormik({
    initialValues: {
      parameterName: parameter?.parameterName || "",
      expression: parameter?.expression || "",
    },
    validationSchema: ParameterSchemaValidator,
    enableReinitialize: true,
    onSubmit: (values) => {},
  });
  const { resetForm } = formik;

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
          <div id="parameter-editor-wrapper">
            <MonacoCqlEditor
              value={formik.values.expression}
              height={editorHeight}
              readOnly={!canEdit}
              onChange={(value: string | undefined) => {
                formik.setFieldValue("expression", value || "");
              }}
              parseValue={() => emptyParseResult}
            />
          </div>
        </FormikProvider>
        <div style={{ marginTop: "24px" }}>
          <div className="form-actions">
            <Button
              variant="outline"
              data-testid="parameter-cancel-btn"
              disabled={!formik.dirty || !canEdit}
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
              disabled={!formik.dirty || !canEdit}
              onClick={() => {
                const parameterToApply: Parameter = {
                  parameterName: formik.values.parameterName,
                  expression: formik.values.expression,
                };
                resetForm();
                handleParameterEdit(parameter, parameterToApply);
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
