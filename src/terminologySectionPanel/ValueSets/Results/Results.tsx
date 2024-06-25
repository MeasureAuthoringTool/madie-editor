import React, { useMemo, useState } from "react";
import tw from "twin.macro";
import "styled-components/macro";
import {
  Pagination,
  Popover,
  MadieDialog,
  TextField,
} from "@madie/madie-design-system/dist/react";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ValueSetForSearch } from "../../../api/useTerminologyServiceApi";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import "./Results.scss";
import { useFormik } from "formik";
import { SuffixSchemaValidator } from "../../../validations/SuffixSchemaValidator";

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
  let { resultValueSets, handleApplyValueSet } = props;
  const data = resultValueSets;

  const [openPopoverOptions, setOpenPopoverOptions] = useState<boolean>(false);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReferenceId, setSelectedReferenceId] = useState<string>(null);
  const [selectedValueSetDetails, setSelectedValueSetDetails] = useState(null);

  const handleOpen = async (selectedId, event) => {
    setOpenPopoverOptions(true);
    setSelectedReferenceId(selectedId);
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

  const formikErrorHandler = (name: string) => {
    if (formik.touched[name] && formik.errors[name]) {
      return `${formik.errors[name]}`;
    }
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
                  <ExpandMoreIcon />
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
              label: "Apply",
              toImplementFunction: () => {
                setOpenPopoverOptions(false);
                handleApplyValueSet(selectedValueSetDetails);
              },
              dataTestId: `apply-valueset-${selectedReferenceId}`,
            }}
            otherSelectOptionProps={[
              {
                label: "Edit",
                toImplementFunction: () => {
                  handleEditValueSetDetails();
                },
                dataTestId: `edit-valueset-${selectedReferenceId}`,
              },
              {
                label: "Details",
                dataTestId: `details-valueset-${selectedReferenceId}`,
              },
            ]}
          />
        </table>

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
                error={formik.touched.suffix && Boolean(formik.errors.suffix)}
                helperText={formikErrorHandler("suffix")}
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
