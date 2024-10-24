import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it } from "@jest/globals";
import "@testing-library/jest-dom";
import { within } from "@testing-library/dom";
import DefinitionBuilder, { formatExpressionName } from "./DefinitionBuilder";
import { cqlBuilderLookup } from "../../__mocks__/MockCqlBuilderLookupsTypes";

describe("CQL Definition Builder Tests", () => {
  it("Should display name and comment fields", async () => {
    render(
      <DefinitionBuilder
        canEdit={true}
        handleApplyDefinition={jest.fn()}
        cqlBuilderLookup={cqlBuilderLookup}
      />
    );
    const definitionNameTextBox = await screen.findByRole("textbox", {
      name: "Definition Name",
    });
    expect(definitionNameTextBox).toBeInTheDocument();

    const definitionCommentTextBox = await screen.findByRole("textbox", {
      name: "Comment",
    });
    expect(definitionCommentTextBox).toBeInTheDocument();

    expect(
      screen.getByTestId("terminology-section-Expression Editor-sub-heading")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("type-selector-input")).not.toBeInTheDocument();
  });

  it("Should disable Apply button with canEdit being false", async () => {
    render(
      <DefinitionBuilder
        canEdit={false}
        handleApplyDefinition={jest.fn()}
        cqlBuilderLookup={cqlBuilderLookup}
      />
    );

    const applyBtn = screen.getByTestId("definition-apply-btn");
    expect(applyBtn).toBeInTheDocument();
    expect(applyBtn).toBeDisabled();

    const clearBtn = screen.getByTestId("clear-definition-btn");
    expect(clearBtn).toBeInTheDocument();
    expect(clearBtn).toBeDisabled();
  });

  it("Should open Expression Editor when definition name is entered", async () => {
    render(
      <DefinitionBuilder
        canEdit={true}
        handleApplyDefinition={jest.fn()}
        cqlBuilderLookup={cqlBuilderLookup}
      />
    );
    const definitionNameInput = (await screen.findByTestId(
      "definition-name-text-input"
    )) as HTMLInputElement;
    expect(definitionNameInput).toBeInTheDocument();
    expect(definitionNameInput.value).toBe("");
    fireEvent.change(definitionNameInput, {
      target: { value: "IP" },
    });
    expect(definitionNameInput.value).toBe("IP");

    const definitionCommentTextBox = await screen.findByRole("textbox", {
      name: "Comment",
    });
    expect(definitionCommentTextBox).toBeInTheDocument();

    expect(
      screen.getByTestId("terminology-section-Expression Editor-sub-heading")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("type-selector-input")).toBeInTheDocument();
  });

  it("Should should clear value when clear button is clicked", async () => {
    render(
      <DefinitionBuilder
        canEdit={true}
        handleApplyDefinition={jest.fn()}
        cqlBuilderLookup={cqlBuilderLookup}
      />
    );
    const definitionNameInput = (await screen.findByTestId(
      "definition-name-text-input"
    )) as HTMLInputElement;
    expect(definitionNameInput).toBeInTheDocument();
    expect(definitionNameInput.value).toBe("");
    fireEvent.change(definitionNameInput, {
      target: { value: "IP" },
    });
    expect(definitionNameInput.value).toBe("IP");

    const definitionCommentTextBox = await screen.findByRole("textbox", {
      name: "Comment",
    });
    expect(definitionCommentTextBox).toBeInTheDocument();

    expect(
      screen.getByTestId("terminology-section-Expression Editor-sub-heading")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("type-selector-input")).toBeInTheDocument();

    const clearBtn = screen.getByTestId("clear-definition-btn");
    expect(clearBtn).toBeEnabled();
    fireEvent.click(clearBtn);
    expect(definitionNameInput.value).toBe("");
  });

  it("Should populate name dropdown list", async () => {
    render(
      <DefinitionBuilder
        canEdit={true}
        handleApplyDefinition={jest.fn()}
        cqlBuilderLookup={cqlBuilderLookup}
      />
    );
    const definitionNameInput = (await screen.findByTestId(
      "definition-name-text-input"
    )) as HTMLInputElement;
    expect(definitionNameInput).toBeInTheDocument();
    expect(definitionNameInput.value).toBe("");
    fireEvent.change(definitionNameInput, {
      target: { value: "IP" },
    });
    expect(definitionNameInput.value).toBe("IP");

    const definitionCommentTextBox = await screen.findByRole("textbox", {
      name: "Comment",
    });
    expect(definitionCommentTextBox).toBeInTheDocument();

    expect(
      screen.getByTestId("terminology-section-Expression Editor-sub-heading")
    ).toBeInTheDocument();
    const typeInput = screen.getByTestId(
      "type-selector-input"
    ) as HTMLInputElement;
    expect(typeInput).toBeInTheDocument();
    expect(typeInput.value).toBe("");

    fireEvent.change(typeInput, {
      target: { value: "Timing" },
    });
    expect(typeInput.value).toBe("Timing");

    const nameAutoComplete = screen.getByTestId("name-selector");
    expect(nameAutoComplete).toBeInTheDocument();
    const nameComboBox = within(nameAutoComplete).getByRole("combobox");
    //name dropdown is populated with values based on type
    await waitFor(() => expect(nameComboBox).toBeEnabled());

    const nameDropDown = await screen.findByTestId("name-selector");
    fireEvent.keyDown(nameDropDown, { key: "ArrowDown" });

    const nameOptions = await screen.findAllByRole("option");
    expect(nameOptions).toHaveLength(70);

    const insertBtn = screen.getByTestId("expression-insert-btn");
    expect(insertBtn).toBeInTheDocument();
    expect(insertBtn).toBeDisabled();

    const applyBtn = screen.getByTestId("definition-apply-btn");
    expect(applyBtn).toBeInTheDocument();
    expect(applyBtn).toBeDisabled();
  });

  it("should enable insert button", async () => {
    render(
      <DefinitionBuilder
        canEdit={true}
        handleApplyDefinition={jest.fn()}
        cqlBuilderLookup={cqlBuilderLookup}
      />
    );
    const definitionNameInput = (await screen.findByTestId(
      "definition-name-text-input"
    )) as HTMLInputElement;
    expect(definitionNameInput).toBeInTheDocument();
    expect(definitionNameInput.value).toBe("");
    fireEvent.change(definitionNameInput, {
      target: { value: "IP" },
    });
    expect(definitionNameInput.value).toBe("IP");

    const definitionCommentTextBox = await screen.findByRole("textbox", {
      name: "Comment",
    });
    expect(definitionCommentTextBox).toBeInTheDocument();

    expect(
      screen.getByTestId("terminology-section-Expression Editor-sub-heading")
    ).toBeInTheDocument();
    const typeInput = screen.getByTestId(
      "type-selector-input"
    ) as HTMLInputElement;
    expect(typeInput).toBeInTheDocument();
    expect(typeInput.value).toBe("");

    fireEvent.change(typeInput, {
      target: { value: "Timing" },
    });
    expect(typeInput.value).toBe("Timing");

    const nameAutoComplete = screen.getByTestId("name-selector");
    expect(nameAutoComplete).toBeInTheDocument();
    const nameComboBox = within(nameAutoComplete).getByRole("combobox");
    //name dropdown is populated with values based on type
    await waitFor(() => expect(nameComboBox).toBeEnabled());

    const nameDropDown = await screen.findByTestId("name-selector");
    fireEvent.keyDown(nameDropDown, { key: "ArrowDown" });

    const nameOptions = await screen.findAllByRole("option");
    expect(nameOptions).toHaveLength(70);

    const insertBtn = screen.getByTestId("expression-insert-btn");
    expect(insertBtn).toBeInTheDocument();
    expect(insertBtn).toBeDisabled();

    fireEvent.click(nameOptions[0]);
    expect(insertBtn).toBeEnabled();

    const applyBtn = screen.getByTestId("definition-apply-btn");
    expect(applyBtn).toBeInTheDocument();
    expect(applyBtn).toBeDisabled();
  });

  it("Editing the definition and saving it", async () => {
    const definition = {
      definitionName: "SDE Sex",
      expressionValue: " Initial Value",
    };
    const handleDefinitionEdit = jest.fn();
    const onClose = jest.fn();
    render(
      <DefinitionBuilder
        canEdit={true}
        handleApplyDefinition={jest.fn()}
        handleDefinitionEdit={handleDefinitionEdit}
        operation={"edit"}
        cqlBuilderLookup={cqlBuilderLookup}
        definition={definition}
        onClose={onClose}
      />
    );
    expect(screen.getByTestId("definition-name-text-input")).toHaveValue(
      "SDE Sex"
    );
    expect(screen.getByTestId("clear-definition-btn")).toBeDisabled();
    expect(screen.getByTestId("definition-save-btn")).toBeDisabled();

    fireEvent.change(screen.getByTestId("definition-name-text-input"), {
      target: { value: "IP" },
    });
    expect(screen.getByTestId("clear-definition-btn")).toBeEnabled();
    expect(screen.getByTestId("definition-save-btn")).toBeEnabled();

    fireEvent.click(screen.getByTestId("definition-save-btn"));

    await waitFor(() => {
      expect(handleDefinitionEdit).toHaveBeenCalled();
    });
  });

  it("Editing the definition and clearing the edited changes", async () => {
    const definition = {
      definitionName: "SDE Sex",
      expressionValue: " Initial Value",
    };
    const handleDefinitionEdit = jest.fn();
    const onClose = jest.fn();
    render(
      <DefinitionBuilder
        canEdit={true}
        handleApplyDefinition={jest.fn()}
        handleDefinitionEdit={handleDefinitionEdit}
        operation={"edit"}
        cqlBuilderLookup={cqlBuilderLookup}
        definition={definition}
        onClose={onClose}
      />
    );
    expect(screen.getByTestId("definition-name-text-input")).toHaveValue(
      "SDE Sex"
    );
    expect(screen.getByTestId("clear-definition-btn")).toBeDisabled();
    expect(screen.getByTestId("definition-save-btn")).toBeDisabled();

    fireEvent.change(screen.getByTestId("definition-name-text-input"), {
      target: { value: "IP" },
    });

    expect(screen.getByTestId("definition-name-text-input")).toHaveValue("IP");
    expect(screen.getByTestId("clear-definition-btn")).toBeEnabled();
    expect(screen.getByTestId("definition-save-btn")).toBeEnabled();

    fireEvent.click(screen.getByTestId("clear-definition-btn"));

    expect(screen.getByTestId("definition-name-text-input")).toHaveValue(
      "SDE Sex"
    );
    expect(screen.getByTestId("clear-definition-btn")).toBeDisabled();
  });

  it("expression is inserted into text area when insert button is clicked", async () => {
    render(
      <DefinitionBuilder
        canEdit={true}
        handleApplyDefinition={jest.fn()}
        cqlBuilderLookup={cqlBuilderLookup}
      />
    );
    const definitionNameInput = (await screen.findByTestId(
      "definition-name-text-input"
    )) as HTMLInputElement;
    expect(definitionNameInput).toBeInTheDocument();
    expect(definitionNameInput.value).toBe("");
    fireEvent.change(definitionNameInput, {
      target: { value: "IP" },
    });
    expect(definitionNameInput.value).toBe("IP");

    const definitionCommentTextBox = await screen.findByRole("textbox", {
      name: "Comment",
    });
    expect(definitionCommentTextBox).toBeInTheDocument();
    const definitionCommentInput = (await screen.findByTestId(
      "definition-comment-text"
    )) as HTMLInputElement;
    expect(definitionCommentInput.value).toBe("");
    fireEvent.change(definitionCommentInput, {
      target: { value: "comment" },
    });
    expect(definitionCommentInput.value).toBe("comment");

    expect(
      screen.getByTestId("terminology-section-Expression Editor-sub-heading")
    ).toBeInTheDocument();
    const typeInput = screen.getByTestId(
      "type-selector-input"
    ) as HTMLInputElement;
    expect(typeInput).toBeInTheDocument();
    expect(typeInput.value).toBe("");

    fireEvent.change(typeInput, {
      target: { value: "Timing" },
    });
    expect(typeInput.value).toBe("Timing");

    const nameAutoComplete = screen.getByTestId("name-selector");
    expect(nameAutoComplete).toBeInTheDocument();
    const nameComboBox = within(nameAutoComplete).getByRole("combobox");
    //name dropdown is populated with values based on type
    await waitFor(() => expect(nameComboBox).toBeEnabled());

    const nameDropDown = await screen.findByTestId("name-selector");
    fireEvent.keyDown(nameDropDown, { key: "ArrowDown" });

    const nameOptions = await screen.findAllByRole("option");
    expect(nameOptions).toHaveLength(70);
    const insertBtn = screen.getByTestId("expression-insert-btn");

    expect(insertBtn).toBeInTheDocument();
    expect(insertBtn).toBeDisabled();

    fireEvent.click(nameOptions[0]);
    expect(insertBtn).toBeEnabled();

    fireEvent.click(insertBtn);
    const definitionName = (await screen.findByTestId(
      "definition-name-text-input"
    )) as HTMLInputElement;
    expect(definitionName.value).toBe("IP");
  });

  it("To check if expressions are formatted as expected before inserting in ace editor", () => {
    const expressionValues = {
      definitionName: "Test",
      comment: "",
      type: "Parameters",
      name: "Measurement Period",
    };
    expect(formatExpressionName(expressionValues)).toBe('"Measurement Period"');

    expressionValues.type = "Definitions";
    expect(formatExpressionName(expressionValues)).toBe('"Measurement Period"');

    expressionValues.type = "Definitions";
    expressionValues.name = "Global.Measurement Period";
    expect(formatExpressionName(expressionValues)).toBe(
      'Global."Measurement Period"'
    );

    expressionValues.type = "Functions";
    expressionValues.name = "Abs()";
    expect(formatExpressionName(expressionValues)).toBe('"Abs"()');

    expressionValues.type = "Fluent Functions";
    expect(formatExpressionName(expressionValues)).toBe('"Abs"()');

    expressionValues.type = "Timing";
    expressionValues.name = "after";
    expect(formatExpressionName(expressionValues)).toBe("after");

    expressionValues.type = "Pre-Defined Functions";
    expressionValues.name = "AgeInDays()";
    expect(formatExpressionName(expressionValues)).toBe("AgeInDays()");
  });
});
