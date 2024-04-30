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
import { Pagination } from "@madie/madie-design-system/dist/react";

export default function SavedCodesSubSection() {
  type TCRow = {
    code: string;
    description: string;
    codeSystem: string;
    systemVersion: string;
  };

  const [data, setData] = useState<TCRow[]>([]);

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
        accessorKey: "active/inactive",
      },
      {
        header: "Code",
        accessorKey: "code",
      },
      {
        header: "Description",
        accessorKey: "description",
      },
      {
        header: "Code System",
        accessorKey: "codeSystem",
      },
      {
        header: "System Version",
        accessorKey: "systemVersion",
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
          </table>
        }
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
