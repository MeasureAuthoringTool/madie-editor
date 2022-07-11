import React from "react";
import useElmTranslationServiceApi, {
  ElmTranslation,
} from "../api/useElmTranslationServiceApi";

export type EditorErrorMarker = {
  range: Range;
  clazz: string;
  type: "text" | null;
};

const validateElmTranslation = async (
  editorVal: string
): Promise<ElmTranslation> => {
  const results = await Promise.allSettled([TranslateCql(editorVal)]);
  if (results[0].status === "rejected") {
    console.error(
      "An error occurred while translating CQL to ELM",
      results[0].reason
    );
  } else {
    const cqlElmResult = results[0].value;
    const cqlElmErrors = !!(cqlElmResult?.errorExceptions?.length > 0);
    return cqlElmResult;
  }

  return null;
};

const TranslateCql = async (cql: string): Promise<ElmTranslation> => {
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

export default validateElmTranslation;
