import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@material-ui/core/InputAdornment";
import { TextField } from "@madie/madie-design-system/dist/react";

interface FormikFieldProps {
  name: string;
  onChange: Function;
  value: string;
}

interface SearchFieldProps {
  fieldProps: FormikFieldProps;
  label: string;
  prefix: string;
  trimField?: Function;
  placeHolder?: string;
  disabled?: boolean;
}

const SearchField: React.FC<SearchFieldProps> = ({
  fieldProps,
  label,
  prefix,
  trimField,
  placeHolder = "",
  disabled = false,
}) => {
  const searchInputProps = {
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon />
      </InputAdornment>
    ),
  };
  const { name } = fieldProps;
  const ammendedLabel = `${prefix} ${label}`;
  return (
    <TextField
      required={false}
      disabled={disabled}
      {...fieldProps}
      id={fieldProps.name}
      label={ammendedLabel}
      placeholder={placeHolder}
      inputProps={{
        "data-testid": `${name}-text-input`,
      }}
      data-testid={`${name}-text`}
      InputProps={searchInputProps}
      onBlur={(e) => {
        trimField(name);
      }}
    />
  );
};

export default SearchField;
