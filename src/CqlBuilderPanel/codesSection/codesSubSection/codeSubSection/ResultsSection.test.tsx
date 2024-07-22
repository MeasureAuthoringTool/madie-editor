import * as React from "react";
import {
  findByTestId,
  render,
  screen,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResultsSection from "./ResultsSection";
import { Code, CodeStatus } from "../../../../api/useTerminologyServiceApi";

const setShowResultsTable = jest.fn();

describe("Results Section component", () => {
  const renderResultsTable = (code: Code, statusIcon: string) => {
    render(
      <ResultsSection
        showResultsTable={true}
        setShowResultsTable={setShowResultsTable}
        code={code}
        handleApplyCode={jest.fn()}
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
    const resultTable = screen.getByTestId("codes-results-tbl");
    const tableRow = resultTable.querySelector("tbody").children[0];
    expect(tableRow.children[1].textContent).toEqual(mockCode.name);
    expect(tableRow.children[2].textContent).toEqual(mockCode.display);
    expect(tableRow.children[3].textContent).toEqual(mockCode.codeSystem);
    expect(tableRow.children[4].textContent).toEqual(mockCode.svsVersion);
    expect(screen.getByTestId(statusIcon)).toBeDefined();
  };

  let mockCode: Code;
  beforeEach(() => {
    mockCode = {
      name: "Code2",
      display: "this is test code",
      codeSystem: "System2",
      status: CodeStatus.ACTIVE,
      svsVersion: "2.0",
      fhirVersion: "2.0",
    } as Code;
  });

  it("should display the results when search button is clicked", () => {
    const { getByTestId } = render(
      <ResultsSection
        showResultsTable={true}
        setShowResultsTable={setShowResultsTable}
        code={undefined}
        handleApplyCode={jest.fn()}
      />
    );

    const resultsContent = getByTestId("codes-results-tbl");
    expect(resultsContent).toBeInTheDocument();
  });

  it("should display the apply button in Results", async () => {
    renderResultsTable(mockCode, "CheckCircleIcon");
    const resultsContent = screen.getByTestId("codes-results-tbl");
    expect(resultsContent).toBeInTheDocument();
    let applyBtn;
    await act(async () => {
      applyBtn = await findByTestId(resultsContent, "select-action-0_apply");
      expect(applyBtn).toBeDefined();
      userEvent.click(applyBtn);
    });
  });

  it("should display the edit button in Results", async () => {
    renderResultsTable(mockCode, "CheckCircleIcon");
    const resultsContent = screen.getByTestId("codes-results-tbl");
    expect(resultsContent).toBeInTheDocument();
    let applyBtn;
    await act(async () => {
      applyBtn = await findByTestId(resultsContent, "select-action-0_apply");
      expect(applyBtn).toBeDefined();
      userEvent.click(applyBtn);
    });
  });

  it("should display the results table for active code", () => {
    renderResultsTable(mockCode, "CheckCircleIcon");
  });

  it("should display the results table for inactive code", () => {
    renderResultsTable(
      { ...mockCode, status: CodeStatus.INACTIVE },
      "DoDisturbOutlinedIcon"
    );
  });

  it("should display the results table for a code with no status available", async () => {
    renderResultsTable(
      { ...mockCode, status: CodeStatus.NA },
      "DoNotDisturbOnIcon"
    );
  });

  it("displaying edit dialog when edit is clicked from the select actions", async () => {
    renderResultsTable(
      { ...mockCode, status: CodeStatus.NA },
      "DoNotDisturbOnIcon"
    );

    await waitFor(() => {
      const selectButton = screen.getByTestId(`select-action-0_apply`);
      expect(selectButton).toBeInTheDocument();
      userEvent.click(selectButton);
    });

    const editButton = screen.getByTestId(`edit-code-0`);
    expect(editButton).toBeInTheDocument();

    const applyButton = screen.getByTestId(`apply-code-0`);
    expect(applyButton).toBeInTheDocument();

    userEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByTestId("dialog-form")).toBeInTheDocument();
    });

    const suffixInput = screen.getByTestId(
      "code-suffix-field-input"
    ) as HTMLInputElement;
    expect(suffixInput.value).toBe("");

    const cancelButton = screen.getByTestId("cancel-button");
    expect(cancelButton).toBeInTheDocument();
    userEvent.click(cancelButton);
  });

  it("Should validate code suffix- Edit dialog validations", async () => {
    renderResultsTable(
      { ...mockCode, status: CodeStatus.NA },
      "DoNotDisturbOnIcon"
    );
    await waitFor(() => {
      const selectButton = screen.getByTestId(`select-action-0_apply`);
      expect(selectButton).toBeInTheDocument();
      userEvent.click(selectButton);
    });
    const editButton = screen.getByTestId(`edit-code-0`);
    userEvent.click(editButton);
    await waitFor(() => {
      expect(screen.getByTestId("dialog-form")).toBeInTheDocument();
    });
    const suffixInput = screen.getByTestId(
      "code-suffix-field-input"
    ) as HTMLInputElement;
    // non numeric value validation
    userEvent.type(suffixInput, "abc-pqr");
    userEvent.tab();
    await waitFor(() => {
      expect(screen.getByTestId("code-suffix-helper-text").textContent).toEqual(
        "Suffix must be numeric"
      );
    });
    // apply button should be disabled, when suffix is invalid
    expect(screen.getByTestId("apply-button")).toBeDisabled();
    // more than 4 digit validation
    userEvent.clear(suffixInput);
    userEvent.type(suffixInput, "12345");
    userEvent.tab();
    await waitFor(() => {
      expect(screen.getByTestId("code-suffix-helper-text").textContent).toEqual(
        "Suffix length must be 4 digits or less"
      );
    });
    // suffix is still invalid
    expect(screen.getByTestId("apply-button")).toBeDisabled();
    // valid suffix values
    userEvent.clear(suffixInput);
    userEvent.type(suffixInput, "1234");
    userEvent.tab();
    // apply button is enabled
    await waitFor(() => {
      expect(screen.getByTestId("apply-button")).toBeEnabled();
    });
  });
});
