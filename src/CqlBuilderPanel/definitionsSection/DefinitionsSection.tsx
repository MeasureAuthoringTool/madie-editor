import React, { useState } from "react";
import "./Definitions.scss";
import DefinitionSectionNavTabs from "./DefinitionSectionNavTabs";
import tw from "twin.macro";
import Definitions from "./definitions/Definitions";
import DefinitionBuilder from "./definitionBuilder/DefinitionBuilder";
import { CqlBuilderLookup } from "../../model/CqlBuilderLookup";

interface DefinitionProps {
  canEdit: boolean;
  handleApplyDefinition: Function;
  handleDefinitionDelete: Function;
  cqlBuilderLookupsTypes: CqlBuilderLookup;
  setIsCQLUnchanged: boolean;
  isCQLUnchanged: boolean;
}

export default function DefinitionsSection({
  canEdit,
  handleApplyDefinition,
  cqlBuilderLookupsTypes,
}: DefinitionProps) {
  const [activeTab, setActiveTab] = useState<string>("definition");

  const measureDefinitions =
    cqlBuilderLookupsTypes?.definitions?.filter(
      (definition) => !definition.libraryName
    ) || [];

  return (
    <>
      <DefinitionSectionNavTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        definitionCount={measureDefinitions.length}
      />
      <div>
        {activeTab === "definition" && (
          <DefinitionBuilder
            canEdit={canEdit}
            handleApplyDefinition={handleApplyDefinition}
            cqlBuilderLookup={cqlBuilderLookupsTypes}
          />
        )}
        {activeTab === "saved-definitions" && (
          <Definitions
            cqlBuilderLookup={cqlBuilderLookupsTypes}
            definitions={measureDefinitions}
          />
        )}
      </div>
    </>
  );
}
