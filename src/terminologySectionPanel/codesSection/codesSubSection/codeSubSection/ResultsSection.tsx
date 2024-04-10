import React, { useMemo } from "react";
import tw from "twin.macro";
import "styled-components/macro";
import TerminologySection from "../../../../common/TerminologySection";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Code } from "../../../../api/useTerminologyServiceApi";

type ResultSectionProps = {
  showResultsTable: boolean;
  setShowResultsTable: any;
  code: Code;
};

type TCRow = {
  name: string;
  display: string;
  codeSystem: string;
  version: string;
};
const TH = tw.th`p-3 text-left text-sm font-bold capitalize`;

export default function ResultsSection({
  showResultsTable,
  setShowResultsTable,
  code,
}: ResultSectionProps) {
  const data = [code];
  const columns = useMemo<ColumnDef<TCRow>[]>(
    () => [
      {
        header: "",
        accessorKey: "active/inactive",
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

  return (
    <div>
      <TerminologySection
        title="Results"
        showHeaderContent={showResultsTable}
        setShowHeaderContent={setShowResultsTable}
        children={
          <table
            tw="min-w-full"
            data-testid="codes-results-tbl"
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
              {!code ? (
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
          </table>
        }
      />
    </div>
  );
}
