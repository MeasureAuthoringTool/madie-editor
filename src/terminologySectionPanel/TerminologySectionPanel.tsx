import React, { useState, useRef, useEffect } from "react";
import KeyboardTabIcon from "@mui/icons-material/KeyboardTab";
import { IconButton } from "@mui/material";
import TerminologySectionPanelNavTabs from "./TerminologySectionPanelNavTabs";
import ValueSetsSection from "./valueSetsSection/ValueSetsSection";
import CodesSection from "./codesSection/CodesSection";
import DefinitionsSection from "./definitionsSection/DefinitionsSection";
import { useFeatureFlags } from "@madie/madie-util";

export default function TerminologySectionPanel({ canEdit }) {
  const featureFlags = useFeatureFlags();
  const { QDMValueSetSearch } = featureFlags;
  const [activeTab, setActiveTab] = useState<string>(
    QDMValueSetSearch ? "valueSets" : "codes"
  );

  return (
    <div className="right-panel">
      <div className="tab-container">
        <TerminologySectionPanelNavTabs
          canEdit={canEdit}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          QDMValueSetSearch={QDMValueSetSearch}
        />
        <div className="spacer" />
        <IconButton>
          <KeyboardTabIcon className="back-icon" />
        </IconButton>
      </div>
      <div className="panel-content">
        {activeTab === "valueSets" && <ValueSetsSection />}
        {activeTab === "codes" && <CodesSection canEdit={canEdit} />}
        {activeTab === "definitions" && <DefinitionsSection />}
      </div>
    </div>
  );
}
