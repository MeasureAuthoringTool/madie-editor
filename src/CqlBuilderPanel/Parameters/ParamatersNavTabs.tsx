import React from "react";
import { Tabs, Tab } from "@madie/madie-design-system/dist/react";

export interface ParameterNavTabProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  parameterCount: number;
  loading?: boolean;
}

export default function ParametersNavTabs(props: ParameterNavTabProps) {
  const { activeTab, setActiveTab, parameterCount, loading } = props;

  return (
    <div style={{ borderBottom: "1px solid #b0b0b0" }} tw="flex flex-row">
      <Tabs
        id="parameters-tabs"
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
          aria-label="parameter"
          type="B"
          label="Parameter"
          data-testid="parameter-tab"
          value="parameters"
        />
        <Tab
          tabIndex={0}
          aria-label="Saved Parameters"
          type="B"
          label={`Saved Parameters ${
            !loading ? "(" + parameterCount + ")" : ""
          }`}
          data-testid="saved-parameters-tab"
          value="savedParameters"
        />
      </Tabs>
    </div>
  );
}
