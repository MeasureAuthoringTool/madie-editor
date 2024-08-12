import React from "react";
import { Button } from "@madie/madie-design-system/dist/react";
import SearchField from "../../common/SearchField";
import { useFormik } from "formik";

export const Search = ({ canEdit, onSearch, onClear }) => {
  const formik = useFormik({
    initialValues: {
      searchTerm: "",
    },
    enableReinitialize: true,
    onSubmit: async (form) => {
      onSearch(form.searchTerm);
    },
    onReset: () => onClear(),
  });
  const { resetForm } = formik;

  return (
    <form onSubmit={formik.handleSubmit}>
      <SearchField
        fieldProps={formik.getFieldProps("searchTerm")}
        label="Search"
        prefix="Library"
        disabled={!canEdit}
        trimField={() => {}}
        placeHolder="Search"
      />
      <div className="row-end">
        <Button
          variant="outline"
          data-testid="clear-btn"
          disabled={!formik.dirty}
          onClick={resetForm}
        >
          Clear
        </Button>
        <Button
          type="submit"
          data-testid="search-btn"
          disabled={!(formik.isValid && formik.dirty)}
        >
          Search
        </Button>
      </div>
    </form>
  );
};

export default Search;
