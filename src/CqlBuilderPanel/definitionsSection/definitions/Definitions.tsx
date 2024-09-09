import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import tw from "twin.macro";
import "styled-components/macro";
import { Pagination } from "@madie/madie-design-system/dist/react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import ToolTippedIcon from "../../../toolTippedIcon/ToolTippedIcon";
import { Definition } from "../DefinitionsSection";

const TH = tw.th`p-3 text-left text-sm font-bold capitalize`;
const TD = tw.td`p-3 text-left text-sm break-all`;

const Definitions = ({ definitions }: { definitions: string[] }) => {
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [visibleItems, setVisibleItems] = useState<number>(0);
  const [visibleDefinitions, setVisibleDefinitions] = useState<Definition[]>(
    []
  );

  const allRowDefinitions = definitions?.map((definition) => {
    return {
      name: definition,
      comment: "",
    } as Definition;
  });

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
  }, [definitions, currentPage, currentLimit]);

  // table data
  const data = visibleDefinitions?.map((definition) => {
    return {
      name: definition.name,
      comment: definition.comment,
    } as unknown as Definition;
  });

  const columns = useMemo<ColumnDef<Definition>[]>(
    () => [
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Comment",
        accessorKey: "comment",
      },
      {
        header: "",
        accessorKey: "apply",
        cell: (row: any) => {
          return (
            <>
              <ToolTippedIcon
                tooltipMessage="Delete"
                buttonProps={{
                  "data-testid": `delete-button-${row.cell.row.id}`,
                  "aria-label": `delete-button-${row.cell.row.id}`,
                  size: "small",
                  onClick: () => {}, // do nothing for now
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
                  onClick: () => {},
                }}
              >
                <BorderColorOutlinedIcon color="primary" />
              </ToolTippedIcon>
            </>
          );
        },
      },
    ],
    [definitions]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const managePagination = useCallback(() => {
    if (allRowDefinitions?.length > 0) {
      setTotalItems(definitions.length);
      if (definitions.length < currentLimit) {
        setOffset(0);
        setVisibleDefinitions(allRowDefinitions && [...allRowDefinitions]);
        setVisibleItems(definitions?.length);
        setTotalPages(1);
      } else {
        const start = (currentPage - 1) * currentLimit;
        const end = start + currentLimit;
        const newVisibleCodes = [...allRowDefinitions].slice(start, end);
        setOffset(start);
        setVisibleDefinitions(newVisibleCodes);
        setVisibleItems(newVisibleCodes?.length);
        setTotalPages(Math.ceil(definitions?.length / currentLimit));
      }
    }
  }, [
    currentLimit,
    currentPage,
    definitions,
    setOffset,
    setVisibleDefinitions,
    setVisibleItems,
    setTotalItems,
    setTotalPages,
  ]);

  return (
    <>
      <table
        tw="min-w-full"
        data-testid="definitions-tbl"
        id="definitions-tbl"
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
        <tbody data-testid="definitions-table-body">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} data-testid={`definitions-row-${row.id}`}>
              {row.getVisibleCells().map((cell) => (
                <TD key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TD>
              ))}
            </tr>
          ))}
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

export default Definitions;
