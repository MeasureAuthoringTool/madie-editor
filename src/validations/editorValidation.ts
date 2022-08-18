import {
  ElmTranslation,
  ElmTranslationError,
} from "../api/useElmTranslationServiceApi";
import { CustomCqlCode } from "../api/useTerminologyServiceApi";
import CqlResult from "@madie/cql-antlr-parser/dist/src/dto/CqlResult";
import { CqlAntlr } from "@madie/cql-antlr-parser/dist/src";
import ValidateCustomCqlCodes, {
  getCustomCqlCodes,
  mapCodeSystemErrorsToTranslationErrors,
} from "../validations/codesystemValidation";
import TranslateCql from "../validations/elmTranslateValidation";
import CheckLogin from "../validations/umlsLogin";
import GetValueSetErrors from "../validations/valuesetValidation";

export interface AllErrorsResult {
  translation: ElmTranslation;
  errors: ElmTranslationError[];
}

export const useGetAllErrors = async (
  cql: string
): Promise<AllErrorsResult> => {
  if (cql && cql.trim().length > 0) {
    const cqlResult: CqlResult = new CqlAntlr(cql).parse();
    const customCqlCodes: CustomCqlCode[] = getCustomCqlCodes(cql, cqlResult);
    const isLoggedInUMLS = await Promise.resolve(CheckLogin());
    const [validatedCodes, translationResults, valuesetsErrors] =
      await Promise.all([
        ValidateCustomCqlCodes(customCqlCodes, isLoggedInUMLS.valueOf()),
        TranslateCql(cql),
        GetValueSetErrors(cqlResult.valueSets, isLoggedInUMLS.valueOf()),
      ]);
    const codeSystemCqlErrors =
      mapCodeSystemErrorsToTranslationErrors(validatedCodes);

    let allErrorsArray: ElmTranslationError[] =
      setErrorsToElmTranslationError(translationResults);

    codeSystemCqlErrors.forEach((codeError) => {
      allErrorsArray.push(codeError);
    });

    if (valuesetsErrors && valuesetsErrors.length > 0) {
      valuesetsErrors.map((valueSet) => {
        allErrorsArray.push(valueSet);
      });
    }
    return {
      translation: translationResults,
      errors: allErrorsArray,
    };
  }
  return null;
};
const setErrorsToElmTranslationError = (
  translationResults: ElmTranslation
): ElmTranslationError[] => {
  let allErrorsArray: ElmTranslationError[] = [];
  const translationErrors: ElmTranslationError[] =
    translationResults?.errorExceptions
      ? translationResults?.errorExceptions
      : [];
  translationErrors.forEach((translationError) => {
    translationError.errorType = "ELM";
    allErrorsArray.push(translationError);
  });
  return allErrorsArray;
};
