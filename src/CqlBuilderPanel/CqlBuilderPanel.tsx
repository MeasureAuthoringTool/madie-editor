import React, { useEffect, useState } from "react";
import CqlBuilderSectionPanelNavTabs from "./CqlBuilderSectionPanelNavTabs";
import ValueSetsSection from "./ValueSets/ValueSets";
import CodesSection from "./codesSection/CodesSection";
import DefinitionsSection from "./definitionsSection/DefinitionsSection";
import { useFeatureFlags } from "@madie/madie-util";
import IncludesTabSection from "./Includes/Includes";
import Parameters from "./Parameters/Parameters";
import useQdmElmTranslationServiceApi from "../api/useQdmElmTranslationServiceApi";
import useFhirElmTranslationServiceApi from "../api/useFhirElmTranslationServiceApi";
import { CqlBuilderLookup } from "../model/CqlBuilderLookup";
import { AxiosResponse } from "axios";
import { MadieAlert } from "@madie/madie-design-system/dist/react";
import { IconButton } from "@mui/material";
import ExpansionIcon from "@mui/icons-material/KeyboardTabOutlined";

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
  handleEditLibrary,
  handleApplyCode,
  handleApplyParameter,
  handleApplyValueSet,
  handleApplyDefinition,
  handleDefinitionEdit,
  handleDefinitionDelete,
  resetCql,
  getCqlDefinitionReturnTypes,
  makeExpanded,
}) {
  const featureFlags = useFeatureFlags();
  const {
    QDMValueSetSearch,
    CQLBuilderDefinitions,
    CQLBuilderIncludes,
    qdmCodeSearch,
    CQLBuilderParameters,
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
  const [loading, setLoading] = useState<boolean>(true);

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
              })
              .finally(() => {
                setLoading(false);
              });
          })
          .catch((error) => {
            setCqlBuilderLookupsTypes({} as unknown as CqlBuilderLookup);

            setErrors(
              "Unable to retrieve Service Config, Please try again or contact Helpdesk"
            );
            console.error(error);
            setLoading(false);
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
              })
              .finally(() => {
                setLoading(false);
              });
          })
          .catch((error) => {
            setCqlBuilderLookupsTypes({} as unknown as CqlBuilderLookup);

            setErrors(
              "Unable to retrieve Service Config, Please try again or contact Helpdesk"
            );
            console.error(error);
            setLoading(false);
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
          CQLBuilderParameters={CQLBuilderParameters}
          CQLBuilderIncludes={CQLBuilderIncludes}
        />
        <div
          style={{
            display: "flex",
            flexGrow: 1,
          }}
        />
        <IconButton
          data-testid="collapsed-button"
          aria-label="editor-collapsed"
          style={{
            color: "#0073c8",
          }}
          onClick={makeExpanded}
        >
          <ExpansionIcon />
        </IconButton>
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
            handleEditLibrary={handleEditLibrary}
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
        {activeTab === "parameters" && (
          <Parameters
            canEdit={canEdit}
            handleApplyParameter={handleApplyParameter}
            cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
            isCQLUnchanged={isCQLUnchanged}
            cql={measureStoreCql}
            setEditorValue={setEditorVal}
            resetCql={resetCql}
            loading={loading}
          />
        )}

        {activeTab === "definitions" && (
          <DefinitionsSection
            canEdit={canEdit}
            handleApplyDefinition={handleApplyDefinition}
            handleDefinitionDelete={handleDefinitionDelete}
            cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
            isCQLUnchanged={isCQLUnchanged}
            cql={measureStoreCql}
            setEditorVal={setEditorVal}
            resetCql={resetCql}
            getCqlDefinitionReturnTypes={getCqlDefinitionReturnTypes}
            handleDefinitionEdit={handleDefinitionEdit}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
