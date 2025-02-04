import React from "react";
import { Tabs, Tab } from "@madie/madie-design-system/dist/react";
export interface NavTabProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  isQDM: boolean;
  QICoreValueSetSearch: boolean;
}

export default function CqlBuilderSectionPanelNavTabs(props: NavTabProps) {
  const {
    activeTab,
    setActiveTab,
    QICoreValueSetSearch,
    isQDM,
  } = props;

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
        aria-label="Includes"
        type="B"
        label="Includes"
        data-testid="includes-tab"
        value="includes"
      />
      {(isQDM || QICoreValueSetSearch) && (
        <Tab
          tabIndex={0}
          aria-label="Value Sets"
          type="B"
          label="Value Sets"
          data-testid="valueSets-tab"
          value="valueSets"
        />
      )}
      {(isQDM) && (
        <Tab
          tabIndex={0}
          aria-label="Codes"
          type="D"
          label="Codes"
          data-testid="codes-tab"
          value="codes"
        />
      )}
        <Tab
          tabIndex={0}
          aria-label="Parameters"
          type="D"
          label="Parameters"
          data-testid="parameters-tab"
          value="parameters"
        />
      <Tab
        tabIndex={0}
        aria-label="Definitions"
        type="D"
        value="definitions"
        label="Definitions"
        data-testid="definitions-tab"
      />
        <Tab
          tabIndex={0}
          aria-label="Functions"
          type="D"
          value="functions"
          label="Functions"
          data-testid="functions-tab"
        />
    </Tabs>
  );
}
