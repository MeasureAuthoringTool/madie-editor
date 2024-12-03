import React, { useState } from "react";
import "./Functions.scss";
import FunctionSectionNavTabs from "./FunctionSectionNavTabs";
import Functions from "./functions/Functions";
import FunctionBuilder from "./functionBuilder/FunctionBuilder";
import {
  CqlBuilderLookup,
  Lookup,
  FunctionLookup,
} from "../..//model/CqlBuilderLookup";
import * as _ from "lodash";
import { CqlAntlr } from "@madie/cql-antlr-parser/dist/src";

export interface FunctionProps {
  canEdit: boolean;
  handleApplyFunction?: Function;
  loading: boolean;
  cqlBuilderLookupsTypes?: CqlBuilderLookup;
  cql: string;
  isCQLUnchanged: boolean;
  functions?: FunctionLookup[];
}
const getArgumentNames = (logic: string) => {
  const args = logic.substring(logic.indexOf("(") + 1, logic.indexOf(")"));
  return args.split(",");
};
const getFunctionLookups = (
  lookups: Lookup[],
  isFluent: string
): FunctionLookup[] => {
  return lookups.map((lookup) => {
    return {
      ...lookup,
      isFluent: isFluent,
      argumentNames: getArgumentNames(lookup.logic),
    };
  });
};

export default function FunctionsSection({
  canEdit,
  handleApplyFunction,
  loading,
  cql,
  isCQLUnchanged,
  cqlBuilderLookupsTypes,
}: FunctionProps) {
  const [activeTab, setActiveTab] = useState<string>("function");

  const expressionDefinitions = cql
    ? new CqlAntlr(cql).parse().expressionDefinitions
    : [];

  const functions: Lookup[] =
    cqlBuilderLookupsTypes?.functions
      ?.filter((func) => !func.libraryName)
      .map((func) => {
        // get the comments for CQL definition from antlr parser expressions
        const expression = expressionDefinitions.find(
          (expression) => func.logic == expression.text?.replace(/["']/g, "")
        );
        return { ...func, comment: expression?.comment };
      }) || [];
  let functionLookups: FunctionLookup[] = getFunctionLookups(functions, "-");

  const fluentFunctions: Lookup[] =
    cqlBuilderLookupsTypes?.fluentFunctions
      ?.filter((func) => !func.libraryName)
      .map((func) => {
        const expression = expressionDefinitions.find(
          (expression) => func.logic == expression.text
        );
        return { ...func, comment: expression?.comment };
      }) || [];
  if (fluentFunctions && fluentFunctions.length > 0) {
    fluentFunctions.every((func) => {
      functionLookups.push({
        ...func,
        isFluent: "Yes",
        argumentNames: getArgumentNames(func.logic),
      });
    });
  }
  functionLookups = _.sortBy(functionLookups, (o) => o.name?.toLowerCase());

  return (
    <>
      <FunctionSectionNavTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        functionCount={functionLookups ? functionLookups.length : 0}
        loading={loading}
      />
      <div>
        {activeTab === "function" && (
          <FunctionBuilder
            canEdit={canEdit}
            handleApplyFunction={handleApplyFunction}
          />
        )}
        {activeTab === "saved-functions" && (
          <Functions
            canEdit={canEdit}
            loading={loading}
            functions={_.sortBy(functionLookups)}
            isCQLUnchanged={isCQLUnchanged}
            cql={cql}
          />
        )}
      </div>
    </>
  );
}
