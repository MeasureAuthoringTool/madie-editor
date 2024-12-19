import React, { useState, useEffect, useMemo, useCallback } from "react";
import _ from "lodash";
import tw from "twin.macro";
import "styled-components/macro";
import { FunctionLookup } from "../../../model/CqlBuilderLookup";
import { FunctionProps } from "../FunctionsSection";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Stack } from "@mui/material";
import ToolTippedIcon from "../../../toolTippedIcon/ToolTippedIcon";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import Skeleton from "@mui/material/Skeleton";
import {
  Pagination,
  MadieConfirmDialog,
} from "@madie/madie-design-system/dist/react";
import EditFunctionDialog from "../EditFunctionDialog";
import Tooltip from "@mui/material/Tooltip";

const TH = tw.th`p-3 text-left text-sm font-bold capitalize`;
const TD = tw.td`p-3 text-left text-sm break-all`;

const getArgNameToolTipHtml = (args: string[], number) => {
  const result = args?.map((arg, index) => {
    if (index < number) {
      if (number === 2 && index === 1) {
        return <div>{arg}...</div>;
      } else {
        return <div>{arg}&nbsp;&nbsp;&nbsp;</div>;
      }
    }
  });
  return result;
};

const Functions = ({
  canEdit,
  loading,
  functions,
  isCQLUnchanged,
  resetCql,
  handleApplyFunction,
  handleFunctionDelete,
  handleFunctionEdit,
  cqlBuilderLookupsTypes,
}: FunctionProps) => {
  // pagination utilities
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [visibleItems, setVisibleItems] = useState<number>(0);
  const [visibleFunctions, setVisibleFunctions] = useState<FunctionLookup[]>(
    []
  );

  const [selectedFunction, setSelectedFunction] = useState<FunctionLookup>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [discardDialog, setDiscardDialog] = useState({
    open: false,
    operation: null,
  });
  const [editFunctionDialogOpen, setEditFunctionDialogOpen] =
    useState<boolean>();

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
  }, [functions, currentPage, currentLimit]);

  //const handleFunctionEdit = () => {};
  // table data
  const data = visibleFunctions;

  const columns = useMemo<ColumnDef<FunctionLookup>[]>(
    () => [
      {
        header: "Function Name",
        accessorKey: "name",
      },
      {
        header: "Fluent",
        accessorKey: "isFluent",
      },
      {
        header: "Argument Name",
        accessorKey: "arguments",
        cell: (row: any) => {
          const args = row.cell.row.original.arguments;
          const argStrArr = args.map((arg) => {
            return arg.argumentName + " " + arg.dataType;
          });
          return (
            <div>
              <Tooltip
                title={getArgNameToolTipHtml(argStrArr, argStrArr?.length)}
                aria-label={args}
              >
                <button>{getArgNameToolTipHtml(argStrArr, 2)}</button>
              </Tooltip>
            </div>
          );
        },
      },
      {
        header: "Comment",
        accessorKey: "comment",
        cell: (row: any) => {
          const comment = row.cell.row.original.comment;
          return (
            <div>
              <Tooltip title={comment} aria-label={comment}>
                <button>
                  {comment?.length > 25
                    ? comment.substring(0, 25) + "..."
                    : comment}
                </button>
              </Tooltip>
            </div>
          );
        },
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
              data-testid="functions-actions"
            >
              <ToolTippedIcon
                tooltipMessage="Delete"
                buttonProps={{
                  "data-testid": `delete-button-${row.cell.row.id}`,
                  "aria-label": `delete-button-${row.cell.row.id}`,
                  size: "small",
                  onClick: (e) => {
                    setSelectedFunction(table.getRow(row.cell.row.id).original);
                    if (!isCQLUnchanged) {
                      setDiscardDialog({ open: true, operation: "delete" });
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
                    setSelectedFunction(table.getRow(row.cell.row.id).original);
                    if (!isCQLUnchanged) {
                      setDiscardDialog({ open: true, operation: "edit" });
                    } else {
                      setEditFunctionDialogOpen(true);
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
    [functions, isCQLUnchanged]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const managePagination = useCallback(() => {
    if (functions?.length > 0) {
      setTotalItems(functions.length);
      if (functions.length < currentLimit) {
        setOffset(0);
        setVisibleFunctions(functions && [...functions]);
        setVisibleItems(functions?.length);
        setTotalPages(1);
      } else {
        const start = (currentPage - 1) * currentLimit;
        const end = start + currentLimit;
        const newVisibleCodes = [...functions].slice(start, end);
        setOffset(start);
        setVisibleFunctions(newVisibleCodes);
        setVisibleItems(newVisibleCodes?.length);
        setTotalPages(Math.ceil(functions?.length / currentLimit));
      }
    }
  }, [
    currentLimit,
    currentPage,
    functions,
    setOffset,
    setVisibleFunctions,
    setVisibleItems,
    setTotalItems,
    setTotalPages,
  ]);

  return (
    <>
      <table
        tw="min-w-full"
        data-testid="functions-tbl"
        id="functions-tbl"
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
        <tbody data-testid="functions-table-body">
          {loading && (
            <div title="loading">
              <Skeleton animation="wave" width="100%" height={45} />
              <Skeleton animation="wave" width="100%" height={45} />
              <Skeleton animation="wave" width="100%" height={45} />
            </div>
          )}
          {!loading && _.isEmpty(functions) && (
            <tr>
              <td colSpan={columns.length} tw="text-center p-2">
                No Results were found
              </td>
            </tr>
          )}
          {!loading &&
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} data-testid={`functions-row-${row.id}`}>
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

      <MadieConfirmDialog
        open={discardDialog?.open}
        warning="This Action cannot be undone."
        dialogTitle="Discard changes?"
        name="discard your changes in the CQL and delete the Function from the CQL"
        action="discard"
        cancelText="No, Keep Working"
        continueText="Yes, Discard All Changes"
        onContinue={() => {
          resetCql();
          if (discardDialog?.operation === "edit") {
            setDiscardDialog({
              open: false,
              operation: "edit",
            });
            setEditFunctionDialogOpen(true);
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

      <MadieConfirmDialog
        open={deleteDialogOpen}
        onContinue={() => {
          handleFunctionDelete({
            functionName: selectedFunction.name,
            comment: selectedFunction.comment,
            functionsArguments: selectedFunction.arguments,
            fluentFunction: selectedFunction.isFluent === "Yes" ? true : false,
            expressionValue: selectedFunction.logic,
            expression: selectedFunction.logic,
          });
          setDeleteDialogOpen(false);
        }}
        onClose={() => setDeleteDialogOpen(false)}
        action="delete"
        dialogTitle="Are you sure?"
        name={"delete this Function"}
        warning={"This action cannot be undone!"}
        continueText="Yes, Delete"
      />

      <EditFunctionDialog
        open={editFunctionDialogOpen}
        setEditFunctionDialogOpen={setEditFunctionDialogOpen}
        funct={selectedFunction}
        onClose={() => setEditFunctionDialogOpen(false)}
        cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
        handleApplyFunction={handleApplyFunction}
        handleFunctionEdit={handleFunctionEdit}
      />
    </>
  );
};

export default Functions;
