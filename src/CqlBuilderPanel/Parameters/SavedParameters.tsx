import React, { useCallback, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import tw from "twin.macro";
import "styled-components/macro";
import { Pagination } from "@madie/madie-design-system/dist/react";
import Skeleton from "@mui/material/Skeleton";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import ToolTippedIcon from "../../toolTippedIcon/ToolTippedIcon";
import { Lookup } from "../../model/CqlBuilderLookup";
import { Stack } from "@mui/material";
import { ParametersProps } from "./Parameters";

const TH = tw.th`p-3 text-left text-sm font-bold capitalize`;
const TD = tw.td`p-3 text-left text-sm break-all`;

const SavedParameters = ({
  canEdit,
  parameters,
  isCQLUnchanged,
  cql,
  setEditorValue,
  handleParameterEdit,
  handleParameterDelete,
  resetCql,
  loading,
}: ParametersProps) => {
  const [selectedParameter, setSelectedParameter] = useState<Lookup>();

  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [visibleItems, setVisibleItems] = useState<number>(0);
  const [visibleParameters, setVisibleParameters] = useState<Lookup[]>([]);

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
  }, [parameters, currentPage, currentLimit]);

  // table data
  const data = visibleParameters;

  const columns = useMemo<ColumnDef<Lookup>[]>(
    () => [
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "",
        accessorKey: "apply",
        cell: (row: any) => {
          if (!canEdit) {
            return null;
          }
          return (
            <Stack
              direction="row"
              alignItems="center"
              data-testid="parameters-actions"
            >
              <ToolTippedIcon
                tooltipMessage="Delete"
                buttonProps={{
                  "data-testid": `delete-button-${row.cell.row.id}`,
                  "aria-label": `delete-button-${row.cell.row.id}`,
                  size: "small",
                  onClick: (e) => {
                    setSelectedParameter(row.row.original.name);
                  },
                }}
              >
                <DeleteOutlineIcon color="error" />
              </ToolTippedIcon>
              <ToolTippedIcon
                tooltipMessage="Edit"
                buttonProps={{
                  "data-testid": `edit-button-${row.cell.row.id}`,
                  "aria-label": `edit-button-${row.cell.row.id}`,
                  size: "small",
                  onClick: (e) => {},
                }}
              >
                <BorderColorOutlinedIcon color="primary" />
              </ToolTippedIcon>
            </Stack>
          );
        },
      },
    ],
    [parameters]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const managePagination = useCallback(() => {
    if (parameters?.length > 0) {
      setTotalItems(parameters.length);
      if (parameters.length < currentLimit) {
        setOffset(0);
        setVisibleParameters(parameters && [...parameters]);
        setVisibleItems(parameters?.length);
        setTotalPages(1);
      } else {
        const start = (currentPage - 1) * currentLimit;
        const end = start + currentLimit;
        const newVisibleCodes = [...parameters].slice(start, end);
        setOffset(start);
        setVisibleParameters(newVisibleCodes);
        setVisibleItems(newVisibleCodes?.length);
        setTotalPages(Math.ceil(parameters?.length / currentLimit));
      }
    }
  }, [
    currentLimit,
    currentPage,
    parameters,
    setOffset,
    setVisibleParameters,
    setVisibleItems,
    setTotalItems,
    setTotalPages,
  ]);

  return (
    <>
      <table
        tw="min-w-full"
        data-testid="parameters-tbl"
        id="parameters-tbl"
        style={{
          borderBottom: "solid 1px #8c8c8c",
        }}
      >
        <thead tw="bg-slate">
          {table.getHeaderGroups()?.map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers?.map((header) => (
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
        <tbody data-testid="parameters-table-body">
          {!loading &&
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} data-testid={`parameters-row-${row.id}`}>
                {row.getVisibleCells().map((cell) => (
                  <TD key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TD>
                ))}
              </tr>
            ))}
          {loading && (
            <div>
              <Skeleton animation="wave" width="100%" height={45} />
              <Skeleton animation="wave" width="100%" height={45} />
              <Skeleton animation="wave" width="100%" height={45} />
            </div>
          )}
        </tbody>
      </table>
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
    </>
  );
};

export default SavedParameters;
