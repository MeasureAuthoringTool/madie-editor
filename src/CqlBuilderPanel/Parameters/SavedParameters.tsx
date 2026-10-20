import _styled from "styled-components";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Pagination,
  MadieDiscardDialog,
  MadieDeleteDialog,
} from "@madie/madie-design-system/dist/react";
import Skeleton from "@mui/material/Skeleton";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import ToolTippedIcon from "../../toolTippedIcon/ToolTippedIcon";
import { Lookup } from "../../model/CqlBuilderLookup";
import { Stack } from "@mui/material";
import { ParametersProps } from "./Parameters";
import EditParameterDialog from "./EditParameterDialog";
import { Parameter } from "./ParameterBuilder";

const _StyledTable = _styled("table").withConfig({
  displayName: "SavedParameters___StyledTable",
  componentId: "sc-j0j2pa-2",
})({
  minWidth: "100%",
});
const _StyledThead = _styled("thead").withConfig({
  displayName: "SavedParameters___StyledThead",
  componentId: "sc-j0j2pa-3",
})({
  "--tw-bg-opacity": "1",
  backgroundColor: "rgb(237 237 237 / var(--tw-bg-opacity, 1))",
});
const _StyledTd = _styled("td").withConfig({
  displayName: "SavedParameters___StyledTd",
  componentId: "sc-j0j2pa-4",
})({
  padding: "0.5rem",
  textAlign: "center",
});

const TH = _styled.th.withConfig({
  displayName: "SavedParameters__TH",
  componentId: "sc-j0j2pa-0",
})({
  padding: "0.75rem",
  textAlign: "left",
  fontSize: "0.875rem",
  lineHeight: "1.25rem",
  fontWeight: "700",
  textTransform: "capitalize",
});
const TD = _styled.td.withConfig({
  displayName: "SavedParameters__TD",
  componentId: "sc-j0j2pa-1",
})({
  wordBreak: "break-all",
  padding: "0.75rem",
  textAlign: "left",
  fontSize: "0.875rem",
  lineHeight: "1.25rem",
});
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
  const [parameterToDelete, setParameterToDelete] = useState<Parameter>();
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [visibleItems, setVisibleItems] = useState<number>(0);
  const [visibleParameters, setVisibleParameters] = useState<Lookup[]>([]);
  const [discardDialog, setDiscardDialog] = useState({
    open: false,
    operation: null,
  });
  const [openParameterDialog, setOpenParameterDialog] = useState<boolean>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
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
                    const seletedParameter = table.getRow(
                      row.cell.row.id
                    ).original;
                    const parameterToDelete = {
                      parameterName: seletedParameter.name,
                      expression:
                        seletedParameter.logic?.slice(0, 1).toUpperCase() +
                        seletedParameter.logic?.slice(
                          1,
                          seletedParameter.logic?.length
                        ),
                    } as Parameter;
                    setParameterToDelete(parameterToDelete);
                    if (!isCQLUnchanged) {
                      setDiscardDialog({
                        open: true,
                        operation: "delete",
                      });
                    } else {
                      setDeleteDialogOpen(true);
                    }
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
                  onClick: (e) => {
                    setSelectedParameter(
                      table.getRow(row.cell.row.id).original
                    );
                    if (!isCQLUnchanged) {
                      setDiscardDialog({
                        open: true,
                        operation: "edit",
                      });
                    } else {
                      setOpenParameterDialog(true);
                    }
                  },
                }}
              >
                <BorderColorOutlinedIcon color="primary" />
              </ToolTippedIcon>
            </Stack>
          );
        },
      },
    ],
    [canEdit, parameters, isCQLUnchanged]
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
      <_StyledTable
        data-testid="parameters-tbl"
        id="parameters-tbl"
        style={{
          borderBottom: "solid 1px #8c8c8c",
        }}
      >
        <_StyledThead
          style={{
            borderBottom: "solid 1px #8c8c8c",
          }}
        >
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
        </_StyledThead>
        <tbody data-testid="parameters-table-body">
          {loading && (
            <div>
              <Skeleton animation="wave" width="100%" height={45} />
              <Skeleton animation="wave" width="100%" height={45} />
              <Skeleton animation="wave" width="100%" height={45} />
            </div>
          )}
          {!loading && _.isEmpty(parameters) && (
            <tr>
              <_StyledTd colSpan={columns.length}>
                No Results were found
              </_StyledTd>
            </tr>
          )}
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
        </tbody>
      </_StyledTable>
      <MadieDeleteDialog
        open={deleteDialogOpen}
        onContinue={() => {
          handleParameterDelete(parameterToDelete);
          setDeleteDialogOpen(false);
        }}
        onClose={() => setDeleteDialogOpen(false)}
        dialogTitle="Are you sure?"
        name={"this Parameter"}
      />
      <MadieDiscardDialog
        open={discardDialog?.open}
        onContinue={() => {
          resetCql();
          if (discardDialog?.operation === "edit") {
            setDiscardDialog({
              open: false,
              operation: "edit",
            });
            setOpenParameterDialog(true);
          } else if (discardDialog?.operation === "delete") {
            setDiscardDialog({
              open: false,
              operation: "delete",
            });
            setDeleteDialogOpen(true);
          }
        }}
        onClose={() => {
          setDiscardDialog({
            open: false,
            operation: null,
          });
        }}
      />
      <EditParameterDialog
        open={openParameterDialog}
        setOpenParameterDialog={setOpenParameterDialog}
        parameter={selectedParameter}
        onClose={() => setOpenParameterDialog(false)}
        handleParameterEdit={handleParameterEdit}
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
    </>
  );
};
export default SavedParameters;
