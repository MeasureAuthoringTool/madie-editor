import * as React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import DefinitionsSection from "./DefinitionsSection";
import userEvent from "@testing-library/user-event";
import { CqlBuilderLookup } from "../../model/CqlBuilderLookup";
import { cqlBuilderLookup } from "../__mocks__/MockCqlBuilderLookupsTypes";

const props = {
  canEdit: true,
  loading: false,
  handleApplyDefinition: jest.fn(),
  handleDefinitionEdit: jest.fn(),
  handleDefinitionDelete: jest.fn(),
  cqlBuilderLookupsTypes: {} as CqlBuilderLookup,
  isCQLUnchanged: true,
  cql: "",
  setEditorVal: jest.fn(),
  resetCql: jest.fn(),
  getCqlDefinitionReturnTypes: jest.fn(),
};

describe("DefinitionsSection", () => {
  it("Should display definition section", async () => {
    render(<DefinitionsSection {...props} />);
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
    render(<DefinitionsSection {...props} />);
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
        {...props}
        cqlBuilderLookupsTypes={cqlBuilderLookup}
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
    await userEvent.click(savedDefinitions);
    await waitFor(() => {
      expect(savedDefinitions).toHaveAttribute("aria-selected", "true");
    });

    const pageButton = await screen.findByRole("button", {
      name: /Go to page 2/i,
    });
    expect(pageButton).toHaveTextContent("2");
    await userEvent.click(pageButton);
    const rows = await screen.findAllByTestId(/definitions-row-/);
    expect(rows.length).toBeGreaterThan(0);
  });

  it("Should allow limit changes for savedDefinitions pagination", async () => {
    render(
      <DefinitionsSection
        {...props}
        cqlBuilderLookupsTypes={cqlBuilderLookup}
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
    await userEvent.click(savedDefinitions);
    await waitFor(() => {
      expect(savedDefinitions).toHaveAttribute("aria-selected", "true");
    });

    const limitChoice = await screen.findByRole("combobox");

    expect(limitChoice).toHaveTextContent("5");

    await waitFor(() => {
      expect(screen.queryByText("ED Encounter")).toBeNull();
    });
    await userEvent.click(limitChoice);

    const optionTen = await screen.findByRole("option", {
      name: /10/i,
    });
    await waitFor(() => {
      expect(optionTen).toBeDefined();
    });
    await userEvent.click(optionTen);
    const initialPopEntries = await screen.findAllByText("Initial Population");
    expect(initialPopEntries.length).toBeGreaterThan(0);
  });

  it("Should not show edit/delete actions for measure if user does not have permission", async () => {
    render(
      <DefinitionsSection
        {...props}
        cqlBuilderLookupsTypes={cqlBuilderLookup}
        canEdit={false}
      />
    );
    // go to saved definitions tab
    const savedDefinitionsTab = screen.getByRole("tab", {
      name: /Saved Definitions/i,
    });
    expect(savedDefinitionsTab).toBeInTheDocument();
    await userEvent.click(savedDefinitionsTab);
    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
    expect(
      screen.queryAllByTestId("definition-actions")[0]
    ).toBeInTheDocument();

    expect(screen.queryByTestId("delete-button-1")).not.toBeInTheDocument();
    expect(screen.queryByTestId("edit-button-1")).not.toBeInTheDocument();

    expect(screen.queryByTestId("view-button-0")).toBeInTheDocument();
    const viewBtn = screen.getByTestId("view-button-0");
    await userEvent.click(viewBtn);
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    const nameMatches = screen.getAllByText("SDE Sex");
    expect(nameMatches.length).toBeGreaterThan(0);
    expect(screen.queryByTestId("edit-button-0")).not.toBeInTheDocument();
    expect(screen.queryByTestId("delete-button-0")).not.toBeInTheDocument();
  });

  it("Should render edit definition dialog on edit button click", async () => {
    const getCqlDefinitionReturnTypes = () => {
      return {
        sdeSex: "PatientCharacteristicSex",
      };
    };
    render(
      <DefinitionsSection
        {...props}
        cql={
          '/*\n this is SDE Sex definition\n*/ \ndefine "SDE Sex":\n  SDE."SDE Sex"'
        }
        cqlBuilderLookupsTypes={cqlBuilderLookup}
        getCqlDefinitionReturnTypes={getCqlDefinitionReturnTypes}
      />
    );
    // go to saved definitions tab
    const savedDefinitionsTab = screen.getByRole("tab", {
      name: /Saved Definitions/i,
    });
    expect(savedDefinitionsTab).toBeInTheDocument();
    await userEvent.click(savedDefinitionsTab);
    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
    const editBtn = await screen.findByRole("button", {
      name: /edit-button-0/i,
    });
    await userEvent.click(editBtn);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByTestId("definition-name-text-input")).toHaveValue(
      "SDE Sex"
    );
    expect(screen.getByTestId("definition-comment-text")).toHaveValue(
      "this is SDE Sex definition"
    );
    const returnType = screen.getByTestId("return-type");
    expect(returnType).toHaveTextContent(getCqlDefinitionReturnTypes().sdeSex);
    // close the dialog
    const button = screen.getByRole("button", { name: "Close" });
    await userEvent.click(button);

    // perform delete action, should display delete confirmation dialog
    const deleteBtn0 = screen.getByTestId("delete-button-0");
    await userEvent.click(deleteBtn0);
    expect(screen.getByTestId("delete-dialog")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Yes, Delete" }));
    expect(props.handleDefinitionDelete).toHaveBeenCalled();
  });

  it("Should show discard dialog if CQL is dirty on edit btn click", async () => {
    const getCqlDefinitionReturnTypes = () => {
      return {
        sdeSex: "PatientCharacteristicSex",
      };
    };
    render(
      <DefinitionsSection
        {...props}
        isCQLUnchanged={false}
        cql={
          '/*\n this is SDE Sex definition\n*/ \ndefine "SDE Sex":\n  SDE."SDE Sex"'
        }
        cqlBuilderLookupsTypes={cqlBuilderLookup}
        getCqlDefinitionReturnTypes={getCqlDefinitionReturnTypes}
      />
    );
    // go to saved definitions tab
    const savedDefinitionsTab = screen.getByRole("tab", {
      name: /Saved Definitions/i,
    });
    expect(savedDefinitionsTab).toBeInTheDocument();
    await userEvent.click(savedDefinitionsTab);
    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();

    // perform delete if cql is dirty, should display discard confirmation
    const deleteBtn1 = screen.getByTestId("delete-button-0");
    await userEvent.click(deleteBtn1);
    expect(screen.getByTestId("discard-dialog")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Yes, Discard All Changes" })
    );
    expect(screen.getByTestId("delete-dialog")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Yes, Delete" }));
    expect(props.handleDefinitionDelete).toHaveBeenCalled();
  });
});
