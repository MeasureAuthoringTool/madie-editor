import _styled, {
  default as _styled2,
  default as _styled3,
  default as _styled4,
} from "styled-components";
import React, { useState } from "react";
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
const emptyParseResult: MonacoParseResult = {
  annotations: [],
  markers: [],
};
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
        <_StyledDiv>
          <_StyledDiv2>
            <_StyledTextField
              required="required"
              id="parameter-name"
              name="parameterName"
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
          </_StyledDiv2>
        </_StyledDiv>
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
        <div
          style={{
            marginTop: "24px",
          }}
        >
          <div className="form-actions">
            <_StyledButton
              variant="outline"
              data-testid="parameter-cancel-btn"
              disabled={!formik.dirty || !canEdit}
              onClick={() => {
                resetForm();
                setOpenParameterDialog(false);
              }}
            >
              Cancel
            </_StyledButton>
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
var _StyledDiv = _styled("div").withConfig({
  displayName: "ParameterBuilder___StyledDiv",
  componentId: "sc-dc3gsp-0",
})({
  display: "flex",
  "> :not([hidden]) ~ :not([hidden])": {
    "--tw-space-x-reverse": "0",
    marginRight: "calc(1.25rem * var(--tw-space-x-reverse))",
    marginLeft: "calc(1.25rem * calc(1 - var(--tw-space-x-reverse)))",
  },
});
var _StyledDiv2 = _styled2("div").withConfig({
  displayName: "ParameterBuilder___StyledDiv2",
  componentId: "sc-dc3gsp-1",
})({
  width: "50%",
});
var _StyledTextField = _styled3(TextField).withConfig({
  displayName: "ParameterBuilder___StyledTextField",
  componentId: "sc-dc3gsp-2",
})({
  width: "100%",
});
var _StyledButton = _styled4(Button).withConfig({
  displayName: "ParameterBuilder___StyledButton",
  componentId: "sc-dc3gsp-3",
})({
  marginRight: "1rem",
});
