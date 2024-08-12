import React, { useState } from "react";
import LibrarySearch from "./LibrarySearch";
import LibraryTabs from "./LibraryTabs";
import "./Includes.scss";

interface IncludesProps {
  canEdit: boolean;
  measureModel: string;
}

export default function Includes(props: IncludesProps) {
  const { measureModel, canEdit } = props;
  const [activeLibraryTab, setActiveLibraryTab] = useState<string>("library");
  return (
    <div id="includes-panel" data-testId="includes-panel">
      <LibraryTabs
        activeTab={activeLibraryTab}
        setActiveTab={setActiveLibraryTab}
      />
      {activeLibraryTab === "library" && (
        <LibrarySearch canEdit={canEdit} measureModel={measureModel} />
      )}
      {activeLibraryTab === "saved-libraries" && "In progress..."}
    </div>
  );
}
