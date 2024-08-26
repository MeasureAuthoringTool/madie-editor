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

  const handleExpressionEditorInsert = async (values) => {
    const cursorPosition = textAreaRef?.current?.selectionStart;
    const newItem = values?.name + "\n";

    // Insert the new item at the cursor position or at the end
    const updatedExpressionValue =
      definitionToApply?.expressionValue?.slice(0, cursorPosition) +
      newItem +
      definitionToApply?.expressionValue?.slice(cursorPosition);

    setDefinitionToApply({
      definitionName: values?.definitionName?.trim(),
      comment: values?.comment?.trim(),
      expressionValue: updatedExpressionValue,
    });
    formik.setFieldValue("type", "");
    formik.setFieldValue("name", "");
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
