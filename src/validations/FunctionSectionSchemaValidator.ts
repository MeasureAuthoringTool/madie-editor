import * as Yup from "yup";

export const FunctionSectionSchemaValidator = Yup.object().shape({
  functionName: Yup.string()
    .required("Function name is required")
    .matches(/^[a-zA-Z0-9]*$/, "No spaces or special characters are allowed"),
  comment: Yup.string(),
  fluentFunction: Yup.boolean(),
  body: Yup.string(),
});
