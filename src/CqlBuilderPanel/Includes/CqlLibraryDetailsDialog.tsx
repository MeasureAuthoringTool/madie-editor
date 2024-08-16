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
import { SuffixSchemaValidator } from "../../validations/SuffixSchemaValidator";

export interface SelectedLibrary {
  id: string;
  librarySetId: string;
  name: string;
  version: string;
  owner: string;
  otherVersions: string[];
  cql: string;
}
interface PropTypes {
  library: SelectedLibrary;
  open: boolean;
  onClose: Function;
  onVersionChange: Function;
}
const CqlLibraryDetailsDialog = ({
  library,
  open,
  onClose,
  onVersionChange,
}: PropTypes) => {
  const aceRef = useRef<AceEditor>(null);

  const formik = useFormik({
    initialValues: {
      libraryAlias: "",
      version: library?.version,
    },
    validationSchema: SuffixSchemaValidator,
    onSubmit: () => {},
    enableReinitialize: true,
  });

  const handleVersionChange = (selectedVersion) => {
    formik.setFieldValue("version", selectedVersion);
    onVersionChange(selectedVersion, library.librarySetId);
  };

  return (
    <MadieDialog
      form={true}
      title={"Details"}
      dialogProps={{
        open,
        onClose: onClose,
        id: "view-apply-library-dialog",
        fullWidth: true,
        maxWidth: "md",
      }}
      cancelButtonProps={{
        cancelText: "Cancel",
        "data-testid": "cancel-button",
      }}
      continueButtonProps={{
        continueText: "Apply",
        "data-testid": "apply-button",
        disabled: true,
      }}
    >
      <div tw="flex flex-row">
        <div tw="basis-1/3 -my-1" data-testid="library-name">
          <TextField
            {...formik.getFieldProps("libraryAlias")}
            placeholder="Library Alias"
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
          />
        </div>
        <div tw="flex-1 ml-5" data-testid="library-name">
          <p className="result-label">Library Name</p>
          <span className="result-value">{library?.name}</span>
        </div>
        <div tw="flex-1 ml-5" data-testid="library-version">
          <Select
            {...formik.getFieldProps("version")}
            placeHolder={{ name: "Version", value: "" }}
            required
            label="Version"
            id="version-select"
            data-testid="version-select"
            inputProps={{ "data-testid": "version-select-input" }}
            name="version"
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
        </div>
        <div tw="flex-1 ml-5" data-testid="library-owner">
          <p className="result-label">Owner</p>
          <span className="result-value">{library?.owner}</span>
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
