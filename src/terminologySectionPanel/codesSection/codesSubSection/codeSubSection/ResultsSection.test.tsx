import React from "react";
import { render, screen } from "@testing-library/react";
import ResultsSection from "./ResultsSection";

const setShowResultsTable = jest.fn();

describe("Results Section component", () => {
  it("should display the results when search button is clicked", () => {
    const { getByTestId } = render(
      <ResultsSection
        showResultsTable={true}
        setShowResultsTable={setShowResultsTable}
      />
    );

    const resultsContent = getByTestId("codes-results-tbl");
    expect(resultsContent).toBeInTheDocument();
  });

  it("should display the results table", () => {
    render(
      <ResultsSection
        showResultsTable={true}
        setShowResultsTable={setShowResultsTable}
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
