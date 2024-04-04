import React, { useMemo, useState } from "react";
import tw from "twin.macro";
import "styled-components/macro";
import TerminologySection from "../../../../common/TerminologySection";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";

export default function ResultsSection({
  showResultsTable,
  setShowResultsTable,
}) {
  type TCRow = {
    code: string;
    description: string;
    codeSystem: string;
    systemVersion: string;
  };

  const [data, setData] = useState<TCRow[]>([]);

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
        title="Results"
        showHeaderContent={showResultsTable}
        setShowHeaderContent={setShowResultsTable}
        children={
          <table
            tw="min-w-full"
            data-testid="codes-results-tbl"
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
    </div>
  );
}
