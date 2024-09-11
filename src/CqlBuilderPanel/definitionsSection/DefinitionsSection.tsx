import React, { useState, useEffect, useMemo, useCallback } from "react";
import "./Definitions.scss";
import DefinitionSectionNavTabs from "./DefinitionSectionNavTabs";
import tw from "twin.macro";

import Definitions from "./definitions/Definitions";

import DefinitionBuilder from "./definitionBuilder/DefinitionBuilder";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
  RowModel,
} from "@tanstack/react-table";
import _ from "lodash";
import { CqlBuilderLookup, Lookup } from "../../model/CqlBuilderLookup";
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
  cqlBuilderLookupsTypes: CqlBuilderLookup;
  setIsCQLUnchanged: boolean;
  isCQLUnchanged: boolean;
}

const columnHelper = createColumnHelper<Lookup>();
const TH = tw.th`p-3 text-left text-sm font-bold capitalize`;
const TD = tw.td`p-3 text-left text-sm break-all`;

export default function DefinitionsSection({
  canEdit,
  handleApplyDefinition,
  cqlBuilderLookupsTypes,
}: DefinitionProps) {
  const [activeTab, setActiveTab] = useState<string>("definition");

  const [optionsOpen, setOptionsOpen] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReferenceId, setSelectedReferenceId] = useState<string>(null);
  const [selectedDefintion, setSelectedDefinition] = useState<Lookup>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [visibleItems, setVisibleItems] = useState<number>(0);
  const [visibleDefinitions, setVisibleDefinitions] = useState<Lookup[]>([]);
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
  const data = visibleDefinitions?.filter(
    (definition) => definition.libraryName === null
  );

  const columns = useMemo<ColumnDef<Lookup>[]>(
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
      definitions = cqlBuilderLookupsTypes?.definitions
        .filter((definition) => !definition.libraryName)
        .map((definition) => {
          definition.comment = "";
          return definition;
        });
    } else {
      definitions = {} as unknown as Lookup;
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
            return cqlBuilderLookupsTypes.definitions.filter(
              (definition) => !definition.libraryName
            ).length;
          } else {
            return 0;
          }
        })()}
      />
      <div>
        {activeTab === "definition" && (
          <DefinitionBuilder
            canEdit={canEdit}
            handleApplyDefinition={handleApplyDefinition}
            cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
          />
        )}
        {activeTab === "saved-definitions" && (
          <Definitions definitions={cqlBuilderLookupsTypes?.definitions} />
        )}
      </div>
    </>
  );
}
