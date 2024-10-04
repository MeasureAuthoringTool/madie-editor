import React, { useRef } from "react";
import tw from "twin.macro";
import "styled-components/macro";
import { MenuItem } from "@mui/material";
import {
  MadieDialog,
  TextField,
  Select,
} from "@madie/madie-design-system/dist/react";
import AceEditor from "react-ace";
import { useFormik } from "formik";
import { EditLibraryDetailsSchemaValidator } from "../../validations/EditLibraryDetailsSchemaValidator";

export interface SelectedLibrary {
  id: string;
  name: string;
  version: string;
  librarySetId?: string;
  owner?: string;
  otherVersions?: string[];
  cql?: string;
  alias?: string;
}
interface PropTypes {
  library: SelectedLibrary;
  open: boolean;
  canEdit: boolean;
  setOpenLibraryDialog: Function;
  onVersionChange: Function;
  onApply: Function;
  onEdit?: Function;
  operation?: string;
}

const ReadOnlyLabelValue = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <>
      <p className="result-label">{label}</p>
      <span className="result-value">{value ? value : "-"}</span>
    </>
  );
};

const CqlLibraryDetailsDialog = ({
  library,
  open,
  canEdit,
  setOpenLibraryDialog,
  onVersionChange,
  onApply,
  onEdit,
  operation,
}: PropTypes) => {
  const aceRef = useRef<AceEditor>(null);

  const formik = useFormik({
    initialValues: {
      libraryAlias: library?.alias || "",
      version: library?.version,
    },
    validationSchema: EditLibraryDetailsSchemaValidator,
    onSubmit: ({ version, libraryAlias }) => {
      if (operation === "edit") {
        onEdit(library, {
          name: library.name,
          version: version,
          alias: libraryAlias,
        });
      } else {
        onApply({
          name: library.name,
          version: version,
          alias: libraryAlias,
        });
      }
      formik.resetForm();
      setOpenLibraryDialog(false);
    },
    enableReinitialize: true,
  });

  const handleVersionChange = (selectedVersion) => {
    onVersionChange(selectedVersion, library.librarySetId);
  };

  const handleClose = () => {
    formik.setErrors({});
    formik.resetForm();
    setOpenLibraryDialog(false);
  };

  const getLibraryAliasView = () => {
    if (canEdit) {
      return (
        <TextField
          {...formik.getFieldProps("libraryAlias")}
          label="Library Alias"
          id="library-alias"
          name="libraryAlias"
          data-testid="library-alias"
          inputProps={{
            "data-testid": "library-alias-input",
            "aria-required": true,
          }}
          required={true}
          size="small"
          onBlur={() =>
            formik.setFieldValue(
              "libraryAlias",
              formik.values["libraryAlias"].trim()
            )
          }
          disabled={!canEdit}
          error={Boolean(formik.errors.libraryAlias)}
          helperText={formik.errors.libraryAlias}
        />
      );
    } else {
      return <ReadOnlyLabelValue label="Alias" value={library?.alias} />;
    }
  };

  const getLibraryVersionView = () => {
    if (canEdit) {
      return (
        <Select
          {...formik.getFieldProps("version")}
          required
          label="Version"
          id="version-select"
          data-testid="version-select"
          inputProps={{ "data-testid": "version-select-input" }}
          name="version"
          disabled={!canEdit}
          SelectDisplayProps={{
            "aria-required": "true",
          }}
          size="small"
          onChange={(evt) => handleVersionChange(evt.target.value)}
          options={library?.otherVersions?.map((version) => {
            return (
              <MenuItem
                key={version}
                value={version}
                data-testid={`option-${version}`}
              >
                {version}
              </MenuItem>
            );
          })}
        />
      );
    } else {
      return <ReadOnlyLabelValue label="Version" value={library?.version} />;
    }
  };

  return (
    <MadieDialog
      form={true}
      title="Details"
      dialogProps={{
        open,
        onClose: handleClose,
        onSubmit: formik.handleSubmit,
        fullWidth: true,
        maxWidth: "md",
        "data-testid": "view-apply-library-dialog",
      }}
      cancelButtonProps={{
        cancelText: "Cancel",
        variant: "outline-filled",
        "data-testid": "cancel-button",
      }}
      continueButtonProps={
        canEdit
          ? {
              type: "submit",
              continueText: "Apply",
              disabled: !canEdit || !(formik.isValid && formik.dirty),
              "data-testid": "apply-button",
            }
          : ""
      }
    >
      <div tw="flex flex-row">
        <div tw="basis-1/4 -my-1">{getLibraryAliasView()}</div>
        <div tw="flex-1 ml-5" data-testid="library-name">
          <p className="result-label">Library Name</p>
          <span className="result-value">{library?.name}</span>
        </div>
        <div tw="flex-1 ml-5 -my-1">{getLibraryVersionView()}</div>
        <div tw="flex-1 ml-5" data-testid="library-owner">
          <ReadOnlyLabelValue label="Owner" value={library?.owner} />
        </div>
      </div>
      <br />
      <div>
        <AceEditor
          mode="sql"
          ref={aceRef}
          theme="monokai"
          value={library?.cql}
          width="100%"
          wrapEnabled={true}
          readOnly={true}
          name="cql-editor-dialog-wrapper"
        />
      </div>
    </MadieDialog>
  );
};

export default CqlLibraryDetailsDialog;
