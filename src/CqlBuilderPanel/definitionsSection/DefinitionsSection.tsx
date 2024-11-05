import React, { useState } from "react";
import "./Definitions.scss";
import DefinitionSectionNavTabs from "./DefinitionSectionNavTabs";
import Definitions from "./definitions/Definitions";
import DefinitionBuilder from "./definitionBuilder/DefinitionBuilder";
import { CqlBuilderLookup } from "../../model/CqlBuilderLookup";
import { CqlAntlr } from "@madie/cql-antlr-parser/dist/src";

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
  loading: boolean;
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
  loading,
}: DefinitionProps) {
  const [activeTab, setActiveTab] = useState<string>("definition");
  const expressionDefinitions = cql
    ? new CqlAntlr(cql).parse().expressionDefinitions
    : [];

  const measureDefinitions =
    cqlBuilderLookupsTypes?.definitions
      ?.filter((definition) => !definition.libraryName)
      .map((definition) => {
        // get the comments for CQL definition from antlr parser expressions
        const expression = expressionDefinitions.find(
          (expression) =>
            definition.name == expression.name?.replace(/["']/g, "")
        );
        return { ...definition, comment: expression?.comment };
      }) || [];

  return (
    <>
      <DefinitionSectionNavTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        definitionCount={measureDefinitions.length}
        loading={loading}
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
            loading={loading}
          />
        )}
      </div>
    </>
  );
}
