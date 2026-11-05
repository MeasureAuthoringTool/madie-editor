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
      <div className="me:flex me:flex-wrap">
        <div className="me:w-1/2">
          <TextField
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
            className="me:w-full"
          />
        </div>
        <div className="me:grow me:pl-5">
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
        </div>
      </div>
      {dataType === "Other" && (
        <div className="me:flex me:flex-wrap">
          <div className="me:pt-6 me:w-1/2">
            <TextField
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
              className="me:w-full"
            />
          </div>
        </div>
      )}
      <div
        style={{
          paddingTop: "24px",
          justifySelf: "end",
        }}
      >
        <Button
          id="clear-function-argument-btn"
          variant="outline"
          data-testid="clear-function-argument-btn"
          disabled={!canEdit || !formik.dirty}
          onClick={() => {
            setConfirmationDialog(true);
          }}
          className="me:mr-4"
        >
          Clear
        </Button>
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
