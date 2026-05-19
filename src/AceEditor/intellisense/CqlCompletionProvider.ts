/**
 * CqlCompletionProvider — context-aware Monaco completion provider for CQL.
 *
 * Replaces the static keyword-only provider with suggestions drawn from:
 *  - Current file symbols (definitions, functions, parameters, valuesets, codes)
 *  - Included library lookups (via getCqlBuilderLookups)
 *  - Data model types and attributes
 *  - CQL keywords and built-in functions (unchanged)
 */
import * as monaco from "monaco-editor";
import { getCache } from "./CqlIntellisenseCache";
import { detectCursorContext } from "./CqlCursorContext";
import { getRetrievableTypes, getTypeAttributes } from "./ModelInfo";
import { FunctionLookup, Lookup } from "../../model/CqlBuilderLookup";

const { CompletionItemKind, CompletionItemInsertTextRule } = monaco.languages;

// ── Top-level CQL keywords (statement starters) ──────────────────────────────
const TOP_LEVEL_KEYWORDS = [
  "library", "using", "include", "called", "define", "parameter",
  "valueset", "codesystem", "code", "context", "function",
];

// ── Expression-body keywords ─────────────────────────────────────────────────
const EXPR_KEYWORDS = [
  "and", "or", "not", "xor", "is", "as", "cast", "in", "contains",
  "exists", "true", "false", "null", "if", "then", "else", "case", "when",
  "end", "return", "all", "distinct", "where", "such that", "with", "without",
  "from", "let", "aggregate", "by", "sort", "ascending", "descending",
  "union", "intersect", "except", "collapse", "expand", "flatten",
  "interval", "Interval", "List", "Tuple", "today()", "now()", "days",
  "months", "years", "hours", "minutes", "seconds", "milliseconds",
  "between", "before", "after", "during", "starts", "ends", "meets",
  "overlaps", "includes", "included in", "properly includes", "properly included in",
  "same as", "same or before", "same or after",
];

const BUILT_IN_FUNCTIONS = [
  "Abs", "Ceiling", "Floor", "Round", "Truncate", "Ln", "Log", "Exp",
  "Power", "Successor", "Predecessor", "Minimum", "Maximum", "PointFrom",
  "Start", "End", "Size", "Duration", "DurationInDays", "DifferenceBetween",
  "AgeInYears", "AgeInYearsAt", "AgeInMonths", "AgeInMonthsAt",
  "AgeInDays", "AgeInDaysAt", "AgeInHours", "AgeInMinutes",
  "Count", "Sum", "Min", "Max", "Avg", "Median", "StdDev", "Variance",
  "First", "Last", "IndexOf", "Length", "Substring", "PositionOf",
  "Upper", "Lower", "Combine", "Split", "Matches", "ReplaceMatches",
  "ToString", "ToInteger", "ToDecimal", "ToDateTime", "ToDate", "ToTime",
  "ToQuantity", "ToConcept", "ToList", "ToBoolean", "ToRatio",
  "date", "time", "dateTime", "years", "months", "days", "hours", "minutes", "seconds",
  "GetLocalTimezone", "GetLocalOffset",
  "singleton from", "in scope",
];

// ── Provider ─────────────────────────────────────────────────────────────────

export const CqlCompletionProvider: monaco.languages.CompletionItemProvider = {
  triggerCharacters: [".", '"', "["],

  provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ): monaco.languages.CompletionList {
    const cache = getCache();
    const ctx = detectCursorContext(model, position);
    const word = model.getWordUntilPosition(position);
    const range: monaco.IRange = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn,
    };

    const suggestions: monaco.languages.CompletionItem[] = [];

    switch (ctx.kind) {
      case "stringLiteral":
        // No suggestions inside string literals
        return { suggestions: [] };

      case "topLevel":
        suggestions.push(...keywordSuggestions(TOP_LEVEL_KEYWORDS, range));
        break;

      case "afterInclude":
        // Suggest known library names from includes in cache
        // (Future: call library service for autocomplete — for now use included names)
        break;

      case "retrieve":
        // Suggest retrievable data model types
        suggestions.push(
          ...retrieveSuggestions(
            cache.local.usingModel,
            cache.local.usingVersion ?? undefined,
            range
          )
        );
        break;

      case "libraryDot":
        // Suggest definitions/functions from the named library alias
        suggestions.push(
          ...libraryMemberSuggestions(ctx.alias, cache.allDefinitions, cache.allFunctions, cache.allFluentFunctions, range)
        );
        break;

      case "dotAccess":
        // Suggest attributes of the type identified by the qualifier
        suggestions.push(
          ...attributeSuggestions(ctx.qualifier, cache.local.usingModel, cache.local.usingVersion ?? undefined, range)
        );
        break;

      case "expression":
      default: {
        // Full expression-body suggestions: local + library + keywords + builtins
        suggestions.push(
          ...definitionSuggestions(cache.local, cache.allDefinitions, range),
          ...functionSuggestions(cache.allFunctions, cache.allFluentFunctions, range),
          ...parameterSuggestions(cache.local.parameters, cache.allParameters, range),
          ...valueSetCodeSuggestions(cache.local, range),
          ...keywordSuggestions(EXPR_KEYWORDS, range),
          ...builtinFunctionSuggestions(range)
        );
        break;
      }
    }

    return { suggestions };
  },
};

// ── Suggestion builders ───────────────────────────────────────────────────────

function keywordSuggestions(
  keywords: string[],
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  return keywords.map((kw) => ({
    label: kw,
    kind: CompletionItemKind.Keyword,
    insertText: kw,
    range,
    sortText: `z_kw_${kw}`, // sort keywords below user-defined symbols
  }));
}

function builtinFunctionSuggestions(range: monaco.IRange): monaco.languages.CompletionItem[] {
  return BUILT_IN_FUNCTIONS.map((fn) => ({
    label: fn,
    kind: CompletionItemKind.Function,
    insertText: fn,
    range,
    detail: "Built-in CQL function",
    sortText: `y_fn_${fn}`,
  }));
}

function definitionSuggestions(
  local: ReturnType<typeof getCache>["local"],
  allDefs: Lookup[],
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  const items: monaco.languages.CompletionItem[] = [];

  // Local definitions (no prefix)
  for (const def of local.definitions) {
    if (!def.name) continue;
    items.push({
      label: `"${def.name}"`,
      kind: CompletionItemKind.Variable,
      insertText: `"${def.name}"`,
      range,
      detail: "Definition (local)",
      documentation: def.comment || undefined,
      sortText: `a_def_${def.name}`,
    });
  }

  // Library definitions (with alias prefix)
  for (const def of allDefs) {
    if (!def.libraryAlias || !def.name) continue;
    const label = `${def.libraryAlias}."${def.name}"`;
    items.push({
      label,
      kind: CompletionItemKind.Variable,
      insertText: label,
      range,
      detail: `Definition from ${def.libraryName ?? def.libraryAlias}`,
      documentation: def.comment || def.logic
        ? { value: `\`\`\`\n${def.logic}\n\`\`\`` }
        : undefined,
      sortText: `b_libdef_${def.libraryAlias}_${def.name}`,
    });
  }

  return items;
}

function functionSuggestions(
  allFns: FunctionLookup[],
  allFluent: FunctionLookup[],
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  const items: monaco.languages.CompletionItem[] = [];

  const addFn = (fn: FunctionLookup, isFluent: boolean) => {
    if (!fn.name) return;
    const argList = (fn.arguments ?? [])
      .map((a, i) => `\${${i + 1}:${a.argumentName ?? `arg${i + 1}`}}`)
      .join(", ");
    const prefix = fn.libraryAlias ? `${fn.libraryAlias}.` : "";
    const label = `${prefix}${fn.name}(${(fn.arguments ?? []).map((a) => `${a.argumentName} ${a.dataType}`).join(", ")})`;

    items.push({
      label,
      kind: isFluent ? CompletionItemKind.Method : CompletionItemKind.Function,
      insertText: argList ? `${prefix}${fn.name}(${argList})` : `${prefix}${fn.name}()`,
      insertTextRules: argList ? CompletionItemInsertTextRule.InsertAsSnippet : undefined,
      range,
      detail: fn.returnType ? `→ ${fn.returnType}` : (fn.libraryName ? `From ${fn.libraryName}` : "Function (local)"),
      documentation: fn.comment
        ? { value: fn.comment }
        : fn.logic
        ? { value: `\`\`\`\n${fn.logic.substring(0, 300)}\n\`\`\`` }
        : undefined,
      sortText: `c_fn_${prefix}${fn.name}`,
    });
  };

  for (const fn of allFns) addFn(fn, false);
  for (const fn of allFluent) addFn(fn, true);

  return items;
}

function parameterSuggestions(
  localParams: ReturnType<typeof getCache>["local"]["parameters"],
  allParams: Lookup[],
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  const items: monaco.languages.CompletionItem[] = [];

  for (const p of localParams) {
    if (!p.name) continue;
    items.push({
      label: `"${p.name}"`,
      kind: CompletionItemKind.TypeParameter,
      insertText: `"${p.name}"`,
      range,
      detail: p.type ? `Parameter: ${p.type}` : "Parameter (local)",
      sortText: `a_par_${p.name}`,
    });
  }

  for (const p of allParams) {
    if (!p.libraryAlias || !p.name) continue;
    const label = `${p.libraryAlias}."${p.name}"`;
    items.push({
      label,
      kind: CompletionItemKind.TypeParameter,
      insertText: label,
      range,
      detail: `Parameter from ${p.libraryName ?? p.libraryAlias}`,
      sortText: `b_libpar_${label}`,
    });
  }

  return items;
}

function valueSetCodeSuggestions(
  local: ReturnType<typeof getCache>["local"],
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  const items: monaco.languages.CompletionItem[] = [];

  for (const vs of local.valueSets) {
    if (!vs.name) continue;
    items.push({
      label: `"${vs.name}"`,
      kind: CompletionItemKind.Enum,
      insertText: `"${vs.name}"`,
      range,
      detail: vs.url ? `ValueSet: ${vs.url}` : "ValueSet",
      sortText: `d_vs_${vs.name}`,
    });
  }

  for (const code of local.codes) {
    if (!code.name) continue;
    items.push({
      label: `"${code.name}"`,
      kind: CompletionItemKind.EnumMember,
      insertText: `"${code.name}"`,
      range,
      detail: code.codeSystem ? `Code from ${code.codeSystem}` : "Code",
      sortText: `d_code_${code.name}`,
    });
  }

  return items;
}

function retrieveSuggestions(
  model: string | null,
  version: string | undefined,
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  if (!model) return [];
  const types = getRetrievableTypes(model, version);
  return types.map((t) => ({
    label: t.label ?? t.name,
    kind: CompletionItemKind.Class,
    insertText: t.label ?? t.name,
    range,
    detail: `${model} data type`,
    sortText: `a_type_${t.name}`,
  }));
}

function attributeSuggestions(
  qualifier: string,
  model: string | null,
  version: string | undefined,
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  const attrs = getTypeAttributes(qualifier, model, version);
  return attrs.map((a) => ({
    label: a.name,
    kind: CompletionItemKind.Field,
    insertText: a.name,
    range,
    detail: a.type,
    sortText: `a_attr_${a.name}`,
  }));
}

function libraryMemberSuggestions(
  alias: string,
  allDefs: Lookup[],
  allFns: FunctionLookup[],
  allFluent: FunctionLookup[],
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  const items: monaco.languages.CompletionItem[] = [];

  for (const def of allDefs) {
    if (def.libraryAlias !== alias || !def.name) continue;
    items.push({
      label: `"${def.name}"`,
      kind: CompletionItemKind.Variable,
      insertText: `"${def.name}"`,
      range,
      detail: `Definition from ${def.libraryName ?? alias}`,
      documentation: def.logic ? { value: `\`\`\`\n${def.logic.substring(0, 300)}\n\`\`\`` } : undefined,
      sortText: `a_${def.name}`,
    });
  }

  for (const fn of [...allFns, ...allFluent]) {
    if (fn.libraryAlias !== alias || !fn.name) continue;
    const argList = (fn.arguments ?? [])
      .map((a, i) => `\${${i + 1}:${a.argumentName ?? `arg${i + 1}`}}`)
      .join(", ");
    items.push({
      label: `${fn.name}(${(fn.arguments ?? []).map((a) => `${a.argumentName} ${a.dataType}`).join(", ")})`,
      kind: CompletionItemKind.Function,
      insertText: argList ? `${fn.name}(${argList})` : `${fn.name}()`,
      insertTextRules: argList ? CompletionItemInsertTextRule.InsertAsSnippet : undefined,
      range,
      detail: fn.returnType ? `→ ${fn.returnType}` : `Function from ${fn.libraryName ?? alias}`,
      sortText: `b_${fn.name}`,
    });
  }

  return items;
}
