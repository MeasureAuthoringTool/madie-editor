import React, { useState } from "react";
import CqlBuilderSectionPanelNavTabs from "./CqlBuilderSectionPanelNavTabs";
import ValueSetsSection from "./ValueSets/ValueSets";
import CodesSection from "./codesSection/CodesSection";
import DefinitionsSection from "./definitionsSection/DefinitionsSection";
import { useFeatureFlags } from "@madie/madie-util";
import IncludesTabSection from "./Includes/Includes";

export default function CqlBuilderPanel({
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
  const { QDMValueSetSearch, CQLBuilderDefinitions, CQLBuilderIncludes } =
    featureFlags;
  // we have multiple flags and need to select a starting value based off of what's available and canEdit.
  const getStartingPage = (() => {
    // if cqlBuilderIncludes -> includes
    // if qdmValueSetSearch -> valueSets
    // else, codes
    if (CQLBuilderIncludes) {
      return "includes";
    }
    if (QDMValueSetSearch) {
      return "valueSets";
    }
    return "codes";
  })();
  const [activeTab, setActiveTab] = useState<string>(getStartingPage);

  return (
    <div className="right-panel">
      <div className="tab-container">
        <CqlBuilderSectionPanelNavTabs
          canEdit={canEdit}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          QDMValueSetSearch={QDMValueSetSearch}
          CQLBuilderDefinitions={CQLBuilderDefinitions}
          CQLBuilderIncludes={CQLBuilderIncludes}
        />
      </div>
      <div className="panel-content">
        {activeTab === "includes" && <IncludesTabSection canEdit={canEdit} />}
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
        {activeTab === "definitions" && (
          <DefinitionsSection canEdit={canEdit} />
        )}
      </div>
    </div>
  );
}
