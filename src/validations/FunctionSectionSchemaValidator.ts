import * as Yup from "yup";

export const FunctionSectionSchemaValidator = Yup.object().shape({
  functionName: Yup.string().required("Function name is required"),
  comment: Yup.string(),
  fluentFunction: Yup.boolean(),
  body: Yup.string(),
});
