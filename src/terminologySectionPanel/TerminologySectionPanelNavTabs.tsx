import React from "react";
import { Tabs, Tab } from "@madie/madie-design-system/dist/react";

export interface NavTabProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export default function TerminologySectionPanelNavTabs(props: NavTabProps) {
  const { activeTab, setActiveTab } = props;
  return (
    <Tabs
      id="terminology-section-panel-navs"
      value={activeTab}
      onChange={(e, v) => {
        setActiveTab(v);
      }}
      type="D"
    >
      <Tab
        tabIndex={0}
        aria-label="Value Sets"
        type="B"
        label="Value Sets"
        data-testid="valueSets-tab"
        value="valueSets"
      />
      <Tab
        tabIndex={0}
        aria-label="Codes"
        type="D"
        label="Codes"
        data-testid="codes-tab"
        value="codes"
      />
      <Tab
        tabIndex={0}
        aria-label="Definitions"
        type="D"
        value="definitions"
        label="Definitions"
        data-testid="definitions-tab"
      />
    </Tabs>
  );
}