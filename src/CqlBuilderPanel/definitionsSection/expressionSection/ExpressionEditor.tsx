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
import * as _ from "lodash";
import { CqlBuilderLookupData } from "../../../model/CqlBuilderLookup";
import { Definition } from "../DefinitionSection";
import AceEditor from "react-ace";
import { Ace } from "ace-builds";

interface ExpressionsProps {
  canEdit: boolean;
  expressionEditorOpen: boolean;
  formik: any;
  cqlBuilderLookupsTypes: CqlBuilderLookupData | {};
  textAreaRef;
  expressionEditorValue: string;
  setExpressionEditorValue: Function;
  setCursorPosition: Function;
  setAutoInsert: Function;
}

export default function ExpressionEditor(props: ExpressionsProps) {
  const {
    canEdit,
    expressionEditorOpen,
    formik,
    cqlBuilderLookupsTypes,
    textAreaRef,
    expressionEditorValue,
    setExpressionEditorValue,
    setCursorPosition,
    setAutoInsert,
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
  const [editorHeight, setEditorHeight] = useState("100px");

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

  const handleCursorChange = (newCursorPosition) => {
    setCursorPosition(newCursorPosition);
    setAutoInsert(false); // disable auto-insert when cursor moves
  };

  const getNameOptionsByType = (type: string): string[] => {
    if (type === "Parameters" && cqlBuilderLookupsTypes) {
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

  // adjusting the height of the editor based on the inserted text
  useEffect(() => {
    if (textAreaRef.current) {
      const lineCount = textAreaRef.current.editor.session.getLength();
      const newHeight = Math.max(lineCount * 20, 100) + "px";
      setEditorHeight(newHeight);
    }
  }, [expressionEditorValue]);

  // allow manual edit
  const handleContentChange = (value) => {
    setExpressionEditorValue(value);
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
            <div data-testId="expression-ace-editor">
              <AceEditor
                mode="sql"
                ref={textAreaRef}
                theme="monokai"
                value={expressionEditorValue}
                onChange={(value) => {
                  handleContentChange(value);
                }}
                onLoad={(aceEditor) => {
                  // On load we want to tell the ace editor that it's inside of a scrollabel page
                  aceEditor.setOption("autoScrollEditorIntoView", true);
                }}
                onCursorChange={(selection) =>
                  handleCursorChange(selection.getCursor())
                }
                width="100%"
                height={editorHeight}
                wrapEnabled={true}
                readOnly={false}
                name="ace-editor-wrapper"
                enableBasicAutocompletion={true}
              />
            </div>
          </>
        }
      />
    </div>
  );
}
