import * as React from "react";
import { render, screen } from "@testing-library/react";
import SavedCodesSubSection from "./SavedCodesSubSection";

describe("Saved Codes section component", () => {
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
});
