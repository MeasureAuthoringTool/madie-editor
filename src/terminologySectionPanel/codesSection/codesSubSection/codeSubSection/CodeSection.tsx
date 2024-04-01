import React from "react";
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

export default function CodeSection({ handleFormSubmit }) {
  const formik = useFormik({
    initialValues: {
      codeSystem: "",
      codeSystemVersion: "",
      code: "",
    },
    validationSchema: CodeSubSectionSchemaValidator,
    onSubmit: (values) => {
      handleFormSubmit(values);
    },
  });

  const searchInputProps = {
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon />
      </InputAdornment>
    ),
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
              <span className="updated-date">03/12/2024</span>
            </div>
            <form onSubmit={formik.handleSubmit}>
              <div tw="flex md:flex-wrap">
                <div tw="w-1/3">
                  <Select
                    required="required"
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
                    onChange={formik.handleChange}
                    name="codeSystem"
                  />
                </div>
                <div tw="flex-grow pl-5">
                  <Select
                    required="required"
                    label="Code System Version"
                    id={"code-system-version-selector"}
                    inputProps={{
                      "data-testid": "code-system-version-selector-input",
                    }}
                    data-testid={"code-system-version-selector"}
                    SelectDisplayProps={{
                      "aria-required": "true",
                    }}
                    onChange={formik.handleChange}
                    name="codeSystemVersion"
                    disabled={!formik.values.codeSystem}
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
                  name="code"
                  disabled={!formik.values.codeSystem}
                />
              </div>

              <div tw="float-right">
                <Button
                  variant="outline"
                  data-testid="clear-codes-btn"
                  disabled={!formik.dirty}
                  tw="mr-4"
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  data-testid="codes-search-btn"
                  disabled={!(formik.isValid && formik.dirty)}
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
