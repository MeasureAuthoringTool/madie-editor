import React, { useEffect, useRef, useState, useCallback } from "react";
import Editor, { DiffEditor, loader, Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import type * as monacoTypes from "monaco-editor";
import * as _ from "lodash";

// Use locally bundled monaco-editor instead of CDN (avoids loader issues in single-spa)
loader.config({ monaco });

// Monaco requires web workers for features like syntax validation.
// In single-spa, worker scripts can't load from the default paths.
// Providing a no-op getWorker prevents "Could not create web worker" errors;
// CQL validation is handled by our own CqlAntlr parser, not Monaco's built-in.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
self.MonacoEnvironment = {
  getWorker: () =>
    new Worker(
      new URL("monaco-editor/esm/vs/editor/editor.worker.js", import.meta.url)
    ),
};

import { CqlAntlr } from "@madie/cql-antlr-parser/dist/src";
import CqlError from "@madie/cql-antlr-parser/dist/src/dto/CqlError";
import {
  registerCqlLanguage,
  defineCqlTheme,
  CQL_LANGUAGE_ID,
} from "./cql-language";
import "./madie-monaco.css";
import { ParsedCql, Statement } from "../model/ParsedCql";
import {
  CqlMetaData,
  Parameter,
  ValueSetForSearch,
} from "../api/useTerminologyServiceApi";
import { Definition } from "../CqlBuilderPanel/definitionsSection/definitionBuilder/DefinitionBuilder";
import { SelectedLibrary } from "../CqlBuilderPanel/Includes/CqlLibraryDetailsDialog";
import { Funct } from "../CqlBuilderPanel/functionsSection/functionBuilder/FunctionBuilder";
import CqlVersion from "@madie/cql-antlr-parser/dist/src/dto/CqlVersion";

// ─── Types re-exported for backward compatibility ────────────────────────────

export interface EditorPropsType {
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
  inboundErrorMarkers?: EditorMarker[];
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
  // Monaco-specific: when set, show inline diff view
  diffOriginal?: string;
}

// Annotation/marker types that mirror what Ace had but are editor-agnostic
export interface EditorAnnotation {
  row: number;
  column: number;
  type: string;
  text: string;
}

export interface EditorMarker {
  range: {
    start: { row: number; column: number };
    end: { row: number; column: number };
  };
  clazz?: string;
  type?: string;
}

export interface UpdatedCqlObject {
  cql: string;
  isLibraryStatementChanged?: boolean;
  isUsingStatementChanged?: boolean;
  isValueSetChanged?: boolean;
  isFhirHelpersAliasChanged?: boolean;
  isConceptRemoved?: boolean;
}

export interface ParsedCqlObject {
  cql: ParsedCql;
  isConceptRemoved?: boolean;
}

// ─── Utility functions (unchanged logic from Ace version) ────────────────────

export const updateUsingStatements = (
  parsedEditorCql: ParsedCql,
  usedModel: string,
  modelVersion: string
) => {
  const usingStatements: CqlVersion[] = parsedEditorCql.parsedCql.usings;
  const measureModel = usedModel.replace("-", "");
  const parsedEditorCqlCopy = { ...parsedEditorCql };
  let isCqlUpdated = false;
  if (usingStatements?.length === 1) {
    const { name, version, start } = usingStatements[0];
    const cleanedVersion = version.replace(/["']/g, "");
    if (measureModel !== name || modelVersion !== cleanedVersion) {
      if (measureModel === "QICore" && name === "FHIR") {
        if (cleanedVersion !== "4.0.1") {
          parsedEditorCqlCopy.cqlArrayToBeFiltered[
            start.line - 1
          ] = `using FHIR version '4.0.1'`;
          isCqlUpdated = true;
        }
      } else {
        parsedEditorCqlCopy.cqlArrayToBeFiltered[
          start.line - 1
        ] = `using ${measureModel} version '${modelVersion}'`;
        isCqlUpdated = true;
      }
    }
  } else if (usingStatements?.length > 1) {
    const models = new Set();
    let deletedLineCount = 0;

    usingStatements.forEach((using) => {
      const { name, version, start } = using;
      const lineIndex = start.line - (deletedLineCount + 1);
      const cleanVersion = version.replace(/["']/g, "");

      if (!models.has(name)) {
        if (measureModel !== name || modelVersion !== cleanVersion) {
          if (measureModel === "QICore") {
            if (name === "FHIR" && cleanVersion !== "4.0.1") {
              parsedEditorCqlCopy.cqlArrayToBeFiltered[
                lineIndex
              ] = `using FHIR version '4.0.1'`;
              models.add(name);
              isCqlUpdated = true;
            } else if (name === "QICore" && cleanVersion !== modelVersion) {
              parsedEditorCqlCopy.cqlArrayToBeFiltered[
                lineIndex
              ] = `using ${measureModel} version '${modelVersion}'`;
              models.add(name);
              isCqlUpdated = true;
            } else if (name === "QDM" && !models.has(measureModel)) {
              parsedEditorCqlCopy.cqlArrayToBeFiltered[
                lineIndex
              ] = `using ${measureModel} version '${modelVersion}'`;
              models.add(measureModel);
              isCqlUpdated = true;
            } else if (name === "QDM") {
              parsedEditorCqlCopy.cqlArrayToBeFiltered.splice(lineIndex, 1);
              deletedLineCount++;
              isCqlUpdated = true;
            } else {
              models.add(name);
            }
          } else if (measureModel === "QDM") {
            if (name === "QDM" && cleanVersion !== modelVersion) {
              parsedEditorCqlCopy.cqlArrayToBeFiltered[
                lineIndex
              ] = `using ${measureModel} version '${modelVersion}'`;
              models.add(name);
              isCqlUpdated = true;
            } else if (
              !models.has("QDM") &&
              (name === "QICore" || name === "FHIR")
            ) {
              parsedEditorCqlCopy.cqlArrayToBeFiltered[
                lineIndex
              ] = `using ${measureModel} version '${modelVersion}'`;
              models.add(measureModel);
              isCqlUpdated = true;
            } else {
              parsedEditorCqlCopy.cqlArrayToBeFiltered.splice(lineIndex, 1);
              deletedLineCount++;
              isCqlUpdated = true;
            }
          }
        } else {
          models.add(name);
        }
      } else {
        parsedEditorCqlCopy.cqlArrayToBeFiltered.splice(lineIndex, 1);
        deletedLineCount++;
        isCqlUpdated = true;
      }
    });
  }
  return {
    isCqlUpdated,
    updatedCqlArray: parsedEditorCqlCopy.cqlArrayToBeFiltered,
  };
};

export const parseEditorContent = (content): CqlError[] => {
  let errors: CqlError[] = [];
  if (content) {
    const parseOutput = new CqlAntlr(content).parse();
    if (parseOutput.errors && parseOutput.errors.length > 0) {
      errors = parseOutput.errors;
    }
    if (!parseOutput?.context?.text?.includes("Patient")) {
      errors.push({
        message: "Measure Context must be 'Patient'.",
        start: parseOutput?.context?.start,
        stop: parseOutput?.context?.stop,
      });
    }
  }
  return errors;
};

const parseCql = (editorVal): ParsedCqlObject => {
  let isConceptRemoved = false;
  if (editorVal) {
    let cleanedVal = editorVal;
    const conceptToRemove = cleanedVal?.match(/^\s*concept[\s\S]*?}.*/gim);
    if (conceptToRemove) {
      conceptToRemove.map((conceptLine) => {
        cleanedVal = cleanedVal?.replace(conceptLine, "");
      });
      isConceptRemoved = true;
    }
    const parsedCql = new CqlAntlr(cleanedVal)?.parse();
    const cqlArrayToBeFiltered = cleanedVal?.split("\n");
    const libraryContent = parsingLibrary(parsedCql, cqlArrayToBeFiltered);
    return {
      cql: { cqlArrayToBeFiltered, libraryContent, parsedCql },
      isConceptRemoved,
    };
  }
};

const parsingLibrary = (parsedCql, cqlArrayToBeFiltered): Statement => {
  if (parsedCql?.library) {
    const libraryContentIndex = parsedCql.library.start.line - 1;
    const libraryContentStatement = cqlArrayToBeFiltered[libraryContentIndex];
    return {
      statement: libraryContentStatement,
      index: libraryContentIndex,
    };
  }
};

const updateCql = (
  parsedEditorCql: ParsedCql,
  libraryName,
  libraryVersion,
  usedModel,
  modelVersion,
  conceptRemoved
): UpdatedCqlObject => {
  const cqlUpdates = {
    cql: "",
    isLibraryStatementChanged: false,
    isUsingStatementChanged: false,
    isValueSetChanged: false,
    isConceptRemoved: false,
  } as UpdatedCqlObject;

  if (parsedEditorCql) {
    const currentLibraryName = parsedEditorCql.parsedCql?.library?.name;
    const currentLibraryVersion = parsedEditorCql.parsedCql?.library?.version;
    if (
      libraryName !== currentLibraryName ||
      `'${libraryVersion}'` !== currentLibraryVersion
    ) {
      parsedEditorCql.cqlArrayToBeFiltered[
        parsedEditorCql.libraryContent?.index
      ] = `library ${libraryName} version '${libraryVersion}'`;
      cqlUpdates.isLibraryStatementChanged = true;
    }

    parsedEditorCql.parsedCql.includes.forEach((include) => {
      if (include.name === "FHIRHelpers" && include.called != "FHIRHelpers") {
        const correctFhirHelpersIncludeLine = `include FHIRHelpers version ${include.version} called FHIRHelpers`;
        const incorrectFhirHelpersIncludeLine = include.text;
        parsedEditorCql.cqlArrayToBeFiltered[include.start.line - 1] =
          parsedEditorCql.cqlArrayToBeFiltered[include.start.line - 1].replace(
            incorrectFhirHelpersIncludeLine,
            correctFhirHelpersIncludeLine
          );
        cqlUpdates.isFhirHelpersAliasChanged = true;
      }
    });

    const { isCqlUpdated, updatedCqlArray } = updateUsingStatements(
      parsedEditorCql,
      usedModel,
      modelVersion
    );
    cqlUpdates.isUsingStatementChanged = isCqlUpdated;
    parsedEditorCql.cqlArrayToBeFiltered = updatedCqlArray;

    if (parsedEditorCql.parsedCql?.valueSets) {
      parsedEditorCql.parsedCql.valueSets
        .filter((valueSet) => valueSet.version)
        .forEach((valueSet) => {
          const lineNumber = valueSet.start.line - 1;
          parsedEditorCql.cqlArrayToBeFiltered[
            lineNumber
          ] = `valueset ${valueSet.name}: ${valueSet.url}`;
          cqlUpdates.isValueSetChanged = true;
        });
    }
    cqlUpdates.cql = parsedEditorCql?.cqlArrayToBeFiltered?.join("\n");
  }
  cqlUpdates.isConceptRemoved = conceptRemoved;
  return cqlUpdates;
};

export const updateEditorContent = async (
  editorVal,
  existingCql,
  libraryName,
  existingCqlLibraryName,
  versionString,
  usingName,
  usingVersion,
  triggeredFrom
): Promise<UpdatedCqlObject> => {
  if (
    triggeredFrom === "measureEditor" ||
    triggeredFrom === "updateCqlLibrary"
  ) {
    const parsedEditorCql = await parseCql(editorVal || "");
    return updateCql(
      parsedEditorCql?.cql,
      libraryName,
      versionString,
      usingName,
      usingVersion,
      parsedEditorCql?.isConceptRemoved
    );
  } else {
    if (existingCql && existingCqlLibraryName !== libraryName) {
      const parsedEditorCql = await parseCql(existingCql);
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
  }
};

export const isUsingStatementEmpty = (editorVal): boolean => {
  const parsedContents = parseCql(editorVal);
  return parsedContents?.cql?.parsedCql?.usings?.length === 0;
};

/**
 * Map CQL parse errors to Monaco-compatible marker data.
 * Kept as a named export so the existing public API in madie-madie-editor.tsx
 * can continue to expose `parseContent` without changes.
 */
export const mapParserErrorsToEditorAnnotations = (
  errors: CqlError[]
): EditorAnnotation[] => {
  if (!errors) return [];
  return errors.map((error) => ({
    row: error.start?.line - 1,
    column: error.start?.position,
    type: "error",
    text: `Parse: ${error.start?.position}:${error.stop?.position} | ${error.message}`,
  }));
};

// ─── Monaco component ────────────────────────────────────────────────────────

let monacoInstance: typeof monacoTypes | null = null;

const MadieMonacoEditor = ({
  value,
  onChange,
  height,
  parseDebounceTime = 1500,
  inboundAnnotations,
  inboundErrorMarkers,
  readOnly = false,
  validationsEnabled = true,
  setOutboundAnnotations,
  diffOriginal,
}: EditorPropsType) => {
  const editorRef = useRef<monacoTypes.editor.IStandaloneCodeEditor | null>(
    null
  );
  const [parserAnnotations, setParserAnnotations] = useState<
    EditorAnnotation[]
  >([]);

  // ── Register CQL language & theme via beforeMount ──────────────────────────
  const handleBeforeMount = (m: Monaco) => {
    monacoInstance = m as typeof monacoTypes;
    registerCqlLanguage(monacoInstance);
    defineCqlTheme(monacoInstance);
  };

  // ── Debounced parsing ──────────────────────────────────────────────────────
  const debouncedParse = useRef(
    _.debounce((nextValue: string) => {
      const errors = parseEditorContent(nextValue);
      const annotations = mapParserErrorsToEditorAnnotations(errors);
      setParserAnnotations(annotations);
    }, parseDebounceTime)
  ).current;

  useEffect(() => {
    return () => {
      if (debouncedParse && validationsEnabled) {
        debouncedParse.cancel();
      }
    };
  }, [debouncedParse, validationsEnabled]);

  useEffect(() => {
    if (!_.isNil(value) && validationsEnabled) {
      debouncedParse(value);
    }
  }, [value, debouncedParse, validationsEnabled]);

  // ── Annotations → Monaco markers ──────────────────────────────────────────
  useEffect(() => {
    if (!validationsEnabled || !monacoInstance) return;
    const ed = editorRef.current;
    if (!ed) return;
    const model = ed.getModel();
    if (!model) return;

    const iann = inboundAnnotations || [];
    const allAnnotations = [...iann, ...parserAnnotations];

    const markers: monacoTypes.editor.IMarkerData[] = allAnnotations.map(
      (ann) => ({
        severity: monacoInstance.MarkerSeverity.Error,
        message: ann.text,
        startLineNumber: ann.row + 1,
        startColumn: ann.column + 1,
        endLineNumber: ann.row + 1,
        endColumn: ann.column + 2,
      })
    );

    if (inboundErrorMarkers) {
      inboundErrorMarkers.forEach((marker) => {
        markers.push({
          severity: monacoInstance.MarkerSeverity.Error,
          message: "Error",
          startLineNumber: marker.range.start.row + 1,
          startColumn: marker.range.start.column + 1,
          endLineNumber: marker.range.end.row + 1,
          endColumn: marker.range.end.column + 1,
        });
      });
    }

    monacoInstance.editor.setModelMarkers(model, "cql", markers);

    if (setOutboundAnnotations) {
      setOutboundAnnotations(allAnnotations);
    }
  }, [
    parserAnnotations,
    inboundAnnotations,
    inboundErrorMarkers,
    validationsEnabled,
  ]);

  // ── Search toggle via custom event ─────────────────────────────────────────
  const toggleSearch = useCallback(() => {
    const ed = editorRef.current;
    if (ed) {
      ed.getAction("actions.find")?.run();
    }
  }, []);

  useEffect(() => {
    window.addEventListener(
      "toggleEditorSearchBox",
      toggleSearch as EventListener
    );
    return () => {
      window.removeEventListener(
        "toggleEditorSearchBox",
        toggleSearch as EventListener
      );
    };
  }, [toggleSearch]);

  // ── Editor mount handler ───────────────────────────────────────────────────
  const handleEditorDidMount = (
    editor: monacoTypes.editor.IStandaloneCodeEditor
  ) => {
    editorRef.current = editor;

    // Accessibility: label the editor textarea
    const textarea = editor.getDomNode()?.querySelector("textarea");
    if (textarea) {
      textarea.setAttribute("aria-label", "Cql editor");
    }
  };

  // ── Diff mode ──────────────────────────────────────────────────────────────
  if (diffOriginal != null) {
    return (
      <div className="madie-monaco-editor" style={{ height: height || "100%" }}>
        <DiffEditor
          original={diffOriginal}
          modified={value}
          language={CQL_LANGUAGE_ID}
          theme="cql-monokai"
          height={height || "100%"}
          beforeMount={handleBeforeMount}
          options={{
            readOnly,
            renderSideBySide: false, // inline diff
            minimap: { enabled: false },
            wordWrap: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            originalEditable: false,
          }}
        />
      </div>
    );
  }

  // ── Standard editor ────────────────────────────────────────────────────────
  return (
    <div className="madie-monaco-editor" style={{ height: height || "100%" }}>
      <Editor
        language={CQL_LANGUAGE_ID}
        theme="cql-monokai"
        value={value}
        onChange={(val) => {
          if (onChange) onChange(val ?? "");
        }}
        beforeMount={handleBeforeMount}
        onMount={handleEditorDidMount}
        height={height || "100%"}
        options={{
          readOnly,
          minimap: { enabled: false },
          wordWrap: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          fontSize: 14,
          lineNumbers: "on",
          renderLineHighlight: "all",
          scrollbar: { vertical: "visible" },
          find: {
            addExtraSpaceOnTop: false,
          },
        }}
      />
    </div>
  );
};

export default MadieMonacoEditor;
