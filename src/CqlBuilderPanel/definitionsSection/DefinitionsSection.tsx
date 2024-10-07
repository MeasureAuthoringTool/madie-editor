import React, { useState } from "react";
import "./Definitions.scss";
import DefinitionSectionNavTabs from "./DefinitionSectionNavTabs";
import Definitions from "./definitions/Definitions";
import DefinitionBuilder from "./definitionBuilder/DefinitionBuilder";
import { CqlBuilderLookup } from "../../model/CqlBuilderLookup";

interface DefinitionProps {
  canEdit: boolean;
  handleApplyDefinition: Function;
  handleDefinitionEdit: Function;
  handleDefinitionDelete: Function;
  cqlBuilderLookupsTypes: CqlBuilderLookup;
  isCQLUnchanged: boolean;
  cql: string;
  setEditorVal: (cql: string) => void;
  resetCql: Function;
  getCqlDefinitionReturnTypes: Function;
}

export default function DefinitionsSection({
  canEdit,
  handleDefinitionDelete,
  handleApplyDefinition,
  handleDefinitionEdit,
  cqlBuilderLookupsTypes,
  isCQLUnchanged,
  cql,
  setEditorVal,
  resetCql,
  getCqlDefinitionReturnTypes,
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
            canEdit={canEdit}
            definitions={measureDefinitions}
            isCQLUnchanged={isCQLUnchanged}
            cql={cql}
            setEditorValue={setEditorVal}
            handleDefinitionDelete={handleDefinitionDelete}
            resetCql={resetCql}
            getCqlDefinitionReturnTypes={getCqlDefinitionReturnTypes}
            cqlBuilderLookup={cqlBuilderLookupsTypes}
            handleDefinitionEdit={handleDefinitionEdit}
          />
        )}
      </div>
    </>
  );
}
