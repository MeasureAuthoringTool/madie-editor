import * as React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, it } from "@jest/globals";
import "@testing-library/jest-dom";
import FunctionBuilder from "./FunctionBuilder";
import userEvent from "@testing-library/user-event";
import { cqlBuilderLookup } from "../../__mocks__/MockCqlBuilderLookupsTypes";
import { getNewExpressionsAndLines } from "../../common/utils";

describe("CQL Function Builder Tests", () => {
  it("Should display name and comment fields", async () => {
    render(<FunctionBuilder canEdit={true} handleApplyFunction={jest.fn()} />);
    const functionNameTextBox = await screen.findByRole("textbox", {
      name: "Function Name",
    });
    expect(functionNameTextBox).toBeInTheDocument();

    const functionCommentTextBox = await screen.findByRole("textbox", {
      name: "Comment",
    });
    expect(functionCommentTextBox).toBeInTheDocument();

    expect(
      screen.getByTestId("terminology-section-Arguments-sub-heading")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("terminology-section-Expression Editor-sub-heading")
    ).toBeInTheDocument();
    expect(screen.queryByTestId("type-selector-input")).not.toBeInTheDocument();
  });

  it("Should disable Apply button with canEdit being false", async () => {
    render(<FunctionBuilder canEdit={true} handleApplyFunction={jest.fn()} />);

    const applyBtn = screen.getByTestId("function-apply-btn");
    expect(applyBtn).toBeInTheDocument();
    expect(applyBtn).toBeDisabled();

    const clearBtn = screen.getByTestId("clear-function-btn");
    expect(clearBtn).toBeInTheDocument();
    expect(clearBtn).toBeDisabled();
  });

  it("Should generate pop up when clear button is clicked, Cancel clear", async () => {
    render(<FunctionBuilder canEdit={true} handleApplyFunction={jest.fn()} />);
    const functionNameInput = (await screen.findByTestId(
      "function-name-text-input"
    )) as HTMLInputElement;
    expect(functionNameInput).toBeInTheDocument();
    expect(functionNameInput.value).toBe("");
    fireEvent.change(functionNameInput, {
      target: { value: "Test" },
    });
    expect(functionNameInput.value).toBe("Test");

    const functionCommentTextBox = await screen.findByRole("textbox", {
      name: "Comment",
    });
    expect(functionCommentTextBox).toBeInTheDocument();

    const clearBtn = screen.getByTestId("clear-function-btn");
    expect(clearBtn).toBeEnabled();
    fireEvent.click(clearBtn);

    const confirmationDialog = screen.getByText("Are you sure?");
    const cancelButton = screen.getByTestId("confirmation-cancel-button");
    expect(cancelButton).toBeEnabled();
    fireEvent.click(cancelButton);
    expect(functionNameInput.value).toBe("Test");
  });

  it("Should generate pop up when clear button is clicked, confirm clear", async () => {
    render(<FunctionBuilder canEdit={true} handleApplyFunction={jest.fn()} />);
    const functionNameInput = (await screen.findByTestId(
      "function-name-text-input"
    )) as HTMLInputElement;
    expect(functionNameInput).toBeInTheDocument();
    expect(functionNameInput.value).toBe("");
    fireEvent.change(functionNameInput, {
      target: { value: "Test" },
    });
    expect(functionNameInput.value).toBe("Test");

    const functionCommentTextBox = await screen.findByRole("textbox", {
      name: "Comment",
    });
    expect(functionCommentTextBox).toBeInTheDocument();

    const clearBtn = screen.getByTestId("clear-function-btn");
    expect(clearBtn).toBeEnabled();
    fireEvent.click(clearBtn);

    const confirmationDialog = screen.getByText("Are you sure?");
    const clearButton = screen.getByTestId("confirmation-clear-button");
    expect(clearButton).toBeEnabled();
    fireEvent.click(clearButton);
    expect(functionNameInput.value).toBe("");
  });

  it("Should expand argument section", async () => {
    render(<FunctionBuilder canEdit={true} handleApplyFunction={jest.fn()} />);
    const functionNameInput = (await screen.findByTestId(
      "function-name-text-input"
    )) as HTMLInputElement;
    const argumentsSection = screen.getByTestId(
      "terminology-section-Arguments-sub-heading"
    );
    const argumentSectionButton = await within(argumentsSection).findByRole(
      "button"
    );
    fireEvent.click(argumentSectionButton);

    const argumentNameTextBox = await screen.findByRole("textbox", {
      name: "Name",
    });
    expect(argumentNameTextBox).toBeInTheDocument();

    const argumentDataTypeTextBox = await screen.findByRole("combobox", {
      name: "Available DataTypes",
    });
    expect(argumentDataTypeTextBox).toBeInTheDocument();

    const clearButton = screen.getByTestId("clear-function-argument-btn");
    expect(clearButton).toBeInTheDocument();
    expect(clearButton).not.toBeEnabled();

    const addButton = screen.getByTestId("function-argument-add-btn");
    expect(addButton).toBeInTheDocument();
    expect(addButton).not.toBeEnabled();

    const functionArgumentTable = screen.getByTestId("function-argument-tbl");
    expect(functionArgumentTable).toBeInTheDocument();
  });

  it("Should add field in argument section when Other selected", async () => {
    render(<FunctionBuilder canEdit={true} handleApplyFunction={jest.fn()} />);
    const functionNameInput = (await screen.findByTestId(
      "function-name-text-input"
    )) as HTMLInputElement;
    const argumentsSection = screen.getByTestId(
      "terminology-section-Arguments-sub-heading"
    );
    const argumentSectionButton = await within(argumentsSection).findByRole(
      "button"
    );
    fireEvent.click(argumentSectionButton);

    const argumentNameTextBox = await screen.findByRole("textbox", {
      name: "Name",
    });
    expect(argumentNameTextBox).toBeInTheDocument();

    const argumentDataTypeTextBox = await screen.findByRole("combobox", {
      name: "Available DataTypes",
    });
    expect(argumentDataTypeTextBox).toBeInTheDocument();
    userEvent.click(argumentDataTypeTextBox);
    const optionList = screen.getAllByRole("option");
    expect(optionList.length).toEqual(9);
    const otherOption = await screen.findByRole("option", { name: "Other" });
    userEvent.click(otherOption);

    const otherTextbox = await screen.findByRole("textbox", {
      name: "Other",
    });
    expect(otherTextbox).toBeInTheDocument();
  });

  it("Should clear argument section", async () => {
    render(<FunctionBuilder canEdit={true} handleApplyFunction={jest.fn()} />);
    const functionNameInput = (await screen.findByTestId(
      "function-name-text-input"
    )) as HTMLInputElement;
    const argumentsSection = screen.getByTestId(
      "terminology-section-Arguments-sub-heading"
    );
    const argumentSectionButton = await within(argumentsSection).findByRole(
      "button"
    );
    fireEvent.click(argumentSectionButton);

    const argumentNameInput = (await screen.findByTestId(
      "argument-name-input"
    )) as HTMLInputElement;
    expect(argumentNameInput).toBeInTheDocument();
    expect(argumentNameInput.value).toBe("");
    fireEvent.change(argumentNameInput, {
      target: { value: "Test" },
    });
    expect(argumentNameInput.value).toBe("Test");

    const clearButton = screen.getByTestId("clear-function-argument-btn");
    expect(clearButton).toBeInTheDocument();
    expect(clearButton).toBeEnabled();

    const addButton = screen.getByTestId("function-argument-add-btn");
    expect(addButton).toBeInTheDocument();
    expect(addButton).toBeEnabled();

    fireEvent.click(clearButton);

    const confirmationDialog = screen.getByText("Are you sure?");
    const confirmClearButton = screen.getByTestId("confirmation-clear-button");
    expect(confirmClearButton).toBeEnabled();
    fireEvent.click(confirmClearButton);
    expect(argumentNameInput.value).toBe("");
  });

  it("Should add argument to the table", async () => {
    render(<FunctionBuilder canEdit={true} handleApplyFunction={jest.fn()} />);
    const functionNameInput = (await screen.findByTestId(
      "function-name-text-input"
    )) as HTMLInputElement;
    const argumentsSection = screen.getByTestId(
      "terminology-section-Arguments-sub-heading"
    );
    const argumentSectionButton = await within(argumentsSection).findByRole(
      "button"
    );
    fireEvent.click(argumentSectionButton);

    const argumentNameInput = (await screen.findByTestId(
      "argument-name-input"
    )) as HTMLInputElement;
    expect(argumentNameInput).toBeInTheDocument();
    expect(argumentNameInput.value).toBe("");
    fireEvent.change(argumentNameInput, {
      target: { value: "Test" },
    });
    expect(argumentNameInput.value).toBe("Test");

    const addButton = screen.getByTestId("function-argument-add-btn");
    expect(addButton).toBeInTheDocument();
    expect(addButton).toBeEnabled();

    fireEvent.click(addButton);

    const functionArgumentTable = screen.getByTestId("function-argument-tbl");
    expect(functionArgumentTable).toBeInTheDocument();
    const tableRow = functionArgumentTable.querySelector("tbody").children[0];
    expect(tableRow.children[1].textContent).toEqual("Test");
  });

  it("Should delete argument from the table", async () => {
    render(<FunctionBuilder canEdit={true} handleApplyFunction={jest.fn()} />);
    const functionNameInput = (await screen.findByTestId(
      "function-name-text-input"
    )) as HTMLInputElement;
    const argumentsSection = screen.getByTestId(
      "terminology-section-Arguments-sub-heading"
    );
    const argumentSectionButton = await within(argumentsSection).findByRole(
      "button"
    );
    fireEvent.click(argumentSectionButton);

    const argumentNameInput = (await screen.findByTestId(
      "argument-name-input"
    )) as HTMLInputElement;
    expect(argumentNameInput).toBeInTheDocument();
    expect(argumentNameInput.value).toBe("");
    fireEvent.change(argumentNameInput, {
      target: { value: "Test" },
    });
    expect(argumentNameInput.value).toBe("Test");

    const addButton = screen.getByTestId("function-argument-add-btn");
    expect(addButton).toBeInTheDocument();
    expect(addButton).toBeEnabled();

    fireEvent.click(addButton);

    const functionArgumentTable = screen.getByTestId("function-argument-tbl");
    expect(functionArgumentTable).toBeInTheDocument();
    const tableRow = functionArgumentTable.querySelector("tbody").children[0];
    expect(tableRow.children[1].textContent).toEqual("Test");
    const deleteArgumentButton = await within(tableRow).findByTestId(
      "delete-button-0"
    );
    fireEvent.click(deleteArgumentButton);

    const confirmDeleteButton = screen.getByTestId(
      "delete-dialog-continue-button"
    );
    expect(confirmDeleteButton).toBeEnabled();
    fireEvent.click(confirmDeleteButton);
    const newTableRow =
      functionArgumentTable.querySelector("tbody").children[0];
    expect(newTableRow.children[0].textContent).toEqual(
      "No Results were found"
    );
  });
  it("Should open expression editor content on entry.", async () => {
    render(
      <FunctionBuilder
        canEdit={true}
        handleApplyFunction={jest.fn()}
        cqlBuilderLookupsTypes={cqlBuilderLookup}
      />
    );
    const functionNameInput = (await screen.findByTestId(
      "function-name-text-input"
    )) as HTMLInputElement;
    expect(functionNameInput).toBeInTheDocument();
    expect(functionNameInput.value).toBe("");
    fireEvent.change(functionNameInput, {
      target: { value: "IP" },
    });
    expect(functionNameInput.value).toBe("IP");

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

    const applyBtn = screen.getByTestId("function-apply-btn");
    expect(applyBtn).toBeInTheDocument();
    expect(applyBtn).toBeEnabled();
  });

  it("expression is inserted into text area when insert button is clicked", async () => {
    render(
      <FunctionBuilder
        canEdit={true}
        handleApplyFunction={jest.fn()}
        cqlBuilderLookupsTypes={cqlBuilderLookup}
      />
    );
    const functionNameInput = (await screen.findByTestId(
      "function-name-text-input"
    )) as HTMLInputElement;
    expect(functionNameInput).toBeInTheDocument();
    expect(functionNameInput.value).toBe("");
    fireEvent.change(functionNameInput, {
      target: { value: "IP" },
    });
    expect(functionNameInput.value).toBe("IP");

    const definitionCommentTextBox = await screen.findByRole("textbox", {
      name: "Comment",
    });
    expect(definitionCommentTextBox).toBeInTheDocument();
    const definitionCommentInput = (await screen.findByTestId(
      "function-comment-text"
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
      "function-name-text-input"
    )) as HTMLInputElement;
    expect(definitionName.value).toBe("IP");
  });

  it("should call handleApplyFunction with a function that we've created through the UI when other is selected.", async () => {
    const handleApplyFn = jest.fn();
    render(
      <FunctionBuilder
        canEdit={true}
        handleApplyFunction={handleApplyFn}
        cqlBuilderLookupsTypes={cqlBuilderLookup}
      />
    );
    // name, insert, except args
    const functionNameInput = (await screen.findByTestId(
      "function-name-text-input"
    )) as HTMLInputElement;
    const argumentsSection = screen.getByTestId(
      "terminology-section-Arguments-sub-heading"
    );
    expect(functionNameInput).toBeInTheDocument();
    expect(functionNameInput.value).toBe("");
    fireEvent.change(functionNameInput, {
      target: { value: "IP" },
    });
    expect(functionNameInput.value).toBe("IP");

    const definitionCommentTextBox = await screen.findByRole("textbox", {
      name: "Comment",
    });
    expect(definitionCommentTextBox).toBeInTheDocument();
    const definitionCommentInput = (await screen.findByTestId(
      "function-comment-text"
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
      "function-name-text-input"
    )) as HTMLInputElement;
    expect(definitionName.value).toBe("IP");
    // args

    const argumentNameInput = (await screen.findByTestId(
      "argument-name-input"
    )) as HTMLInputElement;
    expect(argumentNameInput).toBeInTheDocument();
    expect(argumentNameInput.value).toBe("");
    fireEvent.change(argumentNameInput, {
      target: { value: "Test" },
    });
    expect(argumentNameInput.value).toBe("Test");

    const dataTypeDropdown = await screen.findByTestId(
      "arg-type-selector-input"
    );
    fireEvent.change(dataTypeDropdown, {
      target: { value: "Other" },
    });

    // we now need to populate other textfield
    const otherNameInput = (await screen.findByTestId(
      "other-type-input"
    )) as HTMLInputElement;
    expect(otherNameInput).toBeInTheDocument();
    expect(otherNameInput.value).toBe("");
    fireEvent.change(otherNameInput, {
      target: { value: "Other" },
    });
    expect(otherNameInput.value).toBe("Other");

    const addButton = screen.getByTestId("function-argument-add-btn");
    expect(addButton).toBeInTheDocument();
    expect(addButton).toBeEnabled();

    fireEvent.click(addButton);

    const functionArgumentTable = screen.getByTestId("function-argument-tbl");
    expect(functionArgumentTable).toBeInTheDocument();
    const tableRow = functionArgumentTable.querySelector("tbody").children[0];
    expect(tableRow.children[1].textContent).toEqual("Test");
    // submit
    const submitButton = screen.getByTestId("function-apply-btn");
    expect(submitButton).toBeEnabled();
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(handleApplyFn).toHaveBeenCalledWith(
        expect.objectContaining({
          comment: "comment",
          expressionValue: "after",
          fluentFunction: true,
          functionName: "IP",
          functionsArguments: [
            expect.objectContaining({
              argumentName: "Test",
              dataType: "Other",
            }),
          ],
        })
      );
    });
  });
  it("should call handleApplyFunction with a function that we've created through the UI", async () => {
    const handleApplyFn = jest.fn();
    render(
      <FunctionBuilder
        canEdit={true}
        handleApplyFunction={handleApplyFn}
        cqlBuilderLookupsTypes={cqlBuilderLookup}
      />
    );
    // name, insert, except args
    const functionNameInput = (await screen.findByTestId(
      "function-name-text-input"
    )) as HTMLInputElement;
    const argumentsSection = screen.getByTestId(
      "terminology-section-Arguments-sub-heading"
    );
    expect(functionNameInput).toBeInTheDocument();
    expect(functionNameInput.value).toBe("");
    fireEvent.change(functionNameInput, {
      target: { value: "IP" },
    });
    expect(functionNameInput.value).toBe("IP");

    const definitionCommentTextBox = await screen.findByRole("textbox", {
      name: "Comment",
    });
    expect(definitionCommentTextBox).toBeInTheDocument();
    const definitionCommentInput = (await screen.findByTestId(
      "function-comment-text"
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
      "function-name-text-input"
    )) as HTMLInputElement;
    expect(definitionName.value).toBe("IP");
    // args

    const argumentNameInput = (await screen.findByTestId(
      "argument-name-input"
    )) as HTMLInputElement;
    expect(argumentNameInput).toBeInTheDocument();
    expect(argumentNameInput.value).toBe("");
    fireEvent.change(argumentNameInput, {
      target: { value: "Test" },
    });
    expect(argumentNameInput.value).toBe("Test");

    const dataTypeDropdown = await screen.findByTestId(
      "arg-type-selector-input"
    );
    fireEvent.change(dataTypeDropdown, {
      target: { value: "Boolean" },
    });

    const addButton = screen.getByTestId("function-argument-add-btn");
    expect(addButton).toBeInTheDocument();
    expect(addButton).toBeEnabled();
    // get available dataTypes 0

    fireEvent.click(addButton);

    const functionArgumentTable = screen.getByTestId("function-argument-tbl");
    expect(functionArgumentTable).toBeInTheDocument();
    const tableRow = functionArgumentTable.querySelector("tbody").children[0];
    expect(tableRow.children[1].textContent).toEqual("Test");
    // submit
    const submitButton = screen.getByTestId("function-apply-btn");
    expect(submitButton).toBeEnabled();
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(handleApplyFn).toHaveBeenCalledWith(
        expect.objectContaining({
          comment: "comment",
          expressionValue: "after",
          fluentFunction: true,
          functionName: "IP",
          functionsArguments: [
            expect.objectContaining({
              argumentName: "Test",
              dataType: "Boolean",
            }),
          ],
        })
      );
    });
  });

  it("Should trigger the final page", async () => {
    const handleApplyFn = jest.fn();
    render(
      <FunctionBuilder
        canEdit={true}
        handleApplyFunction={handleApplyFn}
        cqlBuilderLookupsTypes={cqlBuilderLookup}
        funct={{
          functionName: "",
          comment: "",
          functionsArguments: [
            { dataType: "Integer", argumentName: "Test" },
            { dataType: "Integer", argumentName: "Test" },
            { dataType: "Integer", argumentName: "Test" },
            { dataType: "Integer", argumentName: "Test" },
            { dataType: "Integer", argumentName: "Test" },
          ],
        }}
      />
    );
    // name, insert, except args
    const functionNameInput = (await screen.findByTestId(
      "function-name-text-input"
    )) as HTMLInputElement;
    const argumentsSection = screen.getByTestId(
      "terminology-section-Arguments-sub-heading"
    );
    expect(functionNameInput).toBeInTheDocument();
    expect(functionNameInput.value).toBe("");
    fireEvent.change(functionNameInput, {
      target: { value: "IP" },
    });
    expect(functionNameInput.value).toBe("IP");
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
      "function-name-text-input"
    )) as HTMLInputElement;
    expect(definitionName.value).toBe("IP");
    // args

    const argumentNameInput = (await screen.findByTestId(
      "argument-name-input"
    )) as HTMLInputElement;
    expect(argumentNameInput).toBeInTheDocument();
    expect(argumentNameInput.value).toBe("");
    fireEvent.change(argumentNameInput, {
      target: { value: "newName" },
    });
    expect(argumentNameInput.value).toBe("newName");

    const dataTypeDropdown = await screen.findByTestId(
      "arg-type-selector-input"
    );
    fireEvent.change(dataTypeDropdown, {
      target: { value: "Boolean" },
    });

    const addButton = screen.getByTestId("function-argument-add-btn");
    expect(addButton).toBeInTheDocument();
    expect(addButton).toBeEnabled();

    fireEvent.click(addButton);

    const functionArgumentTable = screen.getByTestId("function-argument-tbl");
    expect(functionArgumentTable).toBeInTheDocument();
    const tableRow = functionArgumentTable.querySelector("tbody").children[0];
    expect(tableRow.children[1].textContent).toEqual("newName");
  });
});

describe("getNewExpressionsAndLines", () => {
  it("should insert the formatted expression at the cursor position when cursorPosition is provided and autoInsert is false", () => {
    const values = { name: "test", type: "Functions" };
    const cursorPosition = { row: 1, column: 5 };
    const expressionEditorValue = "Line 1\ntesttesttest2 content\nLine 3";
    const autoInsert = false;
    const result = getNewExpressionsAndLines(
      values,
      cursorPosition,
      expressionEditorValue,
      autoInsert
    );

    expect(result[0]).toBe("Line 1\ntestttestesttest2 content\nLine 3");
    expect(result[1]).toEqual({ row: 1, column: 9 });
  });

  it("should append the formatted expression to a new line when cursorPosition is not provided or autoInsert is true", () => {
    const values = { name: "test", type: "Functions" };
    const cursorPosition = null;
    const expressionEditorValue = "Line 1\nLine 2 content\nLine 3";
    const autoInsert = true;

    const result = getNewExpressionsAndLines(
      values,
      cursorPosition,
      expressionEditorValue,
      autoInsert
    );

    expect(result[0]).toBe("Line 1\nLine 2 content\nLine 3\ntest");
    expect(result[1]).toEqual({ row: 3, column: 4 });
  });
});
