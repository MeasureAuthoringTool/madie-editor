import React from "react";
import { Tabs, Tab } from "@madie/madie-design-system/dist/react";
export interface LibraryTabsProps {
  activeTab: string;
  includedLibraryCount: number;
  setActiveTab: (value: string) => void;
}

export default function LibraryTabs(props: LibraryTabsProps) {
  const { activeTab, includedLibraryCount, setActiveTab } = props;

  return (
    <Tabs
      id="includes-library-tabs"
      value={activeTab}
      onChange={(e, v) => {
        setActiveTab(v);
      }}
      type="B"
    >
      <Tab
        tabIndex={0}
        aria-label="Library"
        type="B"
        label="Library"
        data-testid="library-tab"
        value="library"
      />
      <Tab
        tabIndex={0}
        aria-label="Saved Libraries"
        type="B"
        label={`Saved Libraries (${includedLibraryCount})`}
        data-testid="saved-libraries-tab"
        value="saved-libraries"
      />
    </Tabs>
  );
}
