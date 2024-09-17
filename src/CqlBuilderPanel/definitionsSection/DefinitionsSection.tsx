import React, { useState } from "react";
import "./Definitions.scss";
import DefinitionSectionNavTabs from "./DefinitionSectionNavTabs";
import Definitions from "./definitions/Definitions";
import DefinitionBuilder from "./definitionBuilder/DefinitionBuilder";
import { CqlBuilderLookup } from "../../model/CqlBuilderLookup";
import { ResetTvTwoTone } from "@mui/icons-material";

interface DefinitionProps {
  canEdit: boolean;
  handleApplyDefinition: Function;
  handleDefinitionDelete: Function;
  cqlBuilderLookupsTypes: CqlBuilderLookup;
  setIsCQLUnchanged: boolean;
  isCQLUnchanged: boolean;
  cql: string;
  setEditorVal: (cql: string) => void;
  resetCql: Function;
}

export default function DefinitionsSection({
  canEdit,
  handleDefinitionDelete,
  handleApplyDefinition,
  cqlBuilderLookupsTypes,
  isCQLUnchanged,
  cql,
  setEditorVal,
  resetCql,
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
            definitions={measureDefinitions}
            isCQLUnchanged={isCQLUnchanged}
            cql={cql}
            setEditorValue={setEditorVal}
            handleDefinitionDelete={handleDefinitionDelete}
            resetCql={resetCql}
            cqlBuilderLookup={cqlBuilderLookupsTypes}
          />
        )}
      </div>
    </>
  );
}
