import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { FunctionArgument } from "../../../model/CqlBuilderLookup";
import tw from "twin.macro";
import "styled-components/macro";
import ArrowDropDownOutlinedIcon from "@mui/icons-material/ArrowDropDownOutlined";
import ArrowDropUpOutlinedIcon from "@mui/icons-material/ArrowDropUpOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  MadieDeleteDialog,
  Pagination,
  Toast,
} from "@madie/madie-design-system/dist/react";
import { Stack } from "@mui/material";
import ToolTippedIcon from "../../../toolTippedIcon/ToolTippedIcon";
import "./Arguments.scss";
import toastReducer from "../../../common/ToastReducer";

type PropTypes = {
  functionArguments: Array<FunctionArgument>;
  handleDeleteArgument?: Function;
  canEdit: boolean;
};

type RowDef = {
  id: number;
  arrows: string;
  name: string;
  datatype: string;
  action: string;
};

const TH = tw.th`p-3 text-left text-sm font-bold capitalize`;

const Arguments = ({
  functionArguments,
  handleDeleteArgument,
  canEdit,
}: PropTypes) => {
  const [visibleArguments, setVisibleArguments] = useState<FunctionArgument[]>(
    []
  );
  const [selectedArgument, setSelectedArgument] = useState<FunctionArgument>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

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
    if (functionArguments.length < currentLimit) {
      setOffset(0);
      setVisibleArguments([...functionArguments]);
      setVisibleItems(functionArguments.length);
      setTotalItems(functionArguments.length);
      setTotalPages(1);
    } else {
      const start = (currentPage - 1) * currentLimit;
      const end = start + currentLimit;
      const newVisibleArguments = [...functionArguments].slice(start, end);
      setVisibleArguments(newVisibleArguments);
      setOffset(start);
      setVisibleItems(newVisibleArguments.length);
      setTotalItems(functionArguments.length);
      setTotalPages(Math.ceil(functionArguments.length / currentLimit));
    }
  }, [
    currentLimit,
    currentPage,
    functionArguments,
    setOffset,
    setVisibleArguments,
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
  }, [functionArguments, currentPage, currentLimit]);

  const deleteFunctionArgument = () => {
    handleDeleteArgument(selectedArgument);
    setDeleteDialogOpen(false);
    dispatch({
      type: "SHOW_TOAST",
      payload: {
        type: "success",
        message:
          "Argument " +
          selectedArgument.argumentName +
          " has been successfully removed from the function",
      },
    });
  };

  // table data
  const data = visibleArguments.map((argument, i) => {
    return {
      id: i,
      arrows: null,
      name: argument.argumentName,
      datatype: argument.dataType,
      action: null,
    };
  });

  const moveItem = (fromIndex, toIndex) => {
    setVisibleArguments((prevItems) => {
      const newItems = [...prevItems];
      const [item] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, item);
      return newItems;
    });
  };
  const columns = useMemo<ColumnDef<RowDef>[]>(() => {
    return [
      {
        header: "",
        accessorKey: "arrows",
        cell: (row: any) => {
          if (functionArguments?.length > 1) {
            return (
              <div className="arrow-container">
                <button
                  onClick={() => moveItem(row.row.index, row.row.index - 1)}
                >
                  <ArrowDropUpOutlinedIcon />
                </button>
                <button
                  onClick={() => moveItem(row.row.index, row.row.index + 1)}
                >
                  <ArrowDropDownOutlinedIcon />
                </button>
              </div>
            );
          } else {
            return <></>;
          }
        },
      },
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "DataType",
        accessorKey: "datatype",
      },
      {
        header: "",
        accessorKey: "action",
        cell: (row: any) => {
          return (
            <Stack direction="row" alignItems="center">
              <ToolTippedIcon
                tooltipMessage="Delete"
                buttonProps={{
                  "data-testid": `delete-button-${row.row.id}`,
                  "aria-label": `delete-button-${row.row.id}`,
                  size: "small",
                  onClick: () => {
                    setSelectedArgument({
                      argumentName: row.row.original.name,
                      dataType: row.row.original.datatype,
                    } as FunctionArgument);
                    setDeleteDialogOpen(true);
                  },
                }}
              >
                <DeleteOutlineIcon color="error" />
              </ToolTippedIcon>
            </Stack>
          );
        },
      },
    ];
  }, [functionArguments]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="function-argument-container">
        <table
          tw="min-w-full"
          data-testid="function-argument-tbl"
          id="function-argument-tbl"
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
          <tbody data-testid="function-argument-table-body">
            {functionArguments?.length ? (
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
        {functionArguments?.length > 0 && (
          <div className="pagination-container">
            <Pagination
              data-testid="function-argument-pagination"
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
      <Toast
        toastKey="function-argument-toast"
        testId="function-argument-toast"
        toastType={toastState.type}
        open={toastState.open}
        message={toastState.message}
        onClose={() => dispatch({ type: "HIDE_TOAST" })}
        autoHideDuration={8000}
      />
      <MadieDeleteDialog
        open={deleteDialogOpen}
        onContinue={() => deleteFunctionArgument()}
        onClose={() => setDeleteDialogOpen(false)}
        dialogTitle="Are you sure?"
        name={"this Argument"}
      />
    </>
  );
};

export default Arguments;
