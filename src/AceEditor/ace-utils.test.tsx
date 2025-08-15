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
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("focuses hideBtn when Alt+Tab pressed on findAllBtn", () => {
    const findAllBtn = document.createElement("span");
    const hideBtn = document.createElement("span");
    hideBtn.setAttribute("action", "hide");

    const focusMock = jest.fn();
    hideBtn.focus = focusMock;

    document.body.appendChild(hideBtn);
    wireAceSearchNavigation(findAllBtn, hideBtn, null);

    findAllBtn.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", altKey: true, bubbles: true })
    );

    expect(focusMock).toHaveBeenCalled();
  });

  it("focuses toggleReplaceBtn when Alt+Tab pressed on hideBtn", () => {
    const hideBtn = document.createElement("span");
    const toggleReplaceBtn = document.createElement("span");

    const focusMock = jest.fn();
    toggleReplaceBtn.focus = focusMock;

    wireAceSearchNavigation(null, hideBtn, toggleReplaceBtn);

    hideBtn.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", altKey: true, bubbles: true })
    );

    expect(focusMock).toHaveBeenCalled();
  });

  it("does nothing if buttons are not provided", () => {
    expect(() => wireAceSearchNavigation()).not.toThrow();
  });
});
