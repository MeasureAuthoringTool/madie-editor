import React, { useState } from "react";
import LibraryTabContent from "./LibraryTabContent";
import LibraryTabs from "./LibraryTabs";
import "./Includes.scss";

interface IncludesProps {
  canEdit: boolean;
}

export default function Includes(props: IncludesProps) {
  const { canEdit } = props;
  const [activeLibraryTab, setActiveLibraryTab] = useState<string>("library");

  return (
    <div id="includes-panel" data-testId="includes-panel">
      <LibraryTabs
        activeTab={activeLibraryTab}
        setActiveTab={setActiveLibraryTab}
      />
      <LibraryTabContent
        activeLibraryTab={activeLibraryTab}
        canEdit={canEdit}
      />
    </div>
  );
}
