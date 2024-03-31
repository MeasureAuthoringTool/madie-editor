import * as Yup from "yup";

export const CodeSubSectionSchemaValidator = Yup.object().shape({
  codeSystem: Yup.string().required(),
  codeSystemVersion: Yup.string().required(),
  code: Yup.string().required(),
});
