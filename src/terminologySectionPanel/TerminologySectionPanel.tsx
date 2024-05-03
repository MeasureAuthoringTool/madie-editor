import React, { useState } from "react";
import TerminologySectionPanelNavTabs from "./TerminologySectionPanelNavTabs";
import ValueSetsSection from "./ValueSets/ValueSets";
import CodesSection from "./codesSection/CodesSection";
import DefinitionsSection from "./definitionsSection/DefinitionsSection";
import { useFeatureFlags } from "@madie/madie-util";

export default function TerminologySectionPanel({
  canEdit,
  //editorValue,
  // handleFormSubmit,
  // setHandleFormSubmit,
  measureStoreCql,
}) {
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
      </div>
      <div className="panel-content">
        {activeTab === "valueSets" && <ValueSetsSection canEdit={canEdit} />}
        {activeTab === "codes" && (
          <CodesSection
            canEdit={canEdit}
            //editorValue={editorValue}
            // handleFormSubmit={handleFormSubmit}
            // setHandleFormSubmit={setHandleFormSubmit}
            measureStoreCql={measureStoreCql}
          />
        )}
        {activeTab === "definitions" && <DefinitionsSection />}
      </div>
    </div>
  );
}
