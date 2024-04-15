import * as React from "react";
import { render, screen } from "@testing-library/react";
import ResultsSection from "./ResultsSection";
import { Code, CodeStatus } from "../../../../api/useTerminologyServiceApi";

const setShowResultsTable = jest.fn();

describe("Results Section component", () => {
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

  it("should display the results table", () => {
    const mockCode: Code = {
      name: "Code2",
      display: "this is test code",
      codeSystem: "System2",
      status: CodeStatus.ACTIVE,
      version: "2.0",
    };

    render(
      <ResultsSection
        showResultsTable={true}
        setShowResultsTable={setShowResultsTable}
        code={mockCode}
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
  });
});
