import * as React from "react";
import { render, waitFor, within } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import LibrarySearch from "./LibrarySearch";
import userEvent from "@testing-library/user-event";
import axios from "../../../api/axios-instance";
import {
  fetchCqlErrorMessage,
  fetchVersionedLibrariesErrorMessage,
} from "../../../api/useCqlLibraryServiceApi";
import { mockServiceConfig } from "../../../__mocks__/mockServiceConfig";
import { mockCqlLibraries } from "../../__mocks__/MockCqlLibraries";

jest.mock("../../../api/axios-instance");
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock("../../../api/useServiceConfig", () => {
  return {
    useServiceConfig: jest.fn(() => Promise.resolve(mockServiceConfig)),
  };
});

jest.mock("@madie/madie-util", () => ({
  useOktaTokens: () => ({ getAccessToken: () => "test.jwt" }),
}));

const handleApplyLibrary = jest.fn();

describe("LibrarySearch component tests", () => {
  const renderLibrarySearchComponent = () => {
    render(
      <LibrarySearch
        canEdit={true}
        measureModel="QDM"
        handleApplyLibrary={handleApplyLibrary}
        cql={""}
        isCQLUnchanged={true}
        setIsCQLUnchanged={jest.fn()}
        setEditorValue={jest.fn()}
      />
    );
  };

  it("should render default state of LibrarySearch component", () => {
    renderLibrarySearchComponent();
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

  it("should display NPM libraries in search results and apply them with their prefix", async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes("/cql-libraries/library-set/ext-set")) {
        return Promise.resolve({
          data: {
            librarySet: {},
            libraries: [
              {
                id: "ext-1",
                cqlLibraryName: "FHIRCommon",
                version: "2.0.0",
                librarySetId: "ext-set",
                namespacePrefix: "hl7.fhir.uv.cql",
                publisher: "HL7 International",
                cql: "library FHIRCommon version '2.0.0'",
                external: true,
              },
            ],
          },
          status: 200,
        });
      }
      return Promise.resolve({
        data: [
          {
            id: "ext-1",
            cqlLibraryName: "FHIRCommon",
            externalVersion: "2.0.0",
            librarySetId: "ext-set",
            namespacePrefix: "hl7.fhir.uv.cql",
            ownerDisplayName: "HL7 International",
            externalLibrary: true,
          },
        ],
        status: 200,
      });
    });
    render(
      <LibrarySearch
        canEdit={true}
        measureModel="US Quality Core v0.5.0"
        handleApplyLibrary={handleApplyLibrary}
        cql={
          "library Test version '0.0.000'\nusing USQualityCore version '0.5.0'"
        }
        isCQLUnchanged={true}
        setIsCQLUnchanged={jest.fn()}
        setEditorValue={jest.fn()}
      />
    );
    userEvent.type(
      screen.getByRole("textbox", { name: /Library Search/i }),
      "FHIRCommon"
    );
    userEvent.click(screen.getByTestId("search-btn"));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/cql-libraries/all-versioned"),
        expect.objectContaining({
          params: expect.objectContaining({
            usingModels: "USQualityCore:0.5.0",
          }),
        })
      );
    });
    const table = screen.getByRole("table");
    await waitFor(() => {
      const columns = table.querySelectorAll("tbody tr td");
      expect(
        Array.from(columns)
          .slice(0, 3)
          .map((c) => c.textContent.trim())
      ).toEqual([
        "hl7.fhir.uv.cql.FHIRCommonFrom HL7 IG",
        "2.0.0",
        "HL7 International",
      ]);
    });

    userEvent.click(screen.getByTestId("edit-button-0"));
    const dialog = await screen.findByTestId("view-apply-library-dialog");
    expect(
      within(dialog).getByTestId("library-name-container")
    ).toHaveTextContent("hl7.fhir.uv.cql.FHIRCommon");
    userEvent.type(within(dialog).getByTestId("library-alias-input"), "FC");
    userEvent.click(within(dialog).getByTestId("apply-button"));
    await waitFor(() => {
      expect(handleApplyLibrary).toHaveBeenCalledWith({
        name: "hl7.fhir.uv.cql.FHIRCommon",
        version: "2.0.0",
        alias: "FC",
      });
    });
  });

  it("should display NPM library prefix without quotes but apply it quoted where needed", async () => {
    const npmLibrary = {
      id: "ext-uqc",
      cqlLibraryName: "USQualityCoreCommon",
      librarySetId: "ext-uqc-set",
      namespacePrefix: "fhir.onc.us-quality-core",
    };
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes("/cql-libraries/library-set/ext-uqc-set")) {
        return Promise.resolve({
          data: {
            librarySet: {},
            libraries: [
              {
                ...npmLibrary,
                version: "0.5.0",
                cql: "library USQualityCoreCommon version '0.5.0'",
                external: true,
              },
            ],
          },
          status: 200,
        });
      }
      return Promise.resolve({
        data: [
          {
            ...npmLibrary,
            externalVersion: "0.5.0",
            ownerDisplayName: "ONC",
            externalLibrary: true,
          },
        ],
        status: 200,
      });
    });
    render(
      <LibrarySearch
        canEdit={true}
        measureModel="US Quality Core v0.5.0"
        handleApplyLibrary={handleApplyLibrary}
        cql={""}
        isCQLUnchanged={true}
        setIsCQLUnchanged={jest.fn()}
        setEditorValue={jest.fn()}
      />
    );
    userEvent.type(
      screen.getByRole("textbox", { name: /Library Search/i }),
      "USQualityCoreCommon"
    );
    userEvent.click(screen.getByTestId("search-btn"));

    const table = screen.getByRole("table");
    await waitFor(() => {
      const nameCell = table.querySelector("tbody tr td");
      expect(nameCell.textContent).toEqual(
        "fhir.onc.us-quality-core.USQualityCoreCommon" + "From HL7 IG"
      );
    });

    userEvent.click(screen.getByTestId("edit-button-0"));
    const dialog = await screen.findByTestId("view-apply-library-dialog");
    expect(
      within(dialog).getByTestId("library-name-container")
    ).toHaveTextContent("fhir.onc.us-quality-core.USQualityCoreCommon");
    userEvent.type(within(dialog).getByTestId("library-alias-input"), "UQC");
    userEvent.click(within(dialog).getByTestId("apply-button"));
    await waitFor(() => {
      expect(handleApplyLibrary).toHaveBeenCalledWith({
        name: 'fhir.onc."us-quality-core".USQualityCoreCommon',
        version: "0.5.0",
        alias: "UQC",
      });
    });
  });

  it("should search on search term and display matching libraries", async () => {
    mockedAxios.get.mockImplementation((url) =>
      Promise.resolve({
        data: [mockCqlLibraries[0], mockCqlLibraries[1]],
        status: 200,
      })
    );
    renderLibrarySearchComponent();
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
        mockCqlLibraries[0].ownerDisplayName,
        "View / Apply",
      ],
      [
        mockCqlLibraries[1].cqlLibraryName,
        mockCqlLibraries[1].version,
        mockCqlLibraries[1].ownerDisplayName,
        "View / Apply",
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
    renderLibrarySearchComponent();
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

    renderLibrarySearchComponent();
    const searchInput = screen.getByRole("textbox", {
      name: /Library Search/i,
    });
    userEvent.type(searchInput, "Helper");
    const searchBtn = screen.getByTestId("search-btn");
    userEvent.click(searchBtn);
    const limitChangeButton = await screen.findByRole("combobox", {
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

  it("should show validation errors on library alias when there are spaces or alpha numeric characters", async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes("/all-versioned")) {
        return Promise.resolve({
          data: [mockCqlLibraries[0], mockCqlLibraries[1], mockCqlLibraries[2]],
          status: 200,
        });
      } else if (url.includes("/library-set")) {
        const librarySet = {
          librarySet: mockCqlLibraries[0].librarySet,
          libraries: [
            mockCqlLibraries[0],
            mockCqlLibraries[1],
            mockCqlLibraries[2],
          ],
        };
        return Promise.resolve({
          data: librarySet,
          status: 200,
        });
      }
    });
    renderLibrarySearchComponent();
    const searchInput = screen.getByRole("textbox", {
      name: /Library Search/i,
    });
    userEvent.type(searchInput, "Helper");
    const searchBtn = screen.getByTestId("search-btn");
    userEvent.click(searchBtn);
    await waitFor(() => {
      const viewApplyBtn = screen.getByTestId("edit-button-0");
      userEvent.click(viewApplyBtn);
    });
    const versionSelect = screen.getByTestId("version-select");
    // Change the version
    userEvent.click(await within(versionSelect).getByRole("combobox"));
    const versionOptions = await screen.findAllByRole("option");
    expect(versionOptions.length).toBe(3);
    // select 2nd option
    userEvent.click(versionOptions[1]);
    await waitFor(() => {
      expect(versionSelect).toHaveTextContent(mockCqlLibraries[1].version);
    });
    const applyBtn = screen.getByRole("button", { name: /Apply/i });
    expect(applyBtn).toBeDisabled();
    // type alias value
    userEvent.type(
      screen.getByRole("textbox", { name: /Library Alias/i }),
      "Test!"
    );

    await waitFor(() => {
      expect(applyBtn).toBeDisabled();
      expect(
        screen.getByText(
          "Library Alias must not contain spaces or other special characters"
        )
      ).toBeInTheDocument();
    });
  });

  it("should show library details dialog on view/apply btn click", async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes("/all-versioned")) {
        return Promise.resolve({
          data: [mockCqlLibraries[0], mockCqlLibraries[1], mockCqlLibraries[2]],
          status: 200,
        });
      } else if (url.includes("/library-set")) {
        const librarySet = {
          librarySet: mockCqlLibraries[0].librarySet,
          libraries: [
            mockCqlLibraries[0],
            mockCqlLibraries[1],
            mockCqlLibraries[2],
          ],
        };
        return Promise.resolve({
          data: librarySet,
          status: 200,
        });
      }
    });
    renderLibrarySearchComponent();
    const searchInput = screen.getByRole("textbox", {
      name: /Library Search/i,
    });
    userEvent.type(searchInput, "Helper");
    const searchBtn = screen.getByTestId("search-btn");
    userEvent.click(searchBtn);
    await waitFor(() => {
      const viewApplyBtn = screen.getByTestId("edit-button-0");
      userEvent.click(viewApplyBtn);
    });
    const versionSelect = screen.getByTestId("version-select");
    expect(screen.getByTestId("view-apply-library-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("library-alias-input")).toBeEmptyDOMElement();
    expect(screen.getByTestId("library-name-container")).toHaveTextContent(
      mockCqlLibraries[0].cqlLibraryName
    );
    expect(versionSelect).toHaveTextContent(mockCqlLibraries[0].version);
    expect(screen.getByTestId("library-owner-container")).toHaveTextContent(
      mockCqlLibraries[0].librarySet.owner
    );
    // Change the version
    userEvent.click(await within(versionSelect).getByRole("combobox"));
    const versionOptions = await screen.findAllByRole("option");
    expect(versionOptions.length).toBe(3);
    // select 2nd option
    userEvent.click(versionOptions[1]);
    await waitFor(() => {
      expect(versionSelect).toHaveTextContent(mockCqlLibraries[1].version);
    });
    const applyBtn = screen.getByRole("button", { name: /Apply/i });
    expect(applyBtn).toBeDisabled();
    // type alias value
    userEvent.type(
      screen.getByRole("textbox", { name: /Library Alias/i }),
      "Test"
    );
    expect(applyBtn).toBeEnabled();
    userEvent.click(applyBtn);
    await waitFor(() => {
      expect(handleApplyLibrary).toHaveBeenCalled();
    });
  });

  it("should show error if opening library details dialog error out", async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes("/all-versioned")) {
        return Promise.resolve({
          data: [mockCqlLibraries[0], mockCqlLibraries[1]],
          status: 200,
        });
      } else {
        return Promise.reject({
          status: 500,
        });
      }
    });
    renderLibrarySearchComponent();
    const searchInput = screen.getByRole("textbox", {
      name: /Library Search/i,
    });
    userEvent.type(searchInput, "Helper");
    const searchBtn = screen.getByTestId("search-btn");
    userEvent.click(searchBtn);
    await waitFor(() => {
      const viewApplyBtn = screen.getByTestId("edit-button-0");
      userEvent.click(viewApplyBtn);
    });
    expect(screen.getByRole("alert")).toHaveTextContent(fetchCqlErrorMessage);
  });
});
