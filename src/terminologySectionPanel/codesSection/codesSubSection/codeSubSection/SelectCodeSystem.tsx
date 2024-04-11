import React from "react";
import MultipleSelectDropDown from "../../../ValueSets/Search/MultipleSelectDropDown";

const SelectCodeSystem = ({ formikFieldProps, handleChange, options }) => {
  return (
    <div>
      <MultipleSelectDropDown
        id="search-by-category"
        label="Search By Category"
        placeHolder={{ name: "", value: "" }}
        required={false}
        disabled={false}
        disableCloseOnSelect={false}
        {...formikFieldProps}
        onChange={handleChange}
        options={options}
        multipleSelect={true}
        limitTags={8}
      />
    </div>
  );
};
export default SelectCodeSystem;
