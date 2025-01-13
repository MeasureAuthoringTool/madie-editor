import * as React from "react";
import CodeSubSection from "./CodeSubSection";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { mockedCodeSystems } from "../../../mockedCodeSystems";
import { ServiceConfig } from "../../../../api/useServiceConfig";
import axios from "../../../../api/axios-instance";
import { Code, CodeStatus } from "../../../../api/useTerminologyServiceApi";
import userEvent from "@testing-library/user-event";
import { within } from "@testing-library/dom";

jest.mock("../../useCodeSystems");
jest.mock("../../../../api/axios-instance");
const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock("@madie/madie-util", () => ({
  useOktaTokens: () => ({
    getAccessToken: () => "test.jwt",
  }),
}));
const mockConfig: ServiceConfig = {
  qdmElmTranslationService: {
    baseUrl: "qdm-elm.com",
  },
  fhirElmTranslationService: {
    baseUrl: "fhir-elm.com",
  },
  terminologyService: {
    baseUrl: "terminology.com",
  },
  cqlLibraryService: {
    baseUrl: "library.com",
  },
};
const mockCode: Code = {
  name: "Code2",
  display: "this is test code",
  codeSystem: "System 1",
  status: CodeStatus.ACTIVE,
  svsVersion: "HL7V3.0_2019-12",
  fhirVersion: "HL7V3.0_2019-12",
};

const componentProps = {
  canEdit: true,
  allCodeSystems: mockedCodeSystems,
  measureModel: "",
  editorVal: "",
  handleApplyCode: () => jest.fn(),
};

describe("CodeSub Section component", () => {
  it("should display Codes(s) and Results sections when navigated to code tab", async () => {
    const { findByTestId } = render(
      <CodeSubSection {...componentProps} canEdit={false} />
    );

    const codeSubTabHeading = await findByTestId(
      "terminology-section-Code(s)-sub-heading"
    );
    const resultsSubTabHeading = await findByTestId(
      "terminology-section-Results-sub-heading"
    );

    expect(codeSubTabHeading).toBeInTheDocument();
    expect(resultsSubTabHeading).toBeInTheDocument();
  });

  it("should display code details for selected code, system, version filters", async () => {
    const { getByTestId } = render(<CodeSubSection {...componentProps} />);
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

    expect(getByTestId("clear-codes-btn")).not.toBeDisabled();
    expect(getByTestId("codes-search-btn")).toBeDisabled();
  });

  it("should display all the fields in the Code(s) section", async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url === "/env-config/serviceConfig.json") {
        return Promise.resolve({ data: mockConfig });
      }
      if (url === `${mockConfig.terminologyService.baseUrl}/terminology/code`) {
        return Promise.resolve({ data: mockCode });
      }
    });
    const { findByTestId } = render(<CodeSubSection {...componentProps} />);

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
    expect(codeSystemVersionSelect).toHaveTextContent("2.0");
    expect(codeSystemVersionSelect).toBeEnabled();
    userEvent.click(codeSystemVersionSelect);
    const codeSystemVersionOptions = await screen.findAllByRole("option");
    expect(codeSystemVersionOptions.length).toEqual(2);
    userEvent.click(codeSystemVersionOptions[1]);
    expect(codeSystemVersionSelect).toHaveTextContent("1.0");

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

    const resultTable = await findByTestId("codes-results-tbl");
    const tableRow = resultTable.querySelector("tbody").children[0];
    expect(tableRow.children[1].textContent).toEqual(mockCode.name);
    expect(tableRow.children[2].textContent).toEqual(mockCode.display);
    expect(tableRow.children[3].textContent).toEqual(mockCode.codeSystem);
    expect(tableRow.children[4].textContent).toEqual(mockCode.svsVersion);
  });

  it("should display no results found in result table if code not found", async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url === "/env-config/serviceConfig.json") {
        return Promise.resolve({ data: mockConfig });
      }
      if (url === `${mockConfig.terminologyService.baseUrl}/terminology/code`) {
        return Promise.resolve({ response: { status: 404 } });
      }
    });
    const { getByTestId, findByTestId, getByRole } = render(
      <CodeSubSection {...componentProps} />
    );

    const searchButton = screen.getByRole("button", { name: "Search" });
    const clearButton = screen.getByRole("button", { name: "Clear" });
    expect(searchButton).toBeDisabled();
    expect(clearButton).toBeDisabled();

    const codeSystemSelectButton = getByRole("button", {
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

    const codeText = screen.getByTestId("code-text");
    expect(codeText).toBeEnabled();
    const codeTextInput = getByTestId("code-text-input") as HTMLInputElement;
    userEvent.type(codeTextInput, "invalid Code");

    expect(codeTextInput.value).toBe("invalid Code");

    await waitFor(() => {
      expect(clearButton).toBeEnabled();
      expect(searchButton).not.toBeDisabled();
    });
    userEvent.click(searchButton);
    const resultTable = await findByTestId("codes-results-tbl");
    const tableRow = resultTable.querySelector("tbody").children[0];
    expect(tableRow.children[0].textContent).toEqual("No Results were found");
  });

  it("should display error toast for non 404 errors", async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url === "/env-config/serviceConfig.json") {
        return Promise.resolve({ data: mockConfig });
      }
      if (url === `${mockConfig.terminologyService.baseUrl}/terminology/code`) {
        return Promise.reject({ response: { status: 500 } });
      }
    });
    const { getByTestId, findByTestId, getByRole } = render(
      <CodeSubSection {...componentProps} />
    );
    const codeSystemSelectButton = getByRole("button", {
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

    const codeTextInput = getByTestId("code-text-input") as HTMLInputElement;
    userEvent.type(codeTextInput, "Code");

    expect(codeTextInput.value).toBe("Code");

    const searchButton = screen.getByRole("button", { name: "Search" });
    const clearButton = screen.getByRole("button", { name: "Clear" });
    await waitFor(() => {
      expect(clearButton).toBeEnabled();
      expect(searchButton).toBeEnabled();
    });

    userEvent.click(searchButton);

    const errorMessage = await findByTestId("fetch-code-error-message");
    expect(errorMessage.textContent).toEqual(
      "An issue occurred while retrieving the code from VSAC. Please try again. If the issue continues, please contact helpdesk."
    );
    const resultsContent = await findByTestId("codes-results-tbl");
    expect(resultsContent).toBeInTheDocument();
    userEvent.click(getByTestId("clear-codes-btn"));
    expect(
      (getByTestId("code-system-selector-input") as HTMLInputElement).value
    ).toBe("");
  });

  it("clear button should be disabled until a change is made in one of the search criteria", () => {
    const { getByTestId } = render(<CodeSubSection {...componentProps} />);

    const clearButton = getByTestId("clear-codes-btn");
    expect(clearButton).toBeDisabled();

    const codeText = getByTestId("code-text");
    expect(codeText).toBeEnabled();
    expect(codeText).toBeInTheDocument();
    const codeTextInput = getByTestId("code-text-input") as HTMLInputElement;
    fireEvent.change(codeTextInput, {
      target: { value: "System1" },
    });
    expect(codeTextInput.value).toBe("System1");
    expect(getByTestId("clear-codes-btn")).toBeEnabled();
  });
});
