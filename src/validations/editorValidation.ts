import { CustomCqlCode } from "../api/useTerminologyServiceApi";
import CqlResult from "@madie/cql-antlr-parser/dist/src/dto/CqlResult";
import { CqlAntlr } from "@madie/cql-antlr-parser/dist/src";
import ValidateCustomCqlCodes, {
  getCustomCqlCodes,
  validateAccessModifierErrors,
  mapCodeSystemErrorsToTranslationErrors,
} from "../validations/codesystemValidation";
import TranslateCql from "../validations/elmTranslateValidation";
import CheckLogin from "../validations/umlsLogin";
import GetValueSetErrors from "../validations/valuesetValidation";
import {
  ElmTranslation,
  ElmTranslationError,
  ElmTranslationExternalError,
} from "../api/TranslatedElmModels";

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
        ValidateCustomCqlCodes(
          customCqlCodes,
          isLoggedInUMLS.valueOf(),
          cqlResult?.usings[0]?.name
        ),

        TranslateCql(cql, cqlResult?.usings[0]?.name),
        GetValueSetErrors(
          cqlResult.valueSets,
          isLoggedInUMLS.valueOf(),
          cqlResult?.usings[0]?.name
        ),
      ]);
    const codeSystemCqlErrors =
      mapCodeSystemErrorsToTranslationErrors(validatedCodes);

    let allErrorsArray: ElmTranslationError[] =
      updateErrorTypeForTranslationErrors(translationResults);

    // returning errors if the definitions have access modifiers
    const accessModifierCqlErrors: ElmTranslationError[] =
      validateAccessModifierErrors(cqlResult.expressionDefinitions);

    codeSystemCqlErrors.forEach((codeError) => {
      allErrorsArray.push(codeError);
    });

    if (valuesetsErrors && valuesetsErrors.length > 0) {
      valuesetsErrors.map((valueSet) => {
        allErrorsArray.push(valueSet);
      });
    }

    if (accessModifierCqlErrors && accessModifierCqlErrors.length > 0) {
      accessModifierCqlErrors.map((modifierError) =>
        allErrorsArray.push(modifierError)
      );
    }
    return {
      externalErrors: translationResults?.externalErrors,
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
  return allErrorsArray.map((item) => {
    const match = item.message?.match(/Library resource (.+?) version 'null'/);
    if (match && match[1]) {
      return {
        ...item,
        message: `include ${match[1]} statement is missing version. Please add a version to the include.`,
      };
    }
    return item;
  });
};
