import {
  ElmTranslationError,
  ElmValueSet,
} from "../api/useElmTranslationServiceApi";
import useTerminologyServiceApi from "../api/useTerminologyServiceApi";

const validateValueSets = async (
  valuesetsArray: ElmValueSet[]
): Promise<ElmTranslationError[]> => {
  const valuesetsErrors = await GetValueSetErrors(valuesetsArray);
  return valuesetsErrors;
};

const GetValueSetErrors = async (
  valuesetsArray: ElmValueSet[]
): Promise<ElmTranslationError[]> => {
  const terminologyServiceApi = useTerminologyServiceApi();
  const valuesetsErrorArray: ElmTranslationError[] = [];
  if (valuesetsArray) {
    await Promise.allSettled(
      valuesetsArray.map(async (valueSet) => {
        const oid = getOid(valueSet);
        await terminologyServiceApi
          .getValueSet(oid, valueSet.locator)
          .then((response) => {
            if (response.errorMsg) {
              const vsErrorForElmTranslationError: ElmTranslationError =
                processValueSetErrorForElmTranslationError(
                  response.errorMsg.toString(),
                  valueSet.locator
                );
              valuesetsErrorArray.push(vsErrorForElmTranslationError);
            }
          });
      })
    );
    return valuesetsErrorArray;
  }
};

const getOid = (valueSet: ElmValueSet): string => {
  return valueSet.id.split("ValueSet/")[1];
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

export default validateValueSets;
