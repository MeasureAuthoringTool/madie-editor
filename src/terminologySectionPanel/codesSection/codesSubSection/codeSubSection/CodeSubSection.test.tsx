import * as React from "react";
import CodeSubSection from "./CodeSubSection";
import { fireEvent, render } from "@testing-library/react";
import { mockedCodeSystems } from "../../../mockedCodeSystems";
import { ServiceConfig } from "../../../../api/useServiceConfig";
import axios from "axios";
import { Code, CodeStatus } from "../../../../api/useTerminologyServiceApi";
import userEvent from "@testing-library/user-event";

jest.mock("../../useCodeSystems");
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
jest.mock("@madie/madie-util", () => ({
  useOktaTokens: () => ({
    getAccessToken: () => "test.jwt",
  }),
}));
const mockConfig: ServiceConfig = {
  elmTranslationService: {
    baseUrl: "elm.com",
  },
  terminologyService: {
    baseUrl: "terminology.com",
  },
};
const mockCode: Code = {
  name: "Code2",
  display: "this is test code",
  codeSystem: "System2",
  status: CodeStatus.ACTIVE,
  svsVersion: "2.0",
  fhirVersion: "2.0",
};
describe("CodeSub Section component", () => {
  it("should display Codes(s) and Results sections when navigated to code tab", async () => {
    const { findByTestId } = render(
      <CodeSubSection canEdit={false} allCodeSystems={mockedCodeSystems} />
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
    const { getByTestId, getByText, getByRole, queryByText, findAllByRole } =
      render(
        <CodeSubSection canEdit={true} allCodeSystems={mockedCodeSystems} />
      );
    const codeSystemSelect = getByTestId("code-system-selector-dropdown");

    expect(codeSystemSelect).toBeInTheDocument();

    const codeSystemSelectButton = getByRole("button", {
      name: "Open",
    });

    userEvent.click(codeSystemSelectButton);

    expect(getByText("System1")).toBeInTheDocument();
    expect(getByText("System2")).toBeInTheDocument();

    userEvent.type(codeSystemSelectButton, "System1");

    expect(getByText("System1")).toBeInTheDocument();
    expect(queryByText("System2")).not.toBeInTheDocument();
    expect(codeSystemSelect).toBeEnabled();
    userEvent.click(codeSystemSelect);

    const codeSystemOptions = await findAllByRole("option");
    expect(codeSystemOptions.length).toEqual(1);
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
    const { getByTestId, findByTestId, getByText, getByRole } = render(
      <CodeSubSection canEdit={true} allCodeSystems={mockedCodeSystems} />
    );

    const codeSystemSelect = getByTestId("code-system-selector-dropdown");
    const codeSystemSelectButton = getByRole("button", {
      name: "Open",
    });
    userEvent.click(codeSystemSelectButton);
    userEvent.click(getByText("System2"));
    expect(codeSystemSelect).toBeInTheDocument();

    const codeSystemVersionSelect = getByTestId(
      "code-system-version-selector"
    ) as HTMLInputElement;
    expect(codeSystemVersionSelect).toBeEnabled();
    expect(codeSystemVersionSelect).toBeInTheDocument();
    const codeSystemVersionSelectInput = getByTestId(
      "code-system-version-selector-input"
    ) as HTMLInputElement;
    expect(codeSystemVersionSelectInput).toBeInTheDocument();
    expect(codeSystemVersionSelectInput.value).toBe("2.0");
    const codeSystemSelectInput = getByTestId("code-system-selector-input");
    fireEvent.change(codeSystemSelectInput, {
      target: { value: "S" },
    });
    userEvent.click(getByText("System1"));
    expect(codeSystemVersionSelectInput.value).toBe("2.0");

    const codeText = getByTestId("code-text-input");
    expect(codeText).toBeEnabled();
    expect(codeText).toBeInTheDocument();
    const codeTextInput = getByTestId("code-text-input") as HTMLInputElement;
    fireEvent.change(codeTextInput, {
      target: { value: "System1" },
    });

    expect(codeTextInput.value).toBe("System1");
    expect(getByTestId("code-list-updated-date")).toBeInTheDocument();
    expect(getByTestId("codes-search-btn")).toBeEnabled();
    expect(getByTestId("clear-codes-btn")).toBeEnabled();
    fireEvent.click(getByTestId("codes-search-btn"));

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
    const { getByTestId, findByTestId, getByRole, getByText } = render(
      <CodeSubSection canEdit={true} allCodeSystems={mockedCodeSystems} />
    );
    const codeSystemSelectButton = getByRole("button", {
      name: "Open",
    });
    userEvent.click(codeSystemSelectButton);
    userEvent.click(getByText("System2"));

    const codeSystemVersionSelect = getByTestId(
      "code-system-version-selector"
    ) as HTMLInputElement;
    expect(codeSystemVersionSelect).toBeEnabled();
    expect(codeSystemVersionSelect).toBeInTheDocument();
    const codeSystemVersionSelectInput = getByTestId(
      "code-system-version-selector-input"
    ) as HTMLInputElement;
    expect(codeSystemVersionSelectInput).toBeInTheDocument();
    expect(codeSystemVersionSelectInput.value).toBe("2.0");
    const codeSystemSelectInput = getByTestId("code-system-selector-input");
    fireEvent.change(codeSystemSelectInput, {
      target: { value: "S" },
    });
    userEvent.click(getByText("System1"));
    expect(codeSystemVersionSelectInput.value).toBe("2.0");

    const codeText = getByTestId("code-text-input");
    expect(codeText).toBeEnabled();
    expect(codeText).toBeInTheDocument();
    const codeTextInput = getByTestId("code-text-input") as HTMLInputElement;
    fireEvent.change(codeTextInput, {
      target: { value: "System1" },
    });

    expect(codeTextInput.value).toBe("System1");

    expect(getByTestId("codes-search-btn")).toBeEnabled();
    expect(getByTestId("clear-codes-btn")).toBeEnabled();
    fireEvent.click(getByTestId("codes-search-btn"));
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
    const { getByTestId, findByTestId, getByText, getByRole } = render(
      <CodeSubSection canEdit={true} allCodeSystems={mockedCodeSystems} />
    );
    const codeSystemSelectButton = getByRole("button", {
      name: "Open",
    });
    userEvent.click(codeSystemSelectButton);
    userEvent.click(getByText("System2"));
    const codeSystemVersionSelect = getByTestId(
      "code-system-version-selector"
    ) as HTMLInputElement;
    expect(codeSystemVersionSelect).toBeEnabled();
    expect(codeSystemVersionSelect).toBeInTheDocument();
    const codeSystemVersionSelectInput = getByTestId(
      "code-system-version-selector-input"
    ) as HTMLInputElement;
    expect(codeSystemVersionSelectInput).toBeInTheDocument();
    expect(codeSystemVersionSelectInput.value).toBe("2.0");
    const codeSystemSelectInput = getByTestId("code-system-selector-input");
    fireEvent.change(codeSystemSelectInput, {
      target: { value: "S" },
    });
    userEvent.click(getByText("System1"));
    expect(codeSystemVersionSelectInput.value).toBe("2.0");

    const codeText = getByTestId("code-text-input");
    expect(codeText).toBeEnabled();
    expect(codeText).toBeInTheDocument();
    const codeTextInput = getByTestId("code-text-input") as HTMLInputElement;
    fireEvent.change(codeTextInput, {
      target: { value: "System1" },
    });

    expect(codeTextInput.value).toBe("System1");
    expect(getByTestId("codes-search-btn")).toBeEnabled();
    expect(getByTestId("clear-codes-btn")).toBeEnabled();
    fireEvent.click(getByTestId("codes-search-btn"));
    const errorMessage = await findByTestId("fetch-code-error-message");
    expect(errorMessage.textContent).toEqual(
      "An issue occurred while retrieving the code from VSAC. Please try again. If the issue continues, please contact helpdesk."
    );
    const resultsContent = await findByTestId("codes-results-tbl");
    expect(resultsContent).toBeInTheDocument();
    fireEvent.click(getByTestId("clear-codes-btn"));
    expect(getByTestId("code-system-selector-input").value).toBe("");
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
    const codeTextInput = getByTestId("code-text-input") as HTMLInputElement;
    fireEvent.change(codeTextInput, {
      target: { value: "System1" },
    });
    expect(codeTextInput.value).toBe("System1");
    expect(getByTestId("clear-codes-btn")).toBeEnabled();
  });
});
