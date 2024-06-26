import * as React from "react";
import {
  fireEvent,
  queryByText,
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

const mockCodeDetailsList: any = {
  data: [
    {
      name: "8462-4",
      display: "Diastolic blood pressure",
      svsVersion: "2.6",
      fhirVersion: "2.6",
      codeSystem: "LOINC:2.6",
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
  getCodesAndCodeSystems: jest.fn().mockResolvedValue(mockCodeDetailsList),
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
        handleApplyCode={undefined}
        handleCodeDelete={undefined}
        setEditorVal={undefined}
        setIsCQLUnchanged={undefined}
        isCQLUnchanged={undefined}
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
        handleApplyCode={undefined}
        handleCodeDelete={undefined}
        setEditorVal={undefined}
        setIsCQLUnchanged={undefined}
        isCQLUnchanged={undefined}
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
      "code-suffix-field-input"
    ) as HTMLInputElement;
    expect(suffixInput.value).toBe("1");

    const cancelButton = getByTestId("cancel-button");
    expect(cancelButton).toBeInTheDocument();
    userEvent.click(cancelButton);
  });

  it("Should apply code on apply button click successfully", async () => {
    const handleApplyCode = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <SavedCodesSubSection
        measureStoreCql={mockMeasureStoreCql}
        canEdit={true}
        cqlMetaData={mockCqlMetaData}
        handleApplyCode={handleApplyCode}
        handleCodeDelete={jest.fn()}
        setEditorVal={undefined}
        setIsCQLUnchanged={undefined}
        isCQLUnchanged={undefined}
      />
    );
    await waitForElementToBeRemoved(() =>
      queryByTestId("saved-codes-loading-spinner")
    );
    await waitFor(() => {
      const selectButton = getByTestId(`select-action-0_apply`);
      expect(selectButton).toBeInTheDocument();
      userEvent.click(selectButton);
    });
    const editButton = getByTestId(`edit-code-0`);
    userEvent.click(editButton);
    await waitFor(() => {
      expect(getByTestId("dialog-form")).toBeInTheDocument();
    });
    const suffixInput = screen.getByTestId(
      "code-suffix-field-input"
    ) as HTMLInputElement;
    expect(suffixInput.value).toBe("1");

    const applyButton = getByTestId("apply-button");
    userEvent.click(applyButton);
    await waitFor(() => {
      expect(handleApplyCode).toHaveBeenCalled();
    });
  });

  it("displaying delete dialog when delete is clicked from the select actions", async () => {
    const { getByTestId, queryByTestId, queryByText } = render(
      <SavedCodesSubSection
        measureStoreCql={mockMeasureStoreCql}
        canEdit={true}
        cqlMetaData={mockCqlMetaData}
        isCQLUnchanged={true}
        handleApplyCode={undefined}
        handleCodeDelete={undefined}
        setEditorVal={undefined}
        setIsCQLUnchanged={undefined}
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

    userEvent.click(removeButton);

    expect(getByTestId("delete-dialog")).toBeInTheDocument();
    expect(getByTestId("delete-dialog-continue-button")).toBeInTheDocument();
    expect(getByTestId("delete-dialog-cancel-button")).toBeInTheDocument();

    fireEvent.click(getByTestId("delete-dialog-cancel-button"));
    await waitFor(() => {
      const submitButton = queryByText("Yes, Delete");
      expect(submitButton).not.toBeInTheDocument();
    });
  });

  it("should successfully delete when delete is clicked from the select actions", async () => {
    const handleCodeDelete = jest.fn();
    const { getByTestId, queryByTestId } = render(
      <SavedCodesSubSection
        measureStoreCql={mockMeasureStoreCql}
        canEdit={true}
        cqlMetaData={mockCqlMetaData}
        isCQLUnchanged={true}
        handleCodeDelete={handleCodeDelete}
        handleApplyCode={undefined}
        setEditorVal={undefined}
        setIsCQLUnchanged={undefined}
      />
    );
    await checkRows(2);

    await waitFor(() => {
      const selectButton = getByTestId(`select-action-0_apply`);
      expect(selectButton).toBeInTheDocument();
      userEvent.click(selectButton);
    });

    const removeButton = getByTestId(`remove-code-0`);
    expect(removeButton).toBeInTheDocument();

    userEvent.click(removeButton);
    expect(getByTestId("delete-dialog")).toBeInTheDocument();
    expect(getByTestId("delete-dialog-continue-button")).toBeInTheDocument();
    expect(getByTestId("delete-dialog-cancel-button")).toBeInTheDocument();

    fireEvent.click(getByTestId("delete-dialog-continue-button"));
    expect(queryByTestId("delete-dialog-body")).toBeNull();
  });

  it("should display discard dialog when there is a change in the cql and if try to delete a code", async () => {
    const { getByTestId, queryByTestId } = render(
      <SavedCodesSubSection
        measureStoreCql={mockMeasureStoreCql}
        canEdit={true}
        cqlMetaData={mockCqlMetaData}
        isCQLUnchanged={false}
        handleCodeDelete={jest.fn()}
        setEditorVal={jest.fn()}
        setIsCQLUnchanged={jest.fn()}
        handleApplyCode={undefined}
      />
    );
    await checkRows(2);

    await waitFor(() => {
      const selectButton = getByTestId(`select-action-0_apply`);
      expect(selectButton).toBeInTheDocument();
      userEvent.click(selectButton);
    });

    const removeButton = getByTestId(`remove-code-0`);
    expect(removeButton).toBeInTheDocument();

    userEvent.click(removeButton);
    expect(getByTestId("discard-dialog")).toBeInTheDocument();
    expect(getByTestId("discard-dialog-continue-button")).toBeInTheDocument();
    expect(getByTestId("discard-dialog-cancel-button")).toBeInTheDocument();

    fireEvent.click(getByTestId("discard-dialog-continue-button"));

    expect(getByTestId("delete-dialog")).toBeInTheDocument();
    expect(getByTestId("delete-dialog-continue-button")).toBeInTheDocument();
    expect(getByTestId("delete-dialog-cancel-button")).toBeInTheDocument();

    fireEvent.click(getByTestId("delete-dialog-continue-button"));
    expect(queryByTestId("delete-dialog-body")).toBeNull();
  });
});
