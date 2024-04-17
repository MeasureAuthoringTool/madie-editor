import React from "react";
import ControlledAutoComplete from "../../../common/ControlledAutoComplete";
import { useFormik } from "formik";
import { Button } from "@madie/madie-design-system/dist/react";
import SearchField from "../../../common/SearchField";

export const FILTER_CATEGORIES = [
  { label: "Author", value: "author" },
  { label: "Composed of", value: "composedOf" },
  { label: "Definition Version", value: "definitionVersion" },
  { label: "Effective Date", value: "effectiveDate" },
  { label: "Last Review Date", value: "lastReviewDate" },
  { label: "Last Updated", value: "lastUpdated" },
  { label: "OID/URL", value: "oid" },
  { label: "Publisher", value: "publisher" },
  { label: "Purpose", value: "purpose" },
  { label: "Status", value: "status" },
  { label: "Title", value: "title" },
];
const FILTER_MAP = {};
FILTER_CATEGORIES.forEach((obj) => {
  FILTER_MAP[obj.value] = obj.label;
});
const Filter = (props) => {
  const { canEdit } = props;
  const handleFilter = () => {};

  const formik = useFormik({
    initialValues: {
      filterCategories: [],

      author: "",
      composedOf: "",
      definitionVersion: "",
      effectiveDate: "",
      lastReviewDate: "",
      lastUpdated: "",
      oid: "",
      publisher: "",
      purpose: "",
      status: "",
      title: "",
    },
    enableReinitialize: true,
    onSubmit: async (values) => await handleFilter(),
  });

  const isDirty = (() => {
    for (const { value } of FILTER_CATEGORIES) {
      if (formik.values[value]) {
        return true;
      }
    }
    return false;
  })();
  const { resetForm } = formik;

  const groupedRows = [];
  for (let i = 0; i < formik.values.filterCategories.length; i += 2) {
    groupedRows.push(formik.values.filterCategories.slice(i, i + 2));
  }

  // given a list of selected value not to mutate,
  // { label, value}
  const formBlanker = (values) => {
    const saveMap = {};
    values.forEach(({ value }) => {
      saveMap[value] = true;
    });

    FILTER_CATEGORIES.forEach(({ value }) => {
      // blank the value if it exists and it is still a search category
      if (!saveMap[value] && formik.values[value]) {
        formik.setFieldValue(value, "");
      }
    });
  };

  return (
    <form
      id="madie-editor-filter"
      data-testid="madie-editor-filter"
      onSubmit={formik.handleSubmit}
    >
      <ControlledAutoComplete
        formControl={formik.getFieldProps("filterCategories")}
        onClose={undefined}
        {...formik.getFieldProps("filterCategories")}
        onChange={(_event: any, selectedVal: string | null, reason) => {
          if (reason === "removeOption") {
            formBlanker(selectedVal);
          }
          formik.setFieldValue("filterCategories", selectedVal);
        }}
        id="filter-by-category"
        label="Filter By Category"
        required={false}
        disabled={!canEdit}
        options={FILTER_CATEGORIES}
        multipleSelect={true}
        limitTags={12}
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
                      prefix="Filter by"
                      label={FILTER_MAP[value]}
                    />
                    <div style={{ width: "100%" }} />
                  </>
                );
              }
              return (
                <SearchField
                  fieldProps={formik.getFieldProps(value)}
                  prefix="Filter by"
                  label={FILTER_MAP[value]}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="row-end">
        <Button
          variant="outline"
          data-testid="clear-filters-btn"
          disabled={!formik.dirty}
          onClick={resetForm}
        >
          Clear
        </Button>
        <Button
          type="submit"
          data-testid="valuesets-filter-btn"
          disabled={!isDirty}
        >
          Apply
        </Button>
      </div>
    </form>
  );
};
export default Filter;
