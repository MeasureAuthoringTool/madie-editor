import React, { useState } from "react";
import "twin.macro";
import "styled-components/macro";
import {
  Select,
  Button,
  AutoComplete,
} from "@madie/madie-design-system/dist/react";
import ExpandingSection from "../../../common/ExpandingSection";
import { MenuItem } from "@mui/material";
import { getNameOptionsByType } from "./ExpressionEditorHelper";
import { ControlledTextarea } from "../../../common/ControlledTextArea";

interface ExpressionsProps {
  canEdit: boolean;
  expressionEditorOpen: boolean;
  formik: any;
  expressionValue: string;
  setExpressionValue: Function;
}

export default function ExpressionEditor(props: ExpressionsProps) {
  const {
    canEdit,
    expressionEditorOpen,
    formik,
    expressionValue,
    setExpressionValue,
  } = props;
  const [namesOptions, setNamesOptions] = useState([]);

  const availableTypes = [
    "Parameters",
    "Definitions",
    "Functions",
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
                  inputProps={{
                    "data-testid": "type-selector-input",
                  }}
                  data-testid={"type-selector"}
                  SelectDisplayProps={{
                    "aria-required": "true",
                  }}
                  renderValue={(val) => {
                    if (val) {
                      const type = availableTypes.find((el) => el === val);
                      setNamesOptions(getNameOptionsByType(type));
                      return type;
                    }
                    return val;
                  }}
                  options={renderMenuItems(availableTypes)}
                  disabled={!canEdit}
                  {...formik.getFieldProps("type")}
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
                  options={namesOptions.map((element) => element)}
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
              />
            </div>
          </>
        }
      />
    </div>
  );
}
