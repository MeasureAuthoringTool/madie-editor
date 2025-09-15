import {
  makeAceSearchElementsAccessible,
  wireAceSearchNavigation,
} from "./ace-utils";

describe("makeAceSearchElementsAccessible", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("sets tabIndex, role, can Enter", () => {
    const container = document.createElement("div");
    container.className = "ace_search";
    const el = document.createElement("input");
    container.appendChild(el);
    document.body.appendChild(container);

    const clickMock = jest.fn();
    el.click = clickMock;

    makeAceSearchElementsAccessible();

    expect(el.tabIndex).toBe(0); //we got listeners
    expect(el.getAttribute("role")).toBe("button");

    el.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
    );
    expect(clickMock).toHaveBeenCalled();
  });

  it("handle space", () => {
    const container = document.createElement("div");
    container.className = "ace_search";
    const el = document.createElement("span");
    el.setAttribute("action", "something");
    container.appendChild(el);
    document.body.appendChild(container);

    const clickMock = jest.fn();
    el.click = clickMock;

    makeAceSearchElementsAccessible();

    el.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect(clickMock).toHaveBeenCalled();
  });

  it("does not throw when no matching elements exist", () => {
    expect(() => makeAceSearchElementsAccessible()).not.toThrow();
  });
});

describe("wireAceSearchNavigation", () => {
  let elements: Record<string, HTMLElement>;

  beforeEach(() => {
    document.body.innerHTML = "";
    elements = {
      searchButton: document.createElement("button"),
      findPrevBtn: document.createElement("button"),
      findNextBtn: document.createElement("button"),
      findAllBtn: document.createElement("button"),
      hideBtn: document.createElement("button"),
      replaceSearchField: document.createElement("input"),
      replaceAndFindNextBtn: document.createElement("button"),
      toggleReplaceBtn: document.createElement("button"),
      replaceAllBtn: document.createElement("button"),
      toggleRegexModeBtn: document.createElement("button"),
      toggleCaseSensitiveBtn: document.createElement("button"),
      toggleWholeWordBtn: document.createElement("button"),
      searchInSelectionBtn: document.createElement("button"),
    };

    elements.toggleReplaceBtn.textContent = "-";

    // Append to document to allow focus
    Object.values(elements).forEach((el) => document.body.appendChild(el));

    wireAceSearchNavigation(
      elements.searchButton,
      elements.findPrevBtn,
      elements.findNextBtn,
      elements.findAllBtn,
      elements.hideBtn,
      elements.replaceSearchField,
      elements.replaceAndFindNextBtn,
      elements.toggleReplaceBtn,
      elements.replaceAllBtn,
      elements.toggleRegexModeBtn,
      elements.toggleCaseSensitiveBtn,
      elements.toggleWholeWordBtn,
      elements.searchInSelectionBtn
    );
  });

  // get the full coverage clause
  const triggerPkey = (el: HTMLElement) => {
    const event = new KeyboardEvent("keydown", {
      key: "P",
    });
    el.dispatchEvent(event);
  };
  const triggerTab = (el: HTMLElement, shiftKey = false) => {
    triggerPkey(el);
    const event = new KeyboardEvent("keydown", {
      key: "Tab",
      shiftKey,
    });
    el.dispatchEvent(event);
  };

  const expectFocus = (
    sourceEl: HTMLElement,
    targetEl: HTMLElement,
    shiftKey = false
  ) => {
    const focusSpy = jest.spyOn(targetEl, "focus");
    triggerTab(sourceEl, shiftKey);
    expect(focusSpy).toHaveBeenCalled();
  };

  it("should set aria-labels correctly", () => {
    expect(elements.searchButton).toHaveAttribute("aria-label", "Search");
    expect(elements.findPrevBtn).toHaveAttribute("aria-label", "Find Previous");
    expect(elements.findNextBtn).toHaveAttribute("aria-label", "Find Next");
    expect(elements.findAllBtn).toHaveAttribute("aria-label", "Find All");
    expect(elements.hideBtn).toHaveAttribute("aria-label", "Close Search");
    expect(elements.replaceSearchField).toHaveAttribute(
      "aria-label",
      "Replace With"
    );
    expect(elements.replaceAndFindNextBtn).toHaveAttribute(
      "aria-label",
      "Replace and Find Next"
    );
    expect(elements.replaceAllBtn).toHaveAttribute("aria-label", "Replace All");
    expect(elements.toggleReplaceBtn).toHaveAttribute(
      "aria-label",
      "Toggle Replace"
    );
    expect(elements.toggleRegexModeBtn).toHaveAttribute(
      "aria-label",
      "Toggle Regex Mode"
    );
    expect(elements.toggleCaseSensitiveBtn).toHaveAttribute(
      "aria-label",
      "Toggle Case Sensitive Mode"
    );
    expect(elements.toggleWholeWordBtn).toHaveAttribute(
      "aria-label",
      "Toggle Whole Words"
    );
    expect(elements.searchInSelectionBtn).toHaveAttribute(
      "aria-label",
      "Search In Selection"
    );
  });

  it("should navigate forward and backward through elements using Tab", () => {
    // Forward tabbing
    expectFocus(elements.searchButton, elements.findPrevBtn);
    expectFocus(elements.findPrevBtn, elements.findNextBtn);
    expectFocus(elements.findNextBtn, elements.findAllBtn);
    expectFocus(elements.findAllBtn, elements.hideBtn);
    expectFocus(elements.hideBtn, elements.replaceSearchField);
    expectFocus(elements.replaceSearchField, elements.replaceAndFindNextBtn);
    expectFocus(elements.replaceAndFindNextBtn, elements.replaceAllBtn);
    expectFocus(elements.replaceAllBtn, elements.toggleReplaceBtn);
    expectFocus(elements.toggleReplaceBtn, elements.toggleRegexModeBtn);
    expectFocus(elements.toggleRegexModeBtn, elements.toggleCaseSensitiveBtn);
    expectFocus(elements.toggleCaseSensitiveBtn, elements.toggleWholeWordBtn);
    expectFocus(elements.toggleWholeWordBtn, elements.searchInSelectionBtn);
    expectFocus(elements.searchInSelectionBtn, elements.searchButton);
    // Backward tabbing
    expectFocus(elements.searchButton, elements.searchInSelectionBtn, true);
    expectFocus(
      elements.searchInSelectionBtn,
      elements.toggleWholeWordBtn,
      true
    );
    expectFocus(
      elements.toggleWholeWordBtn,
      elements.toggleCaseSensitiveBtn,
      true
    );
    expectFocus(
      elements.toggleCaseSensitiveBtn,
      elements.toggleRegexModeBtn,
      true
    );
    expectFocus(elements.toggleRegexModeBtn, elements.toggleReplaceBtn, true);
    expectFocus(elements.toggleReplaceBtn, elements.replaceAllBtn, true);
    expectFocus(elements.replaceAllBtn, elements.replaceAndFindNextBtn, true);
    expectFocus(
      elements.replaceAndFindNextBtn,
      elements.replaceSearchField,
      true
    );
    expectFocus(elements.replaceSearchField, elements.hideBtn, true);
    expectFocus(elements.hideBtn, elements.findAllBtn, true);
    expectFocus(elements.findAllBtn, elements.findNextBtn, true);
    expectFocus(elements.findNextBtn, elements.findPrevBtn, true);
    expectFocus(elements.findPrevBtn, elements.searchButton, true);
  });

  it("should trigger nav back", () => {
    elements.toggleReplaceBtn.textContent = "+";
    expectFocus(elements.toggleReplaceBtn, elements.hideBtn, true);
  });

  it("should handle conditional replace visibility logic", () => {
    const replaceFocusSpy = jest
      .spyOn(elements.replaceSearchField, "focus")
      .mockImplementation(() => {});
    const toggleFocusSpy = jest
      .spyOn(elements.toggleReplaceBtn, "focus")
      .mockImplementation(() => {});

    // replace is visible
    elements.toggleReplaceBtn.textContent = "-";
    triggerTab(elements.hideBtn);
    expect(replaceFocusSpy).toHaveBeenCalled();

    // replace is hidden
    elements.toggleReplaceBtn.textContent = "+";
    triggerTab(elements.hideBtn);
    expect(toggleFocusSpy).toHaveBeenCalled();

    // Clean up
    replaceFocusSpy.mockRestore();
    toggleFocusSpy.mockRestore();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });
});
