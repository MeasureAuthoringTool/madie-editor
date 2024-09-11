import * as Yup from "yup";

export const EditLibraryDetailsSchemaValidator = Yup.object().shape({
  libraryAlias: Yup.string().required(),
  version: Yup.string().required(),
});
