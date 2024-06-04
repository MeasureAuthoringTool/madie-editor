import React, { useCallback, useEffect, useMemo, useState } from "react";
import TerminologySection from "../../../../common/TerminologySection";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import tw from "twin.macro";
import "styled-components/macro";
import {
  Pagination,
  MadieSpinner,
  Toast,
  MadieAlert,
  Popover,
  MadieDialog,
  MadieDeleteDialog,
} from "@madie/madie-design-system/dist/react";
import { CqlAntlr } from "@madie/cql-antlr-parser/dist/src";
import ToolTippedIcon from "../../../../toolTippedIcon/ToolTippedIcon";
import DoDisturbOutlinedIcon from "@mui/icons-material/DoDisturbOutlined";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useTerminologyServiceApi, {
  Code,
  CodeStatus,
} from "../../../../api/useTerminologyServiceApi";
import _ from "lodash";
import EditCodeDetailsDialogForm from "../common/EditCodeDetailsDialogForm";
import { getOidFromString } from "@madie/madie-util";

type SavedCodesColumnRow = {
  name: string;
  display: string;
  codeSystem: string;
  svsVersion: string;
};

type CodesList = {
  code: string;
  codeSystem: string;
  oid: string;
  suffix: string;
  version: string;
};

export type SelectedCodeDetails = SavedCodesColumnRow & {
  codeSystemOid?: string;
  isVersionIncluded?: boolean;
  status?: string;
  suffix?: string;
  fhirVersion?: string;
};

export default function SavedCodesSubSection({
  measureStoreCql,
  canEdit,
  cqlMetaData,
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
  const [optionsOpen, setOptionsOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReferenceId, setSelectedReferenceId] = useState<string>(null);
  const [selectedCodeDetails, setSelectedCodeDetails] =
    useState<SelectedCodeDetails>(null);
  const [parsedCodesList, setParsedCodesList] = useState<CodesList[]>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [deleteDialogModalOpen, setDeleteDialogModalOpen] =
    useState<boolean>(false);

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

  const handleOpen = async (
    selectedId,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setOptionsOpen(true);
    setSelectedReferenceId(selectedId);
    setAnchorEl(event.currentTarget);
    setSelectedCodeDetails(table.getRow(selectedId).original);
  };

  useEffect(() => {
    managePagination();
  }, [codes, currentPage, currentLimit]);

  //load codes when actual measure cql is changed
  useEffect(() => {
    if (measureStoreCql) {
      setLoading(true);
      const parsedCql = new CqlAntlr(measureStoreCql).parse();
      if (parsedCql.codes) {
        const codesList = parsedCql.codes.map((code) => {
          const matchedCodeSystem = parsedCql?.codeSystems.find(
            (codeSystem) =>
              codeSystem?.name?.replace(/['"]+/g, "") ===
              code?.codeSystem?.replace(/['"]+/g, "")
          );
          const parsedCode = code?.codeId.replace(/['"]+/g, "");
          const parsedCodeSystem = code?.codeSystem.replace(/['"]+/g, "");
          return {
            code: parsedCode,
            codeSystem: parsedCodeSystem,
            version: getCodeVersion(
              parsedCode,
              parsedCodeSystem,
              matchedCodeSystem?.oid,
              cqlMetaData?.codeSystemMap,
              matchedCodeSystem?.version
            ),
            oid: matchedCodeSystem?.oid,
            suffix: getCodeSystemSuffix(code?.codeSystem.replace(/['"]+/g, "")),
          };
        });
        setParsedCodesList(codesList);
        RetrieveCodeDetailsList(codesList);
      }
    }
  }, [measureStoreCql]);

  const getCodeVersion = (
    code,
    parsedCodeSystem,
    oid,
    codeSystemMap,
    matchedCodeSystemVersion
  ) => {
    if (codeSystemMap && !matchedCodeSystemVersion) {
      //if version is added through UI, then check inn the cql meta data
      if (code && oid && parsedCodeSystem) {
        const parsedOid = getOidFromString(oid, "QDM")?.replace("'", "");
        if (
          codeSystemMap[code] &&
          codeSystemMap[code]?.codeSystemOid === parsedOid &&
          codeSystemMap[code]?.codeSystem === parsedCodeSystem
        ) {
          return codeSystemMap[code]?.svsVersion;
        }
      }
    }
    // if version is added in the cql
    const version = matchedCodeSystemVersion?.replace(/['"]+/g, "");
    return version && version.split(":").pop();
  };

  const getCodeSystemSuffix = (codeSystemName: string) => {
    const pattern = /\((\d+)\)/;
    const match = codeSystemName.match(pattern);
    if (match) {
      return match[1];
    }
    return null;
  };

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

  const TH = tw.th`p-3 text-left text-sm font-bold capitalize`;
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
        accessorKey: "svsVersion",
      },
      {
        header: "",
        accessorKey: "apply",
        cell: (row: any) => (
          <div className="inline-flex gap-x-2">
            {canEdit ? (
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
            ) : (
              ""
            )}
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: visibleCodes,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const RetrieveCodeDetailsList = async (codesList) => {
    const terminologyService = await useTerminologyServiceApi();
    terminologyService
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

  const handleClose = () => {
    setOptionsOpen(false);
    setSelectedReferenceId(null);
    setAnchorEl(null);
  };

  const toggleOpen = () => {
    setOpen(!open);
  };

  const handleDialogEditCodeApply = () => {
    // eslint-disable-next-line no-console
    console.log("Code is edited an applied");
  };

  const handleEditCodeDetails = () => {
    setOptionsOpen(false);
    setOpen(true);
    const selectedAntlrParsedCode = parsedCodesList.filter(
      (code) => code.codeSystem === selectedCodeDetails.codeSystem
    )[0];
    setSelectedCodeDetails({
      ...selectedCodeDetails,
      suffix: selectedAntlrParsedCode?.suffix,
      isVersionIncluded: selectedAntlrParsedCode?.version ? true : false,
    });
  };

  const handleCodeDelete = () => {
    const data = {
      selectedCodeDetails: selectedCodeDetails,
      cql: measureStoreCql,
    };
    const event = new CustomEvent("deleteCode", {
      detail: {
        data,
        callback: () => {
          setDeleteDialogModalOpen(false);
        },
      },
    });
    window.dispatchEvent(event);
  };

  return (
    <div>
      <TerminologySection
        title="Saved Codes"
        children={
          <>
            {showCqlHasErrorsAlert && (
              <MadieAlert
                type="warning"
                content={
                  <div aria-live="polite" role="alert">
                    {
                      <div>
                        <div tw="font-medium">
                          Your Measure CQL contains errors. Due to that, your
                          saved codes table and CQL may not be consistent.
                        </div>
                      </div>
                    }
                  </div>
                }
                canClose={false}
              />
            )}

            <table
              tw="min-w-full"
              data-testid="saved-codes-tbl"
              style={{
                borderBottom: "solid 1px #8c8c8c",
                borderSpacing: "0 2em !important",
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
              <tbody data-testid="saved-codes-tbl-body">
                {!loading ? (
                  _.isEmpty(codes) ? (
                    <tr>
                      <td colSpan={columns.length} tw="text-center p-2">
                        No Results were found
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id} data-testid={`saved-code-row-${row.id}`}>
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} tw="p-2">
                            {cell.column.id === "status"
                              ? getCodeStatus(cell.getValue())
                              : flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )
                ) : (
                  <div data-testid="saved-codes-loading-spinner">
                    <MadieSpinner style={{ height: 50, width: 50 }} />
                  </div>
                )}
              </tbody>

              <Popover
                optionsOpen={optionsOpen}
                anchorEl={anchorEl}
                handleClose={handleClose}
                canEdit={true}
                editViewSelectOptionProps={{
                  label: "Remove",
                  toImplementFunction: () => {
                    setOptionsOpen(false);
                    setDeleteDialogModalOpen(true);
                  },
                  dataTestId: `remove-code-${selectedReferenceId}`,
                }}
                otherSelectOptionProps={[
                  {
                    label: "Edit",
                    toImplementFunction: () => {
                      handleEditCodeDetails();
                    },
                    dataTestId: `edit-code-${selectedReferenceId}`,
                  },
                ]}
              />
            </table>

            <MadieDialog
              form={true}
              title={"Code Details"}
              dialogProps={{
                open,
                onClose: toggleOpen,
                id: "edit-code-details-popup-dialog",
                onSubmit: handleDialogEditCodeApply,
              }}
              cancelButtonProps={{
                cancelText: "Cancel",
                "data-testid": "cancel-button",
              }}
              continueButtonProps={{
                continueText: "Apply",
                "data-testid": "apply-button",
                disabled: false,
              }}
              children={
                selectedCodeDetails && (
                  <EditCodeDetailsDialogForm
                    selectedCodeDetails={selectedCodeDetails}
                  />
                )
              }
            />
          </>
        }
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
          handleCodeDelete();
        }}
        onClose={() => {
          setDeleteDialogModalOpen(false);
        }}
        dialogTitle="Delete Code"
        name={`${selectedCodeDetails?.name} ${selectedCodeDetails?.display}`}
      />
    </div>
  );
}
