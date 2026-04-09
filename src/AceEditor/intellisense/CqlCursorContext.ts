/**
 * CqlCursorContext — determines what kind of completions are appropriate
 * at the current cursor position by reading backward through the document.
 *
 * Uses simple heuristics rather than a full incremental parse — fast and
 * sufficient for the patterns that occur in real CQL.
 */
import * as monaco from "monaco-editor";
import { getCache } from "./CqlIntellisenseCache";

export type CursorContext =
  | { kind: "topLevel" }
  | { kind: "expression" }            // inside a define/function body
  | { kind: "retrieve" }              // inside [ ... ] brackets
  | { kind: "dotAccess"; qualifier: string }  // after Alias. or type.
  | { kind: "libraryDot"; alias: string }     // after a known library alias .
  | { kind: "stringLiteral" }         // inside quotes — suppress suggestions
  | { kind: "afterInclude" }          // on an include line
  | { kind: "afterUsing" }            // on a using line
  | { kind: "afterCalled" }           // on called part of include
  | { kind: "unknown" };

/**
 * Analyse the cursor position and return the appropriate context.
 */
export function detectCursorContext(
  model: monaco.editor.ITextModel,
  position: monaco.Position
): CursorContext {
  const lineContent = model.getLineContent(position.lineNumber);
  const textBeforeCursor = lineContent.substring(0, position.column - 1);
  const trimmedLine = textBeforeCursor.trimStart();

  // ── String literal: inside double quotes ────────────────────────────────
  // Count unescaped double-quotes before cursor
  const quotesBefore = (textBeforeCursor.match(/(?<!\\)"/g) ?? []).length;
  if (quotesBefore % 2 === 1) {
    return { kind: "stringLiteral" };
  }

  // ── Include line ────────────────────────────────────────────────────────
  if (/^\s*include\s/i.test(lineContent)) {
    if (/called\s+\w*$/i.test(textBeforeCursor)) {
      return { kind: "afterCalled" };
    }
    return { kind: "afterInclude" };
  }

  // ── Using line ──────────────────────────────────────────────────────────
  if (/^\s*using\s/i.test(lineContent)) {
    return { kind: "afterUsing" };
  }

  // ── Dot access ──────────────────────────────────────────────────────────
  // Match "Something." at end of text before cursor
  const dotMatch = textBeforeCursor.match(/(\w+(?:\s*,\s*\w+)?)\s*\.\s*(\w*)$/);
  if (dotMatch) {
    const qualifier = dotMatch[1].trim();
    const cache = getCache();

    // Is this a known library alias?
    const isLibraryAlias =
      cache.local.includes.some((inc) => inc.called === qualifier) ||
      cache.allDefinitions.some((d) => d.libraryAlias === qualifier) ||
      cache.allFunctions.some((f) => f.libraryAlias === qualifier);

    if (isLibraryAlias) {
      return { kind: "libraryDot", alias: qualifier };
    }
    return { kind: "dotAccess", qualifier };
  }

  // ── Retrieve brackets ────────────────────────────────────────────────────
  // Count unmatched [ before cursor
  let bracketDepth = 0;
  for (const ch of textBeforeCursor) {
    if (ch === "[") bracketDepth++;
    else if (ch === "]") bracketDepth--;
  }
  if (bracketDepth > 0) {
    return { kind: "retrieve" };
  }

  // ── Top-level vs. expression body ────────────────────────────────────────
  // If a line starts with define/parameter/valueset/codesystem/code at column 0,
  // and we have no open colon-started expression, consider it top-level.
  // We look back through previous lines to find if we're inside a definition body.
  const isInsideDefinition = checkInsideDefinitionBody(model, position);
  if (!isInsideDefinition) {
    return { kind: "topLevel" };
  }

  return { kind: "expression" };
}

/**
 * Scan upward from cursor to determine if we're inside a definition body
 * (i.e., after a "define ... :" line but before the next "define").
 */
function checkInsideDefinitionBody(
  model: monaco.editor.ITextModel,
  position: monaco.Position
): boolean {
  const definePattern = /^\s*(define|parameter|valueset|codesystem|code|context)\b/i;
  const topLevelLine = /^\s*(library|using|include)\b/i;

  for (let line = position.lineNumber; line >= 1; line--) {
    const content = model.getLineContent(line);
    if (definePattern.test(content)) {
      // If the line has a colon (opening of the definition body), we're inside it
      if (content.includes(":")) return true;
      return false;
    }
    if (topLevelLine.test(content) && line < position.lineNumber) {
      return false;
    }
  }
  return false;
}

/** Extract the word (or quoted name) immediately before the cursor. */
export function getWordBeforeCursor(
  model: monaco.editor.ITextModel,
  position: monaco.Position
): string {
  const textBefore = model.getLineContent(position.lineNumber).substring(0, position.column - 1);
  // Try to match a quoted name first, then a plain word
  const quotedMatch = textBefore.match(/"([^"]+)"?\s*$/);
  if (quotedMatch) return quotedMatch[1];
  const wordMatch = textBefore.match(/[\w]+$/);
  return wordMatch ? wordMatch[0] : "";
}
