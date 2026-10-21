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
      <div className="me:flex me:flex-col">
        <div className="me:flex me:mt-4">
          <div data-testid="code-info" className="me:w-1/3">
            <p className="result-label">Code</p>
            <span className="result-value">{selectedCodeDetails?.name}</span>
          </div>

          <div data-testid="code-description-info" className="me:grow me:pl-5">
            <p className="result-label">Code Description</p>
            <span className="result-value">{selectedCodeDetails?.display}</span>
          </div>
        </div>

        <div className="me:flex me:md:flex-wrap me:mt-4">
          <div data-testid="code-system-info" className="me:w-1/3">
            <p className="result-label">Code System</p>
            <span className="result-value">
              {selectedCodeDetails?.codeSystem}
            </span>
          </div>

          <div
            data-testid="code-system-version-info"
            className="me:grow me:pl-5"
          >
            <p className="result-label">Code System Version</p>
            <span className="result-value">
              {_.includes(measureModel, "QDM")
                ? selectedCodeDetails?.svsVersion
                : getFhirCodeSystemVersion(selectedCodeDetails?.fhirVersion)}
            </span>
          </div>
        </div>

        <div className="me:flex me:md:flex-wrap me:mt-4">
          <div className="me:w-48">
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
          </div>
          <div className="me:grow me:pl-5 me:mt-2">
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
          </div>
        </div>
      </div>
    </MadieDialog>
  );
}
