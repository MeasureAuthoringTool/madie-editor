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
} from "@madie/madie-design-system/dist/react";
import { CqlAntlr } from "@madie/cql-antlr-parser/dist/src";
import ToolTippedIcon from "../../../../toolTippedIcon/ToolTippedIcon";
import DoDisturbOutlinedIcon from "@mui/icons-material/DoDisturbOutlined";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import useTerminologyServiceApi, {
  Code,
  CodeStatus,
} from "../../../../api/useTerminologyServiceApi";
import _ from "lodash";

export default function SavedCodesSubSection({ editorValue }) {
  type TCRow = {
    name: string;
    display: string;
    codeSystem: string;
    version: string;
  };

  const [data, setData] = useState<Code[]>();
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const onToastClose = () => {
    setToastMessage("");
    setToastOpen(false);
  };
  const [loading, setLoading] = useState<boolean>(false);

  //currently we are using random data numbers
  // TODO: integrate with actual data
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(5);
  const [visibleItems, setVisibleItems] = useState<number>(0);

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
    setCurrentPage(0);
  };

  useEffect(() => {
    managePagination();
  }, [currentPage, currentLimit]);

  const managePagination = useCallback(() => {
    if (totalItems < currentLimit) {
      setOffset(0);
      setVisibleItems(totalItems);
      setTotalItems(totalItems);
      setTotalPages(1);
    } else {
      const start = (currentPage - 1) * currentLimit;
      setOffset(start);
      setVisibleItems(currentLimit);
      setTotalItems(totalItems);
      setTotalPages(Math.ceil(totalItems / currentLimit));
    }
  }, [
    currentLimit,
    currentPage,
    setOffset,
    setVisibleItems,
    setTotalItems,
    setTotalPages,
  ]);

  const TH = tw.th`p-3 text-left text-sm font-bold capitalize`;
  const columns = useMemo<ColumnDef<TCRow>[]>(
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
        accessorKey: "version",
      },
      {
        header: "",
        accessorKey: "apply",
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    if (editorValue) {
      setLoading(true);
      const parsedCql = new CqlAntlr(editorValue).parse();
      if (parsedCql.codes) {
        const codesList = parsedCql.codes.map((code) => {
          const { codeId, codeSystem } = code;
          return {
            code: codeId.replace(/['"]+/g, ""),
            codeSystem: codeSystem.replace(/['"]+/g, ""),
            version: "",
          };
        });
        RetrieveCodeDetailsList(codesList);
      }
    }
  }, [editorValue]);

  const RetrieveCodeDetailsList = async (codesList) => {
    const terminologyService = await useTerminologyServiceApi();
    terminologyService
      .getCodeDetailsList(codesList)
      .then((response) => {
        setData(response.data.filter((code) => code !== null));
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        if (error.response?.status === 404) {
          setData(undefined);
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
    if (status == CodeStatus.ACTIVE) {
      return (
        <ToolTippedIcon tooltipMessage="This code is active in this code system version">
          <CheckCircleIcon color="success" />
        </ToolTippedIcon>
      );
    }
    if (status == CodeStatus.INACTIVE) {
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

  return (
    <div>
      <TerminologySection
        title="Saved Codes"
        children={
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
            <tbody>
              {!loading ? (
                _.isEmpty(data) ? (
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
                <div>
                  <MadieSpinner style={{ height: 50, width: 50 }} />
                </div>
              )}
            </tbody>
          </table>
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
    </div>
  );
}
