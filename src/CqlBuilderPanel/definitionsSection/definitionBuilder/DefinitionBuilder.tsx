import React, { useState, useEffect, useRef } from "react";
import "twin.macro";
import "styled-components/macro";
import { useFormik, FormikProvider } from "formik";
import {
  Button,
  TextArea,
  TextField,
} from "@madie/madie-design-system/dist/react";
import "../Definitions.scss";
import { DefinitionSectionSchemaValidator } from "../../../validations/DefinitionSectionSchemaValidator";
import ExpressionEditor from "../expressionSection/ExpressionEditor";
import { CqlBuilderLookup } from "../../../model/CqlBuilderLookup";

export interface Definition {
  definitionName?: string;
  comment?: string;
  expressionValue?: string;
}

export interface DefinitionProps {
  canEdit: boolean;
  handleApplyDefinition: Function;
  handleDefinitionEdit?: Function;
  cqlBuilderLookup: CqlBuilderLookup;
  definition?: Definition;
  operation?: string;
  onClose?: Function;
}

export const formatExpressionName = (values) => {
  return values?.type !== "Timing" && values?.type !== "Pre-Defined Functions"
    ? values?.type === "Functions" || values?.type === "Fluent Functions"
      ? values?.name?.replace(/([\w\s]+)\(\)/g, '"$1"()')
      : values?.name.includes(".")
      ? values?.name.replace(/(.*\.)(.*)/, '$1"$2"')
      : `"${values?.name}"`
    : values?.name;
};

export default function DefinitionBuilder({
  canEdit,
  handleApplyDefinition,
  handleDefinitionEdit,
  onClose,
  cqlBuilderLookup,
  definition,
  operation,
}: DefinitionProps) {
  const [expressionEditorOpen, setExpressionEditorOpen] =
    useState<boolean>(false);
  const textAreaRef = useRef(null);
  const [expressionEditorValue, setExpressionEditorValue] = useState(
    definition?.expressionValue || ""
  );
  const [cursorPosition, setCursorPosition] = useState(null);
  const [autoInsert, setAutoInsert] = useState(false);

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

  const formik = useFormik({
    initialValues: {
      definitionName: definition?.definitionName || "",
      comment: definition?.comment || "",
      type: "",
      name: "",
    },
    validationSchema: DefinitionSectionSchemaValidator,
    enableReinitialize: true,
    onSubmit: (values) => {
      handleExpressionEditorInsert(values);
    },
  });
  const { resetForm } = formik;

  useEffect(() => {
    if (formik.values.definitionName) {
      setExpressionEditorOpen(true);
    }
  }, [formik.values.definitionName]);

  const isEditDialogFormDirty = () => {
    if (definition?.expressionValue !== expressionEditorValue || formik.dirty) {
      return false;
    }
    return true;
  };

  return (
    <div>
      <form id="definition-form" onSubmit={formik.handleSubmit}>
        <div tw="flex space-x-5">
          <div tw="w-1/2">
            <TextField
              required="required"
              id="definition-name"
              name="definitionName"
              tw="w-full"
              readOnly={!canEdit}
              disabled={!canEdit}
              label="Definition Name"
              placeholder=""
              inputProps={{
                "data-testid": "definition-name-text-input",
              }}
              {...formik.getFieldProps("definitionName")}
            />
          </div>
          {definition && (
            <div tw="w-1/2 ml-10 my-2">
              <p className="result-label">Return Type</p>
              <span className="result-value">-</span>
            </div>
          )}
        </div>
        <br />
        <TextArea
          id="definition-comment"
          tw="w-full"
          label="Comment"
          readOnly={!canEdit}
          disabled={!canEdit}
          placeholder=""
          inputProps={{
            "data-testid": "definition-comment-text-input",
          }}
          data-testid="definition-comment-text"
          onChange={formik.handleChange}
          value={formik.values.comment}
          name="comment"
          {...formik.getFieldProps("comment")}
        />
        <div style={{ marginTop: "36px" }} />
        <FormikProvider value={formik}>
          <ExpressionEditor
            canEdit={canEdit}
            expressionEditorOpen={expressionEditorOpen}
            cqlBuilderLookupsTypes={cqlBuilderLookup}
            textAreaRef={textAreaRef}
            expressionEditorValue={expressionEditorValue}
            setExpressionEditorValue={setExpressionEditorValue}
            setCursorPosition={setCursorPosition}
            setAutoInsert={setAutoInsert}
          />
        </FormikProvider>
        <div className="form-actions">
          <Button
            variant="outline"
            data-testid="clear-definition-btn"
            disabled={
              (!formik.dirty &&
                expressionEditorValue ===
                  (definition?.expressionValue || "")) ||
              !canEdit
            }
            tw="mr-4"
            onClick={() => {
              resetForm();
              setExpressionEditorValue(definition?.expressionValue || "");
            }}
          >
            Clear
          </Button>
          <Button
            data-testid={`definition-${
              operation === "edit" ? "save" : "apply"
            }-btn`}
            disabled={
              !formik.values.definitionName ||
              !canEdit ||
              !expressionEditorValue ||
              isEditDialogFormDirty()
            }
            onClick={() => {
              const definitionToApply: Definition = {
                definitionName: formik.values.definitionName,
                comment: formik.values.comment,
                expressionValue: expressionEditorValue,
              };
              resetForm();
              setExpressionEditorValue("");
              if (operation === "edit") {
                formik.setFieldValue("definitionName", "");
                formik.setFieldValue("comment", "");
                handleDefinitionEdit(definition, definitionToApply);
                onClose();
              } else {
                handleApplyDefinition(definitionToApply);
              }
            }}
          >
            {operation === "edit" ? "Save" : "Apply"}
          </Button>
        </div>
      </form>
    </div>
  );
}
