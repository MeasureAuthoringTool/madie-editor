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

  let functionLookups: FunctionLookup[] =
    cqlBuilderLookupsTypes?.functions
      ?.filter((func) => !func.libraryName)
      .map((func) => {
        // get the comments for CQL definition from antlr parser expressions
        const expression = expressionDefinitions.find(
          (expression) => func.logic == expression.text?.replace(/["']/g, "")
        );
        const args = getArgumentNames(func.logic);
        return {
          ...func,
          comment: expression?.comment,
          isFluent: "-",
          argumentNames: args,
        } as FunctionLookup;
      }) || [];

  functionLookups = functionLookups.concat(
    cqlBuilderLookupsTypes?.fluentFunctions
      ?.filter((func) => !func.libraryName)
      .map((func) => {
        const expression = expressionDefinitions.find(
          (expression) => func.logic == expression.text
        );
        const args = getArgumentNames(func.logic);
        return {
          ...func,
          comment: expression?.comment,
          isFluent: "Yes",
          argumentNames: args,
        };
      }) || []
  );
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
            functions={functionLookups}
            isCQLUnchanged={isCQLUnchanged}
            cql={cql}
          />
        )}
      </div>
    </>
  );
}
