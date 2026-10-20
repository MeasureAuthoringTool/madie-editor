import _styled, {
  default as _styled2,
  default as _styled3,
  default as _styled4,
  default as _styled5,
  default as _styled6,
  default as _styled7,
} from "styled-components";
import React, { useState, useEffect, useRef } from "react";
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
import { getNewExpressionsAndLines } from "../../common/utils";
export interface Definition {
  definitionName?: string;
  comment?: string;
  expressionValue?: string;
  returnType?: string;
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
      const newValues = getNewExpressionsAndLines(
        values,
        cursorPosition,
        expressionEditorValue,
        autoInsert
      );
      updateExpressionAndLines(newValues[0], newValues[1]);
    },
  });

  // update formik, and expressionEditor, cursor, lines
  const updateExpressionAndLines = (
    newEditorExpressionValue,
    newCursorPosition
  ) => {
    setExpressionEditorValue(newEditorExpressionValue);
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
        <_StyledDiv>
          <_StyledDiv2>
            <_StyledTextField
              required="required"
              id="definition-name"
              name="definitionName"
              readOnly={!canEdit}
              disabled={!canEdit}
              label="Definition Name"
              placeholder=""
              inputProps={{
                "data-testid": "definition-name-text-input",
              }}
              helperText={formik.errors.definitionName}
              error={Boolean(formik.errors.definitionName)}
              {...formik.getFieldProps("definitionName")}
            />
          </_StyledDiv2>
          {definition && definition.returnType && (
            <_StyledDiv3 data-testid="return-type">
              <p className="result-label">Return Type</p>
              <span className="result-value">{definition.returnType}</span>
            </_StyledDiv3>
          )}
        </_StyledDiv>
        <br />
        <_StyledTextArea
          id="definition-comment"
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
        <div
          style={{
            marginTop: "36px",
          }}
        />
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
          {canEdit ? (
            <div>
              <_StyledButton
                variant="outline"
                data-testid="clear-definition-btn"
                disabled={
                  (!formik.dirty &&
                    expressionEditorValue ===
                      (definition?.expressionValue || "")) ||
                  !canEdit
                }
                onClick={() => {
                  resetForm();
                  setExpressionEditorValue(definition?.expressionValue || "");
                }}
              >
                Clear
              </_StyledButton>
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
          ) : (
            <_StyledButton2
              variant="outline"
              data-testid="cancel-definition-btn"
              onClick={() => {
                onClose();
              }}
            >
              Cancel
            </_StyledButton2>
          )}
        </div>
      </form>
    </div>
  );
}
var _StyledDiv = _styled("div").withConfig({
  displayName: "DefinitionBuilder___StyledDiv",
  componentId: "sc-15v127g-0",
})({
  display: "flex",
  "> :not([hidden]) ~ :not([hidden])": {
    "--tw-space-x-reverse": "0",
    marginRight: "calc(1.25rem * var(--tw-space-x-reverse))",
    marginLeft: "calc(1.25rem * calc(1 - var(--tw-space-x-reverse)))",
  },
});
var _StyledDiv2 = _styled2("div").withConfig({
  displayName: "DefinitionBuilder___StyledDiv2",
  componentId: "sc-15v127g-1",
})({
  width: "50%",
});
var _StyledTextField = _styled3(TextField).withConfig({
  displayName: "DefinitionBuilder___StyledTextField",
  componentId: "sc-15v127g-2",
})({
  width: "100%",
});
var _StyledDiv3 = _styled4("div").withConfig({
  displayName: "DefinitionBuilder___StyledDiv3",
  componentId: "sc-15v127g-3",
})({
  marginTop: "0.5rem",
  marginBottom: "0.5rem",
  marginLeft: "2.5rem",
  width: "50%",
});
var _StyledTextArea = _styled5(TextArea).withConfig({
  displayName: "DefinitionBuilder___StyledTextArea",
  componentId: "sc-15v127g-4",
})({
  width: "100%",
});
var _StyledButton = _styled6(Button).withConfig({
  displayName: "DefinitionBuilder___StyledButton",
  componentId: "sc-15v127g-5",
})({
  marginRight: "1rem",
});
var _StyledButton2 = _styled7(Button).withConfig({
  displayName: "DefinitionBuilder___StyledButton2",
  componentId: "sc-15v127g-6",
})({
  marginRight: "1rem",
});
