import React, { useState } from "react";
import "./Definitions.scss";
import DefinitionSectionNavTabs from "./DefinitionSectionNavTabs";
import { CqlBuilderLookupData } from "../../model/CqlBuilderLookup";
import Definitions from "./definitions/Definitions";
import DefinitionBuilder from "./definitionBuilder/DefinitionBuilder";
interface DefinitionProps {
  canEdit: boolean;
  handleApplyDefinition: Function;
  handleDefinitionDelete: Function;
  cqlBuilderLookupsTypes: CqlBuilderLookupData;
  setIsCQLUnchanged: boolean;
  isCQLUnchanged: boolean;
}

export default function DefinitionsSection({
  canEdit,
  handleApplyDefinition,
  cqlBuilderLookupsTypes,
}: DefinitionProps) {
  const [activeTab, setActiveTab] = useState<string>("definition");

  return (
    <>
      <DefinitionSectionNavTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        definitionCount={(() => {
          if (cqlBuilderLookupsTypes?.definitions) {
            return cqlBuilderLookupsTypes.definitions.length;
          } else {
            return 0;
          }
        })()}
      />
      <div>
        {activeTab === "definition" && (
          <DefinitionBuilder
            canEdit={canEdit}
            handleApplyDefinition={handleApplyDefinition}
            cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
          />
        )}
        {activeTab === "saved-definitions" && (
          <Definitions cqlBuilderLookupsTypes={cqlBuilderLookupsTypes} />
        )}
      </div>
    </>
  );
}
