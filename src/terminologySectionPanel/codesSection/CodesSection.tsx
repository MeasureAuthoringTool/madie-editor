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
  handleChange;
  handleCodeDelete;
}

export default function CodesSection({
  canEdit,
  measureStoreCql,
  cqlMetaData,
  measureModel,
  handleChange,
  handleCodeDelete,
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
            handleChange={handleChange}
            measureModel={measureModel}
          />
        )}
        {activeTab === "savedCodes" && (
          <SavedCodesSubSection
            measureStoreCql={measureStoreCql}
            cqlMetaData={cqlMetaData}
            canEdit={canEdit}
            handleCodeDelete={handleCodeDelete}
          />
        )}
      </div>
    </>
  );
}
