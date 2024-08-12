import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import DefinitionsSection from "./DefinitionsSection";
import userEvent from "@testing-library/user-event";

describe("DefinitionSection", () => {
  it("Should display definition section", async () => {
    render(
      <DefinitionsSection
        canEdit={true}
        handleApplyDefinition={jest.fn()}
        availableParameters={null}
      />
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

  it("Should display saved definition section", async () => {
    render(
      <DefinitionsSection
        canEdit={true}
        handleApplyDefinition={jest.fn()}
        availableParameters={null}
      />
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
    userEvent.click(savedDefinitions);
    await waitFor(() => {
      expect(savedDefinitions).toHaveAttribute("aria-selected", "true");
    });
  });
});
