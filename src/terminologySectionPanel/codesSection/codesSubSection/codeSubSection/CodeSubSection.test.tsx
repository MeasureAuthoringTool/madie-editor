import React from "react";
import CodeSubSection from "./CodeSubSection";
import { fireEvent, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useCodeSystems } from "../../useCodeSystems";
import { mockedCodeSystems } from "../../../mockedCodeSystems";
jest.mock("../../useCodeSystems");
jest.mock("axios");

describe("CodeSub Section component", () => {
  it("should display Codes(s) and Results sections when navigated to code tab", async () => {
    const { getByTestId } = render(
      <CodeSubSection canEdit={false} allCodeSystems={mockedCodeSystems} />
    );

    const codeSubTabHeading = await getByTestId(
      "terminology-section-Code(s)-sub-heading"
    );
    const resultsSubTabHeading = await getByTestId(
      "terminology-section-Results-sub-heading"
    );

    expect(codeSubTabHeading).toBeInTheDocument();
    expect(resultsSubTabHeading).toBeInTheDocument();
  });

  it("should display all the fields in the Code(s) section", async () => {
    const { getByTestId, findByTestId } = render(
      <CodeSubSection canEdit={true} allCodeSystems={mockedCodeSystems} />
    );

    const codeSystemSelect = getByTestId("code-system-selector");
    const codeSystemSelectInput = getByTestId("code-system-selector-input");

    expect(getByTestId("clear-codes-btn")).toBeDisabled();
    expect(getByTestId("codes-search-btn")).toBeDisabled();

    fireEvent.change(codeSystemSelectInput, {
      target: { value: "Code2" },
    });
    expect(codeSystemSelectInput.value).toBe("Code2");
    expect(codeSystemSelect).toBeInTheDocument();

    const codeSystemVersionSelect = getByTestId("code-system-version-selector");
    expect(codeSystemVersionSelect).toBeEnabled();
    expect(codeSystemVersionSelect).toBeInTheDocument();
    const codeSystemVersionSelectInput = getByTestId(
      "code-system-version-selector-input"
    );
    expect(codeSystemVersionSelectInput).toBeInTheDocument();
    expect(codeSystemVersionSelectInput.value).toBe("2.0");
    fireEvent.change(codeSystemSelectInput, {
      target: { value: "1.0" },
    });
    expect(codeSystemVersionSelectInput.value).toBe("2.0");

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

    const resultsContent = await findByTestId("codes-results-tbl");
    expect(resultsContent).toBeInTheDocument();
  });

  it("clear button should be disabled until a change is made in one of the search criteria", () => {
    const { getByTestId } = render(
      <CodeSubSection allCodeSystems={mockedCodeSystems} canEdit={true} />
    );

    const clearButton = getByTestId("clear-codes-btn");
    expect(clearButton).toBeDisabled();

    const codeText = getByTestId("code-text");
    expect(codeText).toBeEnabled();
    expect(codeText).toBeInTheDocument();
    const codeTextInput = getByTestId("code-text-input");
    fireEvent.change(codeTextInput, {
      target: { value: "Code1" },
    });

    expect(codeTextInput.value).toBe("Code1");

    expect(getByTestId("clear-codes-btn")).toBeEnabled();
  });
});
