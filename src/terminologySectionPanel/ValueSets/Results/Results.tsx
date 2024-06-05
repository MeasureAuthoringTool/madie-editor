import React, { useMemo } from "react";
import tw from "twin.macro";
import "styled-components/macro";
import { Button, Pagination } from "@madie/madie-design-system/dist/react";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ValueSetForSearch } from "../../../api/useTerminologyServiceApi";
import ExpandMore from "@mui/icons-material/ExpandMore";
import "./Results.scss";

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
  resultValueSets: ValueSetForSearch[];
  handleApplyValueSet: Function;
}
export default function Results(props: ResultsProps) {
  let { resultValueSets, handleApplyValueSet } = props;

  const data = resultValueSets;
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
            <div>
              <Button
                variant="outline"
                className="apply-button"
                data-testid={`seleapplyct-action-${row.cell.id}`}
                aria-label={`apply-action-${row.cell.id}`}
                onClick={() => {
                  handleApplyValueSet(row.row.original);
                }}
              >
                <div className="action">Apply</div>
                <div className="chevron-container">
                  <ExpandMore sx={{ color: "#0073c8" }} />
                </div>
              </Button>
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
          <tbody>
            {!resultValueSets?.length ? (
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
        {resultValueSets?.length > 0 && (
          <div className="pagination-container">
            <Pagination
              totalItems={resultValueSets?.length || 0}
              limitOptions={[5, 10, 25, 50]}
              // to fill in later.
              // visibleItems={visibleItems}
              // offset={offset}
              // handlePageChange={handlePageChange}
              // handleLimitChange={handleLimitChange}
              // page={currentPage}
              // limit={currentLimit}
              // count={totalPages}
              // hideNextButton={!canGoNext}
              // hidePrevButton={!canGoPrev}
              shape="rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
}
