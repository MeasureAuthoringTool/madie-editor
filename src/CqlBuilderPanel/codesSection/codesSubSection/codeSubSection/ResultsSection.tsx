import React, { useMemo, useState } from "react";
import tw from "twin.macro";
import "styled-components/macro";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoDisturbOutlinedIcon from "@mui/icons-material/DoDisturbOutlined";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";
import ExpandingSection from "../../../../common/ExpandingSection";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";

import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Code, CodeStatus } from "../../../../api/useTerminologyServiceApi";
import ToolTippedIcon from "../../../../toolTippedIcon/ToolTippedIcon";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import "./ResultsSection.scss";
import EditCodeDetailsDialog from "../common/EditCodeDetailsDialog";

type ResultSectionProps = {
  showResultsTable: boolean;
  setShowResultsTable: any;
  code: Code;
  handleApplyCode;
  editorVal: string;
};

type ResultsColumnRow = {
  name: string;
  display: string;
  codeSystem: string;
  svsVersion: string;
  versionIncluded?: string;
};
const TH = tw.th`p-3 text-left text-sm font-bold capitalize`;

export default function ResultsSection({
  showResultsTable,
  setShowResultsTable,
  code,
  handleApplyCode,
  editorVal,
}: ResultSectionProps) {
  const [selectedCodeDetails, setSelectedCodeDetails] =
    useState<ResultsColumnRow>(null);
  const [openEditCodeDialog, setOpenEditCodeDialog] = useState<boolean>(false);

  const handleOpen = async (
    selectedId,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setSelectedCodeDetails(table.getRow(selectedId).original);
  };

  const data = [code];
  const columns = useMemo<ColumnDef<ResultsColumnRow>[]>(
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
          <div className="inline-flex gap-x-2" style={{ width: "max-content" }}>
            <ToolTippedIcon
              tooltipMessage="Edit"
              buttonProps={{
                "data-testid": `edit-code-${row.cell.row.id}`,
                "aria-label": `edit-code-${row.cell.row.id}`,
                size: "small",
                onClick: (e) => {
                  setSelectedCodeDetails(
                    table.getRow(row.cell.row.id).original
                  );
                  handleEditCode();
                },
              }}
            >
              <BorderColorOutlinedIcon color="primary" />
            </ToolTippedIcon>
            <ToolTippedIcon
              tooltipMessage="Apply"
              buttonProps={{
                "data-testid": `apply-code-${row.cell.row.id}`,
                "aria-label": `apply-code-${row.cell.row.id}`,
                size: "small",
                onClick: (e) => {
                  const selectedCode = table.getRow(row.cell.row.id).original;
                  setSelectedCodeDetails(selectedCode);
                  handleApplyCodeInner(selectedCode);
                },
              }}
            >
              <ControlPointIcon color="primary" />
            </ToolTippedIcon>
          </div>
        ),
      },
    ],
    [editorVal]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const handleApplyCodeInner = (selectedCode) => {
    handleApplyCode(selectedCode);
  };

  const toggleEditCodeDialogState = () => {
    setOpenEditCodeDialog(!open);
  };

  const handleEditCode = () => {
    setOpenEditCodeDialog(true);
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
      <ExpandingSection
        title="Results"
        showHeaderContent={showResultsTable}
        setShowHeaderContent={setShowResultsTable}
        children={
          <>
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
            <EditCodeDetailsDialog
              selectedCodeDetails={selectedCodeDetails}
              onApplyCode={handleApplyCode}
              open={openEditCodeDialog}
              onClose={toggleEditCodeDialogState}
            />
          </>
        }
      />
    </div>
  );
}
