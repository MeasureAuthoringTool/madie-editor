import React, { useState } from "react";
import "twin.macro";
import "styled-components/macro";
import "./Definitions.scss";
import DefinitionSectionNavTabs from "./DefinitionSectionNavTabs";
import DefinitionSection from "./DefinitionSection";
import { CqlBuilderAvailableLookupData } from "./expressionSection/ExpressionEditorHelper";

interface DefinitionProps {
  canEdit: boolean;
  handleApplyDefinition: Function;
  availabeCqlBuilderLookups: CqlBuilderAvailableLookupData | {};
}

export default function DefinitionsSection({
  canEdit,
  handleApplyDefinition,
  availabeCqlBuilderLookups,
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
            availabeCqlBuilderLookups={availabeCqlBuilderLookups}
          />
        )}
        {activeTab === "savedDefinitions" && (
          <div>Saved Definitions Placeholder</div>
        )}
      </div>
    </>
  );
}
