import React, { useState } from "react";
import "twin.macro";
import "styled-components/macro";
import CodesSectionNavTabs from "./CodesSectionNavTabs";
import CodeSubSection from "./codesSubSection/codeSubSection/CodeSubSection";
import SavedCodesSubSection from "./codesSubSection/savedCodesSubSection/SavedCodesSubSection";
import { useCodeSystems } from "./useCodeSystems";
import { CqlMetaData } from "../../api/useTerminologyServiceApi";

interface CodesSectionProps {
  canEdit: boolean;
  measureStoreCql: string;
  cqlMetaData: CqlMetaData;
  measureModel: string;
  handleCodeDelete;
  setEditorVal: Function;
  setIsCQLUnchanged: Function;
  isCQLUnchanged: boolean;
  handleApplyCode;
}

export default function CodesSection({
  canEdit,
  measureStoreCql,
  cqlMetaData,
  measureModel,
  handleCodeDelete,
  setEditorVal,
  setIsCQLUnchanged,
  isCQLUnchanged,
  handleApplyCode,
}: CodesSectionProps) {
  const [activeTab, setActiveTab] = useState<string>("codeSystems");
  const { codeSystems } = useCodeSystems();
  return (
    <>
      <CodesSectionNavTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div tw="mt-4">
        {activeTab === "codeSystems" && "Code Systems Section"}
        {activeTab === "code" && (
          <CodeSubSection
            allCodeSystems={codeSystems}
            canEdit={canEdit}
            handleApplyCode={handleApplyCode}
            measureModel={measureModel}
          />
        )}
        {activeTab === "savedCodes" && (
          <SavedCodesSubSection
            measureStoreCql={measureStoreCql}
            cqlMetaData={cqlMetaData}
            canEdit={canEdit}
            handleApplyCode={handleApplyCode}
            handleCodeDelete={handleCodeDelete}
            setEditorVal={setEditorVal}
            setIsCQLUnchanged={setIsCQLUnchanged}
            isCQLUnchanged={isCQLUnchanged}
          />
        )}
      </div>
    </>
  );
}
