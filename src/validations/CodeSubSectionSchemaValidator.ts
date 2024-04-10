import * as Yup from "yup";

export const CodeSubSectionSchemaValidator = Yup.object().shape({
  codeSystemName: Yup.string().required(),
  version: Yup.string().required(),
  code: Yup.string().required(),
});
