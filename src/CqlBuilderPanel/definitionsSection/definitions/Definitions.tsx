import React, { useCallback, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import tw from "twin.macro";
import "styled-components/macro";
import {
  Pagination,
  MadieDeleteDialog,
  MadieDiscardDialog,
} from "@madie/madie-design-system/dist/react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BorderColorOutlinedIcon from "@mui/icons-material/BorderColorOutlined";
import ToolTippedIcon from "../../../toolTippedIcon/ToolTippedIcon";
import { CqlBuilderLookup, Lookup } from "../../../model/CqlBuilderLookup";
import DefinitionBuilderDialog from "../definitionBuilderDialog/DefinitionBuilderDialog";
import { Stack } from "@mui/material";

const TH = tw.th`p-3 text-left text-sm font-bold capitalize`;
const TD = tw.td`p-3 text-left text-sm break-all`;

type DefinitionsPropTypes = {
  canEdit: boolean;
  definitions: Lookup[];
  isCQLUnchanged: boolean;
  cql: string;
  setEditorValue: (cql) => void;
  handleDefinitionEdit?: Function;
  handleDefinitionDelete?: Function;
  resetCql: Function;
  getCqlDefinitionReturnTypes: Function;
  cqlBuilderLookup: CqlBuilderLookup;
};
const Definitions = ({
  canEdit,
  definitions,
  isCQLUnchanged,
  cql,
  setEditorValue,
  handleDefinitionEdit,
  handleDefinitionDelete,
  resetCql,
  getCqlDefinitionReturnTypes,
  cqlBuilderLookup,
}: DefinitionsPropTypes) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [discardDialog, setDiscardDialog] = useState({
    open: false,
    operation: null,
  });

  const [selectedDefinition, setSelectedDefinition] = useState<Lookup>();
  const [openDefinitionDialog, setOpenDefinitionDialog] = useState<boolean>();

  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [visibleItems, setVisibleItems] = useState<number>(0);
  const [visibleDefinitions, setVisibleDefinitions] = useState<Lookup[]>([]);

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
  }, [definitions, currentPage, currentLimit]);

  const showEditDefinitionDialog = (index) => {
    const rowModal = table.getRow(index).original;
    const returnTypes = getCqlDefinitionReturnTypes();
    const returnType = returnTypes
      ? returnTypes[_.camelCase(rowModal.name)]
      : undefined;
    setSelectedDefinition({ ...rowModal, returnType: returnType });
  };

  // table data
  const data = visibleDefinitions;

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
              data-testid="definition-actions"
            >
              <ToolTippedIcon
                tooltipMessage="Delete"
                buttonProps={{
                  "data-testid": `delete-button-${row.cell.row.id}`,
                  "aria-label": `delete-button-${row.cell.row.id}`,
                  size: "small",
                  onClick: (e) => {
                    setSelectedDefinition(row.row.original.name);
                    if (!isCQLUnchanged) {
                      setDiscardDialog({ open: true, operation: "delete" });
                    } else {
                      setDeleteDialogOpen(true);
                    }
                  }, // do nothing for now
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
                  onClick: () => {
                    showEditDefinitionDialog(row.cell.row.id);
                    if (!isCQLUnchanged) {
                      setDiscardDialog({ open: true, operation: "edit" });
                    } else {
                      setOpenDefinitionDialog(true);
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
    [definitions]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const managePagination = useCallback(() => {
    if (definitions?.length > 0) {
      setTotalItems(definitions.length);
      if (definitions.length < currentLimit) {
        setOffset(0);
        setVisibleDefinitions(definitions && [...definitions]);
        setVisibleItems(definitions?.length);
        setTotalPages(1);
      } else {
        const start = (currentPage - 1) * currentLimit;
        const end = start + currentLimit;
        const newVisibleCodes = [...definitions].slice(start, end);
        setOffset(start);
        setVisibleDefinitions(newVisibleCodes);
        setVisibleItems(newVisibleCodes?.length);
        setTotalPages(Math.ceil(definitions?.length / currentLimit));
      }
    }
  }, [
    currentLimit,
    currentPage,
    definitions,
    setOffset,
    setVisibleDefinitions,
    setVisibleItems,
    setTotalItems,
    setTotalPages,
  ]);

  return (
    <>
      <table
        tw="min-w-full"
        data-testid="definitions-tbl"
        id="definitions-tbl"
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
        <tbody data-testid="definitions-table-body">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} data-testid={`definitions-row-${row.id}`}>
              {row.getVisibleCells().map((cell) => (
                <TD key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TD>
              ))}
            </tr>
          ))}
        </tbody>
        <MadieDeleteDialog
          open={deleteDialogOpen}
          onContinue={() => {
            handleDefinitionDelete(selectedDefinition);
            setDeleteDialogOpen(false);
          }}
          onClose={() => setDeleteDialogOpen(false)}
          dialogTitle="Are you sure?"
          name={"this Definition"}
        />
        <MadieDiscardDialog
          open={discardDialog?.open}
          onContinue={() => {
            resetCql();
            if (discardDialog?.operation === "delete") {
              setDiscardDialog({
                open: false,
                operation: "delete",
              });
              setDeleteDialogOpen(true);
            } else if (discardDialog?.operation === "edit") {
              setDiscardDialog({
                open: false,
                operation: "edit",
              });
              setOpenDefinitionDialog(true);
            }
          }}
          onClose={() => {
            setDiscardDialog({
              open: false,
              operation: null,
            });
          }}
        />
      </table>
      <DefinitionBuilderDialog
        open={openDefinitionDialog}
        definition={selectedDefinition}
        cqlBuilderLookup={cqlBuilderLookup}
        onClose={() => setOpenDefinitionDialog(false)}
        handleDefinitionEdit={handleDefinitionEdit}
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

export default Definitions;
