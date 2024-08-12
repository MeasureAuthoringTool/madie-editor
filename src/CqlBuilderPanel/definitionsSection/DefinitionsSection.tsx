import React, { useState } from "react";
import "twin.macro";
import "styled-components/macro";
import "./Definitions.scss";
import DefinitionSectionNavTabs from "./DefinitionSectionNavTabs";
import DefinitionSection from "./DefinitionSection";

interface DefinitionProps {
  canEdit: boolean;
  handleApplyDefinition: Function;
  availableParameters: string[];
}

export default function DefinitionsSection({
  canEdit,
  handleApplyDefinition,
  availableParameters,
}: DefinitionProps) {
  const [activeTab, setActiveTab] = useState<string>("definition");

  return (
    <>
      <DefinitionSectionNavTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div>
        {activeTab === "definition" && (
          <DefinitionSection
            canEdit={canEdit}
            handleApplyDefinition={handleApplyDefinition}
            availableParameters={availableParameters}
          />
        )}
        {activeTab === "savedDefinitions" && (
          <div>Saved Definitions Placeholder</div>
        )}
      </div>
    </>
  );
}
