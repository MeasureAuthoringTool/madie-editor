import * as React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import DefinitionsSection from "./DefinitionsSection";
import userEvent from "@testing-library/user-event";
import { CqlBuilderLookup, Lookup } from "../../model/CqlBuilderLookup";

describe("DefinitionsSection", () => {
  const tjcMeasurementPeriod = {
    name: "Measurement Period",
    libraryName: "TJC",
    libraryAlias: "TJC",
    logic: "define",
    comment: "",
  } as unknown as Lookup;
  const sdeSex = {
    name: "SDE Sex",
    logic: "define",
    comment: "",
  } as unknown as Lookup;
  const inpatientEncounter = {
    name: "Inpatient Encounter",
    libraryName: "Global",
    libraryAlias: "Global",
    logic: "define",
    comment: "",
  } as unknown as Lookup;
  const ischemicStroke = {
    name: "Ischemic Stroke Encounters with Discharge Disposition",
    libraryName: "TJC",
    libraryAlias: "TJC",
    logic: "define",
    comment: "",
  } as unknown as Lookup;
  const sdeRace = {
    name: "SDE Race",
    logic: "define",
    comment: "",
  } as unknown as Lookup;
  const nonElectiveEncounter = {
    name: "Non Elective Encounter with Age",
    libraryName: "TJC",
    libraryAlias: "TJC",
    logic: "define",
    comment: "",
  } as unknown as Lookup;
  const encounterWithComfort = {
    name: "Encounter with Comfort Measures during Hospitalization",
    libraryName: "TJC",
    libraryAlias: "TJC",
    logic: "define",
    comment: "",
  } as unknown as Lookup;
  const initialPop = {
    name: "Initial Population",
    logic: "define",
    comment: "",
  } as unknown as Lookup;
  const denominator = {
    name: "denominator",
    logic: "define",
    comment: "",
  } as unknown as Lookup;
  const denominatorExclusion = {
    name: "denominatorExclusion",
    logic: "define",
    comment: "",
  } as unknown as Lookup;
  const numerator = {
    name: "numeraetor",
    logic: "define",
    comment: "",
  } as unknown as Lookup;
  const edEncounter = {
    name: "ED Encounter",
    libraryName: "Global",
    libraryAlias: "Global",
    logic: "define",
    comment: "",
  } as unknown as Lookup;

  const cqlBuilderData = {
    parameters: [tjcMeasurementPeriod],
    definitions: [
      sdeSex,
      inpatientEncounter,
      ischemicStroke,
      sdeRace,
      nonElectiveEncounter,
      encounterWithComfort,
      initialPop,
      denominator,
      denominatorExclusion,
      numerator,
      edEncounter,
    ],
    functions: [],
    fluentFunctions: [],
  } as unknown as CqlBuilderLookup;

  it("Should display definition section", async () => {
    render(
      <DefinitionsSection
        canEdit={true}
        handleApplyDefinition={jest.fn()}
        cqlBuilderLookupsTypes={{} as CqlBuilderLookup}
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
        handleDefinitionDelete={jest.fn()}
        isCQLUnchanged
        setIsCQLUnchanged
        cqlBuilderLookupsTypes={{} as unknown as CqlBuilderLookup}
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
    const savedDefinitions = await screen.findByText("Saved Definitions (6)");
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
    const savedDefinitions = await screen.findByText("Saved Definitions (6)");
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
