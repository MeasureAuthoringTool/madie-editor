import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it } from "@jest/globals";
import "@testing-library/jest-dom";
import FunctionBuilder from "./FunctionBuilder";

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
});
