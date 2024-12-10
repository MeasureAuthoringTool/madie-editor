import React, { useCallback, useEffect, useState } from "react";
import "twin.macro";
import "styled-components/macro";
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

interface ArgumentsProps {
  functionArguments?: FunctionArgument[];
  canEdit: boolean;
  addArgumentToFunctionsArguments: Function;
  deleteArgumentFromFunctionArguments: Function;
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
    canEdit,
  } = props;
  const [functionDataType, setFunctionDataType] = useState("");
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
    let value = formik.values.dataType;
    if (functionDataType === "Other") {
      value = formik.values.other;
    }
    const fnToAdd = {
      argumentName: formik.values.argumentName,
      dataType: value,
    };
    addArgumentToFunctionsArguments(fnToAdd);
    formik.resetForm();
  };
  const { resetForm } = formik;

  return (
    <>
      <div tw="flex flex-wrap">
        <div tw="w-1/2">
          <TextField
            label="Name"
            id="argument-name-field"
            name="argumentName"
            tw="w-full"
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
        </div>
        <div tw="flex-grow pl-5">
          <Select
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
              setFunctionDataType(evt.target.value);
              formik.setFieldValue("dataType", evt.target.value);
            }}
          />
        </div>
      </div>
      {functionDataType && functionDataType === "Other" && (
        <div tw="flex flex-wrap">
          <div tw="pt-6 w-1/2">
            <TextField
              label="Other"
              id="other-field"
              name="otherType"
              tw="w-full"
              readOnly={!canEdit}
              disabled={!canEdit}
              placeholder=""
              inputProps={{
                "data-testid": "other-type-input",
              }}
              // required
              {...formik.getFieldProps("other")}
              error={Boolean(formik.errors.other)}
              helperText={formik.errors.other}
            />
          </div>
        </div>
      )}
      <div style={{ paddingTop: "24px", justifySelf: "end" }}>
        <Button
          id="clear-function-argument-btn"
          variant="outline"
          data-testid="clear-function-argument-btn"
          disabled={!canEdit || !formik.dirty}
          tw="mr-4"
          onClick={() => {
            setConfirmationDialog(true);
          }}
        >
          Clear
        </Button>
        <Button
          data-testid={`function-argument-add-btn`}
          disabled={!canEdit || !formik.isValid || !formik.dirty}
          onClick={handleSubmit}
        >
          Add
        </Button>
      </div>
      <div style={{ paddingTop: "24px" }}>
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
          setFunctionDataType("");
          setConfirmationDialog(false);
        }}
      />
    </>
  );
}
