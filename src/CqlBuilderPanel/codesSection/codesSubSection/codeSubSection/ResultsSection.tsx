import _styled from "styled-components";
import React, { useMemo, useState } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoDisturbOutlinedIcon from "@mui/icons-material/DoDisturbOutlined";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";
import ExpandingSection from "../../../../common/ExpandingSection";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import _ from "lodash";
import {
  useReactTable,
  ColumnDef,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Code, CodeStatus } from "../../../../api/useTerminologyServiceApi";
import ToolTippedIcon from "../../../../toolTippedIcon/ToolTippedIcon";
import "./ResultsSection.scss";
import EditCodeDetailsDialog from "../common/EditCodeDetailsDialog";
import { getFhirCodeSystemVersion } from "../savedCodesSubSection/SavedCodesSubSection";
type ResultSectionProps = {
  showResultsTable: boolean;
  setShowResultsTable: any;
  code: Code;
  handleApplyCode;
  editorVal: string;
  measureModel?: string;
};
type ResultsColumnRow = {
  name: string;
  display: string;
  codeSystem: string;
  svsVersion: string;
  versionIncluded?: string;
};
const TH = _styled.th.withConfig({
  displayName: "ResultsSection__TH",
  componentId: "sc-hhov3i-0",
})({
  padding: "0.75rem",
  textAlign: "left",
  fontSize: "0.875rem",
  lineHeight: "1.25rem",
  fontWeight: "700",
  textTransform: "capitalize",
});
export default function ResultsSection({
  showResultsTable,
  setShowResultsTable,
  code,
  handleApplyCode,
  editorVal,
  measureModel,
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
        accessorKey: measureModel?.includes("QDM")
          ? "svsVersion"
          : "fhirVersion",
      },
      {
        header: "",
        accessorKey: "apply",
        cell: (row: any) => (
          <div
            className="inline-flex gap-x-2"
            style={{
              width: "max-content",
            }}
          >
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
            <_StyledTable
              data-testid="codes-results-tbl"
              style={{
                borderBottom: "solid 1px #8c8c8c",
              }}
            >
              <_StyledThead
                style={{
                  borderBottom: "solid 1px #8c8c8c",
                }}
              >
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
              </_StyledThead>
              <tbody>
                {!code ? (
                  <tr>
                    <_StyledTd colSpan={columns.length}>
                      No Results were found
                    </_StyledTd>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} data-test-id={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <_StyledTd2 key={cell.id}>
                          {cell.column.id === "status"
                            ? getCodeStatus(cell.getValue())
                            : cell.column.id === "fhirVersion"
                            ? getFhirCodeSystemVersion(cell.getValue())
                            : flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                        </_StyledTd2>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </_StyledTable>
            <EditCodeDetailsDialog
              measureModel={measureModel}
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
var _StyledTable = _styled("table").withConfig({
  displayName: "ResultsSection___StyledTable",
  componentId: "sc-hhov3i-1",
})({
  minWidth: "100%",
});
var _StyledThead = _styled("thead").withConfig({
  displayName: "ResultsSection___StyledThead",
  componentId: "sc-hhov3i-2",
})({
  "--tw-bg-opacity": "1",
  backgroundColor: "rgb(237 237 237 / var(--tw-bg-opacity, 1))",
});
var _StyledTd = _styled("td").withConfig({
  displayName: "ResultsSection___StyledTd",
  componentId: "sc-hhov3i-3",
})({
  padding: "0.5rem",
  textAlign: "center",
});
var _StyledTd2 = _styled("td").withConfig({
  displayName: "ResultsSection___StyledTd2",
  componentId: "sc-hhov3i-4",
})({
  padding: "0.5rem",
});
