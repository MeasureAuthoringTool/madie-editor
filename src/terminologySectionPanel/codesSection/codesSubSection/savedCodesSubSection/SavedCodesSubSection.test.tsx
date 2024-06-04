import * as React from "react";
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
import SavedCodesSubSection from "./SavedCodesSubSection";
import { mockMeasureStoreCql } from "../../../__mocks__/MockMeasureStoreCql";
import { TerminologyServiceApi } from "../../../../api/useTerminologyServiceApi";
import userEvent from "@testing-library/user-event";

jest.mock("@madie/madie-util", () => ({
  getOidFromString: () => "2.16.840.1.113883.6.1",
  useOktaTokens: () => ({
    getAccessToken: () => "test.jwt",
  }),
}));

const mockeCodeDetailsList: any = {
  data: [
    {
      name: "8462-4",
      display: "Diastolic blood pressure",
      svsVersion: "2.44",
      fhirVersion: "2.44",
      codeSystem: "LOINC (1)",
      codeSystemOid: "2.16.840.1.113883.6.1",
      status: "ACTIVE",
    },
    {
      name: "8480-6",
      display: "Systolic blood pressure",
      svsVersion: "2.72",
      fhirVersion: "2.72",
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

const mockCqlMetaData = {
  codeSystemMap: {
    "8462-4": {
      name: "8462-4",
      display: "Diastolic blood pressure",
      svsVersion: "2.44",
      fhirVersion: "2.44",
      codeSystem: "LOINC",
      codeSystemOid: "2.16.840.1.113883.6.1",
      status: "ACTIVE",
    },
  },
};

describe("Saved Codes section component", () => {
  const checkRows = async (number: number) => {
    const tableBody = await screen.findByTestId("saved-codes-tbl-body");
    expect(tableBody).toBeInTheDocument();
    const visibleRows = await within(tableBody).findAllByRole("row");
    await waitFor(() => {
      expect(visibleRows).toHaveLength(number);
    });
  };
  it("should display the saved codes table when navigated to the saved codes tab ", async () => {
    render(
      <SavedCodesSubSection
        measureStoreCql="using QDM version 1.0.000"
        canEdit={true}
        cqlMetaData={mockCqlMetaData}
      />
    );
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
    const savedCodesTable = await screen.findByTestId("saved-codes-tbl");
    expect(savedCodesTable).toBeInTheDocument();
    await checkRows(1);
  });

  it("displaying edit dialog when edit is clicked from the select actions", async () => {
    const { getByTestId, queryByTestId } = render(
      <SavedCodesSubSection
        measureStoreCql={mockMeasureStoreCql}
        canEdit={true}
        cqlMetaData={mockCqlMetaData}
      />
    );

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
