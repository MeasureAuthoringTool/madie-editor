import * as Yup from "yup";

export const DefinitionSectionSchemaValidator = Yup.object().shape({
  definitionName: Yup.string().required("Definition Name is required"),
  comment: Yup.string(),
  name: Yup.string().required(),
  body: Yup.string(),
});
