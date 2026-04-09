/**
 * CqlIntellisenseCache — singleton that holds all symbols needed by the
 * Monaco Intellisense providers (completion, hover, signature help).
 *
 * Two update paths:
 *  1. updateFromParse()  — called after every debounced ANTLR parse (~1.5s)
 *  2. updateFromLookups() — called when builder lookups are refreshed
 *                           (on save, or when include statements change)
 */
import CqlResult from "@madie/cql-antlr-parser/dist/src/dto/CqlResult";
import { CqlBuilderLookup, FunctionLookup, Lookup } from "../../model/CqlBuilderLookup";
import { ModelTypeInfo, loadModelInfo } from "./ModelInfo";

export interface LocalSymbols {
  definitions: { name: string; line: number; comment?: string }[];
  functions: { name: string; line: number; comment?: string; args?: string }[];
  parameters: { name: string; type?: string; line: number }[];
  valueSets: { name: string; url?: string }[];
  codes: { name: string; codeSystem?: string }[];
  codeSystems: { name: string; oid?: string }[];
  includes: { name: string; called?: string; version?: string }[];
  usingModel: string | null;
  usingVersion: string | null;
}

export interface CqlIntelliCacheData {
  local: LocalSymbols;
  allDefinitions: Lookup[];
  allFunctions: FunctionLookup[];
  allFluentFunctions: FunctionLookup[];
  allParameters: Lookup[];
  dataModelTypes: ModelTypeInfo[];
}

const EMPTY_LOCAL: LocalSymbols = {
  definitions: [],
  functions: [],
  parameters: [],
  valueSets: [],
  codes: [],
  codeSystems: [],
  includes: [],
  usingModel: null,
  usingVersion: null,
};

let _cache: CqlIntelliCacheData = {
  local: EMPTY_LOCAL,
  allDefinitions: [],
  allFunctions: [],
  allFluentFunctions: [],
  allParameters: [],
  dataModelTypes: [],
};

/** Update the local symbol cache from a fresh ANTLR parse result. */
export function updateFromParse(parsed: CqlResult): void {
  const usings = parsed.usings ?? [];
  const usingModel = usings[0]?.name ?? null;
  const usingVersion = usings[0]?.version ?? null;

  _cache = {
    ..._cache,
    local: {
      definitions: (parsed.expressionDefinitions ?? []).map((d) => ({
        name: stripQuotes(d.name ?? ""),
        line: d.start?.line ?? 1,
        comment: d.comment,
      })),
      functions: (parsed.expressionDefinitions ?? [])
        .filter((d) => d.expressionClass === "function" || d.expressionClass === "fluentFunction")
        .map((d) => ({
          name: stripQuotes(d.name ?? ""),
          line: d.start?.line ?? 1,
          comment: d.comment,
        })),
      parameters: (parsed.parameters ?? []).map((p) => ({
        name: stripQuotes(p.name ?? ""),
        type: p.type,
        line: p.start?.line ?? 1,
      })),
      valueSets: (parsed.valueSets ?? []).map((v) => ({
        name: stripQuotes(v.name ?? ""),
        url: v.url,
      })),
      codes: (parsed.codes ?? []).map((c) => ({
        name: stripQuotes(c.name ?? ""),
        codeSystem: c.codeSystem,
      })),
      codeSystems: (parsed.codeSystems ?? []).map((cs) => ({
        name: stripQuotes(cs.name ?? ""),
        oid: cs.oid,
      })),
      includes: (parsed.includes ?? []).map((inc) => ({
        name: inc.name ?? "",
        called: inc.called,
        version: inc.version,
      })),
      usingModel,
      usingVersion,
    },
  };

  // Update model types if the model changed
  if (usingModel) {
    const types = loadModelInfo(usingModel, usingVersion ?? undefined);
    _cache = { ..._cache, dataModelTypes: types };
  }
}

/** Update the lookup cache from a fresh getCqlBuilderLookups() response. */
export function updateFromLookups(lookups: CqlBuilderLookup): void {
  _cache = {
    ..._cache,
    allDefinitions: lookups.definitions ?? [],
    allFunctions: (lookups.functions ?? []) as FunctionLookup[],
    allFluentFunctions: (lookups.fluentFunctions ?? []) as FunctionLookup[],
    allParameters: lookups.parameters ?? [],
  };
}

/** Read the current cache snapshot. */
export function getCache(): CqlIntelliCacheData {
  return _cache;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function stripQuotes(s: string): string {
  return s.replace(/^["']|["']$/g, "");
}
