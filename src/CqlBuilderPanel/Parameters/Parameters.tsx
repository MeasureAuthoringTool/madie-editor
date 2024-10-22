import React, { useState } from "react";
import ParametersNavTabs from "./ParamatersNavTabs";
import ParameterPane from "./ParameterPane";
import "./Parameters.scss";
import SavedParameters from "./SavedParameters";
import { CqlBuilderLookup } from "../..//model/CqlBuilderLookup";

export interface ParametersProps {
  canEdit: boolean;
  parameters?: any;
  handleApplyParameter: Function;
  handleParameterEdit?: Function;
  handleParameterDelete?: Function;
  cqlBuilderLookupsTypes?: CqlBuilderLookup;
  isCQLUnchanged: boolean;
  cql: string;
  setEditorValue: (cql: string) => void;
  resetCql: Function;
  loading: boolean;
}

export default function Parameters({
  canEdit,
  isCQLUnchanged,
  cql,
  setEditorValue,
  handleParameterEdit,
  handleParameterDelete,
  resetCql,
  cqlBuilderLookupsTypes,
  loading,
  handleApplyParameter,
}: ParametersProps) {
  const [activeTab, setActiveTab] = useState("parameters");
  const [parameters, setParameters] = useState(
    cqlBuilderLookupsTypes?.parameters ? cqlBuilderLookupsTypes?.parameters : []
  );

  return (
    <form id="cql-editor-parameters" data-testId="cql-editor-parameters">
      <ParametersNavTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        parameterCount={cqlBuilderLookupsTypes?.parameters?.length}
      />

      {activeTab === "parameters" && (
        <ParameterPane handleApplyParameter={handleApplyParameter} />
      )}
      {activeTab === "savedParameters" && (
        <div data-testId="saved-parameters">
          <SavedParameters
            canEdit={canEdit}
            parameters={parameters}
            handleApplyParameter={handleApplyParameter}
            isCQLUnchanged={isCQLUnchanged}
            cql={cql}
            setEditorValue={setEditorValue}
            handleParameterDelete={handleParameterDelete}
            resetCql={resetCql}
            handleParameterEdit={handleParameterEdit}
            loading={loading}
          />
        </div>
      )}
    </form>
  );
}
