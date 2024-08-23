import * as React from "react";
import { render, screen } from "@testing-library/react";
import Includes from "./Includes";

const { getByTestId } = screen;

describe("Includes", () => {
  it("Should renders Includes component", async () => {
    render(
      <Includes canEdit measureModel={"QDM"} handleApplyLibrary={jest.fn} />
    );
    expect(getByTestId("includes-panel")).toBeInTheDocument();

    expect(getByTestId("searchTerm-text-input")).toBeEnabled();
  });
});
