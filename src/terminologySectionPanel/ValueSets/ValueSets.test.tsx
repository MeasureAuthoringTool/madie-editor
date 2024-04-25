import React from "react";
import { expect, describe, it } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { within } from "@testing-library/dom";
import ValueSets from "./ValueSets";

const { getByTestId, getByRole, getByText, queryByTestId, getByLabelText } =
  screen;
describe("ValueSets Page", () => {
  it("Should not catch fire, should display all categories", () => {
    render(<ValueSets canEdit />);
    expect(getByTestId("madie-editor-search")).toBeInTheDocument();

    expect(
      getByTestId("terminology-section-Search-sub-heading")
    ).toBeInTheDocument();
    expect(
      getByTestId("terminology-section-Filter-sub-heading")
    ).toBeInTheDocument();
    expect(
      getByTestId("terminology-section-Results-sub-heading")
    ).toBeInTheDocument();
  });
  it("Should use a type ahead field to add and remove search categories", async () => {
    render(<ValueSets canEdit />);
    const categoriesSelectButton = getByRole("button", {
      name: "Open",
    });
    userEvent.click(categoriesSelectButton);
    userEvent.click(getByText("Code"));
    userEvent.click(categoriesSelectButton);
    userEvent.click(getByText("Status"));
    userEvent.click(categoriesSelectButton);
    userEvent.click(getByText("Title"));
    expect(getByTestId("code-text-input")).toBeInTheDocument();
    expect(getByTestId("status-text-input")).toBeInTheDocument();
    expect(getByTestId("title-text-input")).toBeInTheDocument();
    const deleteCodeButton = getByRole("button", { name: "Code" });
    const deleteIcon = within(deleteCodeButton).getByTestId("CancelIcon");
    userEvent.click(deleteIcon);
    await waitFor(() => {
      expect(queryByTestId("code-text-input")).not.toBeInTheDocument();
    });
    const clearButton = getByLabelText("Clear");
    userEvent.click(clearButton);
    await waitFor(() => {
      expect(queryByTestId("status-text-input")).not.toBeInTheDocument();
      expect(queryByTestId("title-text-input")).not.toBeInTheDocument();
    });
  });

  it("Should enable submit button when a dynamic search field has text in it, should remove all values on clear", async () => {
    render(<ValueSets canEdit />);
    const categoriesSelectButton = getByRole("button", {
      name: "Open",
    });
    userEvent.click(categoriesSelectButton);
    userEvent.click(getByText("Code"));
    const codeTextInput = (await screen.findByRole("textbox", {
      name: "Search Code",
    })) as HTMLInputElement;
    expect(codeTextInput).toBeInTheDocument();
    userEvent.clear(codeTextInput);
    userEvent.type(codeTextInput, "test");
    expect(codeTextInput.value).toEqual("test");
    await waitFor(() => {
      expect(getByTestId("valuesets-search-btn")).toBeEnabled();
      expect(getByTestId("clear-valuesets-btn")).toBeEnabled();
    });
    userEvent.click(getByTestId("clear-valuesets-btn"));
    await waitFor(() => {
      expect(queryByTestId("code-text-input")).not.toBeInTheDocument();
      expect(getByTestId("clear-valuesets-btn")).not.toBeEnabled();
    });
  });

  it("Should enable submit button when a dynamic Filter field has text in it, should remove all values on clear", async () => {
    render(<ValueSets canEdit />);
    const filterRow = getByTestId("terminology-section-Filter-sub-heading");
    const openRow = within(filterRow).getByRole("button");

    userEvent.click(openRow);

    const filterSelectButton = within(filterRow).getByRole("button", {
      name: "Open",
    });
    userEvent.click(filterSelectButton);
    userEvent.click(getByText("Author"));
    const filterInput = (await screen.findByRole("textbox", {
      name: "Filter by Author",
    })) as HTMLInputElement;
    expect(filterInput).toBeInTheDocument();
    userEvent.clear(filterInput);
    userEvent.type(filterInput, "test");
    expect(filterInput.value).toEqual("test");
    await waitFor(() => {
      expect(getByTestId("valuesets-filter-btn")).toBeEnabled();
      expect(getByTestId("clear-filters-btn")).toBeEnabled();
    });
    userEvent.click(getByTestId("clear-filters-btn"));
    await waitFor(() => {
      expect(queryByTestId("author-text-input")).not.toBeInTheDocument();
      expect(getByTestId("clear-filters-btn")).not.toBeEnabled();
    });
  });

  it("Should use a type ahead field to add and remove filters", async () => {
    render(<ValueSets canEdit />);
    const filterRow = getByTestId("terminology-section-Filter-sub-heading");
    const openRow = within(filterRow).getByRole("button");

    userEvent.click(openRow);

    const filterSelectButton = within(filterRow).getByRole("button", {
      name: "Open",
    });
    userEvent.click(filterSelectButton);
    userEvent.click(getByText("Author"));
    userEvent.click(filterSelectButton);
    userEvent.click(getByText("Title"));
    userEvent.click(filterSelectButton);
    userEvent.click(getByText("Status"));
    expect(getByTestId("author-text-input")).toBeInTheDocument();
    expect(getByTestId("title-text-input")).toBeInTheDocument();
    expect(getByTestId("status-text-input")).toBeInTheDocument();

    const deleteCodeButton = getByRole("button", { name: "Author" });
    const deleteIcon = within(deleteCodeButton).getByTestId("CancelIcon");
    userEvent.click(deleteIcon);
    await waitFor(() => {
      expect(queryByTestId("author-text-input")).not.toBeInTheDocument();
    });
    const clearButton = getByLabelText("Clear");
    userEvent.click(clearButton);
    await waitFor(() => {
      expect(queryByTestId("title-text-input")).not.toBeInTheDocument();
      expect(queryByTestId("status-text-input")).not.toBeInTheDocument();
    });
  });
});
