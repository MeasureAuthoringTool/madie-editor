import * as React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import DefinitionsSection from "./DefinitionsSection";
import userEvent from "@testing-library/user-event";
import { CqlBuilderLookupData } from "../../model/CqlBuilderLookup";

describe("DefinitionsSection", () => {
  const cqlBuilderData = {
    parameters: ["TJC.Measurement Period", "Global.Measurement Period"],
    definitions: [
      "SDE Sex",
      "Encounter with Pharmacological Contraindications for Antithrombotic Therapy at Discharge",
      "Global.Inpatient Encounter",
      "TJC.Ischemic Stroke Encounters with Discharge Disposition",
      "SDE Race",
      "TJC.Non Elective Encounter with Age",
      "TJC.Encounter with Comfort Measures during Hospitalization",
      "Initial Population",
      "Global.ED Encounter",
    ],
    functions: [
      "Global.Latest()",
      "Global.HospitalizationLocations()",
      "Global.ToDateInterval()",
      "Global.HospitalizationLengthofStay()",
      "Global.HospitalDepartureTime()",
      "Global.Hospitalization()",
      "Global.EmergencyDepartmentArrivalTime()",
    ],
    fluentFunctions: [],
  } as unknown as CqlBuilderLookupData;

  it("Should display definition section", async () => {
    render(
      <DefinitionsSection
        canEdit={true}
        handleApplyDefinition={jest.fn()}
        cqlBuilderLookupsTypes={{} as CqlBuilderLookupData}
        handleDefinitionDelete={jest.fn()}
        isCQLUnchanged
        setIsCQLUnchanged
      />
    );
    const definition = await screen.findByTestId("definition-tab");
    const savedDefinitions = await screen.findByText("Saved Definitions (0)");
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
        cqlBuilderLookupsTypes={{} as CqlBuilderLookupData}
        handleDefinitionDelete={jest.fn()}
        isCQLUnchanged
        setIsCQLUnchanged
      />
    );
    const definition = await screen.findByTestId("definition-tab");
    const savedDefinitions = await screen.findByText("Saved Definitions (0)");
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

  it("Should allow pagination for savedDefinitions", async () => {
    render(
      <DefinitionsSection
        canEdit={true}
        handleApplyDefinition={jest.fn()}
        cqlBuilderLookupsTypes={cqlBuilderData}
        handleDefinitionDelete={jest.fn()}
        isCQLUnchanged
        setIsCQLUnchanged
      />
    );
    const definition = await screen.findByTestId("definition-tab");
    const savedDefinitions = await screen.findByText("Saved Definitions (9)");
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

    const pageButton = await screen.findByRole("button", {
      name: /Go to page 2/i,
    });
    expect(pageButton).toHaveTextContent("2");

    act(() => {
      userEvent.click(pageButton);
    });

    await waitFor(() => {
      expect(screen.findAllByText("Initial Population")).toBeDefined();
    });
  });

  it("Should allow limit changes for savedDefinitions pagination", async () => {
    render(
      <DefinitionsSection
        canEdit={true}
        handleApplyDefinition={jest.fn()}
        cqlBuilderLookupsTypes={cqlBuilderData}
        handleDefinitionDelete={jest.fn()}
        isCQLUnchanged
        setIsCQLUnchanged
      />
    );
    const definition = await screen.findByTestId("definition-tab");
    const savedDefinitions = await screen.findByText("Saved Definitions (9)");
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

    const limitChoice = await screen.findByRole("button", {
      name: /5/i,
    });

    expect(limitChoice).toHaveTextContent("5");

    await waitFor(() => {
      expect(screen.queryByText("Initial Population")).toBeNull();
    });

    act(() => {
      userEvent.click(limitChoice);
    });

    const optionTen = await screen.findByRole("option", {
      name: /10/i,
    });
    await waitFor(() => {
      expect(optionTen).toBeDefined();
    });

    act(() => {
      userEvent.click(optionTen);
    });

    await waitFor(() => {
      expect(screen.findAllByText("Initial Population")).toBeDefined();
    });
  });
});
