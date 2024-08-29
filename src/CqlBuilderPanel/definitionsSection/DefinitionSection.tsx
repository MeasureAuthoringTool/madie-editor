import React, { useState, useEffect, useRef } from "react";
import "twin.macro";
import "styled-components/macro";
import { useFormik } from "formik";
import {
  TextArea,
  TextField,
  Button,
} from "@madie/madie-design-system/dist/react";
import "./Definitions.scss";
import { DefinitionSectionSchemaValidator } from "../../validations/DefinitionSectionSchemaValidator";
import ExpressionEditor from "./expressionSection/ExpressionEditor";
import { CqlBuilderLookupData } from "../../model/CqlBuilderLookup";

export interface Definition {
  definitionName?: string;
  comment?: string;
  expressionValue?: string;
}

export interface DefinitionProps {
  canEdit: boolean;
  handleApplyDefinition: Function;
  cqlBuilderLookupsTypes: CqlBuilderLookupData | {};
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

export default function DefinitionSection({
  canEdit,
  handleApplyDefinition,
  cqlBuilderLookupsTypes,
}: DefinitionProps) {
  const [expressionEditorOpen, setExpressionEditorOpen] =
    useState<boolean>(false);
  const textAreaRef = useRef(null);
  const [definitionToApply, setDefinitionToApply] = useState<Definition>({
    definitionName: "",
    comment: "",
    expressionValue: "",
  });
  const [cursorPosition, setCursorPosition] = useState(null);
  const [autoInsert, setAutoInsert] = useState(false);

  const handleExpressionEditorInsert = (values) => {
    const formattedExpression = formatExpressionName(values);
    let editorExpressionValue = definitionToApply?.expressionValue;
    let newCursorPosition = cursorPosition;

    if (cursorPosition && !autoInsert) {
      // Insert at cursor position
      const { row, column } = cursorPosition;
      const lines = definitionToApply?.expressionValue.split("\n");
      const currentLine = lines[row];
      const newLine =
        currentLine.slice(0, column) +
        formattedExpression +
        currentLine.slice(column);
      lines[row] = newLine;
      editorExpressionValue = lines.join("\n");
      newCursorPosition = { row, column: column + formattedExpression.length };
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

    setDefinitionToApply({
      definitionName: values?.definitionName?.trim(),
      comment: values?.comment?.trim(),
      expressionValue: editorExpressionValue,
    });
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
      definitionName: "",
      comment: "",
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

  return (
    <div>
      <form id="definition-form" onSubmit={formik.handleSubmit}>
        <div className={"full-row"}>
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
            onChange={formik.handleChange}
            {...formik.getFieldProps("definitionName")}
          />
          <div className="spacer" />
        </div>
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
        />
        <div style={{ marginTop: "36px" }} />
        <ExpressionEditor
          canEdit={canEdit}
          expressionEditorOpen={expressionEditorOpen}
          formik={formik}
          cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
          textAreaRef={textAreaRef}
          definitionToApply={definitionToApply}
          setDefinitionToApply={setDefinitionToApply}
          setCursorPosition={setCursorPosition}
          setAutoInsert={setAutoInsert}
        />
        <div className="form-actions">
          <Button
            variant="outline"
            data-testid="clear-definition-btn"
            disabled={!formik.dirty || !canEdit}
            tw="mr-4"
            onClick={() => {
              resetForm();
              setDefinitionToApply({
                definitionName: "",
                comment: "",
                expressionValue: "",
              });
            }}
          >
            Clear
          </Button>
          <Button
            data-testid="definition-apply-btn"
            disabled={
              !formik.values.definitionName ||
              !canEdit ||
              !definitionToApply?.expressionValue
            }
            onClick={() => handleApplyDefinition}
          >
            Apply
          </Button>
        </div>
      </form>
    </div>
  );
}
