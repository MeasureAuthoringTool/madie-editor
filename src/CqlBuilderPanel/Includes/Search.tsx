import React from "react";
import { Button } from "@madie/madie-design-system/dist/react";
import SearchField from "../../common/SearchField";
import { useFormik } from "formik";

export const Search = ({ canEdit }) => {
  const formik = useFormik({
    initialValues: {
      search: "",
    },
    enableReinitialize: true,
    onSubmit: (values) => {
      //   handleFormSubmit(values);
    },
  });
  const { resetForm } = formik;

  return (
    <form>
      <SearchField
        fieldProps={formik.getFieldProps("search")}
        label="Search"
        prefix="Library"
        disabled={!canEdit}
        trimField={() => {}}
        placeHolder="Search"
      />
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
          disabled={!(formik.isValid && formik.dirty)}
        >
          Search
        </Button>
      </div>
    </form>
  );
};

export default Search;
