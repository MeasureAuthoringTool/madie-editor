import * as React from "react";
import { render, waitFor } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import LibrarySearch from "./LibrarySearch";
import userEvent from "@testing-library/user-event";
import axios from "../../api/axios-instance";
import { fetchVersionedLibrariesErrorMessage } from "../../api/useCqlLibraryServiceApi";
import { mockServiceConfig } from "../../__mocks__/mockServiceConfig";
import { mockCqlLibraries } from "../__mocks__/MockCqlLibraries";

jest.mock("../../api/axios-instance");
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock("../../api/useServiceConfig", () => {
  return {
    useServiceConfig: jest.fn(() => Promise.resolve(mockServiceConfig)),
  };
});

jest.mock("@madie/madie-util", () => ({
  useOktaTokens: () => ({ getAccessToken: () => "test.jwt" }),
}));

describe("LibrarySearch component tests", () => {
  it("should render default state of LibrarySearch component", () => {
    render(<LibrarySearch canEdit={true} measureModel="QDM" />);
    const searchInput = screen.getByRole("textbox", {
      name: /Library Search/i,
    });
    expect(searchInput).toBeInTheDocument();

    const searchBtn = screen.getByTestId("search-btn");
    expect(searchBtn).toBeDisabled();

    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
    const tableBody = table.querySelector("tbody");
    expect(tableBody).toHaveTextContent("No Results were found");
  });

  it("should search on search term and display matching libraries", async () => {
    mockedAxios.get.mockImplementation((url) =>
      Promise.resolve({
        data: [mockCqlLibraries[0], mockCqlLibraries[1]],
        status: 200,
      })
    );

    render(<LibrarySearch canEdit={true} measureModel="QDM" />);
    const searchInput = screen.getByRole("textbox", {
      name: /Library Search/i,
    });
    userEvent.type(searchInput, "Helper");
    const searchBtn = screen.getByTestId("search-btn");
    expect(searchBtn).toBeEnabled();
    userEvent.click(searchBtn);

    const expectation = [
      [
        mockCqlLibraries[0].cqlLibraryName,
        mockCqlLibraries[0].version,
        mockCqlLibraries[0].librarySet.owner,
        "View/Apply",
      ],
      [
        mockCqlLibraries[1].cqlLibraryName,
        mockCqlLibraries[1].version,
        mockCqlLibraries[1].librarySet.owner,
        "View/Apply",
      ],
    ];
    await waitFor(() => {
      const table = screen.getByRole("table");
      const rows = table.querySelectorAll("tbody tr");
      rows.forEach((row, index) => {
        const columns = row.querySelectorAll("td");
        const rowText = Array.from(columns).map((c) => c.textContent.trim());
        expect(rowText).toEqual(expectation[index]);
      });
    });
  });

  it("should show error toast if rendering libraries failed", async () => {
    mockedAxios.get.mockImplementation((url) =>
      Promise.reject({ status: 400 })
    );

    render(<LibrarySearch canEdit={true} measureModel="QDM" />);
    const searchInput = screen.getByRole("textbox", {
      name: /Library Search/i,
    });
    userEvent.type(searchInput, "Helper");
    const searchBtn = screen.getByTestId("search-btn");
    userEvent.click(searchBtn);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        fetchVersionedLibrariesErrorMessage
      );
    });
  });

  it("should show working pagination", async () => {
    mockedAxios.get.mockImplementation((url) =>
      // total 12 libraries
      Promise.resolve({ data: mockCqlLibraries, status: 200 })
    );

    await render(<LibrarySearch canEdit={true} measureModel="QDM" />);
    const searchInput = screen.getByRole("textbox", {
      name: /Library Search/i,
    });
    userEvent.type(searchInput, "Helper");
    const searchBtn = screen.getByTestId("search-btn");
    userEvent.click(searchBtn);

    const limitChangeButton = await screen.findByRole("button", {
      expanded: false,
    });
    expect(limitChangeButton).toBeInTheDocument();
    userEvent.click(limitChangeButton);
    const options = await screen.findAllByRole("option");
    expect(options).toHaveLength(4);
    userEvent.click(options[1]); // select 10 items per page option
    // confirm 10 libraries are on the page
    const table = screen.getByRole("table");
    expect(table).toBeInTheDocument();
    const tableBody = table.querySelector("tbody");
    await waitFor(() => {
      expect(tableBody.children.length).toBe(10);
    });

    // go to page 2
    const page2 = await screen.findByLabelText("Go to page 2");
    userEvent.click(page2);
    await waitFor(() => {
      // should show remaining 2 libraries
      expect(tableBody.children.length).toBe(2);
    });
  });

  it("should show library details dialog on view/apply btn click", async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes("/all-versioned")) {
        return Promise.resolve({
          data: [mockCqlLibraries[0], mockCqlLibraries[1]],
          status: 200,
        });
      } else {
        return Promise.resolve({
          data: "cql string",
          status: 200,
        });
      }
    });

    render(<LibrarySearch canEdit={true} measureModel="QDM" />);
    const searchInput = screen.getByRole("textbox", {
      name: /Library Search/i,
    });
    userEvent.type(searchInput, "Helper");
    const searchBtn = screen.getByTestId("search-btn");
    userEvent.click(searchBtn);
    await waitFor(() => {
      const viewApplyBtn = screen.getByRole("button", {
        name: /view-apply-btn-0_apply/i,
      });
      userEvent.click(viewApplyBtn);
    });
    expect(screen.getByTestId("view-apply-library-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("library-alias-input")).toBeEmptyDOMElement();
    expect(screen.getByTestId("library-name")).toHaveTextContent(
      mockCqlLibraries[0].cqlLibraryName
    );
    expect(screen.getByTestId("version-select-input").value).toEqual(
      mockCqlLibraries[0].version
    );
    expect(screen.getByTestId("library-owner")).toHaveTextContent(
      mockCqlLibraries[0].librarySet.owner
    );
  });
});
