import React from "react";
import useElmTranslationServiceApi, {
  ElmTranslation,
} from "../api/useElmTranslationServiceApi";
import * as _ from "lodash";

const TranslateCql = async (cql: string): Promise<ElmTranslation> => {
  const elmTranslationServiceApi = await useElmTranslationServiceApi();
  let translationResults = null;
  if (cql && cql.trim().length > 0) {
    translationResults = await elmTranslationServiceApi.translateCqlToElm(cql);
    return translationResults;
  }
  return null;
};

export default TranslateCql;
