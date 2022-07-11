import {
  CqlAntlr,
  CqlCode,
  CqlCodeSystem,
} from "@madie/cql-antlr-parser/dist/src";
import CqlResult from "@madie/cql-antlr-parser/dist/src/dto/CqlResult";
import useTerminologyServiceApi from "../api/useTerminologyServiceApi";
import { ElmTranslationError } from "../api/useElmTranslationServiceApi";

// customCqlCode contains validation result from VSAC
// This object can be cached in future, to avoid calling VSAC everytime.
export interface CustomCqlCodeSystem extends CqlCodeSystem {
  valid?: boolean;
  errorMessage?: string;
}
export interface CustomCqlCode extends Omit<CqlCode, "codeSystem"> {
  codeSystem: CustomCqlCodeSystem;
  valid?: boolean;
  errorMessage?: string;
}

export const getCustomCqlCodes = (cql: string): CustomCqlCode[] => {
  // using Antlr to get cqlCodes & cqlCodeSystems
  // Constructs a list of CustomCqlCode objects, which are validated in terminology service
  const cqlResult: CqlResult = new CqlAntlr(cql).parse();
  return cqlResult?.codes?.map((code) => {
    return {
      ...code,
      codeSystem: cqlResult.codeSystems?.find(
        (codeSys) => codeSys.name === code.codeSystem
      ),
    };
  });
};

const ValidateCodes = async (
  customCqlCodes: CustomCqlCode[] //, loggedInUMLS: boolean
): Promise<ElmTranslationError[]> => {
  const terminologyServiceApi = useTerminologyServiceApi();
  const [validatedCodes] = await Promise.all([
    await terminologyServiceApi.validateCodes(customCqlCodes),
  ]);
  const codeSystemCqlErrors: ElmTranslationError[] =
    mapCodeSystemErrorsToTranslationErrors(validatedCodes);
  return codeSystemCqlErrors;
};

const mapCodeSystemErrorsToTranslationErrors = (
  cqlCodes: CustomCqlCode[]
): ElmTranslationError[] => {
  const result = [];
  cqlCodes
    .filter((code) => !code.valid || !code.codeSystem?.valid)
    .forEach((code) => {
      if (!code.valid) {
        result.push(getCqlErrors(code, "Error", "Code"));
      }
      if (code.codeSystem && !code.codeSystem.valid) {
        result.push(getCqlErrors(code.codeSystem, "Error", "VSAC"));
      }
    });
  return result;
};

const getCqlErrors = (cqlObj, errorSeverity, errorType) => {
  return {
    startLine: cqlObj.start.line,
    startChar: cqlObj.start.position,
    endChar: cqlObj.stop.position,
    endLine: cqlObj.stop.line,
    errorSeverity: errorSeverity,
    errorType: errorType,
    message: cqlObj.errorMessage,
    targetIncludeLibraryId: "",
    targetIncludeLibraryVersionId: "",
    type: errorType,
  };
};

export default ValidateCodes;
