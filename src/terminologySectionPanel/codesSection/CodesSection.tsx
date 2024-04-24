import React, { useState } from "react";
import "twin.macro";
import "styled-components/macro";
import CodesSectionNavTabs from "./CodesSectionNavTabs";
import CodeSubSection from "./codesSubSection/codeSubSection/CodeSubSection";
import AppliedSubSection from "./codesSubSection/appliedSubSection/AppliedSubSection";
import { useCodeSystems } from "./useCodeSystems";

interface CodesSectionProps {
  canEdit: boolean;
  handleChange;
}

export default function CodesSection({
  canEdit,
  handleChange,
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
          />
        )}
        {activeTab === "applied" && <AppliedSubSection />}
      </div>
    </>
  );
}
