import React from "react";
import useElmTranslationServiceApi, {
  ElmTranslation,
} from "../api/useElmTranslationServiceApi";
import * as _ from "lodash";

const useTranslateCql = async (cql: string): Promise<ElmTranslation> => {
  const elmTranslationServiceApi = useElmTranslationServiceApi();
  if (cql && cql.trim().length > 0) {
    const [translationResults] = await Promise.all([
      await elmTranslationServiceApi.translateCqlToElm(cql),
    ]);
    return translationResults;
  } else {
  }
  return null;
};

export default useTranslateCql;
