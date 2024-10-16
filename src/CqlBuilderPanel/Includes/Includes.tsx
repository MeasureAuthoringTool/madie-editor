import React, { useEffect, useState } from "react";
import LibrarySearch from "./Search/LibrarySearch";
import LibraryTabs from "./LibraryTabs";
import "./Includes.scss";
import SavedLibraryIncludes from "./SavedLibraryIncludes/SavedLibraryIncludes";
import { CqlAntlr } from "@madie/cql-antlr-parser/dist/src";

interface IncludesProps {
  cql: string;
  canEdit: boolean;
  measureModel: string;
  isCQLUnchanged: boolean;
  setIsCQLUnchanged: Function;
  setEditorValue: (cql) => void;
  handleApplyLibrary: (library) => void;
  handleEditLibrary: (selectedLibrary, editedLibrary) => void;
  handleDeleteLibrary: (library) => void;
}

export default function Includes({
  cql,
  measureModel,
  canEdit,
  isCQLUnchanged,
  setIsCQLUnchanged,
  setEditorValue,
  handleApplyLibrary,
  handleEditLibrary,
  handleDeleteLibrary,
}: IncludesProps) {
  const [activeLibraryTab, setActiveLibraryTab] = useState<string>("library");
  const [includedLibraryCount, setIncludedLibraryCount] = useState<number>(0);

  useEffect(() => {
    if (cql) {
      const count = new CqlAntlr(cql).parse().includes?.length;
      setIncludedLibraryCount(count || 0);
    }
  }, [cql]);

  return (
    <div id="includes-panel" data-testId="includes-panel">
      <LibraryTabs
        activeTab={activeLibraryTab}
        setActiveTab={setActiveLibraryTab}
        includedLibraryCount={includedLibraryCount}
      />
      {activeLibraryTab === "library" && (
        <LibrarySearch
          canEdit={canEdit}
          measureModel={measureModel}
          handleApplyLibrary={handleApplyLibrary}
          cql={cql}
          isCQLUnchanged={isCQLUnchanged}
          setIsCQLUnchanged={setIsCQLUnchanged}
          setEditorValue={setEditorValue}
        />
      )}
      {activeLibraryTab === "saved-libraries" && (
        <SavedLibraryIncludes
          canEdit={canEdit}
          cql={cql}
          measureModel={measureModel}
          isCQLUnchanged={isCQLUnchanged}
          setIsCQLUnchanged={setIsCQLUnchanged}
          setEditorValue={setEditorValue}
          handleDeleteLibrary={handleDeleteLibrary}
          handleEditLibrary={handleEditLibrary}
        />
      )}
    </div>
  );
}
