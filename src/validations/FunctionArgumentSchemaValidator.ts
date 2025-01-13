import * as Yup from "yup";

export const FunctionArgumentSchemaValidator = Yup.object().shape({
  argumentName: Yup.string()
    .matches(
      /^(?!\s+$)[a-zA-Z0-9_ ]+$/,
      "No spaces or special characters besides underscore are allowed"
    )
    .test("argumentName", "Argument Name is required", function (value) {
      const { dataType } = this.parent;
      if (
        dataType &&
        dataType.trim() !== "" &&
        (!value || value.trim() === "")
      ) {
        return false;
      }
      return true;
    }),
  dataType: Yup.string().test(
    "dataType",
    "Data Type is required",
    function (value) {
      const { argumentName } = this.parent;
      if (
        argumentName &&
        argumentName.trim() !== "" &&
        (!value || value.trim() === "")
      ) {
        return false;
      }
      return true;
    }
  ),
  other: Yup.string().when("dataType", {
    is: (value: any) => value === "Other",
    then: (schema) =>
      schema.required("Other is required when dataType is Other."),
    otherwise: (schema) => schema,
  }),
});
