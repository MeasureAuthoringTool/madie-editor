import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CodeSection from "./CodeSection";
import userEvent from "@testing-library/user-event";
import { mockedCodeSystems } from "../../../mockedCodeSystems";

const readOnly = true;
const handleFormSubmitMock = jest.fn();

describe("Code Section component", () => {
  it("should display all the fields in the Code(s) section", async () => {
    render(
      <CodeSection
        canEdit={readOnly}
        allCodeSystems={mockedCodeSystems}
        handleFormSubmit={handleFormSubmitMock}
      />
    );

    const searchButton = screen.getByRole("button", { name: "Search" });
    const clearButton = screen.getByRole("button", { name: "Clear" });
    expect(searchButton).toBeDisabled();
    expect(clearButton).toBeDisabled();

    // Selecting a Code System
    const codeSystemSelect = screen.getByTestId(
      "code-system-selector-dropdown"
    );

    expect(codeSystemSelect).toBeInTheDocument();

    const codeSystemSelectButton = screen.getByRole("button", {
      name: "Open",
    });

    userEvent.click(codeSystemSelectButton);

    expect(screen.getByText("System1")).toBeInTheDocument();
    expect(screen.getByText("System2")).toBeInTheDocument();

    userEvent.type(codeSystemSelectButton, "System1");

    expect(screen.getByText("System1")).toBeInTheDocument();
    expect(screen.queryByText("System2")).not.toBeInTheDocument();
    expect(codeSystemSelect).toBeEnabled();
    userEvent.click(codeSystemSelect);

    const codeSystemOptions = await screen.findAllByRole("option");
    expect(codeSystemOptions.length).toEqual(1);
    userEvent.click(codeSystemOptions[0]);

    // Selecting a Code System Version
    const codeSystemVersionSelect = screen.getByRole("combobox", {
      name: "Code System Version",
    });
    expect(codeSystemVersionSelect).toHaveTextContent("HL7V3.0_2019-02");
    expect(codeSystemVersionSelect).toBeEnabled();
    userEvent.click(codeSystemVersionSelect);
    const codeSystemVersionOptions = await screen.findAllByRole("option");
    expect(codeSystemVersionOptions.length).toEqual(2);
    userEvent.click(codeSystemVersionOptions[1]);
    expect(codeSystemVersionSelect).toHaveTextContent("HL7V3.0_2019-12");

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
      expect(clearButton).toBeEnabled();
      expect(searchButton).not.toBeDisabled();
    });
    userEvent.click(searchButton);
    await waitFor(() => {
      expect(handleFormSubmitMock).toHaveBeenCalledWith({
        title: "System1",
        version: "1.0",
        code: "Code",
      });
    });
  });

  it("clear button should be disabled until a change is made in one of the search criteria", () => {
    const { getByTestId } = render(
      <CodeSection
        canEdit={readOnly}
        handleFormSubmit={handleFormSubmitMock}
        allCodeSystems={[]}
      />
    );

    const clearButton = getByTestId("clear-codes-btn");
    expect(clearButton).toBeDisabled();

    const codeText = getByTestId("code-text");
    expect(codeText).toBeEnabled();
    expect(codeText).toBeInTheDocument();
    const codeTextInput = getByTestId("code-text-input") as HTMLInputElement;
    fireEvent.change(codeTextInput, {
      target: { value: "Code1" },
    });

    expect(codeTextInput.value).toBe("Code1");

    expect(getByTestId("clear-codes-btn")).toBeEnabled();
  });

  it("all the code form fields should be disable when user is not the owner or shared user", () => {
    const { getByTestId } = render(
      <CodeSection
        canEdit={false}
        handleFormSubmit={handleFormSubmitMock}
        allCodeSystems={[]}
      />
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
