import {
  ElmTranslation,
  ElmTranslationError,
  ElmTranslationExternalError,
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

export interface ValidationResult {
  translation: ElmTranslation;
  errors: ElmTranslationError[];
  externalErrors: ElmTranslationExternalError[];
}

export const useGetAllErrors = async (
  cql: string
): Promise<ValidationResult> => {
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
      updateErrorTypeForTranslationErrors(translationResults);

    // Filter out external errors for include error type
    // find will return the first found object
    let externalErrors: ElmTranslationExternalError[] = [];
    if (translationResults?.externalErrors?.length > 0) {
      const includeLibraryError: ElmTranslationExternalError =
        translationResults.externalErrors.find(
          (externalErrors) => externalErrors.errorType === "include"
        );
      externalErrors.push(includeLibraryError);
    }

    codeSystemCqlErrors.forEach((codeError) => {
      allErrorsArray.push(codeError);
    });

    if (valuesetsErrors && valuesetsErrors.length > 0) {
      valuesetsErrors.map((valueSet) => {
        allErrorsArray.push(valueSet);
      });
    }
    return {
      externalErrors: externalErrors,
      translation: translationResults,
      errors: allErrorsArray,
    };
  }
  return null;
};
const updateErrorTypeForTranslationErrors = (
  translationResults: ElmTranslation
): ElmTranslationError[] => {
  let allErrorsArray: ElmTranslationError[] = [];

  if (translationResults.errorExceptions) {
    allErrorsArray = translationResults.errorExceptions;
  }
  allErrorsArray.forEach((error) => {
    error.errorType = "ELM";
  });
  return allErrorsArray;
};
