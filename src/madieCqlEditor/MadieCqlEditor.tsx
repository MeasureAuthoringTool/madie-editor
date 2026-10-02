import React from "react";
import { CqlAntlr } from "@madie/cql-antlr-parser/dist/src";
import CqlError from "@madie/cql-antlr-parser/dist/src/dto/CqlError";
import MonacoCqlEditor from "../editor/MonacoCqlEditor";
import { ParsedCql, Statement } from "../model/ParsedCql";
import {
  EditorAnnotation,
  EditorErrorMarker,
} from "../editor/markers/markerMapper";
import {
  CqlMetaData,
  Parameter,
  ValueSetForSearch,
} from "../api/useTerminologyServiceApi";
import { Definition } from "../CqlBuilderPanel/definitionsSection/definitionBuilder/DefinitionBuilder";
import { SelectedLibrary } from "../CqlBuilderPanel/Includes/CqlLibraryDetailsDialog";
import { Funct } from "../CqlBuilderPanel/functionsSection/functionBuilder/FunctionBuilder";

export interface EditorPropsType {
  serviceConfig?: any;
  value: string;
  onChange?: (value: string) => void;
  handleApplyCode?: (code: string) => void;
  handleApplyParameter?: (parameter: Parameter) => void;
  handleParameterEdit?: (
    parameter: Parameter,
    parameterToApply: Parameter
  ) => void;
  handleParameterDelete?: (parameter: Parameter) => void;
  handleApplyValueSet?: (vs: ValueSetForSearch) => void;
  handleApplyDefinition?: (def: Definition) => void;
  handleDefinitionEdit?: (lib: SelectedLibrary, def: Definition) => void;
  handleApplyLibrary?: (lib: SelectedLibrary) => void;
  handleEditLibrary?: (
    lib: SelectedLibrary,
    editedLib: SelectedLibrary
  ) => void;
  handleDeleteLibrary?: (lib: SelectedLibrary) => void;
  handleApplyFunction?: (funct: Funct) => void;
  handleFunctionDelete?: (funct: any) => void;
  handleFunctionEdit?: (funct: any, newFunct: string) => void;
  parseDebounceTime?: number;
  inboundAnnotations?: EditorAnnotation[];
  inboundErrorMarkers?: EditorErrorMarker[];
  height?: string;
  readOnly?: boolean;
  validationsEnabled?: boolean;
  measureStoreCql?: string;
  cqlMetaData?: CqlMetaData;
  measureModel?: string;
  handleCodeDelete?: (code: string, measureModel: string) => void;
  handleDefinitionDelete?: (definition: string) => void;
  setEditorVal?: Function;
  setIsCQLUnchanged?: Function;
  isCQLUnchanged?: boolean;
  resetCql?: () => void;
  getCqlDefinitionReturnTypes?: () => void;
  setOutboundAnnotations?: Function;
  hasCqlError?: boolean;
}

export interface UpdatedCqlObject {
  cql: string;
  isLibraryStatementChanged?: boolean;
  isValueSetChanged?: boolean;
  isFhirHelpersAliasChanged?: boolean;
  isConceptRemoved?: boolean;
}

export interface ParsedCqlObject {
  cql?: ParsedCql;
  isConceptRemoved?: boolean;
}

const numberOrZero = (value?: number): number =>
  Number.isFinite(value) ? (value as number) : 0;

export const parseEditorContent = (content?: string): CqlError[] => {
  const errors: CqlError[] = [];
  if (!content) {
    return errors;
  }

  const parseOutput = new CqlAntlr(content).parse();
  if (parseOutput.errors?.length) {
    errors.push(...parseOutput.errors);
  }

  if (!parseOutput?.context?.text?.includes("Patient")) {
    errors.push({
      message: "Measure Context must be 'Patient'.",
      start: parseOutput?.context?.start,
      stop: parseOutput?.context?.stop,
    });
  }

  return errors;
};

const parseCql = (editorVal?: string): ParsedCqlObject => {
  if (!editorVal) {
    return {};
  }

  let updatedEditorVal = editorVal;
  let isConceptRemoved = false;
  const conceptToRemove = updatedEditorVal.match(/^\s*concept[\s\S]*?}.*/gim);
  if (conceptToRemove) {
    conceptToRemove.forEach((conceptLine: string) => {
      updatedEditorVal = updatedEditorVal.replace(conceptLine, "");
    });
    isConceptRemoved = true;
  }

  const parsedCql = new CqlAntlr(updatedEditorVal).parse();
  const cqlArrayToBeFiltered = updatedEditorVal.split("\n");
  const libraryContent = parsingLibrary(parsedCql, cqlArrayToBeFiltered);

  return {
    cql: { cqlArrayToBeFiltered, libraryContent, parsedCql },
    isConceptRemoved,
  };
};

const parsingLibrary = (
  parsedCql: any,
  cqlArrayToBeFiltered: string[]
): Statement | undefined => {
  if (!parsedCql?.library?.start?.line) {
    return undefined;
  }

  const libraryContentIndex = parsedCql.library.start.line - 1;
  return {
    statement: cqlArrayToBeFiltered[libraryContentIndex],
    index: libraryContentIndex,
  };
};

const updateCql = (
  parsedEditorCql: ParsedCql | undefined,
  libraryName: string,
  libraryVersion: string,
  _usedModel: string,
  _modelVersion: string,
  conceptRemoved?: boolean
): UpdatedCqlObject => {
  const cqlUpdates: UpdatedCqlObject = {
    cql: "",
    isLibraryStatementChanged: false,
    isValueSetChanged: false,
    isConceptRemoved: false,
  };

  if (!parsedEditorCql?.parsedCql || !parsedEditorCql?.cqlArrayToBeFiltered) {
    cqlUpdates.isConceptRemoved = conceptRemoved;
    return cqlUpdates;
  }

  const currentLibraryName = parsedEditorCql.parsedCql?.library?.name;
  const currentLibraryVersion = parsedEditorCql.parsedCql?.library?.version;
  if (
    libraryName !== currentLibraryName ||
    `'${libraryVersion}'` !== currentLibraryVersion
  ) {
    const libraryIndex = parsedEditorCql.libraryContent?.index;
    if (libraryIndex !== undefined) {
      parsedEditorCql.cqlArrayToBeFiltered[
        libraryIndex
      ] = `library ${libraryName} version '${libraryVersion}'`;
      cqlUpdates.isLibraryStatementChanged = true;
    }
  }

  (parsedEditorCql.parsedCql.includes || []).forEach((include: any) => {
    if (include.name === "FHIRHelpers" && include.called !== "FHIRHelpers") {
      const lineIndex = (include.start?.line || 1) - 1;
      const correctInclude = `include FHIRHelpers version ${include.version} called FHIRHelpers`;
      if (parsedEditorCql.cqlArrayToBeFiltered) {
        parsedEditorCql.cqlArrayToBeFiltered[lineIndex] =
          parsedEditorCql.cqlArrayToBeFiltered[lineIndex].replace(
            include.text,
            correctInclude
          );
      }
      cqlUpdates.isFhirHelpersAliasChanged = true;
    }
  });

  (parsedEditorCql.parsedCql?.valueSets || [])
    .filter((valueSet: any) => valueSet.version)
    .forEach((valueSet: any) => {
      const lineNumber = (valueSet.start?.line || 1) - 1;
      if (parsedEditorCql.cqlArrayToBeFiltered) {
        parsedEditorCql.cqlArrayToBeFiltered[
          lineNumber
        ] = `valueset ${valueSet.name}: ${valueSet.url}`;
      }
      cqlUpdates.isValueSetChanged = true;
    });

  cqlUpdates.cql = parsedEditorCql.cqlArrayToBeFiltered.join("\n");
  cqlUpdates.isConceptRemoved = conceptRemoved;
  return cqlUpdates;
};

export const updateEditorContent = async (
  editorVal: string,
  existingCql: string,
  libraryName: string,
  existingCqlLibraryName: string,
  versionString: string,
  usingName: string,
  usingVersion: string,
  triggeredFrom: string
): Promise<UpdatedCqlObject> => {
  if (
    triggeredFrom === "measureEditor" ||
    triggeredFrom === "updateCqlLibrary"
  ) {
    const parsedEditorCql = parseCql(editorVal || "");
    return updateCql(
      parsedEditorCql?.cql,
      libraryName,
      versionString,
      usingName,
      usingVersion,
      parsedEditorCql?.isConceptRemoved
    );
  }

  if (existingCql && existingCqlLibraryName !== libraryName) {
    const parsedEditorCql = parseCql(existingCql);
    if (parsedEditorCql) {
      return updateCql(
        parsedEditorCql?.cql,
        libraryName,
        versionString,
        usingName,
        usingVersion,
        parsedEditorCql?.isConceptRemoved
      );
    }
  }

  return { cql: existingCql } as UpdatedCqlObject;
};

export const isUsingStatementEmpty = (editorVal?: string): boolean => {
  const parsedContents = parseCql(editorVal);
  return (parsedContents?.cql?.parsedCql?.usings?.length || 0) === 0;
};

export const mapParserErrorsToMonacoAnnotations = (
  errors: CqlError[]
): EditorAnnotation[] => {
  return (errors || []).map((error) => {
    const startLine = numberOrZero(error.start?.line);
    const startPos = numberOrZero(error.start?.position);
    const endPos = numberOrZero(error.stop?.position);

    return {
      row: startLine > 0 ? startLine - 1 : 0,
      column: startPos,
      type: "error",
      text: `Parse: ${startPos}:${endPos} | ${error.message}`,
    };
  });
};

export const mapParserErrorsToMonacoMarkers = (
  errors: CqlError[]
): EditorErrorMarker[] => {
  return (errors || []).map((error) => {
    const startLine = numberOrZero(error.start?.line);
    const stopLine = numberOrZero(error.stop?.line || error.start?.line);
    const startPos = numberOrZero(error.start?.position);
    const stopPos = numberOrZero(error.stop?.position || error.start?.position);

    return {
      range: {
        start: {
          row: startLine > 0 ? startLine - 1 : 0,
          column: startPos,
        },
        end: {
          row: stopLine > 0 ? stopLine - 1 : 0,
          column: stopPos,
        },
      },
      clazz: "editor-error-underline",
      type: "text",
    };
  });
};

export const setCommandEnabled = (
  editor: any,
  name: string,
  enabled: boolean
): void => {
  const command = editor?.commands?.byName?.[name];
  if (!command) {
    return;
  }

  // Preserve each command's original shortcut on first toggle.
  const bindKeyOriginal =
    command.__originalBindKey !== undefined
      ? command.__originalBindKey
      : command.bindKey;
  command.__originalBindKey = bindKeyOriginal;
  command.bindKey = enabled ? bindKeyOriginal : null;
  editor.commands.addCommand(command);
};

const MadieCqlEditor = ({
  value,
  onChange,
  height,
  parseDebounceTime = 1500,
  inboundAnnotations,
  inboundErrorMarkers,
  readOnly = false,
  validationsEnabled = true,
  setOutboundAnnotations,
}: EditorPropsType) => {
  return (
    <div style={{ height: "inherit" }}>
      <MonacoCqlEditor
        value={value || ""}
        onChange={onChange}
        height={height}
        readOnly={readOnly}
        validationsEnabled={validationsEnabled}
        parseDebounceTime={parseDebounceTime}
        inboundAnnotations={inboundAnnotations || []}
        inboundErrorMarkers={inboundErrorMarkers || []}
        setOutboundAnnotations={setOutboundAnnotations}
        parseValue={(nextValue) => {
          const errors = parseEditorContent(nextValue);
          return {
            annotations: mapParserErrorsToMonacoAnnotations(errors),
            markers: mapParserErrorsToMonacoMarkers(errors),
          };
        }}
      />
    </div>
  );
};

export default MadieCqlEditor;
