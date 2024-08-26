import * as React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it } from "@jest/globals";
import "@testing-library/jest-dom";
import DefinitionsSection from "./DefinitionsSection";
import { within } from "@testing-library/dom";

describe("CQL Definition Builder Section", () => {
  it("Should display name and comment fields", async () => {
    render(
      <DefinitionsSection
        canEdit={true}
        handleApplyDefinition={jest.fn()}
        availableParameters={null}
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

  it("Should disable Apply buton with canEdit being false", async () => {
    render(
      <DefinitionsSection
        canEdit={false}
        handleApplyDefinition={jest.fn()}
        availableParameters={null}
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
      <DefinitionsSection
        canEdit={true}
        handleApplyDefinition={jest.fn()}
        availableParameters={null}
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
      <DefinitionsSection
        canEdit={true}
        handleApplyDefinition={jest.fn()}
        availableParameters={null}
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
      <DefinitionsSection
        canEdit={true}
        handleApplyDefinition={jest.fn()}
        availableParameters={null}
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
      <DefinitionsSection
        canEdit={true}
        handleApplyDefinition={jest.fn()}
        availableParameters={null}
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

  it("should enable apply button", async () => {
    render(
      <DefinitionsSection
        canEdit={true}
        handleApplyDefinition={jest.fn()}
        availableParameters={null}
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

    const applyBtn = screen.getByTestId("definition-apply-btn");
    expect(applyBtn).toBeInTheDocument();
    expect(applyBtn).toBeDisabled();

    const expressionText = screen.getByTestId(
      "expression-textarea"
    ) as HTMLInputElement;
    fireEvent.change(expressionText, {
      target: { value: "test expression" },
    });
    expect(expressionText.value).toBe("test expression");
    expect(applyBtn).toBeEnabled();

    act(() => {
      fireEvent.click(applyBtn);
    });
    const definitionName = (await screen.findByTestId(
      "definition-name-text-input"
    )) as HTMLInputElement;
    expect(definitionName.value).toBe("IP");
  });
});
