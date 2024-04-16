import * as React from "react";
import { render, screen } from "@testing-library/react";
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
    expect(tableRow.children[4].textContent).toEqual(mockCode.version);
    expect(screen.getByTestId(statusIcon)).toBeDefined();
  };

  let mockCode: Code;
  beforeEach(() => {
    mockCode = {
      name: "Code2",
      display: "this is test code",
      codeSystem: "System2",
      status: CodeStatus.ACTIVE,
      version: "2.0",
    } as Code;
  });

  it("should display the results when search button is clicked", () => {
    const { getByTestId } = render(
      <ResultsSection
        showResultsTable={true}
        setShowResultsTable={setShowResultsTable}
        code={undefined}
      />
    );

    const resultsContent = getByTestId("codes-results-tbl");
    expect(resultsContent).toBeInTheDocument();
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

  it("should display the results table for inactive code", () => {
    renderResultsTable(
      { ...mockCode, status: CodeStatus.NA },
      "DoNotDisturbOnIcon"
    );
  });
});
