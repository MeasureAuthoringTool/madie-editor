import _styled, {
  default as _styled2,
  default as _styled3,
  default as _styled4,
  default as _styled5,
  default as _styled6,
  default as _styled7,
  default as _styled8,
  default as _styled9,
  default as _styled0,
} from "styled-components";
import React from "react";
import { MadieDialog, TextField } from "@madie/madie-design-system/dist/react";
import { Checkbox, FormControlLabel } from "@mui/material";
import { useFormik } from "formik";
import { SuffixSchemaValidator } from "../../../../validations/SuffixSchemaValidator";
import _ from "lodash";
import { getFhirCodeSystemVersion } from "../savedCodesSubSection/SavedCodesSubSection";
export default function EditCodeDetailsDialog({
  measureModel,
  selectedCodeDetails,
  onApplyCode,
  open,
  onClose,
}) {
  const formik = useFormik({
    initialValues: {
      suffix: selectedCodeDetails?.suffix || "",
      versionIncluded: selectedCodeDetails?.versionIncluded || false,
    },
    validationSchema: SuffixSchemaValidator,
    onSubmit: ({ suffix, versionIncluded }) => {
      const updatedCode = {
        ...selectedCodeDetails,
        display: selectedCodeDetails.display,
        suffix: suffix,
        versionIncluded: versionIncluded,
      };
      formik.resetForm();
      onApplyCode(updatedCode);
      onClose();
    },
    enableReinitialize: true,
  });
  return (
    <MadieDialog
      form={true}
      title={"Code Details"}
      dialogProps={{
        open,
        onClose: onClose,
        id: "edit-code-details-popup-dialog",
        onSubmit: formik.handleSubmit,
      }}
      cancelButtonProps={{
        cancelText: "Cancel",
        "data-testid": "cancel-button",
      }}
      continueButtonProps={{
        continueText: "Apply",
        "data-testid": "apply-button",
        disabled: Boolean(formik.errors.suffix),
      }}
    >
      <_StyledDiv>
        <_StyledDiv2>
          <_StyledDiv3 data-testid="code-info">
            <p className="result-label">Code</p>
            <span className="result-value">{selectedCodeDetails?.name}</span>
          </_StyledDiv3>

          <_StyledDiv4 data-testid="code-description-info">
            <p className="result-label">Code Description</p>
            <span className="result-value">{selectedCodeDetails?.display}</span>
          </_StyledDiv4>
        </_StyledDiv2>

        <_StyledDiv5>
          <_StyledDiv6 data-testid="code-system-info">
            <p className="result-label">Code System</p>
            <span className="result-value">
              {selectedCodeDetails?.codeSystem}
            </span>
          </_StyledDiv6>

          <_StyledDiv7 data-testid="code-system-version-info">
            <p className="result-label">Code System Version</p>
            <span className="result-value">
              {_.includes(measureModel, "QDM")
                ? selectedCodeDetails?.svsVersion
                : getFhirCodeSystemVersion(selectedCodeDetails?.fhirVersion)}
            </span>
          </_StyledDiv7>
        </_StyledDiv5>

        <_StyledDiv8>
          <_StyledDiv9>
            <TextField
              {...formik.getFieldProps("suffix")}
              placeholder="Suffix"
              label="Suffix(Max Length 4)"
              id="code-suffix"
              name="suffix"
              data-testid="code-suffix-field"
              inputProps={{
                "data-testid": "code-suffix-field-input",
                "aria-required": true,
              }}
              helperText={formik.errors["suffix"]}
              size="small"
              error={Boolean(formik.errors.suffix)}
              maxLength={4}
            />
          </_StyledDiv9>
          <_StyledDiv0>
            <FormControlLabel
              control={
                <Checkbox
                  sx={{
                    color: "#717171",
                  }}
                  name="versionIncluded"
                  id="include-code-system-version-checkbox"
                  data-testid="include-code-system-version-checkbox"
                  checked={formik.values.versionIncluded}
                  onChange={formik.handleChange}
                />
              }
              label="Include Code System Version"
              sx={{
                color: "#515151",
                textTransform: "none",
                fontFamily: "Rubik",
                marginTop: "6px",
              }}
            />
          </_StyledDiv0>
        </_StyledDiv8>
      </_StyledDiv>
    </MadieDialog>
  );
}
var _StyledDiv = _styled("div").withConfig({
  displayName: "EditCodeDetailsDialog___StyledDiv",
  componentId: "sc-nlvak4-0",
})({
  display: "flex",
  flexDirection: "column",
});
var _StyledDiv2 = _styled2("div").withConfig({
  displayName: "EditCodeDetailsDialog___StyledDiv2",
  componentId: "sc-nlvak4-1",
})({
  marginTop: "1rem",
  display: "flex",
});
var _StyledDiv3 = _styled3("div").withConfig({
  displayName: "EditCodeDetailsDialog___StyledDiv3",
  componentId: "sc-nlvak4-2",
})({
  width: "33.333333%",
});
var _StyledDiv4 = _styled4("div").withConfig({
  displayName: "EditCodeDetailsDialog___StyledDiv4",
  componentId: "sc-nlvak4-3",
})({
  flexGrow: "1",
  paddingLeft: "1.25rem",
});
var _StyledDiv5 = _styled5("div").withConfig({
  displayName: "EditCodeDetailsDialog___StyledDiv5",
  componentId: "sc-nlvak4-4",
})({
  marginTop: "1rem",
  display: "flex",
  "@media (min-width: 768px)": {
    flexWrap: "wrap",
  },
});
var _StyledDiv6 = _styled6("div").withConfig({
  displayName: "EditCodeDetailsDialog___StyledDiv6",
  componentId: "sc-nlvak4-5",
})({
  width: "33.333333%",
});
var _StyledDiv7 = _styled7("div").withConfig({
  displayName: "EditCodeDetailsDialog___StyledDiv7",
  componentId: "sc-nlvak4-6",
})({
  flexGrow: "1",
  paddingLeft: "1.25rem",
});
var _StyledDiv8 = _styled8("div").withConfig({
  displayName: "EditCodeDetailsDialog___StyledDiv8",
  componentId: "sc-nlvak4-7",
})({
  marginTop: "1rem",
  display: "flex",
  "@media (min-width: 768px)": {
    flexWrap: "wrap",
  },
});
var _StyledDiv9 = _styled9("div").withConfig({
  displayName: "EditCodeDetailsDialog___StyledDiv9",
  componentId: "sc-nlvak4-8",
})({
  width: "12rem",
});
var _StyledDiv0 = _styled0("div").withConfig({
  displayName: "EditCodeDetailsDialog___StyledDiv0",
  componentId: "sc-nlvak4-9",
})({
  marginTop: "0.5rem",
  flexGrow: "1",
  paddingLeft: "1.25rem",
});
