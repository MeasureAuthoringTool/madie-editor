import _styled from "styled-components";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Pagination,
  MadieSpinner,
  Toast,
  MadieAlert,
  MadieDeleteDialog,
  MadieDiscardDialog,
} from "@madie/madie-design-system/dist/react";
import { CqlCode, CqlCodeSystem } from "@madie/cql-antlr-parser/dist/src";
import ToolTippedIcon from "../../../../toolTippedIcon/ToolTippedIcon";
import DoDisturbOutlinedIcon from "@mui/icons-material/DoDisturbOutlined";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import useTerminologyServiceApi, {
  Code,
} from "../../../../api/useTerminologyServiceApi";
import _ from "lodash";
import EditCodeDetailsDialog from "../common/EditCodeDetailsDialog";

const _StyledDiv = _styled("div").withConfig({
  displayName: "SavedCodesSubSection___StyledDiv",
  componentId: "sc-obv2i0-1",
})({
  fontWeight: "500",
});
const _StyledTable = _styled("table").withConfig({
  displayName: "SavedCodesSubSection___StyledTable",
  componentId: "sc-obv2i0-2",
})({
  minWidth: "100%",
});
const _StyledThead = _styled("thead").withConfig({
  displayName: "SavedCodesSubSection___StyledThead",
  componentId: "sc-obv2i0-3",
})({
  "--tw-bg-opacity": "1",
  backgroundColor: "rgb(237 237 237 / var(--tw-bg-opacity, 1))",
});
const _StyledTd = _styled("td").withConfig({
  displayName: "SavedCodesSubSection___StyledTd",
  componentId: "sc-obv2i0-4",
})({
  padding: "0.5rem",
  textAlign: "center",
});
const _StyledTd2 = _styled("td").withConfig({
  displayName: "SavedCodesSubSection___StyledTd2",
  componentId: "sc-obv2i0-5",
})({
  padding: "0.5rem",
});

type SavedCodesColumnRow = {
  name: string;
  display: string;
  codeSystem: string;
  svsVersion: string;
};
export type CodesList = {
  code: string;
  codeSystem: string;
  oid: string;
  suffix: string;
  version: string;
  versionIncluded: boolean;
};
export type SelectedCodeDetails = SavedCodesColumnRow & {
  codeSystemOid?: string;
  versionIncluded?: boolean;
  status?: string;
  suffix?: string;
  fhirVersion?: string;
};
export const getFhirCodeSystemVersion = (codeSystemVersion) => {
  if (_.startsWith(codeSystemVersion, "http://snomed.info")) {
    return _.last(_.split(codeSystemVersion, "/"));
  }
  return codeSystemVersion;
};
export const getCodeSystemVersion = (codeSystem: CqlCodeSystem) => {
  if (codeSystem.version) {
    const version = codeSystem.version.replace(/['"]+/g, "");
    return version && version.split("urn:hl7:version:").pop();
  }
  return null;
};
export const getCodeSuffix = (code: CqlCode) => {
  const name = code?.name.replace(/['"]+/g, "");
  const pattern = /\((\d+)\)/;
  const match = name.match(pattern);
  if (match) {
    return match[1];
  }
  return null;
};
export default function SavedCodesSubSection({
  measureStoreCql,
  measureModel,
  canEdit,
  handleApplyCode,
  handleCodeDelete,
  setEditorVal,
  setIsCQLUnchanged,
  isCQLUnchanged,
  parsedCodesList,
  hasCqlError,
}) {
  const [codes, setCodes] = useState<Code[]>();
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [showCqlHasErrorsAlert, setShowCqlHasErrorsAlert] =
    useState<boolean>(false);
  const onToastClose = () => {
    setToastMessage("");
    setToastOpen(false);
  };
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCodeDetails, setSelectedCodeDetails] =
    useState<SelectedCodeDetails>(null);
  const [openEditCodeDialog, setOpenEditCodeDialog] = useState<boolean>(false);
  const [deleteDialogModalOpen, setDeleteDialogModalOpen] =
    useState<boolean>(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState<boolean>(false);

  //currently we are using random data numbers
  // TODO: integrate with actual data
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [visibleItems, setVisibleItems] = useState<number>(0);
  const [visibleCodes, setVisibleCodes] = useState<Code[]>([]);
  const [offset, setOffset] = useState<number>(0);
  const [currentLimit, setCurrentLimit] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const canGoPrev = currentPage > 1;
  const canGoNext = (() => {
    return currentPage < totalPages;
  })();
  const handlePageChange = (e, v) => {
    setCurrentPage(v);
  };
  const handleLimitChange = (e) => {
    setCurrentLimit(e.target.value);
    setCurrentPage(1);
  };
  useEffect(() => {
    managePagination();
  }, [codes, currentPage, currentLimit]);

  //load codes when actual measure cql is changed
  useEffect(() => {
    if (measureStoreCql && parsedCodesList?.length > 0 && !hasCqlError) {
      RetrieveCodeDetailsList(parsedCodesList);
    }
  }, [measureStoreCql]);
  const managePagination = useCallback(() => {
    if (codes?.length > 0) {
      if (totalItems < currentLimit) {
        setOffset(0);
        setVisibleCodes(codes && [...codes]);
        setVisibleItems(codes?.length);
        setTotalItems(codes?.length);
        setTotalPages(1);
      } else {
        const start = (currentPage - 1) * currentLimit;
        const end = start + currentLimit;
        const newVisibleCodes = [...codes].slice(start, end);
        setOffset(start);
        setVisibleCodes(newVisibleCodes);
        setVisibleItems(newVisibleCodes?.length);
        setTotalItems(codes?.length);
        setTotalPages(Math.ceil(codes?.length / currentLimit));
      }
    }
  }, [
    currentLimit,
    currentPage,
    codes,
    setOffset,
    setVisibleCodes,
    setVisibleItems,
    setTotalItems,
    setTotalPages,
  ]);
  const TH = _styled.th.withConfig({
    displayName: "SavedCodesSubSection__TH",
    componentId: "sc-obv2i0-0",
  })({
    padding: "0.75rem",
    textAlign: "left",
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: "700",
    textTransform: "capitalize",
  });
  const columns = useMemo<ColumnDef<SavedCodesColumnRow>[]>(
    () => [
      {
        header: "",
        accessorKey: "status",
      },
      {
        header: "Code",
        accessorKey: "name",
      },
      {
        header: "Description",
        accessorKey: "display",
      },
      {
        header: "Code System",
        accessorKey: "codeSystem",
      },
      {
        header: "System Version",
        accessorKey: measureModel?.includes("QDM")
          ? "svsVersion"
          : "fhirVersion",
      },
      {
        header: "",
        accessorKey: "apply",
        cell: (row: any) => (
          <div
            className="inline-flex gap-x-2"
            style={{
              width: "max-content",
            }}
          >
            {canEdit ? (
              <>
                <ToolTippedIcon
                  tooltipMessage="Delete"
                  buttonProps={{
                    "data-testid": `delete-code-${row.cell.row.id}`,
                    "aria-label": `delete-code-${row.cell.row.id}`,
                    size: "small",
                    onClick: (e) => {
                      setSelectedCodeDetails(
                        table.getRow(row.cell.row.id).original
                      );
                      if (!isCQLUnchanged) {
                        setDiscardDialogOpen(true);
                      } else {
                        setDeleteDialogModalOpen(true);
                      }
                    },
                  }}
                >
                  <DeleteOutlineIcon color="error" />
                </ToolTippedIcon>
                <ToolTippedIcon
                  tooltipMessage="Edit"
                  buttonProps={{
                    "data-testid": `edit-code-${row.cell.row.id}`,
                    "aria-label": `edit-code-${row.cell.row.id}`,
                    size: "small",
                    onClick: (e) => {
                      const selectedCode = table.getRow(
                        row.cell.row.id
                      ).original;
                      setSelectedCodeDetails(selectedCode);
                      handleEditCode(selectedCode);
                    },
                  }}
                >
                  <BorderColorOutlinedIcon color="primary" />
                </ToolTippedIcon>
              </>
            ) : (
              ""
            )}
          </div>
        ),
      },
    ],
    [canEdit, isCQLUnchanged, measureModel]
  );
  const table = useReactTable({
    data: visibleCodes,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const terminologyService = useRef(useTerminologyServiceApi());
  const RetrieveCodeDetailsList = async (codesList) => {
    terminologyService.current
      .getCodesAndCodeSystems(codesList)
      .then((response) => {
        setCodes(
          response?.data?.filter((code) => {
            if (code === null) {
              setShowCqlHasErrorsAlert(true);
              return false;
            }
            return true;
          })
        );
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        if (error.response?.status === 404) {
          setCodes(undefined);
        } else {
          console.error(error);
          setToastMessage(
            "An issue occurred while retrieving the code from VSAC. Please try again. If the issue continues, please contact helpdesk."
          );
          setToastOpen(true);
        }
      });
  };
  const getCodeStatus = (status) => {
    if (status == "ACTIVE") {
      return (
        <ToolTippedIcon tooltipMessage="This code is active in this code system version">
          <CheckCircleIcon color="success" />
        </ToolTippedIcon>
      );
    }
    if (status == "INACTIVE") {
      return (
        <ToolTippedIcon tooltipMessage="This code is inactive in this code system version">
          <DoDisturbOutlinedIcon />
        </ToolTippedIcon>
      );
    }
    return (
      <ToolTippedIcon tooltipMessage="Code status unavailable">
        <DoNotDisturbOnIcon />
      </ToolTippedIcon>
    );
  };
  const toggleEditCodeDialogState = () => {
    setOpenEditCodeDialog(!open);
  };
  const handleEditCode = (selectedCode) => {
    setOpenEditCodeDialog(true);
    const parsedCode = parsedCodesList.find(
      (parsedCode) => parsedCode.code === selectedCode.name
    );
    setSelectedCodeDetails({
      ...selectedCode,
      suffix: parsedCode?.suffix,
      versionIncluded: parsedCode?.versionIncluded,
    });
  };
  return (
    <div>
      {showCqlHasErrorsAlert && (
        <MadieAlert
          type="warning"
          content={
            <div aria-live="polite" role="alert">
              {
                <div>
                  <_StyledDiv>
                    Your Measure CQL contains errors. Due to that, your saved
                    codes table and CQL may not be consistent.
                  </_StyledDiv>
                </div>
              }
            </div>
          }
          canClose={false}
        />
      )}

      <_StyledTable
        data-testid="saved-codes-tbl"
        style={{
          borderBottom: "solid 1px #8c8c8c",
          borderSpacing: "0 2em !important",
        }}
      >
        <_StyledThead
          style={{
            borderBottom: "solid 1px #8c8c8c",
          }}
        >
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
        </_StyledThead>
        <tbody data-testid="saved-codes-tbl-body">
          {!loading ? (
            _.isEmpty(codes) ? (
              <tr>
                <_StyledTd colSpan={columns.length}>
                  No Results were found
                </_StyledTd>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} data-testid={`saved-code-row-${row.id}`}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <_StyledTd2 key={cell.id}>
                        {cell.column.id === "status"
                          ? getCodeStatus(cell.getValue())
                          : cell.column.id === "fhirVersion"
                          ? getFhirCodeSystemVersion(cell.getValue())
                          : flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                      </_StyledTd2>
                    );
                  })}
                </tr>
              ))
            )
          ) : (
            <div data-testid="saved-codes-loading-spinner">
              <MadieSpinner
                style={{
                  height: 50,
                  width: 50,
                }}
              />
            </div>
          )}
        </tbody>
      </_StyledTable>

      <EditCodeDetailsDialog
        measureModel={measureModel}
        selectedCodeDetails={selectedCodeDetails}
        onApplyCode={handleApplyCode}
        open={openEditCodeDialog}
        onClose={toggleEditCodeDialogState}
      />
      <Toast
        toastKey="fetch-code-toast"
        toastType={"danger"}
        testId="fetch-code-error-message"
        open={toastOpen}
        message={toastMessage}
        onClose={onToastClose}
        autoHideDuration={8000}
      />
      <div className="pagination-container">
        <Pagination
          totalItems={totalItems}
          visibleItems={visibleItems}
          limitOptions={[5, 10, 25, 50]}
          offset={offset}
          handlePageChange={handlePageChange}
          handleLimitChange={handleLimitChange}
          page={currentPage}
          limit={currentLimit}
          count={totalPages}
          shape="rounded"
          hideNextButton={!canGoNext}
          hidePrevButton={!canGoPrev}
        />
      </div>

      <MadieDeleteDialog
        open={deleteDialogModalOpen}
        onContinue={() => {
          handleCodeDelete(selectedCodeDetails, measureModel);
        }}
        onClose={() => {
          setDeleteDialogModalOpen(false);
        }}
        dialogTitle="Delete Code"
        name={`${selectedCodeDetails?.name} ${selectedCodeDetails?.display}`}
      />

      <MadieDiscardDialog
        open={discardDialogOpen}
        onContinue={() => {
          setEditorVal(measureStoreCql || "");
          setIsCQLUnchanged(true);
          setDiscardDialogOpen(false);
          setDeleteDialogModalOpen(true);
        }}
        onClose={() => setDiscardDialogOpen(false)}
      />
    </div>
  );
}
