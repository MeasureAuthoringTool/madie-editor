import React, { useState } from "react";
import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";
import { IconButton } from "@mui/material";
import TerminologySectionPanelNavTabs from "./TerminologySectionPanelNavTabs";
import ValueSetsSection from "./valueSetsSection/ValueSetsSection";
import CodesSection from "./codesSection/CodesSection";
import DefinitionsSection from "./definitionsSection/DefinitionsSection";

export default function TerminologySectionPanel() {
  const [activeTab, setActiveTab] = useState<string>("valueSets");

  return (
    <div className="right-panel">
      <div className="tab-container">
        <TerminologySectionPanelNavTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
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
