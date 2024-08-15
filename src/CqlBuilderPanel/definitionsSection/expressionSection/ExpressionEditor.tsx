import React, { useEffect, useState } from "react";
import "twin.macro";
import "styled-components/macro";
import {
  Select,
  Button,
  AutoComplete,
} from "@madie/madie-design-system/dist/react";
import ExpandingSection from "../../../common/ExpandingSection";
import { MenuItem } from "@mui/material";
import {
  predefinedFunctionsNames,
  timingNames,
} from "./ExpressionEditorHelper";
import { ControlledTextarea } from "../../../common/ControlledTextArea";
import * as _ from "lodash";
import { CqlBuilderLookupData } from "../../../model/CqlBuilderLookup";

interface ExpressionsProps {
  canEdit: boolean;
  expressionEditorOpen: boolean;
  formik: any;
  expressionValue: string;
  setExpressionValue: Function;
  cqlBuilderLookupsTypes: CqlBuilderLookupData | {};
}

export default function ExpressionEditor(props: ExpressionsProps) {
  const {
    canEdit,
    expressionEditorOpen,
    formik,
    expressionValue,
    setExpressionValue,
    cqlBuilderLookupsTypes,
  } = props;
  const [namesOptions, setNamesOptions] = useState([]);

  const availableTypes = [
    "Parameters",
    "Definitions",
    "Functions",
    "Fluent Functions",
    "Timing",
    "Pre-Defined Functions",
  ];

  const renderMenuItems = (options: string[]) => {
    return [
      ...options.map((value) => (
        <MenuItem
          key={`${value}-option`}
          value={value}
          data-testid={`${value}-option`}
        >
          {value}
        </MenuItem>
      )),
    ];
  };

  const getNameOptionsByType = (type: string): string[] => {
    if (type === "Parameters") {
      return cqlBuilderLookupsTypes["parameters"];
    } else if (type === "Definitions") {
      return cqlBuilderLookupsTypes["definitions"];
    } else if (type === "Functions") {
      return cqlBuilderLookupsTypes["functions"];
    } else if (type === "Fluent Functions") {
      return cqlBuilderLookupsTypes["fluentFunctions"];
    } else if (type === "Timing") {
      return timingNames;
    } else if (type === "Pre-Defined Functions") {
      return predefinedFunctionsNames;
    }
  };

  return (
    <div>
      <ExpandingSection
        title="Expression Editor"
        showHeaderContent={expressionEditorOpen}
        children={
          <>
            <div tw="flex flex-wrap">
              <div tw="w-1/2">
                <Select
                  label="Type"
                  id="type-selector"
                  {...formik.getFieldProps("type")}
                  inputProps={{
                    "data-testid": "type-selector-input",
                  }}
                  data-testid="type-selector"
                  SelectDisplayProps={{
                    "aria-required": "true",
                  }}
                  renderValue={(val) => {
                    setNamesOptions(getNameOptionsByType(val));
                    return val;
                  }}
                  options={renderMenuItems(availableTypes)}
                  disabled={!canEdit}
                />
              </div>
              <div tw="flex-grow pl-5">
                <AutoComplete
                  label="Name"
                  id="name-selector"
                  inputProps={{
                    "data-testid": "name-selector-input",
                  }}
                  dataTestId="name-selector"
                  SelectDisplayProps={{
                    "aria-required": "true",
                  }}
                  {...formik.getFieldProps("name")}
                  options={_.sortBy(namesOptions?.map((element) => element))}
                  onChange={(
                    _event: any,
                    selectedVal: string | null,
                    reason
                  ) => {
                    formik.setFieldValue("name", selectedVal);
                  }}
                  disabled={!canEdit || !formik.values.type}
                />
              </div>
            </div>

            <div tw="float-right">
              <Button
                type="submit"
                data-testid="expression-insert-btn"
                disabled={
                  !canEdit || !formik.values.type || !formik.values.name
                }
              >
                Insert
              </Button>
            </div>
            <div style={{ marginBottom: "72px" }} />
            <div className="full-row">
              <ControlledTextarea
                name="expression-textarea"
                value={expressionValue}
                onValueChange={(value: string) => setExpressionValue(value)}
                numOfLines={1}
                disabled={!canEdit}
              />
            </div>
          </>
        }
      />
    </div>
  );
}
