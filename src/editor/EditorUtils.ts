import React, { useEffect } from "react";
import type * as monaco from "monaco-editor";

export const getSearchToggleEventName = (
  enableToggleSearchEvent: boolean
): string | undefined => {
  if (!enableToggleSearchEvent) {
    return undefined;
  }

  if (enableToggleSearchEvent) {
    return "toggleEditorSearchBox";
  }
};

// Toggles the Monaco find widget: closes it if already revealed so the
// behavior is a true toggle, otherwise opens it.
export const toggleEditorSearchBox = (
  editor: monaco.editor.IStandaloneCodeEditor | null
): void => {
  if (!editor) {
    return;
  }

  const findController: any = editor.getContribution?.(
    "editor.contrib.findController"
  );
  // close if already open so that it will be true toggle
  if (findController?.getState?.()?.isRevealed) {
    findController.closeFindWidget?.();
  } else {
    editor.getAction("actions.find")?.run();
  }
};

// Wires a window event listener that toggles the editor's find widget.
export const useEditorSearchToggle = (
  searchToggleEventName: string | undefined,
  editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>
): void => {
  useEffect(() => {
    if (!searchToggleEventName) {
      return;
    }

    const handleToggle = () => toggleEditorSearchBox(editorRef.current);

    window.addEventListener(searchToggleEventName, handleToggle);
    return () => {
      window.removeEventListener(searchToggleEventName, handleToggle);
    };
  }, [searchToggleEventName, editorRef]);
};

export interface EditorKeybindingOptions {
  // Prefix used for the edit operation source labels (helps undo grouping and
  // debugging). Defaults to "madie-editor".
  idPrefix?: string;
}

// Registers custom Cmd/Ctrl key bindings (copy, cut, paste, select all,
// undo/redo) plus Esc-to-restore-tab-navigation on a Monaco editor instance.
//
// These are handled via onKeyDown with preventDefault/stopPropagation so they
// reliably override Monaco's built-in core commands (which can take precedence
// over addAction keybindings, as seen with Cmd+A / Cmd+Z on Mac).
//
// The handler is attached per editor instance and only acts on the focused
// editor and its own model, so it is safe to use with multiple editors
// rendered side by side. Returns the disposable so callers can clean it up.
export const registerEditorKeybindings = (
  editor: monaco.editor.IStandaloneCodeEditor,
  monacoInstance: typeof monaco,
  options: EditorKeybindingOptions = {}
): monaco.IDisposable | undefined => {
  const idPrefix = options.idPrefix ?? "madie-editor";

  return editor.onKeyDown?.((event: monaco.IKeyboardEvent) => {
    if (event.keyCode === monacoInstance.KeyCode.Escape) {
      // Press Esc to return tab behavior to page navigation.
      editor.updateOptions?.({ tabFocusMode: true });
    }

    const isCtrlCmd = event.metaKey || event.ctrlKey;
    if (!isCtrlCmd) {
      return;
    }

    const model = editor.getModel();
    const selection = editor.getSelection();

    switch (event.keyCode) {
      // Copy (Cmd/Ctrl + C)
      case monacoInstance.KeyCode.KeyC: {
        if (model && selection) {
          event.preventDefault();
          event.stopPropagation();
          navigator.clipboard?.writeText(model.getValueInRange(selection));
        }
        break;
      }
      // Cut (Cmd/Ctrl + X)
      case monacoInstance.KeyCode.KeyX: {
        if (model && selection) {
          event.preventDefault();
          event.stopPropagation();
          navigator.clipboard?.writeText(model.getValueInRange(selection));
          editor.executeEdits(`${idPrefix}-cut`, [
            { range: selection, text: "", forceMoveMarkers: true },
          ]);
        }
        break;
      }
      // Paste (Cmd/Ctrl + V)
      case monacoInstance.KeyCode.KeyV: {
        event.preventDefault();
        event.stopPropagation();
        navigator.clipboard?.readText().then((text) => {
          const currentSelection = editor.getSelection();
          if (text && currentSelection) {
            editor.executeEdits(`${idPrefix}-paste`, [
              { range: currentSelection, text, forceMoveMarkers: true },
            ]);
          }
        });
        break;
      }
      // Select all (Cmd/Ctrl + A)
      case monacoInstance.KeyCode.KeyA: {
        if (model) {
          event.preventDefault();
          event.stopPropagation();
          editor.setSelection(model.getFullModelRange());
        }
        break;
      }
      // Undo / Redo (Cmd/Ctrl + Z, Cmd/Ctrl + Shift + Z)
      case monacoInstance.KeyCode.KeyZ: {
        event.preventDefault();
        event.stopPropagation();
        editor.trigger?.("keyboard", event.shiftKey ? "redo" : "undo", null);
        break;
      }
      default:
        break;
    }
  });
};
