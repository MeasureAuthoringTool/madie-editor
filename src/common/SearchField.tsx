import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@material-ui/core/InputAdornment";
import { TextField } from "@madie/madie-design-system/dist/react";

interface FormikFieldProps {
  name: string;
  onBlur: Function;
  onChange: Function;
  value: string;
}

interface SearchFieldProps {
  fieldProps: FormikFieldProps;
  label: string;
  prefix: string;
}

const SearchField: React.FC<SearchFieldProps> = ({
  fieldProps,
  label,
  prefix,
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
      {...fieldProps}
      id={fieldProps.name}
      label={ammendedLabel}
      inputProps={{
        "data-testid": `${name}-text-input`,
      }}
      data-testid={`${name}-text`}
      InputProps={searchInputProps}
      disabled={false}
    />
  );
};

export default SearchField;
