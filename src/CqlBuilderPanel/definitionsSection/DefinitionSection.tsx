import React from "react";
import "twin.macro";
import "styled-components/macro";
import { useFormik } from "formik";
import {
  TextArea,
  TextField,
  Button,
} from "@madie/madie-design-system/dist/react";
import "./Definitions.scss";
import ExpandingSection from "../../common/ExpandingSection";
import { DefinitionSectionSchemaValidator } from "../../validations/DefinitionSectionSchemaValidator";

interface DefinitionProps {
  canEdit: boolean;
}

export default function DefinitionSection({ canEdit }: DefinitionProps) {
  const handleFormSubmit = async (values) => {
    if (values && values.name && values.body) {
      // save it.
    }
  };

  const formik = useFormik({
    initialValues: {
      definitionName: "",
      comment: "",
      body: "",
    },
    validationSchema: DefinitionSectionSchemaValidator,
    enableReinitialize: true,
    onSubmit: (values) => {
      handleFormSubmit(values);
    },
  });
  const { resetForm } = formik;

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
            data-testid="definition-name-text"
            onChange={formik.handleChange}
            value={formik.values.definitionName}
            onBlur={() => trimInput("definitionName")}
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
          data-testid="definition-name-text"
          // InputProps={searchInputProps}
          onChange={formik.handleChange}
          value={formik.values.comment}
          onBlur={() => trimInput("comment")}
          name="comment"
        />
        <div style={{ marginTop: "48px" }} />
        <ExpandingSection
          title="Expression Editor"
          children={<div>Expression Editor</div>}
        />
        <div className="form-actions">
          <Button
            variant="outline"
            data-testid="clear-definition-btn"
            disabled={!formik.dirty || !canEdit}
            tw="mr-4"
            onClick={() => {
              resetForm();
            }}
          >
            Clear
          </Button>
          <Button
            type="submit"
            data-testid="definition-apply-btn"
            disabled={!(formik.isValid && formik.dirty) || !canEdit}
          >
            Apply
          </Button>
        </div>
      </form>
    </div>
  );
}
