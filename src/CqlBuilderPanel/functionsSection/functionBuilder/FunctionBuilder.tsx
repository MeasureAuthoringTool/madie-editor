import React, { useState, useRef } from "react";
import "twin.macro";
import "styled-components/macro";
import { useFormik, FormikProvider } from "formik";
import {
  Button,
  TextArea,
  TextField,
  Toast,
} from "@madie/madie-design-system/dist/react";
import "../Functions.scss";
import { FunctionSectionSchemaValidator } from "../../../validations/FunctionSectionSchemaValidator";
import ExpandingSection from "../../../common/ExpandingSection";
import { Checkbox, FormControlLabel } from "@mui/material";
import { Box } from "@mui/system";
import ConfirmationDialog from "../../common/ConfirmationDialog";
import ArgumentSection from "../argumentSection/ArgumentSection";
import ExpressionEditor from "../../definitionsSection/expressionSection/ExpressionEditor";
import { getNewExpressionsAndLines } from "../../common/utils";
import { CqlBuilderLookup } from "../../../model/CqlBuilderLookup";
import UseToast from "../../../common/UseToast";

export interface Funct {
  name?: string;
  fluentFunction?: boolean;
  functionsArguments: any;
  comment?: string;
  expressionEditorValue?: string;
  logic?: string;
}

export interface FunctionProps {
  cqlBuilderLookupsTypes: CqlBuilderLookup;
  canEdit: boolean;
  handleApplyFunction: Function;
  handleFunctionEdit?: Function;
  funct?: Funct;
  onClose?: Function;
  operation?: string;
  setEditFunctionDialogOpen?: Function;
}

export default function FunctionBuilder({
  canEdit,
  handleApplyFunction,
  handleFunctionEdit,
  onClose,
  funct,
  cqlBuilderLookupsTypes,
  operation,
}: FunctionProps) {
  const [argumentsEditorOpen, setArgumentsEditorOpen] =
    useState<boolean>(false);
  const [expressionEditorOpen, setExpressionEditorOpen] =
    useState<boolean>(false);
  const textAreaRef = useRef(null);
  const [confirmationDialog, setConfirmationDialog] = useState<boolean>(false);
  const [cursorPosition, setCursorPosition] = useState(null);
  const [autoInsert, setAutoInsert] = useState(false);

  const formik = useFormik({
    initialValues: {
      functionName: funct?.name || "",
      comment: funct?.comment || "",
      fluentFunction: funct?.name ? funct?.fluentFunction : true,
      functionsArguments: funct?.functionsArguments || [],
      expressionEditorValue: funct?.expressionEditorValue || "",
      type: "",
      name: "",
    },
    validationSchema: FunctionSectionSchemaValidator,
    enableReinitialize: true,
    onSubmit: (values) => {
      const newValues = getNewExpressionsAndLines(
        values,
        cursorPosition,
        formik.values.expressionEditorValue,
        autoInsert
      );
      updateExpressionAndLines(newValues[0], newValues[1]);
    },
  });
  // going to pass dirty down to know when we need to reset sub form
  const { resetForm, dirty } = formik;
  // toast utilities
  const {
    toastOpen,
    setToastOpen,
    toastMessage,
    setToastMessage,
    toastType,
    setToastType,
    onToastClose,
  } = UseToast();
  // update formik, and expressionEditor, cursor, lines
  const updateExpressionAndLines = (
    newEditorExpressionValue,
    newCursorPosition
  ) => {
    formik.setFieldValue("expressionEditorValue", newEditorExpressionValue);
    formik.setFieldValue("type", "");
    formik.setFieldValue("name", "");

    textAreaRef.current.editor.setValue(newEditorExpressionValue, 1);
    textAreaRef.current.editor.moveCursorTo(
      newCursorPosition.row,
      newCursorPosition.column
    );
    textAreaRef.current.editor.clearSelection();
    setAutoInsert(true);
    setCursorPosition(null);
  };

  const addArgumentToFunctionsArguments = (fn) => {
    const newArgs = [...formik.values.functionsArguments, fn];
    formik.setFieldValue("functionsArguments", newArgs);
    setToastMessage(
      `Argument ${fn.argumentName} has been successfully added to the function.`
    );
    setToastType("success");
    setToastOpen(true);
  };

  const deleteArgumentFromFunctionArguments = (fn) => {
    const newArgs = formik.values.functionsArguments.filter(
      (argument) =>
        argument?.argumentName !== fn.argumentName ||
        argument?.dataType !== fn.dataType
    );
    formik.setFieldValue("functionsArguments", newArgs);
  };

  const validateQuotesForFunctionArguments = (argument) => {
    if (argument.startsWith('"') && argument.endsWith("'")) {
      return argument;
    }
    return `"${argument}"`;
  };

  const getFunctionArguments = (args) => {
    let argStr = "";
    args?.forEach((arg) => {
      argStr +=
        validateQuotesForFunctionArguments(
          arg.argumentName.replace(/^"|"$/g, "")
        ) +
        " " +
        validateQuotesForFunctionArguments(arg.dataType.replace(/^"|"$/g, "")) +
        ", ";
    });
    argStr = argStr.substring(0, argStr.length - 2);
    return argStr;
  };
  const getEditedFunction = (): string => {
    let logic = "";
    if (formik.values.comment) {
      logic += "/*\n" + formik.values.comment.replace(/\s+/g, " ") + "\n*/\n";
    }
    logic += "define ";
    if (formik.values.fluentFunction) {
      logic += "fluent ";
    }
    logic += "function ";
    logic += '"' + formik.values.functionName.replace(/\s+/g, " ") + '"' + " ";
    logic +=
      "(" + getFunctionArguments(formik.values.functionsArguments) + "):\n";
    logic += "  " + formik.values.expressionEditorValue;
    return logic;
  };

  const validateArguments = (functionArguments) => {
    return !functionArguments.some(
      (argument) => argument.argumentName && argument.dataType
    );
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
              onChange={(e) => {
                formik.handleChange(e);
                if (e.target.value && !expressionEditorOpen) {
                  setExpressionEditorOpen(true);
                }
                if (e.target.value && !argumentsEditorOpen) {
                  setArgumentsEditorOpen(true);
                }
              }}
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
          {/* functional input fields */}
          <ArgumentSection
            canEdit={canEdit}
            addArgumentToFunctionsArguments={addArgumentToFunctionsArguments}
            deleteArgumentFromFunctionArguments={
              deleteArgumentFromFunctionArguments
            }
            dirty={dirty}
            functionArguments={formik.values.functionsArguments}
            isFluentFunction={formik.values.fluentFunction}
          />
        </ExpandingSection>

        <div style={{ marginTop: "36px" }} />
        <FormikProvider value={formik}>
          <ExpressionEditor
            canEdit={canEdit}
            expressionEditorOpen={expressionEditorOpen}
            cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
            textAreaRef={textAreaRef}
            expressionEditorValue={formik.values.expressionEditorValue}
            setExpressionEditorValue={(v) => {
              formik.setFieldValue("expressionEditorValue", v);
            }}
            setCursorPosition={setCursorPosition}
            setAutoInsert={setAutoInsert}
          />
        </FormikProvider>
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
            disabled={
              !formik.values.functionName ||
              !formik.values.expressionEditorValue ||
              (formik.values.fluentFunction &&
                validateArguments(formik.values.functionsArguments)) ||
              !canEdit ||
              !formik.dirty
            }
            onClick={
              operation === "edit"
                ? () => {
                    const functionToEdit = {
                      functionName: funct.name?.trim().replace(/\s+/g, " "),
                      comment: funct.comment?.trim().replace(/\s+/g, " "),
                      functionsArguments: funct.functionsArguments,
                      fluentFunction: funct.fluentFunction,
                      expressionValue: funct.expressionEditorValue,
                      expression: funct.logic,
                    };
                    const newLogic = getEditedFunction();
                    resetForm();
                    handleFunctionEdit(functionToEdit, newLogic);
                  }
                : () => {
                    const functionToApply = {
                      functionName: formik.values.functionName
                        ?.trim()
                        .replace(/\s+/g, " "),
                      comment: formik.values.comment
                        ?.trim()
                        .replace(/\s+/g, " "),
                      functionsArguments: formik.values.functionsArguments,
                      fluentFunction: formik.values.fluentFunction,
                      expressionValue: formik.values.expressionEditorValue,
                    };
                    resetForm();
                    handleApplyFunction(functionToApply);
                  }
            }
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
      <Toast
        toastKey="function-builder-toast"
        toastType={toastType}
        testId={
          toastType === "danger"
            ? `function-builder-error`
            : `function-builder-success`
        }
        open={toastOpen}
        message={toastMessage}
        onClose={onToastClose}
        autoHideDuration={6000}
        closeButtonProps={{
          "data-testid": "function-builder-toast-close-button",
        }}
      />
    </div>
  );
}
