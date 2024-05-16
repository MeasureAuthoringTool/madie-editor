import * as React from "react";
import axios from "axios";
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import SavedCodesSubSection from "./SavedCodesSubSection";
import { mockMeasureStoreCql } from "../../../__mocks__/MockMeasureStoreCql";
import { ServiceConfig } from "../../../../api/useServiceConfig";
import { TerminologyServiceApi } from "../../../../api/useTerminologyServiceApi";
import userEvent from "@testing-library/user-event";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockConfig: ServiceConfig = {
  elmTranslationService: {
    baseUrl: "elm.com",
  },
  terminologyService: {
    baseUrl: "terminology.com",
  },
};

const mockeCodeDetailsList = {
  data: [
    {
      name: "8462-4",
      display: "Diastolic blood pressure",
      version: "2.72",
      codeSystem: "LOINC (1)",
      codeSystemOid: "2.16.840.1.113883.6.1",
      status: "ACTIVE",
    },
    {
      name: "8480-6",
      display: "Systolic blood pressure",
      version: "2.72",
      codeSystem: "LOINC",
      codeSystemOid: "2.16.840.1.113883.6.1",
      status: "ACTIVE",
    },
  ],
};

const mockTerminologyServiceApi = {
  getCodesAndCodeSystems: jest.fn().mockResolvedValue(mockeCodeDetailsList),
} as unknown as TerminologyServiceApi;

jest.mock("../../../../api/useTerminologyServiceApi", () =>
  jest.fn(() => mockTerminologyServiceApi)
);

const mockCodeList = [
  {
    code: "8462-4",
    codeSystem: "LOINC (1)",
    oid: "'urn:oid:2.16.840.1.113883.6.1'",
    suffix: "1",
    version: undefined,
  },
  {
    code: "8480-6",
    codeSystem: "LOINC",
    oid: "'urn:oid:2.16.840.1.113883.6.1'",
    suffix: null,
    version: undefined,
  },
];

describe("Saved Codes section component", () => {
  const checkRows = async (number: number) => {
    const tableBody = screen.getByTestId("saved-codes-tbl-body");
    expect(tableBody).toBeInTheDocument();
    const visibleRows = await within(tableBody).findAllByRole("row");
    await waitFor(() => {
      expect(visibleRows).toHaveLength(number);
    });
  };
  it("should display the saved codes table when navigated to the saved codes tab ", () => {
    render(<SavedCodesSubSection />);
    expect(
      screen.getByRole("columnheader", {
        name: "Code",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", {
        name: "Description",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", {
        name: "Code System",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", {
        name: "System Version",
      })
    ).toBeInTheDocument();
    const savedCodesTable = screen.getByTestId("saved-codes-tbl");
    expect(savedCodesTable).toBeInTheDocument();
  });

  it("should render the data in the table", async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url === "/env-config/serviceConfig.json") {
        return Promise.resolve({ data: mockConfig });
      }
    });
    await render(
      <SavedCodesSubSection
        measureStoreCql={mockMeasureStoreCql}
        canEdit={true}
      />
    );

    expect(
      mockTerminologyServiceApi.getCodesAndCodeSystems
    ).toHaveBeenCalledWith(mockCodeList);
  });

  it("displaying edit dialog when edit is clicked from the select actions", async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url === "/env-config/serviceConfig.json") {
        return Promise.resolve({ data: mockConfig });
      }
      if (
        url === `${mockConfig.terminologyService.baseUrl}/terminology/codes`
      ) {
        return Promise.resolve({ data: mockCodeList });
      }
    });
    const { getByTestId, queryByTestId, getByText } = await render(
      <SavedCodesSubSection
        measureStoreCql={mockMeasureStoreCql}
        canEdit={true}
      />
    );

    expect(
      mockTerminologyServiceApi.getCodesAndCodeSystems
    ).toHaveBeenCalledWith(mockCodeList);

    expect(getByTestId("saved-codes-loading-spinner")).toBeInTheDocument();

    await waitForElementToBeRemoved(() =>
      queryByTestId("saved-codes-loading-spinner")
    );
    await checkRows(2);

    expect(getByTestId("saved-code-row-0")).toBeInTheDocument();

    await waitFor(() => {
      const selectButton = getByTestId(`select-action-0_apply`);
      expect(selectButton).toBeInTheDocument();
      userEvent.click(selectButton);
    });

    const editButton = getByTestId(`edit-code-0`);
    expect(editButton).toBeInTheDocument();

    const removeButton = getByTestId(`remove-code-0`);
    expect(removeButton).toBeInTheDocument();

    userEvent.click(editButton);

    await waitFor(() => {
      expect(getByTestId("dialog-form")).toBeInTheDocument();
    });

    const suffixInput = screen.getByTestId(
      "suffix-max-length-input"
    ) as HTMLInputElement;
    expect(suffixInput.value).toBe("1");

    const cancelButton = getByTestId("cancel-button");
    expect(cancelButton).toBeInTheDocument();
    userEvent.click(cancelButton);
  });
});
