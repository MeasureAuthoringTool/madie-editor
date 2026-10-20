import _styled, {
  default as _styled2,
  default as _styled3,
  default as _styled4,
  default as _styled5,
  default as _styled6,
  default as _styled7,
  default as _styled8,
} from "styled-components";
import React, { useCallback, useEffect, useState } from "react";
import {
  Select,
  Button,
  AutoComplete,
  TextField,
} from "@madie/madie-design-system/dist/react";
import ExpandingSection from "../../../common/ExpandingSection";
import { MenuItem } from "@mui/material";
import * as _ from "lodash";
import { useFormik } from "formik";
import Arguments from "./Arguments";
import { FunctionArgument } from "../../../model/CqlBuilderLookup";
import ConfirmationDialog from "../../common/ConfirmationDialog";
import { FunctionArgumentSchemaValidator } from "../../../validations/FunctionArgumentSchemaValidator";
import "./ArguementsSection.scss";

const _StyledDiv = _styled("div").withConfig({
  displayName: "ArgumentSection___StyledDiv",
  componentId: "sc-1jx03lg-0",
})({
  display: "flex",
  flexWrap: "wrap",
});
const _StyledDiv2 = _styled2("div").withConfig({
  displayName: "ArgumentSection___StyledDiv2",
  componentId: "sc-1jx03lg-1",
})({
  width: "50%",
});
const _StyledTextField = _styled3(TextField).withConfig({
  displayName: "ArgumentSection___StyledTextField",
  componentId: "sc-1jx03lg-2",
})({
  width: "100%",
});
const _StyledDiv3 = _styled4("div").withConfig({
  displayName: "ArgumentSection___StyledDiv3",
  componentId: "sc-1jx03lg-3",
})({
  flexGrow: "1",
  paddingLeft: "1.25rem",
});
const _StyledDiv4 = _styled5("div").withConfig({
  displayName: "ArgumentSection___StyledDiv4",
  componentId: "sc-1jx03lg-4",
})({
  display: "flex",
  flexWrap: "wrap",
});
const _StyledDiv5 = _styled6("div").withConfig({
  displayName: "ArgumentSection___StyledDiv5",
  componentId: "sc-1jx03lg-5",
})({
  width: "50%",
  paddingTop: "1.5rem",
});
const _StyledTextField2 = _styled7(TextField).withConfig({
  displayName: "ArgumentSection___StyledTextField2",
  componentId: "sc-1jx03lg-6",
})({
  width: "100%",
});
const _StyledButton = _styled8(Button).withConfig({
  displayName: "ArgumentSection___StyledButton",
  componentId: "sc-1jx03lg-7",
})({
  marginRight: "1rem",
});

interface ArgumentsProps {
  functionArguments?: FunctionArgument[];
  canEdit: boolean;
  addArgumentToFunctionsArguments: Function;
  isFluentFunction: boolean;
  deleteArgumentFromFunctionArguments: Function;
  dirty: boolean;
}
const availableDataTypes = [
  "Boolean",
  "Date",
  "Date Time",
  "Decimal",
  "Integer",
  "Ratio",
  "String",
  "Time",
  "Other",
];
export default function ArgumentSection(props: ArgumentsProps) {
  const {
    addArgumentToFunctionsArguments,
    deleteArgumentFromFunctionArguments,
    functionArguments,
    isFluentFunction,
    canEdit,
    dirty,
  } = props;
  const [confirmationDialog, setConfirmationDialog] = useState<boolean>(false);
  const formik = useFormik({
    initialValues: {
      argumentName: "",
      dataType: "",
      other: "",
    },
    validationSchema: FunctionArgumentSchemaValidator,
    enableReinitialize: false,
    onSubmit: () => {},
  });
  const { dataType } = formik.values;
  const handleSubmit = () => {
    let value = dataType;
    if (value === "Other") {
      value = formik.values.other;
    }
    const fnToAdd = {
      argumentName: formik.values.argumentName?.trim().replace(/\s+/g, " "),
      dataType: value,
    };
    addArgumentToFunctionsArguments(fnToAdd);
    formik.resetForm();
  };
  const { resetForm } = formik;
  // reset inner if outer is clean (listen for reset event)
  useEffect(() => {
    if (!dirty) {
      resetForm();
    }
  }, [dirty]);
  return (
    <>
      <_StyledDiv>
        <_StyledDiv2>
          <_StyledTextField
            required={
              isFluentFunction || formik.values.dataType ? "required" : ""
            }
            label="Name"
            id="argument-name-field"
            name="argumentName"
            readOnly={!canEdit}
            disabled={!canEdit}
            placeholder=""
            inputProps={{
              "data-testid": "argument-name-input",
            }}
            error={Boolean(formik.errors.argumentName)}
            helperText={formik.errors.argumentName}
            {...formik.getFieldProps("argumentName")}
          />
        </_StyledDiv2>
        <_StyledDiv3>
          <Select
            required={formik.values.argumentName ? "required" : ""}
            label="Available DataTypes"
            id="arg-type-selector"
            inputProps={{
              "data-testid": "arg-type-selector-input",
            }}
            data-testid="arg-type-selector"
            SelectDisplayProps={{
              "aria-required": "true",
            }}
            options={availableDataTypes?.map((value) => (
              <MenuItem
                key={`${value}-option`}
                value={value}
                data-testid={`${value}-option`}
              >
                {value}
              </MenuItem>
            ))}
            disabled={!canEdit}
            {...formik.getFieldProps("dataType")}
            error={Boolean(formik.errors.dataType)}
            helperText={formik.errors.dataType}
            onChange={(evt) => {
              formik.setFieldValue("dataType", evt.target.value);
              if (formik.values.other) {
                formik.setFieldValue("other", "");
              }
            }}
          />
        </_StyledDiv3>
      </_StyledDiv>
      {dataType === "Other" && (
        <_StyledDiv4>
          <_StyledDiv5>
            <_StyledTextField2
              label="Other"
              id="other-field"
              name="otherType"
              readOnly={!canEdit}
              disabled={!canEdit}
              placeholder=""
              inputProps={{
                "data-testid": "other-type-input",
              }}
              required
              {...formik.getFieldProps("other")}
              error={formik.touched.other && Boolean(formik.errors.other)}
              helperText={formik.errors.other}
            />
          </_StyledDiv5>
        </_StyledDiv4>
      )}
      <div
        style={{
          paddingTop: "24px",
          justifySelf: "end",
        }}
      >
        <_StyledButton
          id="clear-function-argument-btn"
          variant="outline"
          data-testid="clear-function-argument-btn"
          disabled={!canEdit || !formik.dirty}
          onClick={() => {
            setConfirmationDialog(true);
          }}
        >
          Clear
        </_StyledButton>
        <Button
          data-testid={`function-argument-add-btn`}
          disabled={
            !canEdit ||
            !formik.isValid ||
            !formik.dirty ||
            !formik.values.argumentName ||
            !formik.values.dataType
          }
          onClick={handleSubmit}
        >
          Add
        </Button>
      </div>
      <div
        style={{
          paddingTop: "24px",
        }}
      >
        {/* tableData with pagination. */}
        <Arguments
          functionArguments={functionArguments}
          canEdit={canEdit}
          handleDeleteArgument={deleteArgumentFromFunctionArguments}
        />
      </div>
      <ConfirmationDialog
        open={confirmationDialog}
        onClose={() => setConfirmationDialog(false)}
        onSubmit={() => {
          resetForm();
          setConfirmationDialog(false);
        }}
      />
    </>
  );
}
