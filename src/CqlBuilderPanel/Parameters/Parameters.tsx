import React, { useState } from "react";
import ParametersNavTabs from "./ParamatersNavTabs";
import ParameterPane from "./ParameterPane";
import "./Parameters.scss";

export default function Parameters({ handleApplyParameter }) {
  const [activeTab, setActiveTab] = useState("parameters");

  return (
    <form id="cql-editor-parameters" data-testId="cql-editor-parameters">
      <ParametersNavTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "parameters" && (
        <ParameterPane handleApplyParameter={handleApplyParameter} />
      )}
      {activeTab === "savedParameters" && (
        <div data-testId="saved-parameters" />
      )}
    </form>
  );
}
