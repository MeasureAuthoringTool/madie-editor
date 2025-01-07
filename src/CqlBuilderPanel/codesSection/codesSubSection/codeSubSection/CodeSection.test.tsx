import * as React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CodeSection from "./CodeSection";
import userEvent from "@testing-library/user-event";
import { mockedCodeSystems } from "../../../mockedCodeSystems";
import { within } from "@testing-library/dom";

const readOnly = true;
const handleFormSubmitMock = jest.fn();

describe("Code Section component", () => {
  it("should display all the fields in the Code(s) section for QDM", async () => {
    render(
      <CodeSection
        canEdit={readOnly}
        allCodeSystems={mockedCodeSystems}
        handleFormSubmit={handleFormSubmitMock}
        blankResults={jest.fn()}
        measureModel="QDM v5.6"
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
    expect(codeSystemSelect).toBeEnabled();

    const codeSystemSelectButton = screen.getByRole("button", {
      name: "Open",
    });
    userEvent.click(codeSystemSelectButton);

    const codeSystemOptions = await screen.findAllByRole("option");
    expect(codeSystemOptions.length).toEqual(3);
    expect(codeSystemOptions[0]).toHaveTextContent("System1");
    expect(codeSystemOptions[1]).toHaveTextContent("AdministrativeGender");
    expect(codeSystemOptions[2]).toHaveTextContent("SNOMEDCT");
    userEvent.click(codeSystemOptions[0]);

    // Selecting a Code System Version
    const comboBoxContainer = screen.getByTestId(
      "code-system-version-selector"
    );
    const codeSystemVersionSelect =
      within(comboBoxContainer).getByRole("combobox");
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

  it("should display all the fields in the Code(s) section for QiCore", async () => {
    render(
      <CodeSection
        canEdit={readOnly}
        allCodeSystems={mockedCodeSystems}
        handleFormSubmit={handleFormSubmitMock}
        blankResults={jest.fn()}
        measureModel="QiCore v5.0.0"
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
    expect(codeSystemSelect).toBeEnabled();

    const codeSystemSelectButton = screen.getByRole("button", {
      name: "Open",
    });
    userEvent.click(codeSystemSelectButton);

    const codeSystemOptions = await screen.findAllByRole("option");
    expect(codeSystemOptions.length).toEqual(3);
    expect(codeSystemOptions[0]).toHaveTextContent("System1");
    expect(codeSystemOptions[1]).toHaveTextContent("AdministrativeGender");
    expect(codeSystemOptions[2]).toHaveTextContent("SNOMEDCT");
    userEvent.click(codeSystemOptions[1]);

    // Making sure the latest version is already selected
    const comboBoxContainer = screen.getByTestId(
      "code-system-version-selector"
    );
    const codeSystemVersionSelect =
      within(comboBoxContainer).getByRole("combobox");
    expect(codeSystemVersionSelect).toHaveTextContent("2016-07-01");
    expect(codeSystemVersionSelect).toBeEnabled();
    userEvent.click(codeSystemVersionSelect);

    // Selecting a Code System Version
    const codeSystemVersionOptions = await screen.findAllByRole("option");
    expect(codeSystemVersionOptions.length).toEqual(2);
    expect(codeSystemVersionOptions[0]).toHaveTextContent("2016-07-01");
    expect(codeSystemVersionOptions[1]).toHaveTextContent("2015-07-01");
    userEvent.click(codeSystemVersionOptions[1]);

    expect(codeSystemVersionSelect).toHaveTextContent("2015-07-01");

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
        title: "AdministrativeGender",
        version: "2015-07-01",
        code: "Code",
      });
    });
  });

  it("should display accurate code system version for SNOMED CT for QiCore", async () => {
    render(
      <CodeSection
        canEdit={readOnly}
        allCodeSystems={mockedCodeSystems}
        handleFormSubmit={handleFormSubmitMock}
        blankResults={jest.fn()}
        measureModel="QiCore v5.0.0"
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
    expect(codeSystemSelect).toBeEnabled();

    const codeSystemSelectButton = screen.getByRole("button", {
      name: "Open",
    });
    userEvent.click(codeSystemSelectButton);

    const codeSystemOptions = await screen.findAllByRole("option");
    expect(codeSystemOptions.length).toEqual(3);
    expect(codeSystemOptions[0]).toHaveTextContent("System1");
    expect(codeSystemOptions[1]).toHaveTextContent("AdministrativeGender");
    expect(codeSystemOptions[2]).toHaveTextContent("SNOMEDCT");
    userEvent.click(codeSystemOptions[2]);

    // Making sure the latest version is already selected
    const comboBoxContainer = screen.getByTestId(
      "code-system-version-selector"
    );
    const codeSystemVersionSelect =
      within(comboBoxContainer).getByRole("combobox");
    expect(codeSystemVersionSelect).toHaveTextContent("20180901");
    expect(codeSystemVersionSelect).toBeEnabled();
    userEvent.click(codeSystemVersionSelect);

    // Selecting a Code System Version
    const codeSystemVersionOptions = await screen.findAllByRole("option");
    expect(codeSystemVersionOptions.length).toEqual(2);
    expect(codeSystemVersionOptions[0]).toHaveTextContent("20180901");
    expect(codeSystemVersionOptions[1]).toHaveTextContent("20130901");
    userEvent.click(codeSystemVersionOptions[1]);

    expect(codeSystemVersionSelect).toHaveTextContent("20130901");

    // Selecting a code
    const codeText = screen.getByTestId("code-text");
    expect(codeText).toBeEnabled();
    const codeTextInput = screen.getByTestId(
      "code-text-input"
    ) as HTMLInputElement;
    userEvent.type(codeTextInput, "Code");
    expect(codeTextInput.value).toBe("Code");

    await waitFor(() => {
      expect(clearButton).toBeEnabled();
      expect(searchButton).toBeEnabled();
    });
    userEvent.click(searchButton);
    await waitFor(() => {
      expect(handleFormSubmitMock).toHaveBeenCalledWith({
        title: "SNOMEDCT",
        version: "http://snomed.info/sct/731000124108/version/20130901",
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
        blankResults={jest.fn()}
        measureModel=""
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
        blankResults={jest.fn()}
        measureModel=""
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
