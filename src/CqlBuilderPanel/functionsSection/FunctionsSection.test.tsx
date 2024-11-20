import * as React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import FunctionsSection from "./FunctionsSection";
import userEvent from "@testing-library/user-event";

const props = {
  canEdit: true,
  loading: false,
  handleApplyFunction: jest.fn(),
};

describe("FunctionsSection", () => {
  it("Should display function section", async () => {
    render(<FunctionsSection {...props} />);
    const funct = await screen.findByTestId("function-tab");
    const savedfunctions = await screen.findByText("Saved Functions (0)");
    expect(funct).toBeInTheDocument();
    expect(savedfunctions).toBeInTheDocument();
    await waitFor(() => {
      expect(funct).toHaveAttribute("aria-selected", "true");
    });
    await waitFor(() => {
      expect(savedfunctions).toHaveAttribute("aria-selected", "false");
    });
  });

  it("Should display saved function section", async () => {
    render(<FunctionsSection {...props} />);
    const funct = await screen.findByTestId("function-tab");
    const savedfunctions = await screen.findByText("Saved Functions (0)");
    expect(funct).toBeInTheDocument();
    expect(savedfunctions).toBeInTheDocument();
    await waitFor(() => {
      expect(funct).toHaveAttribute("aria-selected", "true");
    });
    await waitFor(() => {
      expect(savedfunctions).toHaveAttribute("aria-selected", "false");
    });
    userEvent.click(savedfunctions);
    await waitFor(() => {
      expect(savedfunctions).toHaveAttribute("aria-selected", "true");
    });
  });
});
