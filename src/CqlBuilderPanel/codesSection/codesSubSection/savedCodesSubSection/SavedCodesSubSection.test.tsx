import * as React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import SavedCodesSubSection, { CodesList } from "./SavedCodesSubSection";
import { mockMeasureStoreCql } from "../../../__mocks__/MockMeasureStoreCql";
import { TerminologyServiceApi } from "../../../../api/useTerminologyServiceApi";
import userEvent from "@testing-library/user-event";

jest.mock("@madie/madie-util", () => ({
  getOidFromString: () => "2.16.840.1.113883.6.1",
  useOktaTokens: () => ({
    getAccessToken: () => "test.jwt",
  }),
  useFeatureFlags: () => ({
    MinimizeAlerts: false,
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
    {
      name: "10000006",
      display: "Radiating chest pain (finding)",
      fhirVersion: "http://snomed.info/sct/731000124108/version/20240901",
      svsVersion: "2024-09",
      codeSystem: "SNOMEDCT",
      codeSystemOid: "2.16.840.1.113883.6.96",
      codeSystemUrl: "http://snomed.info/sct",
      status: "ACTIVE",
      versionIncluded: false,
    },
  ],
};

const mockTerminologyServiceApi = {
  getCodesAndCodeSystems: jest.fn().mockResolvedValue(mockCodeDetailsList),
} as unknown as TerminologyServiceApi;

jest.mock("../../../../api/useTerminologyServiceApi", () =>
  jest.fn(() => mockTerminologyServiceApi)
);

const parsedCodesList: CodesList[] = [
  {
    code: "8462-4",
    codeSystem: "LOINC",
    version: "2.44",
    oid: "'2.16.840.1.113883.6.1'",
    suffix: "1",
    versionIncluded: true,
  },
];

describe("Saved Codes section component", () => {
  const checkRows = async (numberOfRows: number) => {
    const tableBody = await screen.findByTestId("saved-codes-tbl-body");
    expect(tableBody).toBeInTheDocument();
    const visibleRows = await within(tableBody).findAllByRole("row");
    expect(visibleRows).toHaveLength(numberOfRows);
  };

  it("should display the saved codes table when navigated to the saved codes tab for QDM", async () => {
    render(
      <SavedCodesSubSection
        measureStoreCql="using QDM version 1.0.000"
        measureModel={"QDM"}
        canEdit={true}
        handleApplyCode={undefined}
        handleCodeDelete={undefined}
        setEditorVal={undefined}
        setIsCQLUnchanged={undefined}
        isCQLUnchanged={undefined}
        parsedCodesList={parsedCodesList}
        hasCqlError={false}
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
    await checkRows(3);

    // Check the content of Saved Codes table
    const firstRow = await screen.findByTestId("saved-code-row-0");
    expect(firstRow.children.item(1)).toHaveTextContent("8462-4");
    expect(firstRow.children.item(2)).toHaveTextContent(
      "Diastolic blood pressure"
    );
    expect(firstRow.children.item(3)).toHaveTextContent("LOINC:2.6");
    expect(firstRow.children.item(4)).toHaveTextContent("2.6");

    const thirdRow = await screen.findByTestId("saved-code-row-2");
    expect(thirdRow.children.item(1)).toHaveTextContent("10000006");
    expect(thirdRow.children.item(2)).toHaveTextContent(
      "Radiating chest pain (finding)"
    );
    expect(thirdRow.children.item(3)).toHaveTextContent("SNOMEDCT");
    expect(thirdRow.children.item(4)).toHaveTextContent("2024-09");
  });

  it("should display the saved codes table when navigated to the saved codes tab for QiCore", async () => {
    render(
      <SavedCodesSubSection
        measureStoreCql="using FHIR version 1.0.000"
        measureModel={"QiCore"}
        canEdit={true}
        handleApplyCode={undefined}
        handleCodeDelete={undefined}
        setEditorVal={undefined}
        setIsCQLUnchanged={undefined}
        isCQLUnchanged={undefined}
        parsedCodesList={parsedCodesList}
        hasCqlError={false}
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
    await checkRows(3);

    // Check the content of Saved Codes table
    const firstRow = await screen.findByTestId("saved-code-row-0");
    expect(firstRow.children.item(1)).toHaveTextContent("8462-4");
    expect(firstRow.children.item(2)).toHaveTextContent(
      "Diastolic blood pressure"
    );
    expect(firstRow.children.item(3)).toHaveTextContent("LOINC:2.6");
    expect(firstRow.children.item(4)).toHaveTextContent("2.6");

    const thirdRow = await screen.findByTestId("saved-code-row-2");
    expect(thirdRow.children.item(1)).toHaveTextContent("10000006");
    expect(thirdRow.children.item(2)).toHaveTextContent(
      "Radiating chest pain (finding)"
    );
    expect(thirdRow.children.item(3)).toHaveTextContent("SNOMEDCT");
    // Should display FHIR Version instead of SVS for QiCore Measures
    expect(thirdRow.children.item(4)).toHaveTextContent("20240901");
  });

  it("displaying edit dialog when edit is clicked from the select actions for QDM", async () => {
    const { getByTestId } = render(
      <SavedCodesSubSection
        measureStoreCql={mockMeasureStoreCql}
        measureModel={"QDM"}
        canEdit={true}
        handleApplyCode={undefined}
        handleCodeDelete={undefined}
        setEditorVal={undefined}
        setIsCQLUnchanged={undefined}
        isCQLUnchanged={undefined}
        parsedCodesList={parsedCodesList}
        hasCqlError={false}
      />
    );

    await checkRows(3);

    expect(getByTestId("saved-code-row-0")).toBeInTheDocument();

    const editButton = getByTestId(`edit-code-2`);
    expect(editButton).toBeInTheDocument();

    const removeButton = getByTestId(`delete-code-2`);
    expect(removeButton).toBeInTheDocument();

    userEvent.click(editButton);

    await waitFor(() => {
      expect(getByTestId("dialog-form")).toBeInTheDocument();
      const codeSystemVersionInfo = screen.getByTestId(
        "code-system-version-info"
      );
      expect(codeSystemVersionInfo).toHaveTextContent("2024-09");
    });

    // edit firstCode to check the suffx value
    userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    userEvent.click(getByTestId(`edit-code-0`));
    const suffixInput = screen.getByTestId(
      "code-suffix-field-input"
    ) as HTMLInputElement;
    expect(suffixInput.value).toBe("1");

    const cancelButton = getByTestId("cancel-button");
    expect(cancelButton).toBeInTheDocument();
    userEvent.click(cancelButton);
  });

  it("displaying edit dialog when edit is clicked from the select actions for QiCore", async () => {
    const { getByTestId } = render(
      <SavedCodesSubSection
        measureStoreCql="using FHIR version 1.0.000"
        measureModel={"QiCore"}
        canEdit={true}
        handleApplyCode={undefined}
        handleCodeDelete={undefined}
        setEditorVal={undefined}
        setIsCQLUnchanged={undefined}
        isCQLUnchanged={undefined}
        parsedCodesList={parsedCodesList}
        hasCqlError={false}
      />
    );

    await checkRows(3);

    expect(getByTestId("saved-code-row-0")).toBeInTheDocument();

    const editButton = getByTestId(`edit-code-2`);
    expect(editButton).toBeInTheDocument();

    const removeButton = getByTestId(`delete-code-2`);
    expect(removeButton).toBeInTheDocument();

    userEvent.click(editButton);

    await waitFor(() => {
      expect(getByTestId("dialog-form")).toBeInTheDocument();
      const codeSystemVersionInfo = screen.getByTestId(
        "code-system-version-info"
      );
      expect(codeSystemVersionInfo).toHaveTextContent("20240901");
    });

    const cancelButton = getByTestId("cancel-button");
    expect(cancelButton).toBeInTheDocument();
    userEvent.click(cancelButton);
  });

  it("Should apply code on apply button click successfully", async () => {
    const handleApplyCode = jest.fn();
    const { getByTestId } = render(
      <SavedCodesSubSection
        measureStoreCql={mockMeasureStoreCql}
        measureModel={"QDM"}
        canEdit={true}
        handleApplyCode={handleApplyCode}
        handleCodeDelete={jest.fn()}
        setEditorVal={undefined}
        setIsCQLUnchanged={undefined}
        isCQLUnchanged={undefined}
        parsedCodesList={parsedCodesList}
        hasCqlError={false}
      />
    );
    await checkRows(3);
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
    const { getByTestId, queryByText } = render(
      <SavedCodesSubSection
        measureStoreCql={mockMeasureStoreCql}
        measureModel={"QDM"}
        canEdit={true}
        isCQLUnchanged={true}
        handleApplyCode={undefined}
        handleCodeDelete={undefined}
        setEditorVal={undefined}
        setIsCQLUnchanged={undefined}
        parsedCodesList={parsedCodesList}
        hasCqlError={false}
      />
    );

    await checkRows(3);

    expect(getByTestId("saved-code-row-0")).toBeInTheDocument();

    const editButton = getByTestId(`edit-code-0`);
    expect(editButton).toBeInTheDocument();

    const removeButton = getByTestId(`delete-code-0`);
    expect(removeButton).toBeInTheDocument();

    userEvent.click(removeButton);

    expect(getByTestId("delete-dialog")).toBeInTheDocument();
    expect(getByTestId("delete-dialog-continue-button")).toBeInTheDocument();
    expect(getByTestId("delete-dialog-cancel-button")).toBeInTheDocument();

    userEvent.click(getByTestId("delete-dialog-cancel-button"));
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
        measureModel={"QDM"}
        canEdit={true}
        isCQLUnchanged={true}
        handleCodeDelete={handleCodeDelete}
        handleApplyCode={undefined}
        setEditorVal={undefined}
        setIsCQLUnchanged={undefined}
        parsedCodesList={parsedCodesList}
        hasCqlError={false}
      />
    );
    await checkRows(3);

    const removeButton = getByTestId(`delete-code-0`);
    expect(removeButton).toBeInTheDocument();

    userEvent.click(removeButton);
    expect(getByTestId("delete-dialog")).toBeInTheDocument();
    expect(getByTestId("delete-dialog-continue-button")).toBeInTheDocument();
    expect(getByTestId("delete-dialog-cancel-button")).toBeInTheDocument();

    userEvent.click(getByTestId("delete-dialog-continue-button"));
    expect(queryByTestId("delete-dialog-body")).toBeNull();
  });

  it("should display discard dialog when there is a change in the cql and if try to delete a code", async () => {
    const { getByTestId, queryByTestId } = render(
      <SavedCodesSubSection
        measureStoreCql={mockMeasureStoreCql}
        measureModel={"QDM"}
        canEdit={true}
        isCQLUnchanged={false}
        handleCodeDelete={jest.fn()}
        setEditorVal={jest.fn()}
        setIsCQLUnchanged={jest.fn()}
        handleApplyCode={undefined}
        parsedCodesList={parsedCodesList}
        hasCqlError={false}
      />
    );
    await checkRows(3);

    const removeButton = getByTestId(`delete-code-0`);
    expect(removeButton).toBeInTheDocument();

    userEvent.click(removeButton);
    expect(getByTestId("discard-dialog")).toBeInTheDocument();
    expect(getByTestId("discard-dialog-continue-button")).toBeInTheDocument();
    expect(getByTestId("discard-dialog-cancel-button")).toBeInTheDocument();

    userEvent.click(getByTestId("discard-dialog-continue-button"));

    expect(getByTestId("delete-dialog")).toBeInTheDocument();
    expect(getByTestId("delete-dialog-continue-button")).toBeInTheDocument();
    expect(getByTestId("delete-dialog-cancel-button")).toBeInTheDocument();

    userEvent.click(getByTestId("delete-dialog-continue-button"));
    expect(queryByTestId("delete-dialog-body")).toBeNull();
  });

  it("test cancel delete", async () => {
    const { getByTestId, queryByTestId } = render(
      <SavedCodesSubSection
        measureStoreCql={mockMeasureStoreCql}
        measureModel={"QDM"}
        canEdit={true}
        isCQLUnchanged={false}
        handleCodeDelete={jest.fn()}
        setEditorVal={jest.fn()}
        setIsCQLUnchanged={jest.fn()}
        handleApplyCode={undefined}
        parsedCodesList={parsedCodesList}
        hasCqlError={false}
      />
    );
    await checkRows(3);

    const removeButton = getByTestId(`delete-code-0`);
    expect(removeButton).toBeInTheDocument();

    userEvent.click(removeButton);
    expect(getByTestId("discard-dialog")).toBeInTheDocument();
    expect(getByTestId("discard-dialog-continue-button")).toBeInTheDocument();
    expect(getByTestId("discard-dialog-cancel-button")).toBeInTheDocument();
    const closeBtn = getByTestId("close-button");
    expect(closeBtn).toBeInTheDocument();

    userEvent.click(getByTestId("discard-dialog-cancel-button"));
    expect(queryByTestId("delete-dialog")).not.toBeInTheDocument();
  });
});
