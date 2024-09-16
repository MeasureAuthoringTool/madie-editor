import React, { useEffect, useState } from "react";
import CqlBuilderSectionPanelNavTabs from "./CqlBuilderSectionPanelNavTabs";
import ValueSetsSection from "./ValueSets/ValueSets";
import CodesSection from "./codesSection/CodesSection";
import DefinitionsSection from "./definitionsSection/DefinitionsSection";
import { useFeatureFlags } from "@madie/madie-util";
import IncludesTabSection from "./Includes/Includes";
import useQdmElmTranslationServiceApi from "../api/useQdmElmTranslationServiceApi";
import useFhirElmTranslationServiceApi from "../api/useFhirElmTranslationServiceApi";
import { CqlBuilderLookup } from "../model/CqlBuilderLookup";
import { AxiosResponse } from "axios";
import { MadieAlert } from "@madie/madie-design-system/dist/react";

export default function CqlBuilderPanel({
  canEdit,
  measureStoreCql,
  cqlMetaData,
  measureModel,
  handleCodeDelete,
  setEditorVal,
  setIsCQLUnchanged,
  isCQLUnchanged,
  handleApplyLibrary,
  handleDeleteLibrary,
  handleApplyCode,
  handleApplyValueSet,
  handleApplyDefinition,
  handleDefinitionDelete,
}) {
  const featureFlags = useFeatureFlags();
  const {
    QDMValueSetSearch,
    CQLBuilderDefinitions,
    CQLBuilderIncludes,
    qdmCodeSearch,
  } = featureFlags;
  // we have multiple flags and need to select a starting value based off of what's available and canEdit.
  const getStartingPage = (() => {
    // if cqlBuilderIncludes -> includes
    // if BuilderDefs -> definitions
    // if QDM, then
    //  if qdmValueSetSearch -> valueSets
    //  else, codes
    if (CQLBuilderIncludes) {
      return "includes";
    }
    if (CQLBuilderDefinitions) {
      return "definitions";
    }
    if (measureModel?.includes("QDM")) {
      if (QDMValueSetSearch) {
        return "valueSets";
      }
      return "codes";
    }
  })();

  const [activeTab, setActiveTab] = useState<string>(getStartingPage);
  const [cqlBuilderLookupsTypes, setCqlBuilderLookupsTypes] =
    useState<CqlBuilderLookup>();
  const [errors, setErrors] = useState<string>(null);

  const fhirElmTranslationServiceApi = useFhirElmTranslationServiceApi();
  const qdmElmTranslationServiceApi = useQdmElmTranslationServiceApi();

  useEffect(() => {
    if (measureStoreCql && measureStoreCql.trim().length > 0) {
      if (measureModel?.includes("QDM")) {
        qdmElmTranslationServiceApi
          .then((qdmElmTranslationServiceApi) => {
            qdmElmTranslationServiceApi
              .getCqlBuilderLookups(measureStoreCql)
              .then((axiosResponse: AxiosResponse<CqlBuilderLookup>) => {
                setErrors(null);
                setCqlBuilderLookupsTypes(axiosResponse?.data);
              })
              .catch((error) => {
                setCqlBuilderLookupsTypes({} as unknown as CqlBuilderLookup);
                setErrors(
                  "Unable to retrieve CQL builder lookups. Please verify CQL has no errors. If CQL is valid, please contact the help desk."
                );
                console.error(error);
              });
          })
          .catch((error) => {
            setCqlBuilderLookupsTypes({} as unknown as CqlBuilderLookup);
            setErrors(
              "Unable to retrieve Service Config, Please try again or contact Helpdesk"
            );
            console.error(error);
          });
      } else {
        fhirElmTranslationServiceApi
          .then((fhirElmTranslationServiceApi) => {
            fhirElmTranslationServiceApi
              .getCqlBuilderLookups(measureStoreCql)
              .then((axiosResponse: AxiosResponse<CqlBuilderLookup>) => {
                setCqlBuilderLookupsTypes(axiosResponse?.data);
              })
              .catch((error) => {
                setCqlBuilderLookupsTypes({} as unknown as CqlBuilderLookup);
                setErrors(
                  "Unable to retrieve CQL builder lookups. Please verify CQL has no errors. If CQL is valid, please contact the help desk."
                );
                console.error(error);
              });
          })
          .catch((error) => {
            setCqlBuilderLookupsTypes({} as unknown as CqlBuilderLookup);
            setErrors(
              "Unable to retrieve Service Config, Please try again or contact Helpdesk"
            );
            console.error(error);
          });
      }
    }
  }, [measureModel, measureStoreCql]);

  return (
    <div className="right-panel">
      <div className="tab-container">
        <CqlBuilderSectionPanelNavTabs
          canEdit={canEdit}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          QDMValueSetSearch={QDMValueSetSearch}
          CQLBuilderDefinitions={CQLBuilderDefinitions}
          qdmCodeSearch={qdmCodeSearch}
          isQDM={measureModel?.includes("QDM")}
          CQLBuilderIncludes={CQLBuilderIncludes}
        />
      </div>
      {errors && (
        <div className="panel-alert">
          <MadieAlert
            type="error"
            content={
              <div
                aria-live="polite"
                role="alert"
                data-testid={"cql-builder-errors"}
              >
                {errors}
              </div>
            }
            canClose={false}
          />
        </div>
      )}
      <div className="panel-content">
        {activeTab === "includes" && (
          <IncludesTabSection
            canEdit={canEdit}
            cql={measureStoreCql}
            measureModel={measureModel}
            isCQLUnchanged={isCQLUnchanged}
            setIsCQLUnchanged={setIsCQLUnchanged}
            setEditorValue={setEditorVal}
            handleApplyLibrary={handleApplyLibrary}
            handleDeleteLibrary={handleDeleteLibrary}
          />
        )}
        {activeTab === "valueSets" && (
          <ValueSetsSection
            canEdit={canEdit}
            handleApplyValueSet={handleApplyValueSet}
          />
        )}
        {activeTab === "codes" && (
          <CodesSection
            canEdit={canEdit}
            measureStoreCql={measureStoreCql}
            cqlMetaData={cqlMetaData}
            measureModel={measureModel}
            handleCodeDelete={handleCodeDelete}
            setEditorVal={setEditorVal}
            setIsCQLUnchanged={setIsCQLUnchanged}
            isCQLUnchanged={isCQLUnchanged}
            handleApplyCode={handleApplyCode}
          />
        )}

        {activeTab === "definitions" && (
          <DefinitionsSection
            canEdit={canEdit}
            handleApplyDefinition={handleApplyDefinition}
            handleDefinitionDelete={handleDefinitionDelete}
            cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
            setIsCQLUnchanged={setIsCQLUnchanged}
            isCQLUnchanged={isCQLUnchanged}
          />
        )}
      </div>
    </div>
  );
}
