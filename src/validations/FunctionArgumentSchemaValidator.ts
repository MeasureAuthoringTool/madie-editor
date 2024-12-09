import * as Yup from "yup";

export const FunctionArgumentSchemaValidator = Yup.object().shape({
  argumentName: Yup.string().matches(
    /^[a-zA-Z0-9_]*$/,
    "No spaces or special characters besides underscore are allowed"
  ),
  dataType: Yup.string(),
  other: Yup.string(),
});
