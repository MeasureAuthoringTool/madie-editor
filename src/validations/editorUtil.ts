import validateValueSets from "../validations/valuesetValidation";
import ValidateCodes, {
  getCustomCqlCodes,
  CustomCqlCode,
} from "../validations/codesystemValidation";
import {
  ElmTranslationError,
  ElmTranslation,
} from "../api/useElmTranslationServiceApi";
import * as _ from "lodash";
import CqlError from "@madie/cql-antlr-parser/dist/src/dto/CqlError";

const processCodeSystemErrors = (
  cqlCodes: CustomCqlCode[],
  errorMessage: string,
  valid: boolean
): CustomCqlCode[] => {
  return cqlCodes.map((code) => {
    return {
      ...code,
      errorMessage: errorMessage,
      valid: valid,
      ...(code.codeSystem && {
        codeSystem: {
          ...code.codeSystem,
          errorMessage: errorMessage,
          valid: valid,
        },
      }),
    };
  });
};

// VSAC errors (value sets and code system)
const getVsacErrors = async (
  cql: string,
  translationResults: ElmTranslation,
  loggedInUMLS: boolean
): Promise<ElmTranslationError[]> => {
  let vsacErrorsArray: ElmTranslationError[] = [];

  //1. valueset errors
  if (loggedInUMLS) {
    if (translationResults?.library?.valueSets?.def !== null) {
      const valuesetsErrors = await validateValueSets(
        translationResults?.library?.valueSets?.def
      );
      if (valuesetsErrors && valuesetsErrors.length > 0) {
        valuesetsErrors.map((valueSet) => {
          vsacErrorsArray.push(valueSet);
        });
      }
    }

    //2. codesystem errors
    const customCqlCodes: CustomCqlCode[] = getCustomCqlCodes(cql);
    if (customCqlCodes) {
      const codeSystemCqlErrors = await ValidateCodes(customCqlCodes);
      if (codeSystemCqlErrors && codeSystemCqlErrors.length > 0) {
        codeSystemCqlErrors.map((codeSystem) => {
          vsacErrorsArray.push(codeSystem);
        });
      }
    }
  }
  return vsacErrorsArray;
};

//ELM Translation and VSAC Errors mapped to CQL Errors
const mapTranslationAndVsacErrorsToCqlErrors = (
  errors: ElmTranslationError[]
): CqlError[] => {
  let cqlErrors: CqlError[] = [];
  if (errors && _.isArray(errors) && errors.length > 0) {
    cqlErrors = errors.map((error) => ({
      message: error.message,
      name: error.errorType,
      start: { line: error.startLine, position: error.startChar },
      stop: {
        line: error.endLine,
        position: error.endChar,
      },
      clazz: "editor-error-underline",
      type: "text",
    }));
  }
  return cqlErrors;
};

export {
  processCodeSystemErrors,
  getVsacErrors,
  mapTranslationAndVsacErrorsToCqlErrors,
};
