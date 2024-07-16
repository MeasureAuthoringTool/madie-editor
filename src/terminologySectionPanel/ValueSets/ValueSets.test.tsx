import React from "react";
import axios from "../../api/axios-instance";
import { expect, describe, it } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { within } from "@testing-library/dom";
import ValueSets from "./ValueSets";
import { act } from "react-dom/test-utils";
import { ServiceConfig } from "../../api/useServiceConfig";
import { TerminologyServiceApi } from "../../api/useTerminologyServiceApi";

jest.mock("../../api/axios-instance");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockConfig: ServiceConfig = {
  elmTranslationService: {
    baseUrl: "elm.com",
  },
  terminologyService: {
    baseUrl: "terminology.com",
  },
};

const mockValueSet = {
  codeSystem: "urn:oid:2.16.840.1.113762.1.4.1200.105",
  name: "AtraumaticChestPainNonCardiac",
  oid: "ValueSet/2.16.840.1.113762.1.4.1200.105-20201122/_history/4",
  status: "ACTIVE",
  steward: "Cliniwiz Steward",
  title: "Atraumatic Chest Pain Non Cardiac",
  url: "http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1200.105",
  version: "20201122",
};
const mockResult = jest
  .fn()
  .mockImplementation(
    (x) => x?.code === "test" && Promise.resolve([mockValueSet])
  );

const mockTerminologyServiceApi = {
  searchValueSets: jest
    .fn()
    .mockResolvedValue({ valueSets: [mockValueSet], resultBundle: "" }),
} as unknown as TerminologyServiceApi;

jest.mock("../../api/useTerminologyServiceApi", () =>
  jest.fn(() => mockTerminologyServiceApi)
);

const { getByTestId, getByRole, getByText, queryByTestId, getByLabelText } =
  screen;
describe("Add Tests for MAT-7328 Trim Whitespace", () => {
  it("Should enable submit button when a dynamic Filter field has text in it, should remove all values on clear", async () => {
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
    userEvent.type(codeTextInput, "  test");
    expect(codeTextInput.value).toEqual("  test");
    await waitFor(() => {
      expect(getByTestId("valuesets-search-btn")).toBeEnabled();
      expect(getByTestId("clear-valuesets-btn")).toBeEnabled();
    });
    act(() => {
      userEvent.click(getByTestId("valuesets-search-btn"));
    });
    await waitFor(() => {
      expect(getByTestId("madie-spinner")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getByTestId("madie-editor-search-results")).toBeInTheDocument();
    });

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
    act(() => {
      userEvent.click(getByTestId("valuesets-filter-btn"));
    });
  });
});
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
    act(() => {
      userEvent.click(getByTestId("valuesets-search-btn"));
    });
    await waitFor(() => {
      expect(getByTestId("madie-spinner")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(getByTestId("madie-editor-search-results")).toBeInTheDocument();
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
