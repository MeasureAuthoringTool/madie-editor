import React, { useState } from "react";
import "./Functions.scss";
import FunctionSectionNavTabs from "./FunctionSectionNavTabs";
import Functions from "./functions/Functions";
import FunctionBuilder from "./functionBuilder/FunctionBuilder";
import {
  CqlBuilderLookup,
  FunctionLookup,
  FunctionArgument,
} from "../../model/CqlBuilderLookup";
import * as _ from "lodash";
import { CqlAntlr } from "@madie/cql-antlr-parser/dist/src";

export interface FunctionProps {
  canEdit: boolean;
  handleApplyFunction?: Function;
  handleFunctionDelete?: Function;
  handleFunctionEdit?: Function;
  loading: boolean;
  cqlBuilderLookupsTypes?: CqlBuilderLookup;
  cql: string;
  isCQLUnchanged: boolean;
  functions?: FunctionLookup[];
  resetCql: Function;
}

const getArgumentNames = (logic: string): FunctionArgument[] => {
  const args = logic.substring(logic.indexOf("(") + 1, logic.indexOf(")"));
  const argstr = args.split(",");
  return argstr.map((arg) => {
    if (arg[0] === " ") {
      arg = arg.substring(1);
    }
    const splitted = arg.split(" ");
    return { argumentName: splitted[0], dataType: splitted[1] };
  });
};

const getExpressionEditorValue = (logic: string): string => {
  const expressionEditorValue = logic.substring(
    logic.indexOf(":") + 1,
    logic.length
  );
  return expressionEditorValue ? expressionEditorValue.trim() : "";
};

export default function FunctionsSection({
  canEdit,
  handleApplyFunction,
  cql,
  isCQLUnchanged,
  cqlBuilderLookupsTypes,
  resetCql,
  handleFunctionDelete,
  handleFunctionEdit,
  loading,
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
          (expression) => func.logic == expression.text
        );
        return {
          ...func,
          comment: expression?.comment,
          isFluent: "-",
          arguments: getArgumentNames(func.logic),
          expressionEditorValue: getExpressionEditorValue(func.logic),
        } as FunctionLookup;
      }) || [];

  functionLookups = functionLookups.concat(
    cqlBuilderLookupsTypes?.fluentFunctions
      ?.filter((func) => !func.libraryName)
      .map((func) => {
        const expression = expressionDefinitions.find(
          (expression) => func.logic == expression.text
        );
        return {
          ...func,
          comment: expression?.comment,
          isFluent: "Yes",
          arguments: getArgumentNames(func.logic),
          expressionEditorValue: getExpressionEditorValue(func.logic),
        } as FunctionLookup;
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
            cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
          />
        )}
        {activeTab === "saved-functions" && (
          <Functions
            cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
            canEdit={canEdit}
            loading={loading}
            functions={functionLookups}
            isCQLUnchanged={isCQLUnchanged}
            cql={cql}
            resetCql={resetCql}
            handleApplyFunction={handleApplyFunction}
            handleFunctionDelete={handleFunctionDelete}
            handleFunctionEdit={handleFunctionEdit}
          />
        )}
      </div>
    </>
  );
}
