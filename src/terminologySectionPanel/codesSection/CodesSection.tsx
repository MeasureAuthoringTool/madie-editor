import React, { useState, useEffect } from "react";
import "twin.macro";
import "styled-components/macro";
import CodesSectionNavTabs from "./CodesSectionNavTabs";
import CodeSubSection from "./codesSubSection/codeSubSection/CodeSubSection";
import AppliedSubSection from "./codesSubSection/appliedSubSection/AppliedSubSection";
import useTerminologyServiceApi, {
  CodeSystem,
} from "../../api/useTerminologyServiceApi";

export default function CodesSection({ canEdit }) {
  const [activeTab, setActiveTab] = useState<string>("codeSystems");
  const [allCodeSystems, setAllCodeSystems] = useState<CodeSystem[]>([]);

  useEffect(() => {
    const getCodeSystems = async () => {
      const terminologyService = await useTerminologyServiceApi();
      const codeSystems = await terminologyService.getAllCodeSystems();
      setAllCodeSystems(codeSystems);
    };
    getCodeSystems();
  }, []);
  return (
    <>
      <CodesSectionNavTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <div tw="mt-4">
        {activeTab === "codeSystems" && "Code Systems Section"}
        {activeTab === "code" && (
          <CodeSubSection allCodeSystems={allCodeSystems} canEdit={canEdit}/>
        )}
        {activeTab === "applied" && <AppliedSubSection />}
      </div>
    </>
  );
}
