import useQdmElmTranslationServiceApi from "../api/useQdmElmTranslationServiceApi";
import { ElmTranslation } from "../api/TranslatedElmModels";
import useFhirElmTranslationServiceApi from "../api/useFhirElmTranslationServiceApi";

const TranslateCql = async (
  cql: string,
  model: string
): Promise<ElmTranslation> => {
  const qdmElmTranslationServiceApi = await useQdmElmTranslationServiceApi();
  const fhirElmTranslationServiceApi = await useFhirElmTranslationServiceApi();

  if (cql && cql.trim().length > 0) {
    if (model === "QDM") {
      return await qdmElmTranslationServiceApi.translateCqlToElm(cql);
    } else {
      return await fhirElmTranslationServiceApi.translateCqlToElm(cql);
    }
  }
  return null;
};

export default TranslateCql;
