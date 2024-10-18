import React, {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { CqlAntlr, CqlInclude } from "@madie/cql-antlr-parser/dist/src";
import { Toast } from "@madie/madie-design-system/dist/react";
import Results from "../Results/Results";
import useCqlLibraryServiceApi, {
  CqlLibrary,
  fetchVersionedLibrariesErrorMessage,
} from "../../../api/useCqlLibraryServiceApi";
import toastReducer from "../../../common/ToastReducer";

interface PropTypes {
  cql: string;
  canEdit: boolean;
  measureModel: string;
  isCQLUnchanged: boolean;
  setIsCQLUnchanged: Function;
  setEditorValue: (cql) => void;
  handleDeleteLibrary: (library) => void;
  handleEditLibrary: (selectedLibrary, editedLibrary) => void;
}

const SavedLibraryIncludes = ({
  canEdit,
  cql,
  measureModel,
  isCQLUnchanged,
  setIsCQLUnchanged,
  setEditorValue,
  handleDeleteLibrary,
  handleEditLibrary,
}: PropTypes) => {
  const [libraries, setLibraries] = useState<CqlLibrary[]>([]);
  const libraryService = useRef(useCqlLibraryServiceApi());

  // toast reducer
  const [toastState, dispatch] = useReducer(
    toastReducer,
    {
      open: false,
      type: "danger",
      message: "",
    },
    undefined
  );

  const getAlias = (includes: CqlInclude[], library: CqlLibrary): string => {
    return includes.find(
      (include) =>
        include.name === library.cqlLibraryName &&
        include.version.replace(/["']/g, "") === library.version
    ).called;
  };

  const fetchIncludedLibraries = useCallback(
    async (cql) => {
      const parsedCql = new CqlAntlr(cql).parse();
      if (parsedCql.includes.length > 0) {
        const promises = parsedCql?.includes.map(async (l) => {
          return (
            await libraryService.current
          ).getVersionedCqlLibraryByNameVersionAndModel(
            l.name,
            l.version.replace(/["']/g, ""),
            measureModel
          );
        });

        Promise.all(promises)
          .then((responses) => {
            const cqlLibraries = responses.map((response) => {
              const lib = response.data;
              return {
                id: lib.id,
                cqlLibraryName: lib.cqlLibraryName,
                version: lib.version,
                alias: getAlias(parsedCql.includes, lib),
                librarySet: lib.librarySet,
                draft: false,
              } as CqlLibrary;
            });
            setLibraries(cqlLibraries);
          })
          .catch((err) => {
            console.error("Error while fetching library: ", err);
            dispatch({
              type: "SHOW_TOAST",
              payload: {
                type: "danger",
                message: fetchVersionedLibrariesErrorMessage,
              },
            });
          });
      } else {
        setLibraries([]);
      }
    },
    [libraryService, measureModel]
  );

  useEffect(() => {
    if (cql) {
      fetchIncludedLibraries(cql);
    }
  }, [cql, fetchIncludedLibraries]);

  return (
    <div style={{ marginTop: "20px" }}>
      <Results
        cql={cql}
        cqlLibraries={libraries}
        canEdit={canEdit}
        showAlias={true}
        isCQLUnchanged={isCQLUnchanged}
        setIsCQLUnchanged={setIsCQLUnchanged}
        setEditorValue={setEditorValue}
        handleApplyLibrary={() => {}} // do nothing for now
        handleDeleteLibrary={handleDeleteLibrary}
        handleEditLibrary={handleEditLibrary}
        operation={"edit"}
      />
      <Toast
        toastKey="saved-library-toast"
        testId="saved-library-toast"
        toastType={toastState.type}
        open={toastState.open}
        message={toastState.message}
        onClose={() => dispatch({ type: "HIDE_TOAST" })}
        autoHideDuration={8000}
      />
    </div>
  );
};

export default SavedLibraryIncludes;
