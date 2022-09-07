import useElmTranslationServiceApi, {
  ElmTranslation,
} from "../api/useElmTranslationServiceApi";

const TranslateCql = async (cql: string): Promise<ElmTranslation> => {
  const elmTranslationServiceApi = await useElmTranslationServiceApi();
  if (cql && cql.trim().length > 0) {
    return await elmTranslationServiceApi.translateCqlToElm(cql);
  }
  return null;
};

export default TranslateCql;
