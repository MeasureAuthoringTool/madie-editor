import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import CodeSection from "./CodeSection";
import userEvent from "@testing-library/user-event";

const readOnly = false;
const handleFormSubmitMock = jest.fn();

describe("Code Section component", () => {
  it("should display all the fields in the Code(s) section", async () => {
    render(
      <CodeSection canEdit={readOnly} handleFormSubmit={handleFormSubmitMock} />
    );

    const searchButton = screen.getByRole("button", { name: "Search" });
    const clearButton = screen.getByRole("button", { name: "Clear" });
    expect(searchButton).toBeDisabled();
    expect(clearButton).toBeDisabled();

    // Selecting a Code System
    const codeSystemSelect = screen.getByRole("combobox", {
      name: "Code System",
    });
    expect(codeSystemSelect).toBeEnabled();
    userEvent.click(codeSystemSelect);
    const codeSystemOptions = await screen.findAllByRole("option");
    expect(codeSystemOptions.length).toEqual(2);
    userEvent.click(codeSystemOptions[0]);
    expect(codeSystemSelect).toHaveTextContent("Code System 1");

    // Selecting a Code System Version
    const codeSystemVersionSelect = screen.getByRole("combobox", {
      name: "Code System Version",
    });
    expect(codeSystemVersionSelect).toBeEnabled();
    userEvent.click(codeSystemVersionSelect);
    const codeSystemVersionOptions = await screen.findAllByRole("option");
    expect(codeSystemVersionOptions.length).toEqual(2);
    userEvent.click(codeSystemVersionOptions[1]);
    expect(codeSystemVersionSelect).toHaveTextContent("version 2");

    // Selecting a code
    const codeText = screen.getByTestId("code-text");
    expect(codeText).toBeEnabled();
    userEvent.click(codeText);
    const codeTextInput = screen.getByTestId(
      "code-text-input"
    ) as HTMLInputElement;
    userEvent.type(codeTextInput, "Code");
    expect(codeTextInput.value).toBe("Code");

    await waitFor(() => {
      expect(searchButton).toBeEnabled();
      expect(clearButton).toBeEnabled();
    });
    userEvent.click(searchButton);
    await waitFor(() => {
      expect(handleFormSubmitMock).toHaveBeenCalledWith({
        codeSystem: "Code System 1",
        codeSystemVersion: "version 2",
        code: "Code",
      });
    });
  });

  // it("clear button should be disabled until a change is made in one of the search criteria", () => {
  //   const { getByTestId } = render(
  //     <CodeSection canEdit={readOnly} handleFormSubmit={handleFormSubmit} />
  //   );
  //
  //   const clearButton = getByTestId("clear-codes-btn");
  //   expect(clearButton).toBeDisabled();
  //
  //   const codeText = getByTestId("code-text");
  //   expect(codeText).toBeEnabled();
  //   expect(codeText).toBeInTheDocument();
  //   const codeTextInput = getByTestId("code-text-input");
  //   fireEvent.change(codeTextInput, {
  //     target: { value: "Code1" },
  //   });
  //
  //   expect(codeTextInput.value).toBe("Code1");
  //
  //   expect(getByTestId("clear-codes-btn")).toBeEnabled();
  // });
  //
  // it("all the code form fields should be disable when user is not the owner or shared user", () => {
  //   const { getByTestId } = render(
  //     <CodeSection canEdit={true} handleFormSubmit={handleFormSubmit} />
  //   );
  //
  //   const codeSystemSelect = getByTestId("code-system-selector-input");
  //   expect(codeSystemSelect).toBeDisabled();
  //   const codeSystemVersionSelect = getByTestId(
  //     "code-system-version-selector-input"
  //   );
  //   expect(codeSystemVersionSelect).toBeDisabled();
  //   const codeText = getByTestId("code-text-input");
  //   expect(codeText).toBeDisabled();
  //
  //   const codeSearchButton = getByTestId("codes-search-btn");
  //   expect(codeSearchButton).toBeDisabled();
  //   const clearButton = getByTestId("clear-codes-btn");
  //   expect(clearButton).toBeDisabled();
  // });
});
