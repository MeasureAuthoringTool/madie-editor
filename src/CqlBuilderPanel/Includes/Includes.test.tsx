import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Includes from "./Includes";

const { getByTestId } = screen;

describe("Includes", () => {
  it("renders Includes", async () => {
    render(<Includes canEdit measureModel={"QDM"} />);
    expect(getByTestId("includes-panel")).toBeInTheDocument();

    expect(getByTestId("search-text-input")).toBeEnabled();
  });
});
