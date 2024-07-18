import React from "react";
import { MadieDialog, TextField } from "@madie/madie-design-system/dist/react";
import { Checkbox, FormControlLabel } from "@mui/material";
import tw from "twin.macro";
import "styled-components/macro";
import { useFormik } from "formik";
import { SuffixSchemaValidator } from "../../../../validations/SuffixSchemaValidator";

export default function EditCodeDetailsDialog({
  selectedCodeDetails,
  onApplyCode,
  open,
  onClose,
}) {
  const formik = useFormik({
    initialValues: {
      suffix: selectedCodeDetails?.suffix,
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
      <div tw="flex flex-col">
        <div tw="flex mt-4">
          <div tw="w-1/3" data-testid="code-info">
            <p className="result-label">Code</p>
            <span className="result-value">{selectedCodeDetails?.name}</span>
          </div>

          <div tw="flex-grow pl-5" data-testid="code-description-info">
            <p className="result-label">Code Description</p>
            <span className="result-value">{selectedCodeDetails?.display}</span>
          </div>
        </div>

        <div tw="flex md:flex-wrap mt-4">
          <div tw="w-1/3" data-testid="code-system-info">
            <p className="result-label">Code System</p>
            <span className="result-value">
              {selectedCodeDetails?.codeSystem}
            </span>
          </div>

          <div tw="flex-grow pl-5" data-testid="code-system-version-info">
            <p className="result-label">Code System Version</p>
            <span className="result-value">
              {selectedCodeDetails?.svsVersion}
            </span>
          </div>
        </div>

        <div tw="flex md:flex-wrap mt-4">
          <div tw="w-48">
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
            />
          </div>
          <div tw="flex-grow pl-5 mt-2">
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
