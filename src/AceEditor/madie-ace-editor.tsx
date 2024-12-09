import React, { useEffect, useRef, useState } from "react";
import AceEditor from "react-ace";
import * as _ from "lodash";
import { CqlAntlr } from "@madie/cql-antlr-parser/dist/src";

import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-searchbox";

const ace = require("ace-builds/src-noconflict/ace");
ace.config.set("basePath", require("ace-builds").config.basePath);

import CqlMode from "./cql-mode";
import { Ace, Range } from "ace-builds";
import CqlError from "@madie/cql-antlr-parser/dist/src/dto/CqlError";

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
  parseDebounceTime?: number;
  inboundAnnotations?: Ace.Annotation[];
  inboundErrorMarkers?: Ace.MarkerLike[];
  height?: string;
  readOnly?: boolean;
  validationsEnabled?: boolean;
  measureStoreCql?: string;
  cqlMetaData?: CqlMetaData;
  measureModel?: string;
  handleCodeDelete?: (code: string) => void;
  handleDefinitionDelete?: (definition: string) => void;
  setEditorVal?: Function;
  setIsCQLUnchanged?: Function;
  isCQLUnchanged?: boolean;
  resetCql?: () => void;
  getCqlDefinitionReturnTypes?: () => void;
  // conditional props used to pass up annotations outside of the editor
  setOutboundAnnotations?: Function;
}

export interface UpdatedCqlObject {
  cql: string;
  isLibraryStatementChanged?: boolean;
  isUsingStatementChanged?: boolean;
  isValueSetChanged?: boolean;
  isFhirHelpersAliasChanged?: boolean;
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
    if (
      measureModel !== name ||
      modelVersion !== version.replace(/["']/g, "")
    ) {
      // we want to keep FHIR if that's the only using model present for QICore.
      if (measureModel === "QICore" && name === "FHIR") {
        parsedEditorCqlCopy.cqlArrayToBeFiltered[
          start.line - 1
        ] = `using FHIR version '4.0.1'`;
      } else {
        parsedEditorCqlCopy.cqlArrayToBeFiltered[
          start.line - 1
        ] = `using ${measureModel} version '${modelVersion}'`;
      }
      isCqlUpdated = true;
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
  }
  return errors;
};

const parseCql = (editorVal): ParsedCql => {
  //TODO: post MVP, move to ANTLR Parser, possibly the listener?
  //look at/use enterConceptDefinition
  if (editorVal) {
    const conceptToRemove = editorVal?.match(/^\s*concept .*/gm);
    if (conceptToRemove) {
      conceptToRemove.map((conceptLine) => {
        editorVal = editorVal?.replace(
          conceptLine,
          "/*CONCEPT DECLARATION REMOVED: CQL concept construct shall NOT be used.*/"
        );
      });
    }
    const parsedCql = new CqlAntlr(editorVal)?.parse();
    const cqlArrayToBeFiltered = editorVal?.split("\n");
    const libraryContent = parsingLibrary(parsedCql, cqlArrayToBeFiltered);
    return {
      cqlArrayToBeFiltered,
      libraryContent,
      parsedCql,
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
  modelVersion
): UpdatedCqlObject => {
  const cqlUpdates = {
    cql: "",
    isLibraryStatementChanged: false,
    isUsingStatementChanged: false,
    isValueSetChanged: false,
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

    //FHIRHelpers can  not be aliased

    //in includes find FHIRHelpers.. if it exists, check for Alias.  If Alias isn't FHIRHelpers exactly,
    parsedEditorCql.parsedCql.includes.forEach((include) => {
      if (include.name === "FHIRHelpers" && include.called != "FHIRHelpers") {
        //then modify and return .. also set cqlUpdates.isFhirHelpersAliasModified = true
        const fhirHelpersIncludeLine: string[] =
          parsedEditorCql.cqlArrayToBeFiltered[include.start.line - 1].split(
            " "
          );
        if (fhirHelpersIncludeLine[4].toLowerCase() === "called") {
          fhirHelpersIncludeLine[5] = "FHIRHelpers";
        } else {
          console.error("FHIRHelpers include statement was malformed");
          throw new Error("FHIRHelpers include statement was malformed");
        }
        parsedEditorCql.cqlArrayToBeFiltered[include.start.line - 1] =
          fhirHelpersIncludeLine.join(" ");
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
      parsedEditorCql,
      libraryName,
      versionString,
      usingName,
      usingVersion
    );
  } else {
    if (existingCql && existingCqlLibraryName !== libraryName) {
      const parsedEditorCql = await parseCql(existingCql);
      if (parsedEditorCql) {
        return updateCql(
          parsedEditorCql,
          libraryName,
          versionString,
          usingName,
          usingVersion
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
  return parsedContents?.parsedCql?.usings?.length === 0;
};

export const mapParserErrorsToAceAnnotations = (
  errors: CqlError[]
): Ace.Annotation[] => {
  let annotations: Ace.Annotation[] = [];
  if (errors) {
    annotations = errors.map((error) => ({
      row: error.start.line - 1,
      column: error.start.position,
      type: "error",
      text: `Parse: ${error.start.position}:${error.stop.position} | ${error.message}`,
    }));
  }
  return annotations;
};

export const mapParserErrorsToAceMarkers = (errors: CqlError[]) => {
  let markers = [];
  if (errors) {
    markers = errors.map((error) => ({
      range: new Range(
        error.start.line - 1,
        error.start.position,
        error.stop.line - 1,
        error.stop.position
      ),
      clazz: "editor-error-underline",
      type: "text",
    }));
  }
  return markers;
};

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

const MadieAceEditor = ({
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
  const [editor, setEditor] = useState<Ace.Editor>();
  const [editorAnnotations, setEditorAnnotations] = useState<Ace.Annotation[]>(
    []
  );
  const [parserAnnotations, setParserAnnotations] = useState<Ace.Annotation[]>(
    []
  );

  const [parseErrorMarkers, setParseErrorMarkers] = useState<Ace.MarkerLike[]>(
    []
  );
  const [isParsing, setParsing] = useState<boolean>(undefined);
  const aceRef = useRef<AceEditor>(null);

  aceRef?.current?.editor?.on("focus", function () {
    setCommandEnabled(editor, "indent", true);
    setCommandEnabled(editor, "outdent", true);
  });
  aceRef?.current?.editor?.on("blur", function () {
    setCommandEnabled(editor, "indent", true);
    setCommandEnabled(editor, "outdent", true);
  });

  aceRef?.current?.editor?.commands.addCommand({
    name: "escape",
    bindKey: { win: "Esc", mac: "Esc" },
    exec: function () {
      setCommandEnabled(editor, "indent", false);
      setCommandEnabled(editor, "outdent", false);
    },
  });

  const customSetAnnotations = (annotations, editor) => {
    editor.getSession().setAnnotations(annotations);
    // pass all the annotations we have out
    if (setOutboundAnnotations) {
      setOutboundAnnotations(annotations);
    }
    setEditorAnnotations(annotations);
  };

  const debouncedParse: any = useRef(
    _.debounce(async (nextValue: string) => {
      const errors = parseEditorContent(nextValue);
      const annotations = mapParserErrorsToAceAnnotations(errors);
      const aceMarkers = mapParserErrorsToAceMarkers(errors);
      setParseErrorMarkers(aceMarkers);
      setParserAnnotations(annotations);
      setParsing(false);
    }, parseDebounceTime)
  ).current;

  const removeErrorMarkersFromEditor = (session) => {
    let currMarkers = session.getMarkers(true);
    for (const m in currMarkers) {
      if (currMarkers[m].clazz === "editor-error-underline") {
        session.removeMarker(currMarkers[m].id);
      }
    }
  };

  useEffect(() => {
    if (validationsEnabled) {
      const iann = inboundAnnotations || [];
      const allAnnotations = [...iann, ...parserAnnotations];
      if (editor) {
        customSetAnnotations(allAnnotations, editor);
      } else {
        console.warn("Editor is not set! Cannot set annotations!", editor);
      }
    }
  }, [parserAnnotations, inboundAnnotations, editor]);
  const toggleSearchBox = () => {
    // given the searchBox has not been instantiated we execCommand which also triggers show
    //@ts-ignore
    if (!editor?.searchBox) {
      editor.execCommand("find");
      // @ts-ignore
    } else if (editor.searchBox.active) {
      // @ts-ignore
      editor.searchBox.hide();
      // assume that it's been executed
    } else {
      //@ts-ignore
      editor.searchBox.show();
    }
  };
  useEffect(() => {
    if (editor && validationsEnabled) {
      let session = editor.getSession();
      // Remove previous error markers to prevent duplicates
      // (Ace renders each dup as a new element)
      removeErrorMarkersFromEditor(editor.getSession());
      // Set latest parseErrorMarkers
      const inbound = inboundErrorMarkers || [];
      const allErrorMarkers = [...inbound, ...parseErrorMarkers];
      allErrorMarkers.forEach((marker) => {
        let range = Range.fromPoints(marker.range.start, marker.range.end);
        // Set inFront to true to display underline when line is selected
        session.addMarker(range, "editor-error-underline", "text", true);
      });
      // tacking on an event listener for editor to toggle searchBox from parent component
      window.addEventListener(
        "toggleEditorSearchBox",
        toggleSearchBox as EventListener
      );
    }
    return () => {
      window.removeEventListener(
        "toggleEditorSearchBox",
        toggleSearchBox as EventListener
      );
    };
  }, [editor, parseErrorMarkers, inboundErrorMarkers]);

  useEffect(() => {
    const cqlMode = new CqlMode();
    // @ts-ignore
    aceRef?.current?.editor?.getSession()?.setMode(cqlMode);

    return () => {
      if (debouncedParse && validationsEnabled) {
        debouncedParse.cancel();
      }
    };
  }, [debouncedParse]);

  useEffect(() => {
    if (!_.isNil(value) && editor && validationsEnabled) {
      setParsing(true);
      debouncedParse(value, editor);
    }
  }, [value, editor, debouncedParse]);

  useEffect(() => {
    // This is to set aria-label on textarea for accessibility
    aceRef.current.editor.container
      .getElementsByClassName("ace_text-input")[0]
      .setAttribute("aria-label", "Cql editor");
  });

  return (
    <div style={{ height: "inhert" }}>
      <AceEditor
        mode="sql" // Temporary value of mode to prevent a dynamic search request.
        ref={aceRef}
        theme="monokai"
        value={value}
        onChange={(value) => {
          onChange(value);
        }}
        onLoad={(aceEditor) => {
          // On load we want to tell the ace editor that it's inside of a scrollabel page
          aceEditor.setOption("autoScrollEditorIntoView", true);
          setEditor(aceEditor);
        }}
        width="100%"
        height={height}
        wrapEnabled={true}
        readOnly={readOnly}
        name="ace-editor-wrapper"
        enableBasicAutocompletion={true}
        setOptions={{
          vScrollBarAlwaysVisible: true,
        }}
      />
    </div>
  );
};

export default MadieAceEditor;
