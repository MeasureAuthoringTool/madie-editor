import React, { useState } from "react";
import TerminologySectionPanelNavTabs from "./TerminologySectionPanelNavTabs";
import ValueSetsSection from "./ValueSets/ValueSets";
import CodesSection from "./codesSection/CodesSection";
import DefinitionsSection from "./definitionsSection/DefinitionsSection";
import { useFeatureFlags } from "@madie/madie-util";

export default function TerminologySectionPanel({
  canEdit,
  measureStoreCql,
  cqlMetaData,
  measureModel,
  handleCodeDelete,
  setEditorVal,
  setIsCQLUnchanged,
  isCQLUnchanged,
  handleApplyCode,
  handleApplyValueSet,
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
        {activeTab === "valueSets" && (
          <ValueSetsSection
            canEdit={canEdit}
            handleApplyValueSet={handleApplyValueSet}
          />
        )}
        {activeTab === "codes" && (
          <CodesSection
            canEdit={canEdit}
            measureStoreCql={measureStoreCql}
            cqlMetaData={cqlMetaData}
            measureModel={measureModel}
            handleCodeDelete={handleCodeDelete}
            setEditorVal={setEditorVal}
            setIsCQLUnchanged={setIsCQLUnchanged}
            isCQLUnchanged={isCQLUnchanged}
            handleApplyCode={handleApplyCode}
          />
        )}
        {activeTab === "definitions" && <DefinitionsSection />}
      </div>
    </div>
  );
}
