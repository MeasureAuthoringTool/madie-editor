import { ElmTranslation } from "../api/TranslatedElmModels";
import { QdmElmTranslationServiceApi } from "../api/useQdmElmTranslationServiceApi";
import { FhirElmTranslationServiceApi } from "../api/useFhirElmTranslationServiceApi";

const TranslateCql = async (
  cql: string,
  model: string,
  checkContext: boolean,
  qdmApi: QdmElmTranslationServiceApi,
  fhirApi: FhirElmTranslationServiceApi
): Promise<ElmTranslation> => {
  if (cql && cql.trim().length > 0) {
    if (model === "QDM") {
      return await qdmApi.translateCqlToElm(cql);
    } else {
      return await fhirApi.translateCqlToElm(cql, checkContext);
    }
  }
  return null;
};

export default TranslateCql;
