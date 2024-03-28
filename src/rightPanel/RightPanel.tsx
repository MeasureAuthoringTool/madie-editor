import React, { useState } from "react";
import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";
import { IconButton } from "@mui/material";
import ValueSetsSection from "./valueSetsTab/ValueSetsSection";
import RightPanelNavTabs from "./RightPanelNavTabs";
import DefinitionsSection from "./definitionsTab/DefinitionsSection";
import CodesSection from "./codesTab/CodesSection";

export default function RightPanel() {
  const [activeTab, setActiveTab] = useState<string>("valueSets");

  return (
    <div className="right-panel">
      <div className="tab-container">
        <RightPanelNavTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="spacer" />
        <IconButton>
          <KeyboardTabIcon className="back-icon" />
        </IconButton>
      </div>
      <div className="panel-content">
        {activeTab === "valueSets" && <ValueSetsSection />}
        {activeTab === "codes" && <CodesSection />}
        {activeTab === "definitions" && <DefinitionsSection />}
      </div>
    </div>
  );
}
