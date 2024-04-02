import React from "react";
import { fireEvent, render } from "@testing-library/react";
import CodeSection from "./CodeSection";

const handleFormSubmit = jest.fn();
const readOnly = false;

describe("Code Section component", () => {
  it("should display all the fields in the Code(s) section", () => {
    const { getByTestId } = render(
      <CodeSection canEdit={readOnly} handleFormSubmit={handleFormSubmit} />
    );

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
    fireEvent.click(getByTestId("codes-search-btn"));
    expect(getByTestId("clear-codes-btn")).toBeEnabled();
  });

  it("clear button should be disabled until a change is made in one of the search criteria", () => {
    const { getByTestId } = render(
      <CodeSection canEdit={readOnly} handleFormSubmit={handleFormSubmit} />
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

  it("all the code form fields should be disable when user is not the owner or shared user", () => {
    const { getByTestId } = render(
      <CodeSection canEdit={true} handleFormSubmit={handleFormSubmit} />
    );

    const codeSystemSelect = getByTestId("code-system-selector-input");
    expect(codeSystemSelect).toBeDisabled();
    const codeSystemVersionSelect = getByTestId(
      "code-system-version-selector-input"
    );
    expect(codeSystemVersionSelect).toBeDisabled();
    const codeText = getByTestId("code-text-input");
    expect(codeText).toBeDisabled();

    const codeSearchButton = getByTestId("codes-search-btn");
    expect(codeSearchButton).toBeDisabled();
    const clearButton = getByTestId("clear-codes-btn");
    expect(clearButton).toBeDisabled();
  });
});
