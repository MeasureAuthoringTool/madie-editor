import React from "react";
import MultipleSelectDropDown from "./MultipleSelectDropDown";

const SelectSearchCategories = ({
  formikFieldProps,
  handleChange,
  options,
}) => {
  return (
    <div>
      <MultipleSelectDropDown
        formControl={formikFieldProps}
        {...formikFieldProps}
        id="search-by-category"
        label="Search By Category"
        required={false}
        disabled={false}
        onChange={handleChange}
        options={options}
        multipleSelect={true}
        limitTags={8}
      />
    </div>
  );
};
export default SelectSearchCategories;
