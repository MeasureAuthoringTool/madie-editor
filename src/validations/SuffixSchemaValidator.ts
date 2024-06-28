import * as Yup from "yup";

export const SuffixSchemaValidator = Yup.object().shape({
  suffix: Yup.string()
    .nullable()
    .matches(/^\d+$/, "Suffix must be numeric")
    .max(4, "Suffix length must be 4 digits or less"),
});
