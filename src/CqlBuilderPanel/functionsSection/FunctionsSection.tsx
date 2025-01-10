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

  let functArgs: FunctionArgument[] = [];
  // regex by comma but not the comma within double quotes:
  // e.g. Encounter "Encounter, Performed", "Encounter 2" "Encounter, Performed"
  const regexByComma = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;
  const resultByComma = args.split(regexByComma);

  resultByComma.forEach((str) => {
    //regex by space but not the space within double quotes, same example as above
    const regexBySpace = /\w+|"(?:\\"|[^"])+"/g;
    const resultBySpace = str.match(regexBySpace);

    functArgs.push({
      argumentName: resultBySpace[0],
      dataType: resultBySpace[1],
    });
  });
  return functArgs;
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

  let functionLookups: FunctionLookup[] = [];
  expressionDefinitions?.forEach((expression) => {
    if (expression.name === "function") {
      const found = cqlBuilderLookupsTypes?.functions?.find(
        (funct) => funct.logic === expression.text
      );
      if (found) {
        functionLookups.push({
          ...found,
          comment: expression?.comment,
          isFluent: "-",
          arguments: getArgumentNames(found.logic),
          expressionEditorValue: getExpressionEditorValue(found.logic),
        } as FunctionLookup);
      }
    } else if (expression.name === "fluent") {
      const found = cqlBuilderLookupsTypes?.fluentFunctions?.find(
        (funct) => funct.logic === expression.text
      );
      if (found) {
        functionLookups.push({
          ...found,
          comment: expression?.comment,
          isFluent: "Yes",
          arguments: getArgumentNames(found.logic),
          expressionEditorValue: getExpressionEditorValue(found.logic),
        } as FunctionLookup);
      }
    }
  });

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
