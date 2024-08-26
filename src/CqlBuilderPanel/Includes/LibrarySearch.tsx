import React, { useReducer, useState } from "react";
import ExpandingSection from "../../common/ExpandingSection";
import Search from "./Search";
import useCqlLibraryServiceApi, {
  CqlLibrary,
} from "../../api/useCqlLibraryServiceApi";
import { Toast } from "@madie/madie-design-system/dist/react";
import Results from "./Results";
import toastReducer from "../../common/ToastReducer";

export interface LibraryTabContentProps {
  canEdit: boolean;
  measureModel: string;
  handleApplyLibrary: (library) => void;
}

const LibrarySearch = (props: LibraryTabContentProps) => {
  const { measureModel, canEdit, handleApplyLibrary } = props;
  const libraryService = useCqlLibraryServiceApi();
  const [cqlLibraries, setCqlLibraries] = useState<CqlLibrary[]>([]);

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

  const handleSearch = async (searchTerm: string) => {
    (await libraryService)
      .fetchVersionedCqlLibraries(searchTerm, measureModel)
      .then((libraries) => {
        setCqlLibraries(libraries);
      })
      .catch((error) => {
        dispatch({
          type: "SHOW_TOAST",
          payload: { type: "danger", message: error.message },
        });
      });
  };

  const handleClearSearch = () => setCqlLibraries([]);

  return (
    <div className="content">
      <ExpandingSection title="Search" showHeaderContent={true}>
        <Search
          canEdit={canEdit}
          onSearch={handleSearch}
          onClear={handleClearSearch}
        />
      </ExpandingSection>
      <ExpandingSection title="Library Results" showHeaderContent={true}>
        <Results
          cqlLibraries={cqlLibraries}
          measureModel={measureModel}
          handleApplyLibrary={handleApplyLibrary}
        />
      </ExpandingSection>
      <Toast
        toastKey="search-library-toast"
        testId="search-library-toast"
        toastType={toastState.type}
        open={toastState.open}
        message={toastState.message}
        onClose={() => dispatch({ type: "HIDE_TOAST" })}
        autoHideDuration={8000}
      />
    </div>
  );
};
export default LibrarySearch;
