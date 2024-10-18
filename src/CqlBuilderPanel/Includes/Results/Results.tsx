import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import tw from "twin.macro";
import "styled-components/macro";
import useCqlLibraryServiceApi, {
  CqlLibrary,
} from "../../../api/useCqlLibraryServiceApi";
import {
  MadieDeleteDialog,
  MadieDiscardDialog,
  Pagination,
  Toast,
} from "@madie/madie-design-system/dist/react";
import CqlLibraryDetailsDialog, {
  SelectedLibrary,
} from "../CqlLibraryDetailsDialog";
import toastReducer from "../../../common/ToastReducer";
import IncludeResultActions from "./IncludeResultActions";
import { useMemoizedLibrarySet } from "./useMemoisedLibrarySet";

type PropTypes = {
  cqlLibraries: Array<CqlLibrary>;
  canEdit: boolean;
  showAlias: boolean;
  handleApplyLibrary: (library) => void;
  handleEditLibrary?: (selectedLibrary, editedLibrary) => void;
  isCQLUnchanged: boolean;
  setIsCQLUnchanged?: Function;
  cql?: string;
  setEditorValue?: (cql) => void;
  handleDeleteLibrary?: (library) => void;
  operation?: string;
};

type RowDef = {
  id: string;
  name: string;
  version: string;
  alias: string;
  owner: string;
  librarySetId: string;
};

const TH = tw.th`p-3 text-left text-sm font-bold capitalize`;

const Results = ({
  cqlLibraries,
  canEdit,
  showAlias,
  isCQLUnchanged,
  setIsCQLUnchanged,
  cql,
  setEditorValue,
  handleApplyLibrary,
  handleEditLibrary,
  handleDeleteLibrary,
  operation,
}: PropTypes) => {
  const [visibleLibraries, setVisibleLibraries] = useState<CqlLibrary[]>([]);
  const libraryService = useCqlLibraryServiceApi();
  const [openLibraryDialog, setOpenLibraryDialog] = useState<boolean>(false);
  const [selectedLibrary, setSelectedLibrary] = useState<SelectedLibrary>();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState<boolean>(false);
  const [rowIndex, setRowIndex] = useState<string>();
  const [isEditAction, setEditAction] = useState<boolean>(false);

  // toast utilities
  const [toastState, dispatch] = useReducer(
    toastReducer,
    {
      open: false,
      type: "danger",
      message: "",
    },
    undefined
  );

  // pagination utilities
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [visibleItems, setVisibleItems] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);
  const [currentLimit, setCurrentLimit] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const managePagination = useCallback(() => {
    if (cqlLibraries.length < currentLimit) {
      setOffset(0);
      setVisibleLibraries([...cqlLibraries]);
      setVisibleItems(cqlLibraries.length);
      setTotalItems(cqlLibraries.length);
      setTotalPages(1);
    } else {
      const start = (currentPage - 1) * currentLimit;
      const end = start + currentLimit;
      const newVisibleLibraries = [...cqlLibraries].slice(start, end);
      setVisibleLibraries(newVisibleLibraries);
      setOffset(start);
      setVisibleItems(newVisibleLibraries.length);
      setTotalItems(cqlLibraries.length);
      setTotalPages(Math.ceil(cqlLibraries.length / currentLimit));
    }
  }, [
    currentLimit,
    currentPage,
    cqlLibraries,
    setOffset,
    setVisibleLibraries,
    setVisibleItems,
    setTotalItems,
    setTotalPages,
  ]);

  const canGoNext = (() => {
    return currentPage < totalPages;
  })();
  const canGoPrev = currentPage > 1;

  const handlePageChange = (e, v) => {
    setCurrentPage(v);
  };
  const handleLimitChange = (e) => {
    setCurrentLimit(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    managePagination();
  }, [cqlLibraries, currentPage, currentLimit]);

  // table data
  const data = visibleLibraries.map((library) => {
    return {
      id: library.id,
      librarySetId: library.librarySet.librarySetId,
      name: library.cqlLibraryName,
      version: library.version,
      alias: library.alias,
      owner: library.librarySet.owner,
    };
  });

  // Use the custom hook to memoize the fetchLibrarySet async function
  const memoizedLibrarySetFetch = useMemoizedLibrarySet();

  const updateLibrarySelection = async (
    version: string,
    setId: string,
    alias: string
  ) => {
    try {
      const librarySet = await memoizedLibrarySetFetch(setId);
      if (librarySet) {
        // filter out library for selected version from family of library
        const library = librarySet.libraries.find(
          (library: CqlLibrary) => library.version === version
        );
        // list if all the versions for selected library
        const versions = librarySet.libraries.map(
          (library: CqlLibrary) => library.version
        );
        setSelectedLibrary({
          id: library.id,
          name: library.cqlLibraryName,
          alias: alias,
          owner: librarySet.librarySet.owner,
          librarySetId: setId,
          version: version,
          cql: library.cql,
          otherVersions: versions,
        } as SelectedLibrary);
        setOpenLibraryDialog(true);
        setRowIndex(null);
      }
    } catch (error) {
      dispatch({
        type: "SHOW_TOAST",
        payload: { type: "danger", message: error.message },
      });
    }
  };

  // get the cql for selected library and set selected library
  const showLibraryDetails = async (index, isEditAction = false) => {
    setRowIndex(index);
    setEditAction(isEditAction && canEdit);
    if (isCQLUnchanged) {
      const rowModal = table.getRow(index).original;
      await updateLibrarySelection(
        rowModal.version,
        rowModal.librarySetId,
        rowModal.alias
      );
    } else {
      setDiscardDialogOpen(true);
    }
  };

  const showDeleteConfirmation = (index) => {
    const rowModal = table.getRow(index).original;
    setSelectedLibrary({
      name: rowModal.name,
      version: rowModal.version,
      alias: rowModal.alias,
    } as SelectedLibrary);
    if (isCQLUnchanged) {
      setDeleteDialogOpen(true);
    } else {
      setDiscardDialogOpen(true);
    }
  };

  const onDiscardContinue = async () => {
    setEditorValue(cql);
    setIsCQLUnchanged(true);
    if (rowIndex) {
      const rowModal = table.getRow(rowIndex).original;
      await updateLibrarySelection(
        rowModal.version,
        rowModal.librarySetId,
        rowModal.alias
      );
    } else {
      setDeleteDialogOpen(true);
    }
    setDiscardDialogOpen(false);
  };

  const columns = useMemo<ColumnDef<RowDef>[]>(() => {
    const columnDefs = [
      {
        header: "name",
        accessorKey: "name",
      },
      {
        header: "version",
        accessorKey: "version",
      },
      {
        header: "owner",
        accessorKey: "owner",
      },
      {
        header: "Action",
        accessorKey: "apply",
        cell: (row: any) => {
          return (
            <IncludeResultActions
              id={row.cell.row.id}
              canEdit={canEdit}
              showDeleteAction={showAlias}
              onDelete={showDeleteConfirmation}
              onEdit={showLibraryDetails}
              onView={showLibraryDetails}
            />
          );
        },
      },
    ];
    // we need to display aliases for saved libraries, so check if showAlias is true
    return showAlias
      ? [
          {
            header: "alias",
            accessorKey: "alias",
          },
          ...columnDefs,
        ]
      : columnDefs;
  }, [cqlLibraries, isCQLUnchanged]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="search-results-container">
        <table
          tw="min-w-full"
          data-testid="library-results-tbl"
          id="library-results-tbl"
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
          <tbody data-testid="library-results-table-body">
            {cqlLibraries?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} data-test-id={`row-${row.id}`}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} tw="text-center p-2">
                  No Results were found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {cqlLibraries?.length > 0 && (
          <div className="pagination-container">
            <Pagination
              data-testid="library-search-pagination"
              totalItems={totalItems}
              limitOptions={[5, 10, 25, 50]}
              visibleItems={visibleItems}
              offset={offset}
              handlePageChange={handlePageChange}
              handleLimitChange={handleLimitChange}
              page={currentPage}
              limit={currentLimit}
              count={totalPages}
              hideNextButton={!canGoNext}
              hidePrevButton={!canGoPrev}
              shape="rounded"
            />
          </div>
        )}
      </div>
      <CqlLibraryDetailsDialog
        canEdit={isEditAction && canEdit}
        library={selectedLibrary}
        open={openLibraryDialog}
        setOpenLibraryDialog={setOpenLibraryDialog}
        onVersionChange={updateLibrarySelection}
        onApply={handleApplyLibrary}
        onEdit={handleEditLibrary}
        operation={operation}
      />
      <Toast
        toastKey="search-library-toast"
        testId="search-library-toast"
        toastType={toastState.type}
        open={toastState.open}
        message={toastState.message}
        onClose={() => dispatch({ type: "HIDE_TOAST" })}
        autoHideDuration={8000}
      />
      <MadieDeleteDialog
        open={deleteDialogOpen}
        onContinue={() => handleDeleteLibrary(selectedLibrary)}
        onClose={() => setDeleteDialogOpen(false)}
        dialogTitle="Are you sure?"
        name={"this Library"}
      />
      <MadieDiscardDialog
        open={discardDialogOpen}
        onContinue={onDiscardContinue}
        onClose={() => setDiscardDialogOpen(false)}
      />
    </>
  );
};

export default Results;
