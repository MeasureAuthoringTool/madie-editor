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
import {
  getQualifiedLibraryName,
  parseQualifiedLibraryName,
} from "../../../utils/cqlLibraryUtils";
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
  hasCqlError: boolean;
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
  hasCqlError,
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
        include.name.replace(/"/g, "") === getQualifiedLibraryName(library) &&
        include.version.replace(/["']/g, "") === library.version
    )?.called;
  };

  const fetchIncludedLibraries = useCallback(
    async (cql) => {
      const parsedCql = new CqlAntlr(cql).parse();
      if (parsedCql.includes.length > 0) {
        const promises = parsedCql?.includes.map(async (l) => {
          // NPM libraries are included with their namespace prefix
          const { namespacePrefix, name } = parseQualifiedLibraryName(l.name);
          return (
            await libraryService.current
          ).getVersionedCqlLibraryByNameVersion(
            name,
            l.version.replace(/["']/g, ""),
            namespacePrefix?.replace(/"/g, "")
          );
        });

        Promise.all(promises)
          .then((responses) => {
            const cqlLibraries = responses.map((response) => {
              const lib = response.data;
              const library = {
                id: lib.id,
                cqlLibraryName: lib.cqlLibraryName,
                version: lib.version,
                librarySet: lib.librarySet,
                draft: false,
                librarySetId: lib.librarySetId,
                ownerDisplayName: lib.ownerDisplayName || lib.publisher,
                namespacePrefix: lib.namespacePrefix,
                externalLibrary: !!lib.external,
              } as CqlLibrary;
              return {
                ...library,
                alias: getAlias(parsedCql.includes, library),
              };
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
    if (cql && !hasCqlError) {
      fetchIncludedLibraries(cql);
    } else {
      setLibraries([]);
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
