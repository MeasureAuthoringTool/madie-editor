import React, { useState, useEffect } from "react";
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

export interface Definition {
  definitionName?: string;
  comment?: string;
  expressionType?: string;
  expressionName?: string;
  expressionValue?: string;
}

export interface DefinitionProps {
  canEdit: boolean;
  handleApplyDefinition: Function;
  availableParameters: string[];
}

export default function DefinitionSection({
  canEdit,
  handleApplyDefinition,
  availableParameters,
}: DefinitionProps) {
  const [expressionValue, setExpressionValue] = useState("");
  const [expressionEditorOpen, setExpressionEditorOpen] =
    useState<boolean>(false);

  const handleFormSubmit = async (values) => {
    values.definitionName = trimInput("definitionName");
    values.comment = trimInput("comment");
    // save it with handleApplyDefinition
    formik.resetForm();
    setExpressionValue("");
    setExpressionEditorOpen(false);
    // }
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
      handleFormSubmit(values);
    },
  });
  const { resetForm } = formik;

  useEffect(() => {
    if (formik.values.definitionName) {
      setExpressionEditorOpen(true);
    }
  }, [formik.values]);

  function trimInput(field: string) {
    formik.setFieldValue(field, formik.values[field].trim());
  }
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
          expressionValue={expressionValue}
          setExpressionValue={setExpressionValue}
          availableParameters={availableParameters}
        />
        <div className="form-actions">
          <Button
            variant="outline"
            data-testid="clear-definition-btn"
            disabled={!formik.dirty || !canEdit}
            tw="mr-4"
            onClick={() => {
              resetForm();
              setExpressionValue("");
            }}
          >
            Clear
          </Button>
          <Button
            type="submit"
            data-testid="definition-apply-btn"
            disabled={
              !formik.values.definitionName ||
              !formik.values.type ||
              !canEdit ||
              !expressionValue
            }
          >
            Apply
          </Button>
        </div>
      </form>
    </div>
  );
}
