import { TerminologyServiceApi } from "../api/useTerminologyServiceApi";
import CqlValueSet from "@madie/cql-antlr-parser/dist/src/dto/CqlValueSet";
import { ElmTranslationError } from "../api/TranslatedElmModels";

export const getOidFromString = (
  oidString: string,
  dataModel: string
): string => {
  if (dataModel === "QDM") {
    return oidString?.split("urn:oid:")[1];
  }
  return oidString?.split("ValueSet/")[1];
};

const GetValueSetErrors = async (
  valuesetsArray: CqlValueSet[],
  loggedInUMLS: boolean,
  model: string,
  terminologyServiceApi: TerminologyServiceApi
): Promise<ElmTranslationError[]> => {
  const valuesetsErrorArray: ElmTranslationError[] = [];
  if (valuesetsArray) {
    await Promise.allSettled(
      valuesetsArray.map(async (valueSet: CqlValueSet) => {
        const oid = getOidFromCqlValueSet(valueSet, model);
        const locator = getLocatorFromCqlValueSet(valueSet);
        const valueSetUrl = valueSet?.url;
        const valueSetUrlErrors = validateValuesetUrl(model, valueSet, locator);
        if (valueSetUrlErrors != null) {
          valuesetsErrorArray.push(valueSetUrlErrors);
        }
        console.log("model", model, "valueSet", valueSet, "oid", oid);
        await terminologyServiceApi
          .getValueSet(oid, locator, loggedInUMLS, model, valueSetUrl)
          .then((response) => {
            console.log("response", response);
            if (response.errorMsg) {
              const vsErrorForElmTranslationError: ElmTranslationError =
                processValueSetErrorForElmTranslationError(
                  response.errorMsg.toString(),
                  locator
                );
              valuesetsErrorArray.push(vsErrorForElmTranslationError);
            }
          });
      })
    );
    return valuesetsErrorArray;
  }
  return [];
};

const validateValuesetUrl = (
  model: string,
  valueSet: CqlValueSet,
  locator: string
): ElmTranslationError | undefined => {
  let invalidValuesetUrlError: ElmTranslationError | undefined;
  if (model != "QDM") {
    const valuesetUrlWithoutOid = valueSet?.url?.split("ValueSet/");
    if (
      valuesetUrlWithoutOid &&
      valuesetUrlWithoutOid[0] !== "'http://cts.nlm.nih.gov/fhir/"
    ) {
      invalidValuesetUrlError = processValueSetErrorForElmTranslationError(
        `"${valueSet.url} is not a valid URL. Fhir URL should start with 'http://cts.nlm.nih.gov/fhir/ValueSet/'"`,
        locator
      );
    }
  } else {
    const valuesetUrlWithoutOid = valueSet?.url?.split("oid:");
    if (valuesetUrlWithoutOid && valuesetUrlWithoutOid[0] !== "'urn:") {
      invalidValuesetUrlError = processValueSetErrorForElmTranslationError(
        `"${valueSet.url} is not a valid URL. QDM URL should start with 'urn:oid:'"`,
        locator
      );
    }
  }
  return invalidValuesetUrlError;
};

const getOidFromCqlValueSet = (
  valueSet: CqlValueSet,
  model: string
): string => {
  const oid = getOidFromString(valueSet?.url ?? "", model);
  if (oid) {
    return oid.replace("'", "");
  }
  return valueSet.url ?? "";
};

const getLocatorFromCqlValueSet = (valueSet: CqlValueSet): string => {
  const start = valueSet.start;
  const stop = valueSet.stop;
  if (!start || !stop) {
    return "0:0-0:0";
  }
  return `${start.line}:${start.position}-${stop.line}:${stop.position}`;
};

const processValueSetErrorForElmTranslationError = (
  vsError: string,
  valuesetLocator: string
): ElmTranslationError => {
  const startLine: number = getStartLine(valuesetLocator);
  const startChar: number = getStartChar(valuesetLocator);
  const endLine: number = getEndLine(valuesetLocator);
  const endChar: number = getEndChar(valuesetLocator);
  return {
    startLine: startLine,
    startChar: startChar,
    endChar: endChar,
    endLine: endLine,
    errorSeverity: "Error",
    errorType: "VSAC",
    message: vsError,
    targetIncludeLibraryId: "",
    targetIncludeLibraryVersionId: "",
    type: "ValueSet",
  };
};

const getStartLine = (locator: string): number => {
  const index = locator.indexOf(":");
  const startLine = locator.substring(0, index);
  return Number(startLine);
};

const getStartChar = (locator: string): number => {
  const index = locator.indexOf(":");
  const index2 = locator.indexOf("-");
  const startChar = locator.substring(index + 1, index2);
  return Number(startChar);
};

const getEndLine = (locator: string): number => {
  const index = locator.indexOf("-");
  const endLineAndChar = locator.substring(index + 1);
  const index2 = locator.indexOf(":");
  const endLine = endLineAndChar.substring(0, index2);
  return Number(endLine);
};

const getEndChar = (locator: string): number => {
  const index = locator.indexOf("-");
  const endLineAndChar = locator.substring(index + 1);
  const index2 = locator.indexOf(":");
  const endLine = endLineAndChar.substring(index2 + 1);
  return Number(endLine);
};

export default GetValueSetErrors;
