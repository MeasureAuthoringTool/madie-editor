export function makeAceSearchElementsAccessible() {
  document
    .querySelectorAll<HTMLElement>(
      ".ace_search input, .ace_search [action], .ace_searchbtn_close"
    )
    .forEach((el) => {
      el.tabIndex = 0; // So we can navigate across block style
      el.setAttribute("role", "button"); // So we can hit spans

      el.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          el.click();
        }
      });
    });
}

export function wireAceSearchNavigation(
  findAllBtn?: HTMLElement | null,
  hideBtn?: HTMLElement | null,
  toggleReplaceBtn?: HTMLElement | null
) {
  findAllBtn?.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Tab" && e.altKey && !e.shiftKey) {
      e.preventDefault();
      document.querySelector<HTMLElement>('span[action="hide"]')?.focus();
    }
  });

  hideBtn?.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Tab" && e.altKey && !e.shiftKey) {
      e.preventDefault();
      toggleReplaceBtn?.focus();
    }
  });
}
