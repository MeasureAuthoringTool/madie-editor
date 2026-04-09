/**
 * CqlSignatureHelpProvider — shows function parameter hints when typing
 * inside a function call (triggered on "(" and ",").
 */
import * as monaco from "monaco-editor";
import { getCache } from "./CqlIntellisenseCache";
import { FunctionLookup } from "../../model/CqlBuilderLookup";

export const CqlSignatureHelpProvider: monaco.languages.SignatureHelpProvider = {
  signatureHelpTriggerCharacters: ["(", ","],
  signatureHelpRetriggerCharacters: [","],

  provideSignatureHelp(
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ): monaco.languages.SignatureHelpResult | null {
    const cache = getCache();
    const funcInfo = findEnclosingFunctionCall(model, position);
    if (!funcInfo) return null;

    const fn = findFunction(funcInfo.name, funcInfo.libraryAlias, cache);
    if (!fn || !fn.arguments?.length) return null;

    const argLabels = (fn.arguments ?? []).map(
      (a) => `${a.argumentName ?? "arg"}: ${a.dataType ?? "Any"}`
    );
    const prefix = funcInfo.libraryAlias ? `${funcInfo.libraryAlias}.` : "";
    const signatureLabel = `${prefix}${fn.name}(${argLabels.join(", ")})`;

    return {
      value: {
        signatures: [
          {
            label: signatureLabel,
            documentation: fn.comment
              ? { value: fn.comment }
              : fn.logic
              ? { value: `\`\`\`cql\n${fn.logic.substring(0, 300)}\n\`\`\`` }
              : undefined,
            parameters: argLabels.map((label) => ({
              label,
            })),
          },
        ],
        activeSignature: 0,
        activeParameter: Math.min(funcInfo.argIndex, (fn.arguments?.length ?? 1) - 1),
      },
      dispose: () => {},
    };
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

interface FuncCallInfo {
  name: string;
  libraryAlias: string | null;
  argIndex: number;
}

/**
 * Walk backward from the cursor to find the enclosing function call,
 * returning the function name, optional library alias, and current argument index.
 */
function findEnclosingFunctionCall(
  model: monaco.editor.ITextModel,
  position: monaco.Position
): FuncCallInfo | null {
  // Scan backward char-by-char through previous lines (up to 5 lines)
  const startLine = Math.max(1, position.lineNumber - 5);
  let text = "";
  for (let line = startLine; line <= position.lineNumber; line++) {
    const content = model.getLineContent(line);
    text += (line < position.lineNumber ? content + "\n" : content.substring(0, position.column - 1));
  }

  let depth = 0;
  let argIndex = 0;

  // Walk backward
  for (let i = text.length - 1; i >= 0; i--) {
    const ch = text[i];
    if (ch === ")") { depth++; continue; }
    if (ch === "(") {
      if (depth > 0) { depth--; continue; }
      // Found our opening paren — look backward for the function name
      const before = text.substring(0, i);
      const fnMatch = before.match(/(\w+)\s*$/) || before.match(/(?:(\w+)\s*\.\s*)?(\w+)\s*$/);
      if (!fnMatch) return null;

      // Try to match "Alias.FuncName" or just "FuncName"
      const qualMatch = before.match(/(\w+)\s*\.\s*(\w+)\s*$/);
      if (qualMatch) {
        return { name: qualMatch[2], libraryAlias: qualMatch[1], argIndex };
      }
      const simpleMatch = before.match(/(\w+)\s*$/);
      if (simpleMatch) {
        return { name: simpleMatch[1], libraryAlias: null, argIndex };
      }
      return null;
    }
    if (ch === "," && depth === 0) {
      argIndex++;
    }
  }
  return null;
}

function findFunction(
  name: string,
  libraryAlias: string | null,
  cache: ReturnType<typeof getCache>
): FunctionLookup | null {
  const allFns = [...cache.allFunctions, ...cache.allFluentFunctions];

  if (libraryAlias) {
    return allFns.find((f) => f.name === name && f.libraryAlias === libraryAlias) ?? null;
  }
  // Try local first (no libraryAlias), then any match
  return (
    allFns.find((f) => f.name === name && !f.libraryAlias) ??
    allFns.find((f) => f.name === name) ??
    null
  );
}
