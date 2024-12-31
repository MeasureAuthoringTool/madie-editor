import * as Yup from "yup";

export const FunctionSectionSchemaValidator = Yup.object().shape({
  functionName: Yup.string()
    .matches(/^(?!\s+$)[a-zA-Z0-9_ ]+$/, "Function name is required")
    .required("Function name is required"),
  comment: Yup.string(),
  fluentFunction: Yup.boolean(),
  body: Yup.string(),
});
