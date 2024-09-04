import React from "react";
import { Tabs, Tab } from "@madie/madie-design-system/dist/react";

export interface NavTabProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  definitionCount: number;
}

export default function DefinitionSectionNavTabs(props: NavTabProps) {
  const { activeTab, setActiveTab, definitionCount } = props;

  return (
    <div style={{ borderBottom: "1px solid #b0b0b0" }} tw="flex flex-row">
      <Tabs
        id="definition-tabs"
        value={activeTab}
        onChange={(e, v) => {
          setActiveTab(v);
        }}
        type="B"
        visibleScrollbar
        variant="scrollable"
        scrollButtons={false}
      >
        <Tab
          tabIndex={0}
          aria-label="Definition"
          type="B"
          label="Definition"
          data-testid="definition-tab"
          value="definition"
        />
        <Tab
          tabIndex={0}
          aria-label={`Saved Definition(s)`}
          type="B"
          label={`Saved Definition(s) (${definitionCount})`}
          data-testid="savedDefinitions-tab"
          value="savedDefinitions"
        />
      </Tabs>
    </div>
  );
}
