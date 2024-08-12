import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import tw from "twin.macro";
import "styled-components/macro";
import { CqlLibrary } from "../../api/useCqlLibraryServiceApi";
import { Pagination } from "@madie/madie-design-system/dist/react";

type PropTypes = {
  cqlLibraries: Array<CqlLibrary>;
};

type RowDef = {
  name?: string; // we want the human friendly
  version?: string;
  owner?: string;
};

const TH = tw.th`p-3 text-left text-sm font-bold capitalize`;

const Results = ({ cqlLibraries }: PropTypes) => {
  const [visibleLibraries, setVisibleLibraries] = useState<CqlLibrary[]>([]);
  // pagination utilities
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [visibleItems, setVisibleItems] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);
  const [currentLimit, setCurrentLimit] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const managePagination = useCallback(() => {
    if (cqlLibraries.length < currentLimit) {
      setOffset(0);
      setVisibleLibraries([...cqlLibraries]);
      setVisibleItems(cqlLibraries.length);
      setTotalItems(cqlLibraries.length);
      setTotalPages(1);
    } else {
      const start = (currentPage - 1) * currentLimit;
      const end = start + currentLimit;
      const newVisibleLibraries = [...cqlLibraries].slice(start, end);
      setVisibleLibraries(newVisibleLibraries);
      setOffset(start);
      setVisibleItems(newVisibleLibraries.length);
      setTotalItems(cqlLibraries.length);
      setTotalPages(Math.ceil(cqlLibraries.length / currentLimit));
    }
  }, [
    currentLimit,
    currentPage,
    cqlLibraries,
    setOffset,
    setVisibleLibraries,
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
  }, [cqlLibraries, currentPage, currentLimit]);

  const data = visibleLibraries.map((library) => {
    return {
      name: library.cqlLibraryName,
      version: library.version,
      owner: library.librarySet.owner,
    };
  });

  const columns = useMemo<ColumnDef<RowDef>[]>(
    () => [
      {
        header: "name",
        accessorKey: "name",
      },
      {
        header: "version",
        accessorKey: "version",
      },
      {
        header: "owner",
        accessorKey: "owner",
      },
      {
        header: "Action",
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
  return (
    <>
      <div className="search-results-container">
        <table
          tw="min-w-full"
          data-testid="library-results-tbl"
          id="library-results-tbl"
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
          <tbody data-testid="library-results-table-body">
            {cqlLibraries?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} data-test-id={`row-${row.id}`}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} tw="text-center p-2">
                  No Results were found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {cqlLibraries?.length > 0 && (
          <div className="pagination-container">
            <Pagination
              data-testid="library-search-pagination"
              totalItems={totalItems}
              limitOptions={[5, 10, 25, 50]}
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
    </>
  );
};

export default Results;
