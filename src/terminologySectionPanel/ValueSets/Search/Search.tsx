import React, { useState } from "react";
import ControlledAutoComplete from "../../../common/ControlledAutoComplete";
import { useFormik } from "formik";
import SearchField from "../../../common/SearchField";
import { Button } from "@madie/madie-design-system/dist/react";

// human readable label & formik value / query param key
export const SEARCH_CATEGORIES = [
  { label: "Code", value: "code" },
  {
    label: "Definition Version",
    value: "version",
    disabledText: "OID/URL must be selected first.",
  },
  { label: "Description", value: "description" },
  { label: "Keyword", value: "keyword" },
  { label: "Name", value: "name" },
  { label: "OID/URL", value: "url" },
  { label: "Status", value: "status" },
  { label: "Title", value: "title" },
];

// given url:  2.16.840.1.113762.1.4.1200.105
// given url: http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1200.105
// convert to: http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1200.105
// https://cts.nlm.nih.gov/fhir/res/ValueSet?url=http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1200.105

// easy lookup to interface label with value for the search fields
const SEARCH_MAP = {};
SEARCH_CATEGORIES.forEach((obj) => {
  SEARCH_MAP[obj.value] = obj.label;
});

interface SearchProps {
  canEdit: boolean;
  handleSearch: Function;
}
export default function Search(props: SearchProps) {
  const { canEdit, handleSearch } = props;

  const formik = useFormik({
    initialValues: {
      // available categories user as selected,
      searchCategories: [],
      /*
        These will be the query param placeholder variables to associate for our umls call search.
        endpoint documentation
        https://www.hl7.org/fhir/ValueSet-operation-expand.html
        https://confluence.cms.gov/display/MAT/VSAC+FHIR+Terminology+Service+UAT#VSACFHIRTerminologyServiceUAT-Test2:ValueSetExpansion
      */
      code: "",
      version: "",
      description: "",
      keyword: "",
      name: "",
      url: "",
      status: "",
      title: "",
    },
    enableReinitialize: true,
    onSubmit: async (values) => await handleSearch(values),
  });

  // check if any keys are dirty aside from searchCategories.
  const isDirty = (() => {
    for (const { value } of SEARCH_CATEGORIES) {
      if (formik.values[value]) {
        return true;
      }
    }
    return false;
  })();
  const { resetForm } = formik;

  // We need to break the selected categories into two's in order to render them as half widths in rows.
  const groupedRows = [];
  for (let i = 0; i < formik.values.searchCategories.length; i += 2) {
    groupedRows.push(formik.values.searchCategories.slice(i, i + 2));
  }

  // given a list of selected value not to mutate,
  // { label, value}
  const formBlanker = (values) => {
    const saveMap = {};
    values.forEach(({ value }) => {
      saveMap[value] = true;
    });

    SEARCH_CATEGORIES.forEach(({ value }) => {
      // blank the value if it exists and it is still a search category
      if (!saveMap[value] && formik.values[value]) {
        formik.setFieldValue(value, "");
      }
    });
  };

  return (
    <form
      id="madie-editor-search"
      data-testid="madie-editor-search"
      onSubmit={formik.handleSubmit}
    >
      <ControlledAutoComplete
        formControl={formik.getFieldProps("searchCategories")}
        onClose={undefined}
        {...formik.getFieldProps("searchCategories")}
        onChange={(_event: any, selectedVal: string | null, reason) => {
          if (reason === "removeOption") {
            formBlanker(selectedVal);
          }
          if (reason === "clear") {
            formBlanker([]);
          }
          formik.setFieldValue("searchCategories", selectedVal);
        }}
        id="search-by-category"
        label="Search By Category"
        required={false}
        disabled={!canEdit}
        options={SEARCH_CATEGORIES}
        getOptionDisabled={(option) => {
          if (option.value === "version") {
            return formik.values.url === "";
          }
          return false;
        }}
        multipleSelect={true}
        limitTags={8}
      />
      <div className="search-container">
        {groupedRows.map((group, index) => (
          // each row
          <div key={index} className="search-row">
            {/* Each row touple, what about odd cases? We need logic to conditionally Add an empty div for formatting */}
            {group.map(({ value }, index, a) => {
              if (a.length === 1) {
                return (
                  <>
                    <SearchField
                      fieldProps={formik.getFieldProps(value)}
                      prefix="Search"
                      label={SEARCH_MAP[value]}
                    />
                    <div style={{ width: "100%" }} />
                  </>
                );
              }
              return (
                <SearchField
                  fieldProps={formik.getFieldProps(value)}
                  prefix="Search"
                  label={SEARCH_MAP[value]}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="row-end">
        <Button
          variant="outline"
          data-testid="clear-valuesets-btn"
          disabled={!formik.dirty}
          onClick={resetForm}
        >
          Clear
        </Button>
        <Button
          type="submit"
          data-testid="valuesets-search-btn"
          disabled={!isDirty}
        >
          Search
        </Button>
      </div>
    </form>
  );
}
