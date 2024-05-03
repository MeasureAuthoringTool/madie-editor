import React, { useState } from "react";
import "twin.macro";
import "styled-components/macro";
import CodesSectionNavTabs from "./CodesSectionNavTabs";
import CodeSubSection from "./codesSubSection/codeSubSection/CodeSubSection";
import SavedCodesSubSection from "./codesSubSection/savedCodesSubSection/SavedCodesSubSection";
import { useCodeSystems } from "./useCodeSystems";

interface CodesSectionProps {
  canEdit: boolean;
  measureStoreCql: string;
}

export default function CodesSection({
  canEdit,
  measureStoreCql,
}: CodesSectionProps) {
  const [activeTab, setActiveTab] = useState<string>("codeSystems");
  const { codeSystems } = useCodeSystems();
  return (
    <>
      <CodesSectionNavTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div tw="mt-4">
        {activeTab === "codeSystems" && "Code Systems Section"}
        {activeTab === "code" && (
          <CodeSubSection allCodeSystems={codeSystems} canEdit={canEdit} />
        )}
        {activeTab === "savedCodes" && (
          <SavedCodesSubSection measureStoreCql={measureStoreCql} />
        )}
      </div>
    </>
  );
}
