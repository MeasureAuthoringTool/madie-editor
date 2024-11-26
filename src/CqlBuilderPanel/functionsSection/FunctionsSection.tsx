import React, { useState } from "react";
import "./Functions.scss";
import FunctionSectionNavTabs from "./FunctionSectionNavTabs";
import Functions from "./functions/Functions";
import FunctionBuilder from "./functionBuilder/FunctionBuilder";

interface FunctionProps {
  canEdit: boolean;
  handleApplyFunction: Function;
  loading: boolean;
}

export default function FunctionsSection({
  canEdit,
  handleApplyFunction,
  loading,
}: FunctionProps) {
  const [activeTab, setActiveTab] = useState<string>("function");

  return (
    <>
      <FunctionSectionNavTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        functionCount={0}
        loading={loading}
      />
      <div>
        {activeTab === "function" && (
          <FunctionBuilder
            canEdit={canEdit}
            handleApplyFunction={handleApplyFunction}
          />
        )}
        {activeTab === "saved-functions" && <Functions />}
      </div>
    </>
  );
}
