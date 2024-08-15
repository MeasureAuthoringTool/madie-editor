import React, { useState } from "react";
import ExpandingSection from "../../common/ExpandingSection";
import Search from "./Search";
import useCqlLibraryServiceApi, {
  CqlLibrary,
} from "../../api/useCqlLibraryServiceApi";
import { Toast } from "@madie/madie-design-system/dist/react";
import Results from "./Results";

export interface LibraryTabContentProps {
  canEdit: boolean;
  measureModel: string;
}

const LibrarySearch = (props: LibraryTabContentProps) => {
  const { measureModel, canEdit } = props;
  const libraryService = useCqlLibraryServiceApi();
  // toast utilities
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastType, setToastType] = useState<string>("danger");
  const [toastMessage, setToastMessage] = useState<string>("");
  const [cqlLibraries, setCqlLibraries] = useState<CqlLibrary[]>([]);
  const closeToast = () => {
    setToastMessage("");
    setToastOpen(false);
  };

  const showToast = (type: string, message: string) => {
    setToastType(type);
    setToastMessage(message);
    setToastOpen(true);
  };

  const handleSearch = async (searchTerm: string) => {
    (await libraryService)
      .fetchVersionedCqlLibraries(searchTerm, measureModel)
      .then((libraries) => {
        setCqlLibraries(libraries);
      })
      .catch((error) => {
        showToast("danger", error.message);
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
        <Results cqlLibraries={cqlLibraries} />
      </ExpandingSection>
      <Toast
        toastKey="include-library-toast"
        testId="include-library-toast"
        toastType={toastType}
        open={toastOpen}
        message={toastMessage}
        onClose={closeToast}
        autoHideDuration={8000}
      />
    </div>
  );
};
export default LibrarySearch;
