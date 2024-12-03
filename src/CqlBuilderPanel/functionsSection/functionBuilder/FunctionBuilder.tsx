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
import ExpressionEditor from "../../definitionsSection/expressionSection/ExpressionEditor";
import { formatExpressionName } from "../../definitionsSection/definitionBuilder/DefinitionBuilder";
import { CqlBuilderLookup } from "../../../model/CqlBuilderLookup";

export interface Funct {
  functionName?: string;
  fluentFunction?: boolean;
  functionsArguments: any;
  comment?: string;
}

export interface FunctionProps {
  cqlBuilderLookupsTypes: CqlBuilderLookup;
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
  cqlBuilderLookupsTypes,
}: FunctionProps) {
  const [argumentsEditorOpen, setArgumentsEditorOpen] =
    useState<boolean>(false);
  const [expressionEditorOpen, setExpressionEditorOpen] =
    useState<boolean>(false);
  const textAreaRef = useRef(null);
  const [confirmationDialog, setConfirmationDialog] = useState<boolean>(false);

  const [expressionEditorValue, setExpressionEditorValue] = useState("");
  const [cursorPosition, setCursorPosition] = useState(null);
  const [autoInsert, setAutoInsert] = useState(false);
  const formik = useFormik({
    initialValues: {
      functionName: funct?.functionName || "",
      comment: funct?.comment || "",
      fluentFunction: funct?.fluentFunction || true,
      functionsArguments: funct?.functionsArguments || [],
      type: "",
      name: "",
    },
    validationSchema: FunctionSectionSchemaValidator,
    enableReinitialize: true,
    onSubmit: (values) => {
      handleExpressionEditorInsert(values);
    },
  });
  const { resetForm } = formik;
  const handleExpressionEditorInsert = (values) => {
    const formattedExpression = formatExpressionName(values);
    let editorExpressionValue = expressionEditorValue;
    let newCursorPosition = cursorPosition;

    if (cursorPosition && !autoInsert) {
      // Insert at cursor position
      const { row, column } = cursorPosition;
      const lines = expressionEditorValue.split("\n");
      const currentLine = lines[row];
      lines[row] =
        currentLine.slice(0, column) +
        formattedExpression +
        currentLine.slice(column);
      editorExpressionValue = lines.join("\n");
      newCursorPosition = {
        row,
        column: column + formattedExpression.length,
      } as unknown;
    } else {
      // Append to a new line
      const lines = editorExpressionValue.split("\n");
      const newLineIndex = lines.length;
      editorExpressionValue +=
        (editorExpressionValue ? "\n" : "") + formattedExpression;
      newCursorPosition = {
        row: newLineIndex,
        column: formattedExpression.length,
      };
    }

    setExpressionEditorValue(editorExpressionValue);
    formik.setFieldValue("type", "");
    formik.setFieldValue("name", "");

    textAreaRef.current.editor.setValue(editorExpressionValue, 1);
    // set the cursor to the end of the inserted text
    textAreaRef.current.editor.moveCursorTo(
      newCursorPosition.row,
      newCursorPosition.column
    );
    textAreaRef.current.editor.clearSelection();
    // set autoInsert to true for next insertion
    setAutoInsert(true);
    // clear cursor position to allow the next item to auto-insert at the end
    setCursorPosition(null);
  };

  const addArgumentToFunctionsArguments = (fn) => {
    const newArgs = [...formik.values.functionsArguments, fn];
    formik.setFieldValue("functionsArguments", newArgs);
  };

  const deleteArgumentFromFunctionArguments = (fn) => {
    const newArgs = formik.values.functionsArguments.filter(
      (argument) =>
        argument?.argumentName !== fn.argumentName ||
        argument?.dataType !== fn.dataType
    );
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
              onChange={(e) => {
                formik.handleChange(e);
                if (e.target.value && !expressionEditorOpen) {
                  setExpressionEditorOpen(true);
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
          <ArgumentSection
            canEdit={canEdit}
            addArgumentToFunctionsArguments={addArgumentToFunctionsArguments}
            deleteArgumentFromFunctionArguments={
              deleteArgumentFromFunctionArguments
            }
            functionArguments={formik.values.functionsArguments}
          />
        </ExpandingSection>

        <div style={{ marginTop: "36px" }} />
        <FormikProvider value={formik}>
          <ExpressionEditor
            canEdit={canEdit}
            expressionEditorOpen={expressionEditorOpen}
            cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
            textAreaRef={textAreaRef}
            expressionEditorValue={expressionEditorValue}
            setExpressionEditorValue={setExpressionEditorValue}
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
