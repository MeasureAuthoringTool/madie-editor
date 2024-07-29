import React from "react";
import { Tabs, Tab } from "@madie/madie-design-system/dist/react";
export interface NavTabProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  canEdit: boolean;
  CQLBuilderIncludes: boolean;
  QDMValueSetSearch: boolean;
  CQLBuilderDefinitions: boolean;
}

export default function CqlBuilderSectionPanelNavTabs(props: NavTabProps) {
  const {
    activeTab,
    setActiveTab,
    canEdit,
    QDMValueSetSearch,
    CQLBuilderIncludes,
    CQLBuilderDefinitions,
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
      {CQLBuilderIncludes && (
        <Tab
          tabIndex={0}
          aria-label="Includes"
          type="B"
          label="Includes"
          data-testid="includes-tab"
          value="includes"
        />
      )}

      {QDMValueSetSearch && (
        <Tab
          tabIndex={0}
          aria-label="Value Sets"
          type="B"
          label="Value Sets"
          data-testid="valueSets-tab"
          value="valueSets"
        />
      )}
      <Tab
        tabIndex={0}
        aria-label="Codes"
        type="D"
        label="Codes"
        data-testid="codes-tab"
        value="codes"
      />
      {CQLBuilderDefinitions && (
        <Tab
          tabIndex={0}
          aria-label="Definitions"
          type="D"
          value="definitions"
          label="Definitions"
          data-testid="definitions-tab"
        />
      )}
    </Tabs>
  );
}
