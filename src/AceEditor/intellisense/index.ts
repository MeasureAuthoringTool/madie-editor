/**
 * registerCqlIntellisense — registers all Monaco Intellisense providers for CQL.
 * Called once after the CQL language is registered.
 */
import * as monaco from "monaco-editor";
import { CQL_LANGUAGE_ID } from "../cql-monaco-language";
import { CqlCompletionProvider } from "./CqlCompletionProvider";
import { CqlHoverProvider } from "./CqlHoverProvider";
import { CqlSignatureHelpProvider } from "./CqlSignatureHelpProvider";

let _registered = false;

export function registerCqlIntellisense(): void {
  if (_registered) return;
  _registered = true;

  monaco.languages.registerCompletionItemProvider(CQL_LANGUAGE_ID, CqlCompletionProvider);
  monaco.languages.registerHoverProvider(CQL_LANGUAGE_ID, CqlHoverProvider);
  monaco.languages.registerSignatureHelpProvider(CQL_LANGUAGE_ID, CqlSignatureHelpProvider);
}

export { updateFromParse, updateFromLookups } from "./CqlIntellisenseCache";
