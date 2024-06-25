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
      isVersionIncluded: Boolean(selectedCodeDetails?.isVersionIncluded),
    },
    validationSchema: SuffixSchemaValidator,
    onSubmit: ({ suffix, isVersionIncluded }) => {
      const updatedCode = {
        ...selectedCodeDetails,
        display: selectedCodeDetails.display,
        suffix: suffix,
        isVersionIncluded: isVersionIncluded,
      };
      formik.resetForm();
      onApplyCode(updatedCode);
      onClose();
    },
    enableReinitialize: true,
  });

  const formikErrorHandler = (name: string) => {
    if (formik.touched[name] && formik.errors[name]) {
      return `${formik.errors[name]}`;
    }
  };

  const getCodeSystemName = (codeDetails) => {
    if (codeDetails?.codeSystem && codeDetails.suffix) {
      const codeSystemWithSuffix =
        codeDetails.codeSystem.match(/^(.*?)\s*\(\d+\)$/);
      if (codeSystemWithSuffix) {
        return codeSystemWithSuffix[1].trim();
      }
    }
    return codeDetails?.codeSystem;
  };

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
        disabled: formik.touched.suffix && Boolean(formik.errors.suffix),
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
              {getCodeSystemName(selectedCodeDetails)}
            </span>
          </div>

          <div tw="flex-grow pl-5" data-testid="code-system-version-info">
            <p className="result-label">Code System Version</p>
            <span className="result-value">
              {selectedCodeDetails?.svsVersion
                ? selectedCodeDetails.svsVersion
                : selectedCodeDetails?.version}
            </span>
          </div>
        </div>

        <div tw="flex md:flex-wrap mt-4">
          <div tw="w-48">
            <TextField
              placeholder="Suffix"
              label="Suffix(Max Length 4)"
              id="code-suffix"
              name="suffix"
              data-testid="code-suffix-field"
              inputProps={{
                "data-testid": "code-suffix-field-input",
                "aria-required": true,
              }}
              helperText={formikErrorHandler("suffix")}
              size="small"
              error={formik.touched.suffix && Boolean(formik.errors.suffix)}
              {...formik.getFieldProps("suffix")}
            />
          </div>
          <div tw="flex-grow pl-5 mt-2">
            <FormControlLabel
              control={
                <Checkbox
                  sx={{
                    color: "#717171",
                  }}
                  name="isVersionIncluded"
                  id="include-code-system-version-checkbox"
                  data-testid="include-code-system-version-checkbox"
                  checked={formik.values.isVersionIncluded}
                />
              }
              label="Include Code System Version"
              sx={{
                color: "#515151",
                textTransform: "none",
                fontFamily: "Rubik",
                marginTop: "6px",
              }}
              {...formik.getFieldProps("includeCodeSystemVersion")}
            />
          </div>
        </div>
      </div>
    </MadieDialog>
  );
}
