import React, { useState, useEffect } from "react";
import "twin.macro";
import "styled-components/macro";
import {
  Select,
  TextField,
  Button,
} from "@madie/madie-design-system/dist/react";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@material-ui/core/InputAdornment";
import TerminologySection from "../../../../common/TerminologySection";
import { useFormik } from "formik";
import { CodeSubSectionSchemaValidator } from "../../../../validations/CodeSubSectionSchemaValidator";
import { uniq } from "lodash";
import moment from "moment";
import { MenuItem } from "@mui/material";
import { CodeSystem } from "../../../../api/useTerminologyServiceApi";

interface CodeSectionProps {
  handleFormSubmit: Function;
  canEdit: boolean;
  allCodeSystems: CodeSystem[];
}

interface MenuObj {
  value: string;
  label: string;
}

export default function CodeSection({
  handleFormSubmit,
  allCodeSystems,
  canEdit,
}: CodeSectionProps) {
  const [titles, setTitles] = useState([]);
  // if we open tab before information has arrived, we need to trigger a useEffect
  useEffect(() => {
    if (allCodeSystems?.length) {
      const filteredTitles = uniq(allCodeSystems.map((t) => t.name)).map(
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
      codeSystem: "",
      version: "",
      code: "",
    },
    validationSchema: CodeSubSectionSchemaValidator,
    onSubmit: (values) => {
      handleFormSubmit(values);
    },
  });
  const [availableVersions, setAvailableVersions] = useState([]);
  useEffect(() => {
    if (formik.values.codeSystem) {
      const availableVersions = allCodeSystems
        .filter((c) => c.name === formik.values.codeSystem)
        .sort((a, b) => {
          const dateA = new Date(a.lastUpdatedUpstream);
          const dateB = new Date(b.lastUpdatedUpstream);
          return dateB.getTime() - dateA.getTime();
        });
      setAvailableVersions(
        availableVersions.map((cs) => ({
          value: cs.version,
          label: cs.version,
        }))
      );
      formik.setFieldValue("version", availableVersions[0].version);
    }
  }, [formik.values.codeSystem]);
  const searchInputProps = {
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon />
      </InputAdornment>
    ),
  };

  const renderMenuItems = (options: MenuObj[]) => {
    return [
      ...options.map(({ value, label }) => (
        <MenuItem
          key={`${label}-option`}
          value={value}
          data-testid={`${label}-option`}
        >
          {label}
        </MenuItem>
      )),
    ];
  };

  return (
    <div>
      <TerminologySection
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
              <div tw="flex md:flex-wrap">
                <div tw="w-1/3">
                  <Select
                    required
                    placeHolder={{
                      name: "Select Code System",
                      value: "",
                    }}
                    label="Code System"
                    id={"code-system-selector"}
                    inputProps={{
                      "data-testid": "code-system-selector-input",
                    }}
                    data-testid={"code-system-selector"}
                    SelectDisplayProps={{
                      "aria-required": "true",
                    }}
                    options={renderMenuItems(titles)}
                    disabled={!canEdit}
                    {...formik.getFieldProps("codeSystem")}
                  />
                </div>
                <div tw="flex-grow pl-5">
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
                    options={renderMenuItems(availableVersions)}
                    disabled={!formik.values.codeSystem || !canEdit}
                    {...formik.getFieldProps("version")}
                  />
                </div>
              </div>

              <div tw="w-1/2 mt-2">
                <TextField
                  required="required"
                  id="code"
                  tw="w-full"
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
                  disabled={!formik.values.codeSystem}
                />
              </div>
              <div tw="float-right">
                <Button
                  variant="outline"
                  data-testid="clear-codes-btn"
                  disabled={!formik.dirty || !canEdit}
                  tw="mr-4"
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  data-testid="codes-search-btn"
                  disabled={!(formik.isValid && formik.dirty) || !canEdit}
                >
                  Search
                </Button>
              </div>
            </form>
          </>
        }
      />
    </div>
  );
}
