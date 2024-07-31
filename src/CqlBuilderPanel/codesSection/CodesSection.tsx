import React, { useState, useEffect } from "react";
import "twin.macro";
import "styled-components/macro";
import CodesSectionNavTabs from "./CodesSectionNavTabs";
import CodeSubSection from "./codesSubSection/codeSubSection/CodeSubSection";
import SavedCodesSubSection, {
  getCodeVersion,
  getCodeSuffix,
  CodesList,
} from "./codesSubSection/savedCodesSubSection/SavedCodesSubSection";
import { useCodeSystems } from "./useCodeSystems";
import { CqlMetaData } from "../../api/useTerminologyServiceApi";
import { CqlAntlr } from "@madie/cql-antlr-parser/dist/src";
import _ from "lodash";

interface CodesSectionProps {
  canEdit: boolean;
  measureStoreCql: string;
  cqlMetaData: CqlMetaData;
  measureModel: string;
  handleCodeDelete;
  setEditorVal: Function;
  setIsCQLUnchanged: Function;
  isCQLUnchanged: boolean;
  handleApplyCode;
}

export default function CodesSection({
  canEdit,
  measureStoreCql,
  cqlMetaData,
  measureModel,
  handleCodeDelete,
  setEditorVal,
  setIsCQLUnchanged,
  isCQLUnchanged,
  handleApplyCode,
}: CodesSectionProps) {
  const [activeTab, setActiveTab] = useState<string>("code");
  const { codeSystems } = useCodeSystems();
  const [parsedCodesList, setParsedCodesList] = useState<CodesList[]>(null);
  const [savedCodes, setSavedCodes] = useState(0);

  useEffect(() => {
    if (measureStoreCql) {
      const parsedCql = new CqlAntlr(measureStoreCql).parse();
      if (!_.isEmpty(parsedCql?.codes)) {
        const codesList = parsedCql.codes.map((code) => {
          const matchedCodeSystem = parsedCql.codeSystems.find(
            (codeSystem) =>
              codeSystem.name?.replace(/['"]+/g, "") ===
              code.codeSystem?.replace(/['"]+/g, "")
          );
          const parsedCode = code.codeId.replace(/['"]+/g, "");
          const parsedCodeSystem = code.codeSystem.replace(/['"]+/g, "");
          const codeSystemVersion = getCodeVersion(
            parsedCode,
            parsedCodeSystem,
            matchedCodeSystem?.oid,
            cqlMetaData?.codeSystemMap,
            matchedCodeSystem?.version
          );
          return {
            code: parsedCode,
            codeSystem: parsedCodeSystem.replace(":" + codeSystemVersion, ""),
            version: codeSystemVersion,
            oid: matchedCodeSystem?.oid,
            suffix: getCodeSuffix(code),
            versionIncluded: code.codeSystem.includes(codeSystemVersion),
          };
        });
        setParsedCodesList(codesList);
        setSavedCodes(parsedCodesList ? parsedCodesList?.length : 0);
      }
    }
  }, [measureStoreCql]);

  return (
    <>
      <CodesSectionNavTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCodes={parsedCodesList ? parsedCodesList?.length : 0}
      />
      <div tw="mt-4">
        {activeTab === "code" && (
          <CodeSubSection
            allCodeSystems={codeSystems}
            canEdit={canEdit}
            handleApplyCode={handleApplyCode}
            measureModel={measureModel}
          />
        )}
        {activeTab === "savedCodes" && (
          <SavedCodesSubSection
            measureStoreCql={measureStoreCql}
            cqlMetaData={cqlMetaData}
            canEdit={canEdit}
            handleApplyCode={handleApplyCode}
            handleCodeDelete={handleCodeDelete}
            setEditorVal={setEditorVal}
            setIsCQLUnchanged={setIsCQLUnchanged}
            isCQLUnchanged={isCQLUnchanged}
            setSavedCodes={setSavedCodes}
          />
        )}
      </div>
    </>
  );
}
