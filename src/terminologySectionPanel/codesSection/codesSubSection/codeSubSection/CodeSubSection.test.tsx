import React from "react";
import CodeSubSection from "./CodeSubSection";
import { fireEvent, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("CodeSub Section component", () => {
  it("should display Codes(s) and Results sections when navigated to code tab", async () => {
    const { getByTestId } = render(<CodeSubSection canEdit={false} />);

    const codeSubTabHeading = await getByTestId(
      "terminology-section-Code(s)-sub-heading"
    );
    const resultsSubTabHeading = await getByTestId(
      "terminology-section-Results-sub-heading"
    );

    expect(codeSubTabHeading).toBeInTheDocument();
    expect(resultsSubTabHeading).toBeInTheDocument();
  });

  it.skip("should display results section table when search button is clicked", async () => {
    const { getByTestId } = render(<CodeSubSection canEdit={false} />);

    const codeSystemSelect = getByTestId("code-system-selector");
    const codeSystemSelectInput = getByTestId("code-system-selector-input");

    expect(getByTestId("clear-codes-btn")).toBeDisabled();
    expect(getByTestId("codes-search-btn")).toBeDisabled();

    fireEvent.change(codeSystemSelectInput, {
      target: { value: "Code1" },
    });
    expect(codeSystemSelectInput.value).toBe("Code1");
    expect(codeSystemSelect).toBeInTheDocument();

    const codeSystemVersionSelect = getByTestId("code-system-version-selector");
    expect(codeSystemVersionSelect).toBeEnabled();
    expect(codeSystemVersionSelect).toBeInTheDocument();
    const codeSystemVersionSelectInput = getByTestId(
      "code-system-version-selector-input"
    );
    expect(codeSystemVersionSelectInput).toBeInTheDocument();

    const codeText = getByTestId("code-text");
    expect(codeText).toBeEnabled();
    expect(codeText).toBeInTheDocument();
    const codeTextInput = getByTestId("code-text-input");
    fireEvent.change(codeTextInput, {
      target: { value: "Code1" },
    });

    expect(codeTextInput.value).toBe("Code1");
    expect(getByTestId("code-list-updated-date")).toBeInTheDocument();
    expect(getByTestId("codes-search-btn")).toBeEnabled();
    expect(getByTestId("clear-codes-btn")).toBeEnabled();
    fireEvent.click(getByTestId("codes-search-btn"));

    const resultsContent = await getByTestId("codes-results-tbl");
    expect(resultsContent).toBeInTheDocument();
  });
});
