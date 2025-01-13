import React, { useState, useEffect } from "react";
import "twin.macro";
import "styled-components/macro";
import CodesSectionNavTabs from "./CodesSectionNavTabs";
import CodeSubSection from "./codesSubSection/codeSubSection/CodeSubSection";
import SavedCodesSubSection, {
  getCodeSystemVersion,
  getCodeSuffix,
  CodesList,
} from "./codesSubSection/savedCodesSubSection/SavedCodesSubSection";
import { useCodeSystems } from "./useCodeSystems";
import { CqlAntlr } from "@madie/cql-antlr-parser/dist/src";
import _ from "lodash";

interface CodesSectionProps {
  canEdit: boolean;
  measureStoreCql: string;
  measureModel: string;
  handleCodeDelete;
  editorVal: string;
  setEditorVal: Function;
  setIsCQLUnchanged: Function;
  isCQLUnchanged: boolean;
  handleApplyCode;
}

export default function CodesSection({
  canEdit,
  measureStoreCql,
  measureModel,
  handleCodeDelete,
  editorVal,
  setEditorVal,
  setIsCQLUnchanged,
  isCQLUnchanged,
  handleApplyCode,
}: CodesSectionProps) {
  const [activeTab, setActiveTab] = useState<string>("code");
  const { codeSystems } = useCodeSystems();
  const [parsedCodesList, setParsedCodesList] = useState<CodesList[]>(null);

  useEffect(() => {
    if (measureStoreCql && !_.isEmpty(codeSystems)) {
      const parsedCql = new CqlAntlr(measureStoreCql).parse();
      if (!_.isEmpty(parsedCql?.codes)) {
        const codesList = parsedCql.codes.map((code) => {
          const matchedCodeSystem = parsedCql.codeSystems.find(
            (codeSystem) =>
              codeSystem.name?.replace(/['"]+/g, "") ===
              code.codeSystem?.replace(/['"]+/g, "")
          );
          const parsedCode = code.codeId.replace(/['"]+/g, "");
          // get the code system
          const codeSystem = codeSystems.find(
            (codeSystem) =>
              `'${codeSystem.oid}'` === matchedCodeSystem?.oid ||
              `'${codeSystem.fullUrl}'` === matchedCodeSystem.oid
          );
          const codeSystemVersion = getCodeSystemVersion(matchedCodeSystem);
          return {
            code: parsedCode,
            codeSystem: codeSystem?.name,
            version: codeSystemVersion,
            oid: codeSystem?.oid,
            suffix: getCodeSuffix(code),
            versionIncluded: code.codeSystem?.startsWith(`"SNOMEDCT`)
              ? !_.isEmpty(codeSystemVersion)
              : code.codeSystem.includes(codeSystemVersion),
          };
        });
        setParsedCodesList(codesList);
      }
    }
  }, [measureStoreCql, codeSystems]);

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
            editorVal={editorVal}
          />
        )}
        {activeTab === "savedCodes" && (
          <SavedCodesSubSection
            measureStoreCql={measureStoreCql}
            measureModel={measureModel}
            canEdit={canEdit}
            handleApplyCode={handleApplyCode}
            handleCodeDelete={handleCodeDelete}
            setEditorVal={setEditorVal}
            setIsCQLUnchanged={setIsCQLUnchanged}
            isCQLUnchanged={isCQLUnchanged}
            parsedCodesList={parsedCodesList}
          />
        )}
      </div>
    </>
  );
}
