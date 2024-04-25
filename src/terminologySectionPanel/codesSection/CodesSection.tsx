import React, { useState } from "react";
import "twin.macro";
import "styled-components/macro";
import CodesSectionNavTabs from "./CodesSectionNavTabs";
import CodeSubSection from "./codesSubSection/codeSubSection/CodeSubSection";
import SavedCodesSubSection from "./codesSubSection/savedCodesSubSection/SavedCodesSubSection";

export default function CodesSection({ canEdit }) {
  const [activeTab, setActiveTab] = useState<string>("codeSystems");
  return (
    <>
      <CodesSectionNavTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div tw="mt-4">
        {activeTab === "codeSystems" && "Code Systems Section"}
        {activeTab === "code" && <CodeSubSection canEdit={canEdit} />}
        {activeTab === "savedCodes" && <SavedCodesSubSection />}
      </div>
    </>
  );
}
