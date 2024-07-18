import React, { useState } from "react";
import "twin.macro";
import "styled-components/macro";
import "./Definitions.scss";
import DefinitionSectionNavTabs from "./DefinitionSectionNavTabs";
import DefinitionSection from "./DefinitionSection";

interface DefinitionProps {
  canEdit: boolean;
}

export default function DefinitionsSection({ canEdit }: DefinitionProps) {
  const [activeTab, setActiveTab] = useState<string>("definition");

  return (
    <>
      <DefinitionSectionNavTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div>
        {activeTab === "definition" && <DefinitionSection canEdit={canEdit} />}
        {activeTab === "savedDefinitions" && (
          <div>Saved Definitions Placeholder</div>
        )}
      </div>
    </>
  );
}
