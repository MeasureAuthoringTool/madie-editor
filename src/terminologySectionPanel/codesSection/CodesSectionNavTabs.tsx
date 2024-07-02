import React from "react";
import { Tabs, Tab } from "@madie/madie-design-system/dist/react";

export interface NavTabProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export default function CodesSectionNavTabs(props: NavTabProps) {
  const { activeTab, setActiveTab } = props;

  return (
    <div style={{ borderBottom: "1px solid #b0b0b0" }} tw="flex flex-row">
      <Tabs
        id="codes-tabs"
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
          aria-label="Code"
          type="B"
          label="Code"
          data-testid="code-tab"
          value="code"
        />
        <Tab
          tabIndex={0}
          aria-label="Saved Codes"
          type="B"
          label="Saved Codes"
          data-testid="savedCodes-tab"
          value="savedCodes"
        />
      </Tabs>
    </div>
  );
}
