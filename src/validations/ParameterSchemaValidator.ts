import * as Yup from "yup";

export const ParameterSchemaValidator = Yup.object().shape({
  parameterName: Yup.string()
    .required("Parameter name is required")
    .matches(
      /^[a-zA-Z0-9\s]*$/,
      "Only alphanumeric characters and spaces are allowed"
    ),
  version: Yup.string().required(),
});
