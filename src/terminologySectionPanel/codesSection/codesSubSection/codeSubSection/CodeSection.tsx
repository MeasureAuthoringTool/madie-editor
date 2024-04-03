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
const codeSystemVersionOptions = [
  {
    label: "version 1",
    value: "version 1",
  },
  {
    label: "version 2",
    value: "version 2",
  },
];

const codeSystemOptions = [
  {
    label: "Code System 1",
    value: "Code System 1",
  },
  {
    label: "Code System 2",
    value: "Code System 2",
  },
];

interface CodeSectionProps {
  handleFormSubmit: Function;
  canEdit: boolean;
}

interface MenuObj {
  value: string;
  label: string;
}

export default function CodeSection({ handleFormSubmit, allCodeSystems, canEdit }) {
  // if we open tab before information has arrived, we need to trigger a useEffect
  const [codeSystems, setCodeSystems] = useState(allCodeSystems);
  const [titles, setTitles] = useState([]);
  useEffect(() => {
    if (allCodeSystems?.length) {
      const filteredTitles = uniq(allCodeSystems.map((t) => t.title)).map(
        (title) => ({
          value: title,
          label: title,
        })
      );
      setTitles(filteredTitles);
      setCodeSystems(allCodeSystems);
    }
  }, [allCodeSystems, setCodeSystems]);

  const formik = useFormik({
    initialValues: {
      title: "",
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
    if (formik.values.title) {
      const availableVersions = codeSystems
        .filter((c) => c.title === formik.values.title)
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
  }, [formik.values.title]);
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
                  codeSystems?.length
                    ? moment(codeSystems[0]?.lastUpdated).format("L")
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
                    name="codeSystem"
                    disabled={!canEdit}
                    {...formik.getFieldProps("title")}
                  />
                </div>
                <div tw="flex-grow pl-5">
                  <Select
                    required
                    name="codeSystemVersion"
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
                    disabled={!formik.values.title || !canEdit}
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
                  disabled={!formik.values.title}
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
