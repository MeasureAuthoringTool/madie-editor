import React, { useState } from "react";
import CodesSectionNavTabs from "./CodesSectionNavTabs";
import CodeSubSection from "./codesSubSection/codeSubSection/CodeSubSection";
import AppliedSubSection from "./codesSubSection/appliedSubSection/AppliedSubSection";

export default function CodesSection() {
  const [activeTab, setActiveTab] = useState<string>("codeSystems");
  return (
    <>
      <CodesSectionNavTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div style={{ marginTop: "20px" }}>
        {activeTab === "codeSystems" && "Code Systems Section"}
        {activeTab === "code" && <CodeSubSection />}
        {activeTab === "applied" && <AppliedSubSection />}
      </div>
    </>
  );
}
