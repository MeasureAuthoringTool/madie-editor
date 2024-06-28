import React, { useMemo, useState, useEffect } from "react";

import tw from "twin.macro";
import "styled-components/macro";
import {
  Pagination,
  Popover,
  MadieDialog,
  TextField,
  Button,
} from "@madie/madie-design-system/dist/react";

import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import "./Results.scss";
import { useFormik } from "formik";
import { SuffixSchemaValidator } from "../../../validations/SuffixSchemaValidator";

import useTerminologyServiceApi, {
  ValueSetForSearch,
} from "../../../api/useTerminologyServiceApi";

import {
  Dialog,
  DialogTitle,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// given url:  2.16.840.1.113762.1.4.1200.105
// given url: http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1200.105
// convert to: http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1200.105
// https://cts.nlm.nih.gov/fhir/res/ValueSet?url=http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1200.105

const TH = tw.th`p-3 text-left text-sm font-bold capitalize`;

// easy lookup to interface label with value for the search fields
type TCRow = {
  title?: string; // we want the human friendly
  codeSystem?: string;
  steward?: string;
  oid?: string;
};

interface ResultsProps {
  resultValueSets: ValueSetForSearch[];
  handleApplyValueSet: Function;
}

export default function Results(props: ResultsProps) {
  const [selectedReferenceId, setSelectedReferenceId] = useState<string>(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [vsJson, setVsJson] = useState<String>("Loading");
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);

  let { resultValueSets, handleApplyValueSet } = props;
  const data = resultValueSets;

  const [openPopoverOptions, setOpenPopoverOptions] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);

  const [selectedValueSetDetails, setSelectedValueSetDetails] = useState(null);

  const handleOpen = async (selectedId, event) => {
    setOpenPopoverOptions(true);

    setSelectedReferenceId(table.getRow(selectedId).original.oid);

    setAnchorEl(event.currentTarget);
    setSelectedValueSetDetails(table.getRow(selectedId).original);
  };

  const handleClose = () => {
    setOpenPopoverOptions(false);
    setSelectedReferenceId(null);
    setAnchorEl(null);
  };

  const handleEditValueSetDetails = () => {
    setOpenPopoverOptions(false);
    setOpenEditDialog(true);
  };

  const toggleClose = () => {
    setOpenEditDialog(!openEditDialog);
    setSelectedValueSetDetails(null);
    resetForm();
  };

  const columns = useMemo<ColumnDef<TCRow>[]>(
    () => [
      {
        header: "Title",
        accessorKey: "title",
      },
      {
        header: "Steward",
        accessorKey: "steward",
      },
      {
        header: "OID",
        accessorKey: "oid",
      },
      {
        header: "Status",
        accessorKey: "status",
      },
      {
        header: "",
        accessorKey: "apply",
        cell: (row: any) => {
          return (
            <div className="inline-flex gap-x-2">
              <button
                className="action-button"
                onClick={(e) => {
                  handleOpen(row.cell.row.id, e);
                }}
                tw="text-blue-600 hover:text-blue-900"
                data-testid={`select-action-${row.cell.id}`}
                aria-label={`select-action-${row.cell.id}`}
              >
                <div className="action">Select</div>
                <div className="chevron-container">
                  <ExpandMoreIcon sx={{ color: "#0073c8" }} />
                </div>
              </button>
            </div>
          );
        },
      },
    ],
    []
  );
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const formik = useFormik({
    initialValues: {
      suffix: "",
    },
    validationSchema: SuffixSchemaValidator,
    onSubmit: (values) => {
      handleApplyValueSet({
        ...selectedValueSetDetails,
        suffix: values.suffix,
      });
      toggleClose();
    },
  });
  const { resetForm } = formik;
  const RetrieveValueSet = async (oid) => {
    const terminologyService = await useTerminologyServiceApi();
    const result = await terminologyService.getValueSet(oid, undefined, true);
    return JSON.stringify(result, null, 2);
  };

  const handleDetailsClick = async () => {
    setOpenPopoverOptions(false);
    //get teh OID number
    //urn:oid:2.16.840.1.113762.1.4.1099.53 -> 2.16.840.1.113762.1.4.1099.53
    const oid = selectedReferenceId.slice(8);
    const result: String = await RetrieveValueSet(oid);
    setVsJson(result);
    setDetailsOpen(true);
  };

  return (
    <div
      id="madie-editor-search-results"
      data-testid="madie-editor-search-results"
    >
      <div className="searc-results-container">
        <table
          tw="min-w-full"
          data-testid="value-sets-results-tbl"
          id="value-sets-results-tbl"
          style={{
            borderBottom: "solid 1px #8c8c8c",
          }}
        >
          <thead tw="bg-slate">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TH key={header.id} scope="col">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TH>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {!resultValueSets?.length ? (
              <tr>
                <td colSpan={columns.length} tw="text-center p-2">
                  No Results were found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} data-test-id={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} tw="p-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>

          <Popover
            optionsOpen={openPopoverOptions}
            anchorEl={anchorEl}
            handleClose={handleClose}
            canEdit={true}
            editViewSelectOptionProps={{
              key: 1,
              label: "Apply",
              toImplementFunction: () => {
                setOpenPopoverOptions(false);
                handleApplyValueSet(selectedValueSetDetails);
              },
              dataTestId: `apply-valueset-${selectedReferenceId}`,
            }}
            otherSelectOptionProps={[
              {
                key: 2,
                label: "Edit",
                toImplementFunction: () => {
                  handleEditValueSetDetails();
                },
                dataTestId: `edit-valueset-${selectedReferenceId}`,
              },
              {
                key: 3,
                label: "Details",
                dataTestId: `details-valueset-${selectedReferenceId}`,
                toImplementFunction: () => {
                  handleDetailsClick();
                },
              },
            ]}
          />
        </table>

        <Dialog
          fullWidth={true}
          maxWidth={"xl"}
          onClose={() => {
            setVsJson("Loading");
            setDetailsOpen(false);
          }}
          open={detailsOpen}
          data-testid="details-modal"
          sx={{
            "& .MuiDialog-container": {
              "& .MuiPaper-root": {
                backgroundColor: "white",
                width: "100%",
              },
            },
          }}
        >
          <AppBar position="static">
            <DialogTitle>Details</DialogTitle>
            <Toolbar sx={{ justifyContent: "space-between" }}>
              <div />
              <IconButton
                sx={{
                  "&:hover, &.Mui-focusVisible": { backgroundColor: "gray" },
                  backgroundColor: "black",
                  marginLeft: "auto",
                }}
                edge="start"
                color="inherit"
                onClick={() => setDetailsOpen(false)}
                aria-label="close"
              >
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          <div>
            <pre>{vsJson}</pre>
          </div>
        </Dialog>

        <MadieDialog
          form={true}
          title={"Edit"}
          dialogProps={{
            open: openEditDialog,
            onClose: toggleClose,
            id: "edit-value-set-suffix-popup-dialog",
            onSubmit: formik.handleSubmit,
          }}
          cancelButtonProps={{
            id: "cancelBtn",
            "data-testid": "apply-suffix-cancel-button",
            "aria-label": "apply suffix cancel button",
            variant: "outline",
            onClick: () => {
              toggleClose();
              resetForm();
            },
            cancelText: "Cancel",
          }}
          continueButtonProps={{
            continueText: "Apply",
            "aria-label": "apply suffix button",
            "data-testid": "apply-suffix-continue-button",
            disabled: !(formik.isValid && formik.dirty),
          }}
          children={
            <div tw="w-1/2">
              <TextField
                placeholder="Suffix"
                label="Suffix(Max Length 4)"
                id="suffix-max-length"
                inputProps={{
                  "data-testid": "suffix-max-length-input",
                  disabled: false,
                }}
                sx={{
                  borderRadius: "3px",
                  height: "auto",
                  border: "1px solid #8c8c8c",
                  marginTop: "8px",
                  "& .MuiInputBase-input": {
                    color: "#333",
                    fontFamily: "Rubik",
                    fontSize: 14,
                    borderRadius: "3px",
                    padding: "9px 14px",
                    "&::placeholder": {
                      opacity: 1,
                      color: "#717171",
                    },
                  },
                }}
                onChange={formik.handleChange}
                {...formik.getFieldProps("suffix")}
                data-testid="suffix-max-length-text-field"
                size="small"
                error={Boolean(formik.errors.suffix)}
                helperText={formik.errors.suffix}
              />
            </div>
          }
        />

        {resultValueSets?.length > 0 && (
          <div className="pagination-container">
            <Pagination
              totalItems={resultValueSets?.length || 0}
              limitOptions={[5, 10, 25, 50]}
              // to fill in later.
              // visibleItems={visibleItems}
              // offset={offset}
              // handlePageChange={handlePageChange}
              // handleLimitChange={handleLimitChange}
              // page={currentPage}
              // limit={currentLimit}
              // count={totalPages}
              // hideNextButton={!canGoNext}
              // hidePrevButton={!canGoPrev}
              shape="rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
}
