import React, { useState, useEffect, useMemo, useCallback } from "react";
import tw from "twin.macro";
import "styled-components/macro";
import "./Definitions.scss";
import DefinitionSectionNavTabs from "./DefinitionSectionNavTabs";
import DefinitionSection from "./DefinitionSection";
import { CqlBuilderLookupData } from "../../model/CqlBuilderLookup";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
  RowModel,
} from "@tanstack/react-table";
import _ from "lodash";

import {
  Pagination,
  Popover,
  MadieSpinner,
} from "@madie/madie-design-system/dist/react";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import { green } from "@mui/material/colors";
interface DefinitionProps {
  canEdit: boolean;
  handleApplyDefinition: Function;
  handleDefinitionDelete: Function;
  cqlBuilderLookupsTypes: CqlBuilderLookupData;
  setIsCQLUnchanged: boolean;
  isCQLUnchanged: boolean;
}

export type Definition = {
  id: number;
  name: string;
  comment: string;
};

const columnHelper = createColumnHelper<Definition>();
const TH = tw.th`p-3 text-left text-sm font-bold capitalize`;
const TD = tw.td`p-3 text-left text-sm break-all`;

export default function DefinitionsSection({
  canEdit,
  handleApplyDefinition,
  handleDefinitionDelete,
  cqlBuilderLookupsTypes,
  setIsCQLUnchanged,
  isCQLUnchanged,
}: DefinitionProps) {
  const [activeTab, setActiveTab] = useState<string>("definition");
  const [optionsOpen, setOptionsOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReferenceId, setSelectedReferenceId] = useState<string>(null);
  const [selectedDefintion, setSelectedDefinition] = useState<Definition>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [visibleItems, setVisibleItems] = useState<number>(0);
  const [visibleDefinitions, setVisibleDefinitions] = useState<Definition[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(false);

  const [offset, setOffset] = useState<number>(0);
  const [currentLimit, setCurrentLimit] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [discardDialogOpen, setDiscardDialogOpen] = useState<boolean>(false);
  const [deleteDialogModalOpen, setDeleteDialogModalOpen] =
    useState<boolean>(false);
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

  const handleOpen = async (
    selectedId,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setOptionsOpen(true);
    setAnchorEl(event.currentTarget);

    setSelectedDefinition(table.getRow(selectedId).original);
  };

  const handleClose = () => {
    setOptionsOpen(false);

    setAnchorEl(null);
  };
  useEffect(() => {
    managePagination();
  }, [cqlBuilderLookupsTypes, currentPage, currentLimit]);

  // table data
  const data = visibleDefinitions?.map((definition) => {
    return {
      name: definition.name,
      comment: definition.comment,
    } as unknown as Definition;
  });
  const columns = useMemo<ColumnDef<Definition>[]>(
    () => [
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Comment",
        accessorKey: "comment",
      },
      {
        header: "",
        accessorKey: "apply",
        cell: (row: any) => {
          return (
            <>
              <button onClick={(e) => handleOpen(row.cell.row.id, e)}>
                <DeleteOutlineOutlinedIcon htmlColor="red" />
              </button>
              <EditNoteRoundedIcon color="primary" />
            </>
          );
        },
      },
    ],
    [cqlBuilderLookupsTypes]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const managePagination = useCallback(() => {
    let definitions;
    if (cqlBuilderLookupsTypes?.definitions) {
      definitions = cqlBuilderLookupsTypes?.definitions.map((definition) => {
        return {
          name: definition,
          comment: "",
        } as unknown as Definition;
      });
    } else {
      definitions = {} as unknown as Definition;
    }

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
    cqlBuilderLookupsTypes,
    setOffset,
    setVisibleDefinitions,
    setVisibleItems,
    setTotalItems,
    setTotalPages,
  ]);

  return (
    <>
      <DefinitionSectionNavTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        definitionCount={(() => {
          if (cqlBuilderLookupsTypes?.definitions) {
            return cqlBuilderLookupsTypes.definitions.length;
          } else {
            return 0;
          }
        })()}
      />
      <div>
        {activeTab === "definition" && (
          <DefinitionSection
            canEdit={canEdit}
            handleApplyDefinition={handleApplyDefinition}
            cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
          />
        )}
        {activeTab === "savedDefinitions" && (
          <>
            <table
              tw="min-w-full"
              data-testid="saved-definitions-tbl"
              id="saved-definitions-tbl"
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
              <tbody data-testid="saved-definitions-table-body">
                {!loading ? (
                  _.isEmpty(cqlBuilderLookupsTypes?.definitions) ? (
                    <tr>
                      <td colSpan={columns.length} tw="text-center p-2">
                        No Results were found
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        data-testid={`saved-definitions-row-${row.id}`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TD key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TD>
                        ))}
                      </tr>
                    ))
                  )
                ) : (
                  <div data-testid="saved-codes-loading-spinner">
                    <MadieSpinner style={{ height: 50, width: 50 }} />
                  </div>
                )}
              </tbody>

              <Popover
                optionsOpen={optionsOpen}
                anchorEl={anchorEl}
                handleClose={handleClose}
                canEdit={true}
                editViewSelectOptionProps={{
                  label: "Remove",
                  toImplementFunction: () => {
                    setOptionsOpen(false);
                    if (!isCQLUnchanged) {
                      setDiscardDialogOpen(true);
                    } else {
                      setDeleteDialogModalOpen(true);
                    }
                  },
                  dataTestId: `remove-code-${selectedReferenceId}`,
                }}
                otherSelectOptionProps={[
                  {
                    label: "Edit",
                    toImplementFunction: () => {},
                    dataTestId: `edit-code-${selectedReferenceId}`,
                  },
                ]}
              />
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
          </>
        )}
      </div>
    </>
  );
}
