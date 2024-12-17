import * as React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import FunctionsSection from "./FunctionsSection";
import userEvent from "@testing-library/user-event";
import { mockMeasureStoreCql } from "../__mocks__/MockMeasureStoreCql";
import { cqlBuilderLookup } from "../__mocks__/MockCqlBuilderLookupsTypes";

const resetCql = jest.fn();

const props = {
  canEdit: true,
  loading: false,
  handleApplyFunction: jest.fn(),
  cql: mockMeasureStoreCql,
  isCQLUnchanged: false,
  cqlBuilderLookupsTypes: cqlBuilderLookup,
  resetCql,
};

describe("FunctionsSection", () => {
  it("Should display function section", async () => {
    render(<FunctionsSection {...props} />);
    const funct = await screen.findByTestId("function-tab");
    const savedfunctions = await screen.findByText("Saved Functions (2)");
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
    const savedfunctions = await screen.findByText("Saved Functions (2)");
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

  it("Should display saved function section", async () => {
    const propsNoSql = {
      canEdit: true,
      loading: false,
      handleApplyFunction: jest.fn(),
      cql: undefined,
      isCQLUnchanged: false,
      cqlBuilderLookupsTypes: undefined,
    };
    render(<FunctionsSection {...propsNoSql} />);
    const funct = await screen.findByTestId("function-tab");
    const savedfunctions = await screen.findByText("Saved Functions (0)");
    expect(funct).toBeInTheDocument();
    expect(savedfunctions).toBeInTheDocument();
  });

  it("Should open a confirmation dialog on click", async () => {
    render(<FunctionsSection {...props} isCQLUnchanged={false} />);
    const funct = await screen.findByTestId("function-tab");
    const savedfunctions = await screen.findByText("Saved Functions (2)");
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
    const editButon0 = screen.getByTestId("edit-button-0");
    userEvent.click(editButon0);
    expect(screen.getByTestId("discard-dialog")).toBeInTheDocument();
    expect(screen.getByText("Discard Changes?")).toBeInTheDocument();
    const cancelBtn = screen.getByTestId("discard-dialog-cancel-button");
    const discardBtn = screen.getByTestId("discard-dialog-continue-button");
    expect(cancelBtn).toBeInTheDocument();
    expect(discardBtn).toBeInTheDocument();

    userEvent.click(discardBtn);
    await waitFor(() => {
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });
  });

  it("Should open edit dialog on click", async () => {
    render(<FunctionsSection {...props} isCQLUnchanged={true} />);
    const funct = await screen.findByTestId("function-tab");
    const savedfunctions = await screen.findByText("Saved Functions (2)");
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
    const editButon0 = screen.getByTestId("edit-button-0");
    userEvent.click(editButon0);
    await waitFor(() => {
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });
  });

  it("Should close discard dialog on click", async () => {
    render(<FunctionsSection {...props} isCQLUnchanged={false} />);
    const funct = await screen.findByTestId("function-tab");
    const savedfunctions = await screen.findByText("Saved Functions (2)");
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
    const editButon0 = screen.getByTestId("edit-button-0");
    userEvent.click(editButon0);
    expect(screen.getByTestId("discard-dialog")).toBeInTheDocument();
    expect(screen.getByText("Discard Changes?")).toBeInTheDocument();
    const cancelBtn = screen.getByTestId("discard-dialog-cancel-button");
    expect(cancelBtn).toBeInTheDocument();
    userEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByTestId("discard-dialog")).not.toBeInTheDocument();
    });
  });

  it("Should close edit dialog on click", async () => {
    render(<FunctionsSection {...props} isCQLUnchanged={true} />);
    const funct = await screen.findByTestId("function-tab");
    const savedfunctions = await screen.findByText("Saved Functions (2)");
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
    const editButon0 = screen.getByTestId("edit-button-0");
    userEvent.click(editButon0);
    await waitFor(() => {
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });
    const closeButton = screen.getByRole("button", { name: "Close" });
    expect(closeButton).toBeInTheDocument();
    userEvent.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByTestId("discard-dialog")).not.toBeInTheDocument();
    });
  });
});
