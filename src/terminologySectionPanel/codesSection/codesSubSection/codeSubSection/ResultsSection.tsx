import React, { useMemo, useState } from "react";
import tw from "twin.macro";
import "styled-components/macro";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoDisturbOutlinedIcon from "@mui/icons-material/DoDisturbOutlined";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";
import TerminologySection from "../../../../common/TerminologySection";

import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Code, CodeStatus } from "../../../../api/useTerminologyServiceApi";
import ToolTippedIcon from "../../../../toolTippedIcon/ToolTippedIcon";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Popover } from "@madie/madie-design-system/dist/react";


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

  const [optionsOpen, setOptionsOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setOptionsOpen(true);
      console.log("AnchorEl", event.currentTarget);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setOptionsOpen(true);
    setAnchorEl(null);
  };

  const data = [code];
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
        cell: (row: any) => (
          <div className="inline-flex gap-x-2">
            
            <button
              className="action-button"
              onClick={(e) => {
                console.log("Cell", row.cell.id);
                handleOpen(e);
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
            <Popover
              optionsOpen={optionsOpen}
              anchorEl={anchorEl}
              handleClose={handleClose}
              canEdit={true}
              editViewSelectOptionProps={{
                label: "Apply",
                toImplementFunction: () => {
                  // handleClick(selectedReferenceId, "edit");
                  setOptionsOpen(false);
                },
                dataTestId: `edit-measure-reference-`,
              }}
              otherSelectOptionProps={[
                {
                  label: "Delete",
                  toImplementFunction: () => {
                    //handleClick(selectedReferenceId, "delete");
                    setOptionsOpen(false);
                  },
                  dataTestId: `delete-measure-reference-`,
                },
              ]}

            />
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
              )}
            </tbody>
          </table>
        }
      />
    </div>
  );
}
