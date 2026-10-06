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
