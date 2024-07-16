import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import AceEditor from "react-ace";
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

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import "./Results.scss";
import { useFormik } from "formik";
import { SuffixSchemaValidator } from "../../../validations/SuffixSchemaValidator";

import useTerminologyServiceApi, {
  ValueSetForSearch,
} from "../../../api/useTerminologyServiceApi";

import {
  AppBar,
  Dialog,
  DialogTitle,
  Divider,
  IconButton,
  Toolbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ValueSet } from "fhir/r4";

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
  resultBundle: string;
  filteredValueSets: ValueSetForSearch[]; //should be type casted to ValueSetForSearch but importing from test file json breaks
  handleApplyValueSet: Function;
}

export default function Results(props: ResultsProps) {
  const [selectedReferenceId, setSelectedReferenceId] = useState<string>(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [vsJson, setVsJson] = useState<string>("Loading");

  let { filteredValueSets, handleApplyValueSet } = props;
  // pagination lives here
  const [visibleFilteredValuesets, setVisibleFilteredValuesets] = useState<
    ValueSetForSearch[]
  >([]);
  const data = visibleFilteredValuesets;
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [visibleItems, setVisibleItems] = useState<number>(0);
  const [openPopoverOptions, setOpenPopoverOptions] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);
  const [currentLimit, setCurrentLimit] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);
  const [selectedValueSetDetails, setSelectedValueSetDetails] = useState(
    filteredValueSets[0]
  );
  const managePagination = useCallback(() => {
    if (filteredValueSets.length < currentLimit) {
      setOffset(0);
      setVisibleFilteredValuesets([...filteredValueSets]);
      setVisibleItems(filteredValueSets.length);
      setTotalItems(filteredValueSets.length);
      setTotalPages(1);
    } else {
      const start = (currentPage - 1) * currentLimit;
      const end = start + currentLimit;
      const newVisibleValueSets = [...filteredValueSets].slice(start, end);
      setVisibleFilteredValuesets(newVisibleValueSets);
      setOffset(start);
      setVisibleItems(newVisibleValueSets.length);
      setTotalItems(filteredValueSets.length);
      setTotalPages(Math.ceil(filteredValueSets.length / currentLimit));
    }
  }, [
    currentLimit,
    currentPage,
    filteredValueSets,
    setOffset,
    setVisibleFilteredValuesets,
    setVisibleItems,
    setTotalItems,
    setTotalPages,
  ]);

  const canGoNext = (() => {
    return currentPage < totalPages;
  })();
  const canGoPrev = currentPage > 1;

  const handlePageChange = (e, v) => {
    setCurrentPage(v);
  };
  const handleLimitChange = (e) => {
    setCurrentLimit(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    managePagination();
  }, [filteredValueSets, currentPage, currentLimit]);

  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const aceRef = useRef<AceEditor>(null);

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

  const getValueSetEntryFromBundle = (oid: string): ValueSet => {
    return JSON.parse(props?.resultBundle)?.entry?.find((entry) => {
      const valueSet: ValueSet = entry.resource as ValueSet;
      return valueSet.identifier[0].value === oid;
    }).resource as ValueSet;
  };

  const handleDetailsClick = async () => {
    setOpenPopoverOptions(false);
    console.error("findMe:" + props.resultBundle);
    const bundleEntry = getValueSetEntryFromBundle(selectedReferenceId);
    bundleEntry && setVsJson(JSON.stringify(bundleEntry, null, 2));
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
          <tbody data-testid="vs-results-table-body">
            {!visibleFilteredValuesets?.length ? (
              <tr>
                <td colSpan={columns.length} tw="text-center p-2">
                  No Results were found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} data-test-id={`row-${row.id}`}>
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
          <AppBar
            position="static"
            sx={{
              display: "flex",
              flexDirection: "row",
              alignContent: "center",
              padding: "32px",
              paddingBottom: "16px",
            }}
          >
            <DialogTitle
              sx={{
                fontFamily: "Rubik",
                fontSize: 24,
                padding: 0,
              }}
            >
              Details
            </DialogTitle>
            <Toolbar sx={{ justifyContent: "space-between" }}>
              <div />
              <div>
                <IconButton
                  aria-label="Close"
                  onClick={() => setDetailsOpen(false)}
                >
                  <CloseIcon
                    sx={{
                      color: "#D92F2F",
                    }}
                    data-testid="close-button"
                  />
                </IconButton>
              </div>
            </Toolbar>
          </AppBar>
          <Divider sx={{ borderColor: "#8c8c8c" }} />
          <div style={{ padding: "32px" }}>
            <AceEditor
              mode="sql"
              ref={aceRef}
              theme="monokai"
              value={vsJson}
              width="100%"
              wrapEnabled={true}
              readOnly={true}
              name="ace-editor-wrapper"
              enableBasicAutocompletion={true}
            />
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

        {filteredValueSets?.length > 0 && (
          <div className="pagination-container">
            <Pagination
              data-testid="vs-pagination"
              totalItems={totalItems}
              limitOptions={[5, 10, 25, 50]}
              // to fill in later.
              visibleItems={visibleItems}
              offset={offset}
              handlePageChange={handlePageChange}
              handleLimitChange={handleLimitChange}
              page={currentPage}
              limit={currentLimit}
              count={totalPages}
              hideNextButton={!canGoNext}
              hidePrevButton={!canGoPrev}
              shape="rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
}
