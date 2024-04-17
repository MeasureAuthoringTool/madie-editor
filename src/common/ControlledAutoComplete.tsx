import React from "react";
import { FormControl, Autocomplete, Checkbox } from "@mui/material";
import PropTypes from "prop-types";
import { TextField } from "@madie/madie-design-system/dist/react/";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

export const autoCompleteStyles = {
  borderRadius: "3px",
  height: "auto",
  "& .MuiOutlinedInput-notchedOutline": {
    borderRadius: "3px",
    "& legend": {
      width: 0,
    },
  },
  "& .MuiAutocomplete-inputFocused": {
    border: "none",
    boxShadow: "none",
    outline: "none",
  },
  "& .MuiAutocomplete-inputRoot": {
    paddingTop: 1,
    paddingBottom: 1,
  },
  "& input::placeholder": {
    fontSize: "14px",
  },
  "& .Mui-disabled": {
    backgroundColor: "#EDEDED",
    border: "#EDEDED",
  },
  "& .MuiChip-deleteIcon": {
    color: "#757575 !important",
  },
  width: "100%",
};

const ControlledAutoComplete = ({
  id,
  label,
  placeHolder = "",
  defaultValue = undefined,
  required = false,
  disabled = false,
  error = false,
  helperText = undefined,
  options,
  multipleSelect = true,
  limitTags = 8,
  onClose,
  ...rest
}) => {
  const requiredLabelReadable = <span className="sr-only">required</span>;
  const labelReadable = required ? (
    <span>
      {label} {requiredLabelReadable}
    </span>
  ) : (
    label
  );
  return (
    <FormControl error={error} fullWidth>
      <div
        style={{
          width: 1,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      />
      <Autocomplete
        aria-required
        size="small"
        limitTags={8}
        multiple={multipleSelect}
        sx={autoCompleteStyles}
        disablePortal
        id={id}
        onClose={onClose}
        defaultValue={defaultValue}
        disabled={disabled}
        data-testid={`${id}-dropdown`}
        options={options}
        getOptionLabel={(option) => {
          return option.label;
        }}
        renderOption={(props: any, option, { selected }) => {
          const uniqueProps = {
            ...props,
            key: `${props.key}_${props.id}`,
          };
          return (
            <li
              {...uniqueProps}
              aria-label={`option ${option.label} ${
                selected ? "selected" : "not selected"
              }`}
            >
              <Checkbox
                icon={icon}
                checkedIcon={checkedIcon}
                style={{ marginRight: 8 }}
                checked={selected}
              />
              {option.label}
            </li>
          );
        }}
        renderInput={(params) => {
          const { inputProps } = params;
          inputProps["aria-required"] = required;

          return (
            <TextField
              label={labelReadable}
              placeholder={placeHolder}
              error={error}
              {...params}
              required={required}
              helperText={helperText}
            />
          );
        }}
        {...rest}
      />
    </FormControl>
  );
};

ControlledAutoComplete.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  placeHolder: PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.any,
  }),
  defaultValue: PropTypes.any,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.string),
  multipleSelect: PropTypes.bool,
  limitTags: PropTypes.number,
};

export default ControlledAutoComplete;
