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
  definitionToApply: Definition;
  setDefinitionToApply: Function;
}

export default function ExpressionEditor(props: ExpressionsProps) {
  const {
    canEdit,
    expressionEditorOpen,
    formik,
    cqlBuilderLookupsTypes,
    textAreaRef,
    definitionToApply,
    setDefinitionToApply,
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
  const lineNumbers = definitionToApply?.expressionValue?.split("\n")?.length;
  const [editor, setEditor] = useState<Ace.Editor>();
  const [editorHeight, setEditorHeight] = useState("100px"); // Start with a minimal height

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

  // Automatically adjust the height of the ace editor based on the content
  useEffect(() => {
    if (textAreaRef.current) {
      const lineCount = textAreaRef.current.editor.session.getLength();
      const newHeight = Math.max(lineCount * 20, 100) + "px"; // Calculate height based on lines, minimum 100px
      setEditorHeight(newHeight);
    }
  }, [definitionToApply?.expressionValue]);

  // Allow manual editing of the textarea
  const handleContentChange = (value) => {
    setDefinitionToApply({
      ...definitionToApply,
      expressionValue: value,
    });
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
                value={definitionToApply?.expressionValue}
                onChange={(value) => {
                  handleContentChange(value);
                }}
                onLoad={(aceEditor) => {
                  // On load we want to tell the ace editor that it's inside of a scrollabel page
                  aceEditor.setOption("autoScrollEditorIntoView", true);
                  setEditor(aceEditor);
                }}
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
