import { CqlCode, CqlCodeSystem } from "@madie/cql-antlr-parser/dist/src";
import { TerminologyServiceApi } from "../api/useTerminologyServiceApi";
import CqlResult from "@madie/cql-antlr-parser/dist/src/dto/CqlResult";
import { ElmTranslationError } from "../api/TranslatedElmModels";

// customCqlCode contains validation result from VSAC
// This object can be cached in future, to avoid calling VSAC everytime.
export interface CustomCqlCodeSystem extends CqlCodeSystem {
  valid?: boolean;
  errorMessage?: string;
}
export interface CustomCqlCode extends Omit<CqlCode, "codeSystem"> {
  codeSystem: CustomCqlCodeSystem;
  valid?: boolean;
  model?: string;
  errorMessage?: string;
}

export interface CodeMappingCandidate {
  name: string;
  source: CqlCode | CqlCodeSystem;
}

export const mapCodeSystemErrorsToTranslationErrors = (
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

export const validateAccessModifierErrors = (definitions) => {
  const result = [];
  const accessModifierIncludedDefinitions = definitions.filter((definition) =>
    /\bdefine\s+(public|private)\b/.test(definition.text)
  );
  accessModifierIncludedDefinitions.forEach((def) => {
    let errorStartLine;
    if (def?.comment) {
      const totalLineExcludingCommentsInDefinition =
        def.text.split("\n").length;
      errorStartLine =
        def.stop.line - totalLineExcludingCommentsInDefinition + 1;
    } else {
      errorStartLine = def.start.line;
    }

    const cqlObj = {
      start: {
        line: errorStartLine,
        position: def.start.position,
      },
      stop: {
        line: errorStartLine,
        position:
          def.text.indexOf("\n") !== -1
            ? def.text.indexOf("\n")
            : def.text.length,
      },
      errorMessage:
        "Access modifiers like Public and Private can not be used in MADiE.",
    };

    result.push(getCqlErrors(cqlObj, "Error", "Access Modifier"));
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

export const getCustomCqlCodes = (
  cql: string,
  cqlResult: CqlResult
): CustomCqlCode[] => {
  // using Antlr to get cqlCodes & cqlCodeSystems
  // Constructs a list of CustomCqlCode objects, which are validated in terminology service
  return cqlResult?.codes?.map((code) => {
    return {
      ...code,
      codeSystem: cqlResult.codeSystems?.find(
        (codeSys) => codeSys.name === code.codeSystem
      ),
    };
  });
};

export const getCodeMappingCandidates = (
  cqlResult: CqlResult
): CodeMappingCandidate[] => [
  ...(cqlResult?.codes?.map((code) => ({
    name: code.codeSystem.replace(/['"]/g, ""),
    source: code,
  })) ?? []),

  ...(cqlResult?.codeSystems?.map((codeSystem) => ({
    name: codeSystem.name.replace(/['"]/g, ""),
    source: codeSystem,
  })) ?? []),
];

export const validateCodeSystemMapping = async (
  codes: string[],
  terminologyServiceApi: TerminologyServiceApi
): Promise<string[]> => {
  return terminologyServiceApi.validateCodeSystemMapping(codes);
};

export const mapMappingErrorsToTranslationErrors = (
  mappingErrors: string[],
  candidates: CodeMappingCandidate[]
): ElmTranslationError[] => {
  return candidates
    .filter((candidate) => mappingErrors.includes(candidate.name))
    .map((candidate) =>
      getCqlErrors(
        {
          ...candidate.source,
          errorMessage: `MADiE does not support the code system, '${candidate.name}'. Please contact the help desk if you need to use this code system.`,
        },
        "Error",
        "Code System Mapping"
      )
    );
};

const ValidateCustomCqlCodes = async (
  customCqlCodes: CustomCqlCode[],
  loggedInUMLS: boolean,
  model: string,
  terminologyServiceApi: TerminologyServiceApi
): Promise<CustomCqlCode[]> => {
  return terminologyServiceApi.validateCodes(
    customCqlCodes,
    loggedInUMLS,
    model
  );
};

export default ValidateCustomCqlCodes;
