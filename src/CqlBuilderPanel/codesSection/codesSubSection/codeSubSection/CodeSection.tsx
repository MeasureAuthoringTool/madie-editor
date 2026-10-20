import _styled, {
  default as _styled2,
  default as _styled3,
  default as _styled4,
  default as _styled5,
  default as _styled6,
  default as _styled7,
} from "styled-components";
import React, { useState, useEffect } from "react";
import {
  Select,
  TextField,
  Button,
} from "@madie/madie-design-system/dist/react";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import ExpandingSection from "../../../../common/ExpandingSection";
import { useFormik } from "formik";
import { CodeSubSectionSchemaValidator } from "../../../../validations/CodeSubSectionSchemaValidator";
import _ from "lodash";
import moment from "moment";
import { MenuItem, Tooltip } from "@mui/material";
import { CodeSystem } from "../../../../api/useTerminologyServiceApi";
import ControlledAutoComplete from "../../../../common/ControlledAutoComplete";

const _StyledDiv = _styled("div").withConfig({
  displayName: "CodeSection___StyledDiv",
  componentId: "sc-1iniqlj-0",
})({
  display: "flex",
  "@media (min-width: 768px)": {
    flexWrap: "wrap",
  },
});
const _StyledDiv2 = _styled2("div").withConfig({
  displayName: "CodeSection___StyledDiv2",
  componentId: "sc-1iniqlj-1",
})({
  width: "33.333333%",
});
const _StyledDiv3 = _styled3("div").withConfig({
  displayName: "CodeSection___StyledDiv3",
  componentId: "sc-1iniqlj-2",
})({
  flexGrow: "1",
  paddingLeft: "1.25rem",
});
const _StyledDiv4 = _styled4("div").withConfig({
  displayName: "CodeSection___StyledDiv4",
  componentId: "sc-1iniqlj-3",
})({
  marginTop: "0.5rem",
  width: "50%",
});
const _StyledTextField = _styled5(TextField).withConfig({
  displayName: "CodeSection___StyledTextField",
  componentId: "sc-1iniqlj-4",
})({
  width: "100%",
});
const _StyledDiv5 = _styled6("div").withConfig({
  displayName: "CodeSection___StyledDiv5",
  componentId: "sc-1iniqlj-5",
})({
  float: "right",
});
const _StyledButton = _styled7(Button).withConfig({
  displayName: "CodeSection___StyledButton",
  componentId: "sc-1iniqlj-6",
})({
  marginRight: "1rem",
});

interface CodeSectionProps {
  handleFormSubmit: Function;
  canEdit: boolean;
  allCodeSystems: CodeSystem[];
  blankResults: Function;
  measureModel: string;
}
interface MenuObj {
  value: string;
  label: string;
  fullValue: string;
}
const renderMenuItems = (options) =>
  options.map(({ value, label, fullValue }) => (
    <MenuItem
      key={`${value}-option`}
      value={value}
      data-testid={`${value}-option`}
    >
      <Tooltip key={`${label}-tooltip`} title={fullValue} arrow>
        <span>{label}</span>
      </Tooltip>
    </MenuItem>
  ));
export default function CodeSection({
  handleFormSubmit,
  allCodeSystems,
  canEdit,
  blankResults,
  measureModel,
}: CodeSectionProps) {
  const [titles, setTitles] = useState([]);
  // if we open tab before information has arrived, we need to trigger a useEffect
  useEffect(() => {
    if (allCodeSystems?.length) {
      const filteredTitles = _.uniq(allCodeSystems.map((t) => t.name)).map(
        (name) => ({
          value: name,
          label: name,
        })
      );
      setTitles(filteredTitles);
    }
  }, [allCodeSystems]);
  const formik = useFormik({
    initialValues: {
      title: "",
      version: "",
      code: "",
    },
    validationSchema: CodeSubSectionSchemaValidator,
    enableReinitialize: true,
    onSubmit: (values) => {
      handleFormSubmit(values);
    },
  });
  const { resetForm } = formik;
  const [availableVersions, setAvailableVersions] = useState([]);
  useEffect(() => {
    if (formik.values.title) {
      // filter out code entries that matches with CodeSystem Title
      const matchedCodeSystems = allCodeSystems
        .filter((c) => c.name === formik.values.title)
        .filter(
          (c) =>
            c.version?.vsacVersion !== null || c.version?.fhirVersion !== null
        )
        .sort((a, b) => {
          const dateA = new Date(a.lastUpdatedUpstream);
          const dateB = new Date(b.lastUpdatedUpstream);
          return dateB.getTime() - dateA.getTime();
        });
      // creates a list of value, label obj based on model and filters out if version is null
      // We want to display qdm version but when retrieving codes we have to use fhir Version
      const availableVersionsList = matchedCodeSystems
        .map((m) => ({
          value: _.includes(measureModel, "QDM")
            ? m.version?.vsacVersion
            : m.version?.fhirVersion,
          label: _.includes(measureModel, "QDM")
            ? m.version?.vsacVersion
            : m.version?.fhirVersion,
        }))
        .filter((m) => m.label !== null);
      // if version is URL ( ex: SNOMEDCT ) then fetch the version parameter
      const updatedVersionList = availableVersionsList.map((a) => {
        const isUrl = a.label.includes("http://");
        const version = isUrl ? _.last(a.label.split("/")) : a.label;
        return {
          value: a.value,
          label: version,
          fullValue: a.value,
        };
      });
      setAvailableVersions(updatedVersionList);
      formik.setFieldValue("version", updatedVersionList[0]?.value);
    } else {
      setAvailableVersions([]);
      formik.setFieldValue("version", "");
    }
  }, [formik.values.title, measureModel, allCodeSystems]);
  const searchInputProps = {
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon />
      </InputAdornment>
    ),
  };
  function trimCodeInput() {
    formik.setFieldValue("code", formik.values.code.trim());
  }
  return (
    <div>
      <ExpandingSection
        title="Code(s)"
        children={
          <>
            <div
              data-testid="code-list-updated-date"
              className="code-list-updated-date"
            >
              List updated:
              <span className="updated-date">
                {`${
                  allCodeSystems?.length
                    ? moment(allCodeSystems[0]?.lastUpdated).format("L")
                    : ""
                }`}
              </span>
            </div>
            <form onSubmit={formik.handleSubmit}>
              <_StyledDiv
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <_StyledDiv2>
                  <ControlledAutoComplete
                    multipleSelect={false}
                    placeholder="-"
                    id="code-system-selector"
                    label="Code Systems"
                    setFieldValue={formik.setFieldValue}
                    {...formik.getFieldProps("title")}
                    value={{
                      value: formik.values.title,
                      label: formik.values.title,
                    }}
                    disabled={!canEdit}
                    onClose={undefined}
                    disableCloseOnSelect={false}
                    required={false}
                    options={titles}
                    onChange={(_event: any, selectedVal: MenuObj) => {
                      formik.setFieldValue("title", selectedVal?.label || "");
                    }}
                    limitTags={1}
                  />
                </_StyledDiv2>
                <_StyledDiv3>
                  <Select
                    required
                    label="Code System Version"
                    id={"code-system-version-selector"}
                    inputProps={{
                      "data-testid": "code-system-version-selector-input",
                    }}
                    data-testid={"code-system-version-selector"}
                    SelectDisplayProps={{
                      "aria-required": "true",
                    }}
                    renderValue={(val) => {
                      if (val) {
                        // we want to show the user the display label.
                        const version = availableVersions.find(
                          (el) => el.value === val
                        );
                        return version?.label;
                      }
                      return val;
                    }}
                    options={renderMenuItems(availableVersions)}
                    disabled={!formik.values.title || !canEdit}
                    {...formik.getFieldProps("version")}
                  />
                </_StyledDiv3>
              </_StyledDiv>

              <_StyledDiv4>
                <_StyledTextField
                  required="required"
                  id="code"
                  label="Code"
                  placeholder="Search"
                  inputProps={{
                    "data-testid": "code-text-input",
                  }}
                  data-testid="code-text"
                  InputProps={searchInputProps}
                  onChange={formik.handleChange}
                  value={formik.values.code}
                  name="code"
                  disabled={!formik.values.title}
                  helperText={formik.touched.code && formik.errors.code}
                  error={formik.touched.code && Boolean(formik.errors.code)}
                  {...formik.getFieldProps("code")}
                  onBlur={() => {
                    formik.setFieldTouched("code", true);
                    trimCodeInput();
                  }}
                />
              </_StyledDiv4>
              <_StyledDiv5>
                <_StyledButton
                  variant="outline"
                  data-testid="clear-codes-btn"
                  disabled={!formik.dirty || !canEdit}
                  onClick={() => {
                    resetForm();
                    blankResults();
                  }}
                >
                  Clear
                </_StyledButton>
                <Button
                  type="submit"
                  data-testid="codes-search-btn"
                  disabled={!(formik.isValid && formik.dirty) || !canEdit}
                >
                  Search
                </Button>
              </_StyledDiv5>
            </form>
          </>
        }
      />
    </div>
  );
}
