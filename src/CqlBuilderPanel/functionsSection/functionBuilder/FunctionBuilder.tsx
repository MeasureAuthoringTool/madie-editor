import React, { useState, useRef } from "react";
import "twin.macro";
import "styled-components/macro";
import { useFormik, FormikProvider } from "formik";
import {
  Button,
  TextArea,
  TextField,
} from "@madie/madie-design-system/dist/react";
import "../Functions.scss";
import { FunctionSectionSchemaValidator } from "../../../validations/FunctionSectionSchemaValidator";
import ExpandingSection from "../../../common/ExpandingSection";
import { Checkbox, FormControlLabel } from "@mui/material";
import { Box } from "@mui/system";
import ConfirmationDialog from "../../common/ConfirmationDialog";
import ArgumentSection from "../argumentSection/ArgumentSection";

export interface Funct {
  functionName?: string;
  fluentFunction?: boolean;
  functionsArguments: any;
  comment?: string;
}

export interface FunctionProps {
  canEdit: boolean;
  handleApplyFunction: Function;
  handleFunctionEdit?: Function;
  funct?: Funct;
  onClose?: Function;
}

export default function FunctionBuilder({
  canEdit,
  handleApplyFunction,
  handleFunctionEdit,
  onClose,
  funct,
}: FunctionProps) {
  const [argumentsEditorOpen, setArgumentsEditorOpen] =
    useState<boolean>(false);
  const [expressionEditorOpen, setExpressionEditorOpen] =
    useState<boolean>(false);
  const textAreaRef = useRef(null);
  const [confirmationDialog, setConfirmationDialog] = useState<boolean>(false);

  const formik = useFormik({
    initialValues: {
      functionName: funct?.functionName || "",
      comment: funct?.comment || "",
      fluentFunction: funct?.fluentFunction || true,
      functionsArguments: funct?.functionsArguments || [],
    },
    validationSchema: FunctionSectionSchemaValidator,
    enableReinitialize: true,
    onSubmit: (values) => {},
  });
  const { resetForm } = formik;

  const addArgumentToFunctionsArguments = (fn) => {
    const newArgs = [...formik.values.functionsArguments, fn];
    formik.setFieldValue("functionsArguments", newArgs);
  };

  return (
    <div>
      <form id="function-form" onSubmit={formik.handleSubmit}>
        <div tw="flex space-x-5">
          <div tw="w-1/2">
            <TextField
              required="required"
              id="function-name"
              name="functionName"
              tw="w-full"
              readOnly={!canEdit}
              disabled={!canEdit}
              label="Function Name"
              placeholder=""
              inputProps={{
                "data-testid": "function-name-text-input",
              }}
              error={Boolean(formik.errors.functionName)}
              helperText={formik.errors.functionName}
              {...formik.getFieldProps("functionName")}
            />
          </div>
          <Box sx={{ marginTop: "22px" }}>
            <FormControlLabel
              control={
                <Checkbox
                  {...formik.getFieldProps("fluentFunction")}
                  checked={formik.values.fluentFunction}
                  disabled={!canEdit}
                  name="fluentFunction"
                  id="fluentFunction"
                  data-testid="fluentFunction"
                />
              }
              sx={{ textTransform: "none", color: "#515151" }}
              label="Fluent Function"
            />
          </Box>
        </div>
        <br />
        <TextArea
          id="function-comment"
          tw="w-full"
          label="Comment"
          readOnly={!canEdit}
          disabled={!canEdit}
          placeholder=""
          inputProps={{
            "data-testid": "function-comment-text-input",
          }}
          data-testid="function-comment-text"
          onChange={formik.handleChange}
          value={formik.values.comment}
          name="comment"
          {...formik.getFieldProps("comment")}
        />
        <div style={{ marginTop: "36px" }} />
        <ExpandingSection
          title="Arguments"
          showHeaderContent={argumentsEditorOpen}
        >
          <ArgumentSection
            canEdit={canEdit}
            addArgumentToFunctionsArguments={addArgumentToFunctionsArguments}
            functionArguments={formik.values.functionsArguments}
          />
        </ExpandingSection>

        <div style={{ marginTop: "36px" }} />
        <ExpandingSection
          title="Expression Editor"
          showHeaderContent={expressionEditorOpen}
          children={<></>}
        />
        <div className="form-actions">
          <Button
            id="clear-function-btn"
            variant="outline"
            data-testid="clear-function-btn"
            disabled={!formik.dirty || !canEdit}
            tw="mr-4"
            onClick={() => {
              setConfirmationDialog(true);
            }}
          >
            Clear
          </Button>
          <Button
            data-testid={`function-apply-btn`}
            disabled={!formik.values.functionName || !canEdit || !formik.dirty}
            // tw="ml-4"
            onClick={() => {}}
          >
            Apply
          </Button>
        </div>
        <ConfirmationDialog
          open={confirmationDialog}
          onClose={() => setConfirmationDialog(false)}
          onSubmit={() => {
            resetForm();
            setConfirmationDialog(false);
          }}
        />
      </form>
    </div>
  );
}
