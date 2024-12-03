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

export interface FunctionProps {
  canEdit: boolean;
  handleApplyFunction?: Function;
  loading: boolean;
  cqlBuilderLookupsTypes?: CqlBuilderLookup;
  functions?: FunctionLookup[];
  isCQLUnchanged: boolean;
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
  cqlBuilderLookupsTypes,
  isCQLUnchanged,
}: FunctionProps) {
  const [activeTab, setActiveTab] = useState<string>("function");

  const functions: Lookup[] = cqlBuilderLookupsTypes?.functions
    ? cqlBuilderLookupsTypes?.functions.filter((func) => !func.libraryName)
    : [];
  let functionLookups: FunctionLookup[] = getFunctionLookups(functions, "-");

  const fluentFunctions: Lookup[] = cqlBuilderLookupsTypes?.fluentFunctions
    ? cqlBuilderLookupsTypes?.fluentFunctions.filter(
        (func) => !func.libraryName
      )
    : [];
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
          />
        )}
      </div>
    </>
  );
}
