import * as Yup from "yup";

export const DefinitionSectionSchemaValidator = Yup.object().shape({
  name: Yup.string().required(),
  comment: Yup.string(),
  body: Yup.string(),
});
