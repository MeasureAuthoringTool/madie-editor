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

// Could not find a meaningful way to override Ace Editor's tab order, so we're manually wiring the searchBox behavior
export function wireAceSearchNavigation(
  searchButton?: HTMLElement | null,
  findPrevBtn?: HTMLElement | null,
  findNextBtn?: HTMLElement | null,
  findAllBtn?: HTMLElement | null,
  hideBtn?: HTMLElement | null,
  // next row
  replaceSearchField?: HTMLElement | null,
  replaceAndFindNextBtn?: HTMLElement | null,
  toggleReplaceBtn?: HTMLElement | null,
  // last row
  replaceAllBtn?: HTMLElement | null,
  toggleRegexModeBtn?: HTMLElement | null,
  toggleCaseSensitiveBtn?: HTMLElement | null,
  toggleWholeWordBtn?: HTMLElement | null,
  searchInSelectionBtn?: HTMLElement | null
) {
  // searchInputBox
  searchButton?.setAttribute("aria-label", "Search");
  searchButton?.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      if (e.shiftKey) {
        searchInSelectionBtn?.focus();
      } else {
        findPrevBtn?.focus();
      }
    }
  });
  // first row
  findPrevBtn?.setAttribute("aria-label", "Find Previous");
  findPrevBtn?.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      if (e.shiftKey) {
        searchButton?.focus();
      } else {
        findNextBtn?.focus();
      }
    }
  });

  findNextBtn?.setAttribute("aria-label", "Find Next");
  findNextBtn?.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      if (e.shiftKey) {
        findPrevBtn?.focus();
      } else {
        findAllBtn?.focus();
      }
    }
  });

  findAllBtn?.setAttribute("aria-label", "Find All");
  findAllBtn?.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      if (e.shiftKey) {
        findNextBtn?.focus();
      } else {
        hideBtn?.focus();
      }
    }
  });

  // must be conditional based on replace box visibility
  hideBtn?.setAttribute("aria-label", "Close Search");
  hideBtn?.addEventListener("keydown", (e: KeyboardEvent) => {
    const isReplaceVisible = toggleReplaceBtn?.textContent === "-" || false;
    // console.log('isReplaceVisible', isReplaceVisible);
    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      if (e.shiftKey) {
        findAllBtn?.focus();
      } else {
        // it's visible tabbing forward goes to replaceSearchField
        if (isReplaceVisible) {
          replaceSearchField?.focus();
        } else {
          toggleReplaceBtn?.focus();
        }
      }
    }
  });
  // end first row

  // Hidden row, only visible when replace is toggled
  replaceSearchField?.setAttribute("aria-label", "Replace With");
  replaceSearchField?.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      if (e.shiftKey) {
        hideBtn?.focus();
      } else {
        replaceAndFindNextBtn?.focus();
      }
    }
  });
  replaceAndFindNextBtn?.setAttribute("aria-label", "Replace and Find Next");
  replaceAndFindNextBtn?.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      if (e.shiftKey) {
        replaceSearchField?.focus();
      } else {
        replaceAllBtn?.focus();
      }
    }
  });

  replaceAllBtn?.setAttribute("aria-label", "Replace All");
  replaceAllBtn?.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      if (e.shiftKey) {
        replaceAndFindNextBtn?.focus();
      } else {
        toggleReplaceBtn?.focus();
      }
    }
  });
  // Hidden Row end

  //bottom row, always visible
  toggleReplaceBtn?.setAttribute("aria-label", "Toggle Replace");
  toggleReplaceBtn?.addEventListener("keydown", (e: KeyboardEvent) => {
    const isReplaceVisible = toggleReplaceBtn?.textContent === "-" || false;
    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      // if visible, our back tab should go to replaceAllBtn
      if (e.shiftKey) {
        if (isReplaceVisible) {
          replaceAllBtn?.focus();
        } else {
          hideBtn?.focus();
        }
      } else {
        toggleRegexModeBtn?.focus();
      }
    }
  });

  toggleRegexModeBtn?.setAttribute("aria-label", "Toggle Regex Mode");
  toggleRegexModeBtn?.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      if (e.shiftKey) {
        toggleReplaceBtn?.focus();
      } else {
        toggleCaseSensitiveBtn?.focus();
      }
    }
  });

  toggleCaseSensitiveBtn?.setAttribute(
    "aria-label",
    "Toggle Case Sensitive Mode"
  );
  toggleCaseSensitiveBtn?.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      if (e.shiftKey) {
        toggleRegexModeBtn?.focus();
      } else {
        toggleWholeWordBtn?.focus();
      }
    }
  });

  toggleWholeWordBtn?.setAttribute("aria-label", "Toggle Whole Words");
  toggleWholeWordBtn?.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      e.stopPropagation();
      e.preventDefault();
      if (e.shiftKey) {
        toggleCaseSensitiveBtn?.focus();
      } else {
        searchInSelectionBtn?.focus();
      }
    }
  });

  searchInSelectionBtn?.setAttribute("aria-label", "Search In Selection");
  searchInSelectionBtn?.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      if (e.shiftKey) {
        toggleWholeWordBtn?.focus();
      } else {
        searchButton?.focus();
      }
    }
  });
}
