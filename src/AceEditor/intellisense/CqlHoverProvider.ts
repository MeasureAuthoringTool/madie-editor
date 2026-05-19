/**
 * CqlHoverProvider — shows type info, documentation, and source library
 * when hovering over symbols in the CQL editor.
 */
import * as monaco from "monaco-editor";
import { getCache } from "./CqlIntellisenseCache";

export const CqlHoverProvider: monaco.languages.HoverProvider = {
  provideHover(
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ): monaco.languages.Hover | null {
    const cache = getCache();
    const word = model.getWordAtPosition(position);
    if (!word?.word) return null;

    const lineContent = model.getLineContent(position.lineNumber);
    // Also try to capture quoted identifiers: "Word"
    const quotedMatch = lineContent.match(
      new RegExp(`"([^"]*?)"`, "g")
    );
    const quotedNames: string[] = quotedMatch
      ? quotedMatch.map((m) => m.replace(/"/g, ""))
      : [];

    const lookupName = word.word;
    const range = new monaco.Range(
      position.lineNumber,
      word.startColumn,
      position.lineNumber,
      word.endColumn
    );

    // Check if cursor is on a quoted identifier and expand range/name
    let effectiveName = lookupName;
    for (const qn of quotedNames) {
      if (qn.includes(lookupName)) {
        effectiveName = qn;
        break;
      }
    }

    // ── Detect library alias prefix (Alias."Name") ────────────────────────
    const textBefore = lineContent.substring(0, word.startColumn - 1);
    const aliasPrefixMatch = textBefore.match(/(\w+)\s*\.\s*"?$/);
    const libraryAlias = aliasPrefixMatch ? aliasPrefixMatch[1] : null;

    // ── Look up in definitions ────────────────────────────────────────────
    if (libraryAlias) {
      // Library-qualified lookup
      const def = cache.allDefinitions.find(
        (d) => d.libraryAlias === libraryAlias && d.name === effectiveName
      );
      if (def) return buildHover([
        `**Definition** \`${libraryAlias}."${def.name}"\``,
        def.comment ? `\n${def.comment}` : "",
        def.returnType ? `\n*Returns:* \`${def.returnType}\`` : "",
        `\n*From:* ${def.libraryName ?? libraryAlias}`,
        def.logic ? `\n\`\`\`cql\n${def.logic.substring(0, 400)}\n\`\`\`` : "",
      ], range);

      const fn = [...cache.allFunctions, ...cache.allFluentFunctions].find(
        (f) => f.libraryAlias === libraryAlias && f.name === effectiveName
      );
      if (fn) return buildFunctionHover(fn, libraryAlias, range);
    }

    // ── Local definitions ────────────────────────────────────────────────
    const localDef = cache.local.definitions.find((d) => d.name === effectiveName);
    if (localDef) return buildHover([
      `**Definition** \`"${localDef.name}"\``,
      localDef.comment ? `\n${localDef.comment}` : "",
      `\n*Defined at line ${localDef.line}*`,
    ], range);

    // ── Local parameters ─────────────────────────────────────────────────
    const localParam = cache.local.parameters.find((p) => p.name === effectiveName);
    if (localParam) return buildHover([
      `**Parameter** \`"${localParam.name}"\``,
      localParam.type ? `\nType: \`${localParam.type}\`` : "",
    ], range);

    // ── ValueSets ────────────────────────────────────────────────────────
    const vs = cache.local.valueSets.find((v) => v.name === effectiveName);
    if (vs) return buildHover([
      `**ValueSet** \`"${vs.name}"\``,
      vs.url ? `\nURL: ${vs.url}` : "",
    ], range);

    // ── Codes ────────────────────────────────────────────────────────────
    const code = cache.local.codes.find((c) => c.name === effectiveName);
    if (code) return buildHover([
      `**Code** \`"${code.name}"\``,
      code.codeSystem ? `\nCode system: ${code.codeSystem}` : "",
    ], range);

    // ── Include aliases ──────────────────────────────────────────────────
    const inc = cache.local.includes.find(
      (i) => i.called === lookupName || i.name === lookupName
    );
    if (inc) return buildHover([
      `**Library** \`${inc.name}\``,
      inc.called ? `\nAliased as: \`${inc.called}\`` : "",
      inc.version ? `\nVersion: ${inc.version}` : "",
    ], range);

    // ── All-library definitions (unqualified match) ──────────────────────
    const libDef = cache.allDefinitions.find((d) => d.name === effectiveName);
    if (libDef) return buildHover([
      `**Definition** \`"${libDef.name}"\``,
      libDef.comment ? `\n${libDef.comment}` : "",
      libDef.returnType ? `\n*Returns:* \`${libDef.returnType}\`` : "",
      libDef.libraryName ? `\n*From:* ${libDef.libraryName}` : "",
    ], range);

    // ── Data model type ──────────────────────────────────────────────────
    const modelType = cache.dataModelTypes.find(
      (t) => t.name === effectiveName || t.label === effectiveName
    );
    if (modelType) return buildHover([
      `**${cache.local.usingModel ?? "FHIR"} type** \`${modelType.label ?? modelType.name}\``,
      modelType.baseType ? `\n*Base:* \`${modelType.baseType}\`` : "",
      modelType.attributes.length > 0
        ? `\n**Attributes:**\n${modelType.attributes
            .slice(0, 15)
            .map((a) => `- \`${a.name}\`: ${a.type}`)
            .join("\n")}${modelType.attributes.length > 15 ? "\n…" : ""}`
        : "",
    ], range);

    return null;
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildHover(lines: string[], range: monaco.Range): monaco.languages.Hover {
  const content = lines.filter(Boolean).join("").trim();
  return {
    range,
    contents: [{ value: content, isTrusted: true }],
  };
}

function buildFunctionHover(
  fn: import("../../model/CqlBuilderLookup").FunctionLookup,
  alias: string | null,
  range: monaco.Range
): monaco.languages.Hover {
  const sig =
    (alias ? `${alias}.` : "") +
    `${fn.name}(${(fn.arguments ?? []).map((a) => `${a.argumentName}: ${a.dataType}`).join(", ")})`;
  return buildHover([
    `**Function** \`${sig}\``,
    fn.returnType ? `\n*Returns:* \`${fn.returnType}\`` : "",
    fn.comment ? `\n${fn.comment}` : "",
    fn.libraryName ? `\n*From:* ${fn.libraryName}` : "",
  ], range);
}
