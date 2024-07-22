import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import DefinitionsSection from "./DefinitionsSection";

describe("DefinitionSection", () => {
  it("Should display difinition section", async () => {
    render(
      <DefinitionsSection canEdit={true} handleApplyDefinition={jest.fn()} />
    );
    const definition = await screen.findByTestId("definition-tab");
    const savedDefinitions = await screen.findByText("Saved Definition(s)");
    expect(definition).toBeInTheDocument();
    expect(savedDefinitions).toBeInTheDocument();
    await waitFor(() => {
      expect(definition).toHaveAttribute("aria-selected", "true");
    });
    await waitFor(() => {
      expect(savedDefinitions).toHaveAttribute("aria-selected", "false");
    });
  });

  it("Should display saved difinition section", async () => {
    render(
      <DefinitionsSection canEdit={true} handleApplyDefinition={jest.fn()} />
    );
    const definition = await screen.findByTestId("definition-tab");
    const savedDefinitions = await screen.findByText("Saved Definition(s)");
    expect(definition).toBeInTheDocument();
    expect(savedDefinitions).toBeInTheDocument();
    await waitFor(() => {
      expect(definition).toHaveAttribute("aria-selected", "true");
    });
    await waitFor(() => {
      expect(savedDefinitions).toHaveAttribute("aria-selected", "false");
    });

    act(() => {
      fireEvent.click(savedDefinitions);
    });
    await waitFor(() => {
      expect(savedDefinitions).toHaveAttribute("aria-selected", "true");
    });
  });
});
