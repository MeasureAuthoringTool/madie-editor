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

import { useFormik, useFormikContext } from "formik";
import Arguments from "./Arguments";
import { FunctionArgument } from "../../../model/CqlBuilderLookup";

interface ArgumentsProps {
  functionArgument?: FunctionArgument;
  setConfirmationDialog: Function;
  canEdit: boolean;
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
  const { functionArgument, setConfirmationDialog, canEdit } = props;
  const [functionDataType, setFunctionDataType] = useState(
    functionArgument?.dataType || ""
  );

  const formik = useFormik({
    initialValues: {
      argumentName: "",
      dataType: "",
      other: "",
    },
    // validationSchema: FunctionSectionSchemaValidator,
    enableReinitialize: true,
    onSubmit: (values) => {},
  });

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
            {...formik.getFieldProps("argumentName")}
            error={Boolean(formik.errors.argumentName)}
            helperText={formik.errors.argumentName}
          />
        </div>
        <div tw="flex-grow pl-5">
          <Select
            label="Available DataTypes"
            id="type-selector"
            inputProps={{
              "data-testid": "type-selector-input",
            }}
            data-testid="type-selector"
            SelectDisplayProps={{
              "aria-required": "true",
            }}
            options={availableDataTypes.map((value) => (
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
          disabled={!canEdit}
          tw="mr-4"
          onClick={() => {
            resetForm();
            setFunctionDataType("");
            setConfirmationDialog(true);
          }}
        >
          Clear
        </Button>
        <Button
          data-testid={`function-argument-add-btn`}
          disabled={!canEdit}
          onClick={() => {}}
        >
          Add
        </Button>
      </div>
      <div style={{ paddingTop: "24px" }}>
        <Arguments functionArguments={[]} canEdit={canEdit} />
      </div>
    </>
  );
}
