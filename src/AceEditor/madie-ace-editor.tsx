import React, { useEffect, useRef, useState } from "react";
import MonacoEditor, { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import * as _ from "lodash";
import { CqlAntlr } from "@madie/cql-antlr-parser/dist/src";

import CqlError from "@madie/cql-antlr-parser/dist/src/dto/CqlError";
import { Ace } from "ace-builds";

import "./madie-custom.css";
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
import { registerCqlLanguage, CQL_LANGUAGE_ID } from "./cql-monaco-language";

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
  inboundAnnotations?: Ace.Annotation[];
  inboundErrorMarkers?: Ace.MarkerLike[];
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
  /** When true, decorates lines that differ from the last-saved baseline */
  showDiff?: boolean;
  /** Callback fired when the user resets the diff baseline to the current content */
  onResetDiffBaseline?: () => void;
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
      // keep FHIR if that's the only using model present for QICore but update version if it was incorrect.
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
    // to track if the usings statement was verified or not
    const models = new Set();
    let deletedLineCount = 0;

    usingStatements.forEach((using) => {
      const { name, version, start } = using;
      const lineIndex = start.line - (deletedLineCount + 1);
      const cleanVersion = version.replace(/["']/g, "");

      if (!models.has(name)) {
        if (measureModel !== name || modelVersion !== cleanVersion) {
          // if measure model is QICore
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
            // if measure model is QDM
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
  //TODO: post MVP, move to ANTLR Parser, possibly the listener?
  //look at/use enterConceptDefinition
  let isConceptRemoved = false;
  if (editorVal) {
    const conceptToRemove = editorVal?.match(/^\s*concept[\s\S]*?}.*/gim);
    if (conceptToRemove) {
      conceptToRemove.map((conceptLine) => {
        editorVal = editorVal?.replace(conceptLine, "");
      });
      isConceptRemoved = true;
    }
    const parsedCql = new CqlAntlr(editorVal)?.parse();
    const cqlArrayToBeFiltered = editorVal?.split("\n");
    const libraryContent = parsingLibrary(parsedCql, cqlArrayToBeFiltered);
    return {
      cql: { cqlArrayToBeFiltered, libraryContent, parsedCql },
      isConceptRemoved: isConceptRemoved,
    };
  }
};

const parsingLibrary = (parsedCql, cqlArrayToBeFiltered): Statement => {
  if (parsedCql?.library) {
    const libraryContentIndex =
      parsedCql?.library && parsedCql?.library.start.line - 1;
    const libraryContentStatement = cqlArrayToBeFiltered[libraryContentIndex];
    return {
      statement: libraryContentStatement,
      index: libraryContentIndex,
    };
  }
};

/**
 * User is not allowed to update following things in CQL:
 * 1. library version
 * 2. using statement
 * 3. value set can not have version
 * If any of the above change encountered, it will be reverted
 * @param parsedEditorCql
 * @param libraryName
 * @param libraryVersion
 * @param usedModel
 * @param modelVersion
 */
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
    // library statement can't be modified
    if (
      libraryName !== currentLibraryName ||
      `'${libraryVersion}'` !== currentLibraryVersion
    ) {
      parsedEditorCql.cqlArrayToBeFiltered[
        parsedEditorCql.libraryContent?.index
      ] = `library ${libraryName} version '${libraryVersion}'`;
      cqlUpdates.isLibraryStatementChanged = true;
    }

    //in includes find FHIRHelpers.. if it exists, check for Alias.  If Alias isn't FHIRHelpers exactly,
    parsedEditorCql.parsedCql.includes.forEach((include) => {
      if (include.name === "FHIRHelpers" && include.called != "FHIRHelpers") {
        //then modify and return .. also set cqlUpdates.isFhirHelpersAliasModified = true
        const correctFhirHelpersIncludeLine: string = `include FHIRHelpers version ${include.version} called FHIRHelpers`;
        const incorrectFhirHelpersIncludeLine: string = include.text;

        parsedEditorCql.cqlArrayToBeFiltered[include.start.line - 1] =
          parsedEditorCql.cqlArrayToBeFiltered[include.start.line - 1].replace(
            incorrectFhirHelpersIncludeLine,
            correctFhirHelpersIncludeLine
          );
        cqlUpdates.isFhirHelpersAliasChanged = true;
      }
    });
    // update using statements if they are incorrect
    const { isCqlUpdated, updatedCqlArray } = updateUsingStatements(
      parsedEditorCql,
      usedModel,
      modelVersion
    );
    cqlUpdates.isUsingStatementChanged = isCqlUpdated;
    parsedEditorCql.cqlArrayToBeFiltered = updatedCqlArray;

    // value set with version are not allowed at this moment, remove version
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
    return {
      cql: existingCql,
    } as UpdatedCqlObject;
  }
};

export const isUsingStatementEmpty = (editorVal): boolean => {
  const parsedContents = parseCql(editorVal);
  return parsedContents?.cql?.parsedCql?.usings?.length === 0;
};

// Kept for backward compatibility with tests and consumers using Ace types
export const mapParserErrorsToAceAnnotations = (
  errors: CqlError[]
): Ace.Annotation[] => {
  let annotations: Ace.Annotation[] = [];
  if (errors) {
    annotations = errors.map((error) => ({
      row: error.start?.line - 1,
      column: error.start?.position,
      type: "error",
      text: `Parse: ${error.start?.position}:${error.stop?.position} | ${error.message}`,
    }));
  }
  return annotations;
};

export const mapParserErrorsToAceMarkers = (errors: CqlError[]) => {
  let markers = [];
  if (errors) {
    markers = errors.map((error) => ({
      range: {
        start: {
          row: error.start?.line - 1,
          column: error.start?.position,
        },
        end: {
          row: error.stop?.line - 1,
          column: error.stop?.position,
        },
      },
      clazz: "editor-error-underline",
      type: "text",
    }));
  }
  return markers;
};

// Kept for backward compatibility
let originalCommands;
export const setCommandEnabled = (editor, name, enabled) => {
  const command = editor.commands.byName[name];
  if (!originalCommands) {
    originalCommands = JSON.parse(JSON.stringify(editor.commands));
  }
  const bindKeyOriginal = originalCommands.byName[name].bindKey;
  command.bindKey = enabled ? bindKeyOriginal : null;
  editor.commands.addCommand(command);
};

/** Convert Ace-style annotations to Monaco markers */
const aceAnnotationsToMonacoMarkers = (
  annotations: Ace.Annotation[],
  model: monaco.editor.ITextModel
): monaco.editor.IMarkerData[] => {
  if (!annotations) return [];
  return annotations.map((ann) => ({
    severity: monaco.MarkerSeverity.Error,
    message: ann.text,
    startLineNumber: (ann.row ?? 0) + 1,
    startColumn: (ann.column ?? 0) + 1,
    endLineNumber: (ann.row ?? 0) + 1,
    endColumn: model.getLineMaxColumn((ann.row ?? 0) + 1),
  }));
};

/** Convert CqlError[] directly to Monaco markers */
const cqlErrorsToMonacoMarkers = (
  errors: CqlError[]
): monaco.editor.IMarkerData[] => {
  if (!errors) return [];
  return errors.map((error) => ({
    severity: monaco.MarkerSeverity.Error,
    message: `Parse: ${error.start?.position}:${error.stop?.position} | ${error.message}`,
    startLineNumber: error.start?.line ?? 1,
    startColumn: (error.start?.position ?? 0) + 1,
    endLineNumber: error.stop?.line ?? 1,
    endColumn: (error.stop?.position ?? 0) + 1,
  }));
};

const MONACO_EDITOR_MODEL_URI = "cql-editor-model";

// ---------------------------------------------------------------------------
// VS Code-style inline diff with Accept / Reject per hunk
// ---------------------------------------------------------------------------

/** A single diff hunk produced by Monaco's diff worker */
export interface DiffHunk {
  /** 1-based, inclusive start line in the *new* (current) document */
  newStartLine: number;
  /** 1-based, inclusive end line in the *new* document (0 = pure deletion) */
  newEndLine: number;
  /** 1-based, inclusive start line in the *original* (baseline) document */
  origStartLine: number;
  /** 1-based, inclusive end line in the original document (0 = pure insertion) */
  origEndLine: number;
  /** The original lines that were replaced / deleted */
  origLines: string[];
}

/**
 * Compute hunks by running Monaco's built-in line-level diff algorithm
 * on two temporary models, then dispose them immediately.
 */
const computeHunks = (
  origText: string,
  newText: string
): Promise<DiffHunk[]> => {
  return new Promise((resolve) => {
    const origModel = monaco.editor.createModel(origText, "plaintext");
    const newModel = monaco.editor.createModel(newText, "plaintext");

    // createDiffEditor needs a DOM node – use a hidden off-screen div
    const container = document.createElement("div");
    container.style.cssText =
      "position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;";
    document.body.appendChild(container);

    const diffEditor = monaco.editor.createDiffEditor(container, {
      automaticLayout: false,
      enableSplitViewResizing: false,
      renderSideBySide: false,
    });

    diffEditor.setModel({ original: origModel, modified: newModel });

    // Monaco fires onDidUpdateDiff when the diff worker finishes
    const disposable = diffEditor.onDidUpdateDiff(() => {
      disposable.dispose();
      const lineChanges = diffEditor.getLineChanges() ?? [];
      const origLines = origText.split("\n");

      const hunks: DiffHunk[] = lineChanges.map((c) => {
        const oStart = c.originalStartLineNumber; // 1-based
        const oEnd = c.originalEndLineNumber; // 0 = pure insert
        const nStart = c.modifiedStartLineNumber;
        const nEnd = c.modifiedEndLineNumber; // 0 = pure delete

        const hunkOrigLines = oEnd > 0 ? origLines.slice(oStart - 1, oEnd) : [];

        return {
          newStartLine: nStart,
          newEndLine: nEnd,
          origStartLine: oStart,
          origEndLine: oEnd,
          origLines: hunkOrigLines,
        };
      });

      // Clean up
      diffEditor.dispose();
      origModel.dispose();
      newModel.dispose();
      document.body.removeChild(container);

      resolve(hunks);
    });
  });
};

// ---------------------------------------------------------------------------
// Decoration helpers
// ---------------------------------------------------------------------------

const applyHunkDecorations = (
  editor: monaco.editor.IStandaloneCodeEditor,
  hunks: DiffHunk[],
  decorationsRef: React.MutableRefObject<string[]>
) => {
  const model = editor.getModel();
  if (!model) return;

  const newDecorations: monaco.editor.IModelDeltaDecoration[] = [];

  for (const hunk of hunks) {
    const hasInserted = hunk.newEndLine > 0;
    const hasDeleted = hunk.origEndLine > 0;

    // ── Inserted / modified lines – green background + left border ──
    if (hasInserted) {
      newDecorations.push({
        range: new monaco.Range(
          hunk.newStartLine,
          1,
          hunk.newEndLine,
          model.getLineMaxColumn(hunk.newEndLine)
        ),
        options: {
          isWholeLine: true,
          className: "diff-inserted-line",
          glyphMarginClassName: "diff-inserted-glyph",
          overviewRuler: {
            color: "#28a745",
            position: monaco.editor.OverviewRulerLane.Left,
          },
        },
      });
    }

    // ── Deleted lines – red stripe shown *above* the first modified/inserted
    //    line using a `beforeContentClassName` on that anchor line ──
    if (hasDeleted) {
      const anchorLine = hasInserted ? hunk.newStartLine : hunk.newStartLine;
      const safeLine = Math.max(1, anchorLine);
      newDecorations.push({
        range: new monaco.Range(safeLine, 1, safeLine, 1),
        options: {
          isWholeLine: false,
          beforeContentClassName: "diff-deleted-block",
          hoverMessage: {
            value: "**Removed:**\n```\n" + hunk.origLines.join("\n") + "\n```",
          },
          stickiness:
            monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        },
      });
    }
  }

  decorationsRef.current = editor.deltaDecorations(
    decorationsRef.current,
    newDecorations
  );
};

/** Apply glyph-margin and line-highlight decorations for all error markers */
const applyErrorGutterDecorations = (
  editor: monaco.editor.IStandaloneCodeEditor,
  markers: monaco.editor.IMarkerData[],
  decorationsRef: React.MutableRefObject<string[]>
) => {
  const errorLines = new Set(markers.map((m) => m.startLineNumber));
  const newDecorations: monaco.editor.IModelDeltaDecoration[] = Array.from(
    errorLines
  ).map((line) => ({
    range: new monaco.Range(line, 1, line, 1),
    options: {
      glyphMarginClassName: "cql-error-glyph",
      glyphMarginHoverMessage: {
        value:
          "**CQL Error** on this line. Please see squiggly to view error description.",
      },
      isWholeLine: true,
      className: "cql-error-line-highlight",
      overviewRuler: {
        color: "#ff0000",
        position: monaco.editor.OverviewRulerLane.Left,
      },
    },
  }));
  decorationsRef.current = editor.deltaDecorations(
    decorationsRef.current,
    newDecorations
  );
};

const MadieAceEditor = ({
  value,
  onChange,
  height,
  parseDebounceTime = 1500,
  inboundAnnotations,
  inboundErrorMarkers: _inboundErrorMarkers,
  readOnly = false,
  validationsEnabled = true,
  setOutboundAnnotations,
  showDiff = false,
  onResetDiffBaseline,
}: EditorPropsType) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [, setParsing] = useState<boolean>(undefined);
  const gutterDecorationsRef = useRef<string[]>([]);

  // ── Inline diff state ────────────────────────────────────────────────────
  const [diffEnabled, setDiffEnabled] = useState<boolean>(showDiff);
  const diffBaselineRef = useRef<string | null>(null);
  const diffDecorationsRef = useRef<string[]>([]);
  // Keep track of hunks so Accept/Reject can reference them
  const hunksRef = useRef<DiffHunk[]>([]);
  // Overlay widget DOM nodes – we manage them manually so we can dispose them
  const overlayWidgetsRef = useRef<
    { widgetId: string; domNode: HTMLElement }[]
  >([]);

  // Keep prop → state in sync
  useEffect(() => {
    setDiffEnabled(showDiff);
  }, [showDiff]);

  // ── Overlay widget management ────────────────────────────────────────────

  const removeAllOverlayWidgets = () => {
    const editor = editorRef.current;
    if (!editor) return;
    overlayWidgetsRef.current.forEach(({ widgetId }) => {
      try {
        editor.removeOverlayWidget({
          getId: () => widgetId,
          getDomNode: () => null,
          getPosition: () => null,
        });
      } catch (_) {
        // ignore if already removed
      }
    });
    overlayWidgetsRef.current = [];
  };

  /**
   * Accept a hunk: keep the new lines as-is (just clear highlights for it).
   * We re-baseline only the accepted hunk's region so the rest of the diff
   * stays visible. Easiest implementation: rebuild baseline by applying all
   * *rejected* hunks' original lines back, then re-diff.
   * For "accept" we just remove the hunk from the pending list and redraw.
   */
  const acceptHunk = (hunkIndex: number) => {
    const newHunks = hunksRef.current.filter((_, i) => i !== hunkIndex);
    hunksRef.current = newHunks;
    redrawDiff(newHunks);
  };

  /**
   * Reject a hunk: restore the original lines in the editor, then redraw.
   */
  const rejectHunk = (hunkIndex: number, currentValue: string) => {
    const hunk = hunksRef.current[hunkIndex];
    if (!hunk) return;

    const lines = currentValue.split("\n");
    const hasInserted = hunk.newEndLine > 0;
    const hasDeleted = hunk.origEndLine > 0;

    let newLines: string[];
    if (hasInserted && hasDeleted) {
      // Replace inserted lines with original lines
      newLines = [
        ...lines.slice(0, hunk.newStartLine - 1),
        ...hunk.origLines,
        ...lines.slice(hunk.newEndLine),
      ];
    } else if (hasInserted && !hasDeleted) {
      // Pure insertion – remove the inserted lines
      newLines = [
        ...lines.slice(0, hunk.newStartLine - 1),
        ...lines.slice(hunk.newEndLine),
      ];
    } else {
      // Pure deletion – re-insert the original lines above anchor
      newLines = [
        ...lines.slice(0, hunk.newStartLine - 1),
        ...hunk.origLines,
        ...lines.slice(hunk.newStartLine - 1),
      ];
    }

    const rejectedValue = newLines.join("\n");
    if (onChange) onChange(rejectedValue);

    // After rejection, this hunk is resolved – remove it
    const newHunks = hunksRef.current.filter((_, i) => i !== hunkIndex);
    hunksRef.current = newHunks;
    // Decorations will update via the value useEffect
  };

  /** Accept all hunks at once */
  const acceptAll = () => {
    hunksRef.current = [];
    // Update baseline to current value so future edits diff from here
    diffBaselineRef.current = value ?? "";
    redrawDiff([]);
  };

  /** Reject all hunks: restore baseline */
  const rejectAll = () => {
    if (diffBaselineRef.current === null) return;
    if (onChange) onChange(diffBaselineRef.current);
    hunksRef.current = [];
  };

  /** Re-render decorations + overlay widgets for the current hunk list */
  const redrawDiff = (hunks: DiffHunk[]) => {
    const editor = editorRef.current;
    if (!editor) return;
    removeAllOverlayWidgets();
    applyHunkDecorations(editor, hunks, diffDecorationsRef);
    addOverlayWidgets(editor, hunks);
  };

  /**
   * For each hunk, create a small floating widget positioned at the top-right
   * of its first line with Accept / Reject buttons.
   */
  const addOverlayWidgets = (
    editor: monaco.editor.IStandaloneCodeEditor,
    hunks: DiffHunk[]
  ) => {
    hunks.forEach((hunk, idx) => {
      const widgetId = `diff-hunk-widget-${idx}-${Date.now()}`;

      const domNode = document.createElement("div");
      domNode.className = "diff-hunk-widget";

      // Accept button
      const acceptBtn = document.createElement("button");
      acceptBtn.className = "diff-hunk-btn diff-hunk-btn--accept";
      acceptBtn.title = "Accept this change";
      acceptBtn.innerHTML = "✓ Accept";
      acceptBtn.onclick = (e) => {
        e.stopPropagation();
        acceptHunk(idx);
      };

      // Reject button
      const rejectBtn = document.createElement("button");
      rejectBtn.className = "diff-hunk-btn diff-hunk-btn--reject";
      rejectBtn.title = "Reject this change (revert to original)";
      rejectBtn.innerHTML = "✕ Reject";
      rejectBtn.onclick = (e) => {
        e.stopPropagation();
        rejectHunk(idx, editor.getValue());
      };

      domNode.appendChild(acceptBtn);
      domNode.appendChild(rejectBtn);

      // Position the widget at the first line of the hunk
      const anchorLine =
        hunk.newEndLine > 0
          ? hunk.newStartLine
          : Math.max(1, hunk.newStartLine);
      const lineTop = editor.getTopForLineNumber(anchorLine);
      const scrollTop = editor.getScrollTop();
      const editorDom = editor.getDomNode();
      const editorWidth = editorDom ? editorDom.clientWidth : 600;

      domNode.style.top = `${lineTop - scrollTop}px`;
      domNode.style.left = `${editorWidth - 185}px`;

      const widget: monaco.editor.IOverlayWidget = {
        getId: () => widgetId,
        getDomNode: () => domNode,
        getPosition: () => null, // we position manually
      };

      editor.addOverlayWidget(widget);
      overlayWidgetsRef.current.push({ widgetId, domNode });

      // Keep widget pinned to its line as the user scrolls
      editor.onDidScrollChange(() => {
        const newLineTop = editor.getTopForLineNumber(anchorLine);
        const newScrollTop = editor.getScrollTop();
        domNode.style.top = `${newLineTop - newScrollTop}px`;
        const newEditorWidth = editorDom ? editorDom.clientWidth : 600;
        domNode.style.left = `${newEditorWidth - 185}px`;
      });
    });
  };

  // ── Recompute diff whenever value or diffEnabled changes ─────────────────
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (!diffEnabled) {
      removeAllOverlayWidgets();
      hunksRef.current = [];
      diffDecorationsRef.current = editor.deltaDecorations(
        diffDecorationsRef.current,
        []
      );
      return;
    }

    if (diffBaselineRef.current === null) return;
    if (diffBaselineRef.current === (value ?? "")) {
      // No changes vs baseline
      removeAllOverlayWidgets();
      hunksRef.current = [];
      diffDecorationsRef.current = editor.deltaDecorations(
        diffDecorationsRef.current,
        []
      );
      return;
    }

    computeHunks(diffBaselineRef.current, value ?? "").then((hunks) => {
      hunksRef.current = hunks;
      redrawDiff(hunks);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diffEnabled, value]);

  const handleResetBaseline = () => {
    diffBaselineRef.current = value ?? "";
    removeAllOverlayWidgets();
    hunksRef.current = [];
    if (editorRef.current) {
      diffDecorationsRef.current = editorRef.current.deltaDecorations(
        diffDecorationsRef.current,
        []
      );
    }
    if (onResetDiffBaseline) onResetDiffBaseline();
  };
  // ─────────────────────────────────────────────────────────────────────────

  const debouncedParse = useRef(
    _.debounce(async (nextValue: string) => {
      const errors = parseEditorContent(nextValue);
      if (editorRef.current && monacoRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          const parseMarkers = cqlErrorsToMonacoMarkers(errors);
          const inboundMarkers = inboundAnnotations
            ? aceAnnotationsToMonacoMarkers(inboundAnnotations, model)
            : [];
          const allMarkers = [...inboundMarkers, ...parseMarkers];
          monacoRef.current.editor.setModelMarkers(
            model,
            MONACO_EDITOR_MODEL_URI,
            allMarkers
          );
          applyErrorGutterDecorations(
            editorRef.current,
            allMarkers,
            gutterDecorationsRef
          );
          if (setOutboundAnnotations) {
            setOutboundAnnotations(mapParserErrorsToAceAnnotations(errors));
          }
        }
      }
      setParsing(false);
    }, parseDebounceTime)
  ).current;

  // Re-run parse when inbound annotations change
  useEffect(() => {
    if (validationsEnabled && editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        const errors = parseEditorContent(value);
        const parseMarkers = cqlErrorsToMonacoMarkers(errors);
        const inboundMarkers = inboundAnnotations
          ? aceAnnotationsToMonacoMarkers(inboundAnnotations, model)
          : [];
        const allMarkers = [...inboundMarkers, ...parseMarkers];
        monacoRef.current.editor.setModelMarkers(
          model,
          MONACO_EDITOR_MODEL_URI,
          allMarkers
        );
        applyErrorGutterDecorations(
          editorRef.current,
          allMarkers,
          gutterDecorationsRef
        );
        if (setOutboundAnnotations) {
          setOutboundAnnotations(mapParserErrorsToAceAnnotations(errors));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inboundAnnotations]);

  useEffect(() => {
    if (validationsEnabled && !_.isNil(value)) {
      setParsing(true);
      debouncedParse(value);
    }
    return () => {
      debouncedParse.cancel();
    };
  }, [value, debouncedParse, validationsEnabled]);

  // Listen for toggleEditorSearchBox custom event
  useEffect(() => {
    const handleToggleSearch = () => {
      if (editorRef.current) {
        editorRef.current.getAction("actions.find")?.run();
      }
    };
    window.addEventListener("toggleEditorSearchBox", handleToggleSearch);
    return () => {
      window.removeEventListener("toggleEditorSearchBox", handleToggleSearch);
    };
  }, []);

  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: Monaco
  ) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;

    // Capture diff baseline on first mount
    if (diffBaselineRef.current === null) {
      diffBaselineRef.current = value ?? "";
    }

    // Register CQL language if not already registered
    registerCqlLanguage();

    // Set aria-label for accessibility
    editor.getDomNode()?.setAttribute("aria-label", "Cql editor");

    // Add Escape key handling similar to Ace (blur the editor so Tab navigates away)
    editor.addCommand(monacoInstance.KeyCode.Escape, () => {
      (editor.getDomNode() as HTMLElement)?.blur();
    });

    if (validationsEnabled) {
      setParsing(true);
      debouncedParse(value ?? "");
    }
  };

  return (
    <div
      id="monaco-editor-wrapper"
      style={{
        height: height ?? "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Inline-diff toolbar */}
      <div className="diff-toolbar">
        <button
          className={`diff-toolbar__toggle${
            diffEnabled ? " diff-toolbar__toggle--active" : ""
          }`}
          onClick={() => {
            if (!diffEnabled && diffBaselineRef.current === null) {
              diffBaselineRef.current = value ?? "";
            }
            setDiffEnabled((prev) => !prev);
          }}
          title={
            diffEnabled
              ? "Hide inline diff"
              : "Show inline diff against baseline"
          }
        >
          {diffEnabled ? "Hide Diff" : "Show Diff"}
        </button>
        {diffEnabled && (
          <button
            className="diff-toolbar__reset"
            onClick={handleResetBaseline}
            title="Reset baseline to current content (clears all diff highlights)"
          >
            Reset Baseline
          </button>
        )}
        {diffEnabled && hunksRef.current.length > 0 && (
          <>
            <button
              className="diff-toolbar__accept-all"
              onClick={acceptAll}
              title="Accept all changes"
            >
              ✓ Accept All
            </button>
            <button
              className="diff-toolbar__reject-all"
              onClick={rejectAll}
              title="Reject all changes and revert to baseline"
            >
              ✕ Reject All
            </button>
          </>
        )}
        {diffEnabled && (
          <span className="diff-toolbar__legend">
            <span className="diff-toolbar__legend-inserted">&#9632;</span> Added
            &nbsp;
            <span className="diff-toolbar__legend-deleted">&#9632;</span>{" "}
            Removed
          </span>
        )}
      </div>

      <MonacoEditor
        language={CQL_LANGUAGE_ID}
        theme="vs-dark"
        value={value}
        height="100%"
        options={{
          readOnly,
          wordWrap: "on",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          lineNumbers: "on",
          glyphMargin: true,
          folding: true,
          scrollbar: {
            vertical: "visible",
            alwaysConsumeMouseWheel: false,
          },
          accessibilitySupport: "on",
        }}
        onChange={(val) => {
          if (onChange) onChange(val ?? "");
        }}
        onMount={handleEditorDidMount}
      />
    </div>
  );
};

export default MadieAceEditor;
