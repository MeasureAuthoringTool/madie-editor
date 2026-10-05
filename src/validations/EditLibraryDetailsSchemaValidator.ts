import * as Yup from "yup";

export const EditLibraryDetailsSchemaValidator = Yup.object().shape({
  libraryAlias: Yup.string()
    .required("Library Alias is required")
    .matches(
      /^[a-zA-Z0-9]*$/,
      "Library Alias must not contain spaces or other special characters"
    ),
  version: Yup.string().required(),
});
