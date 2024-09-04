import * as React from "react";
import axios from "../../../api/axios-instance";
import { mockServiceConfig } from "../../../__mocks__/mockServiceConfig";
import { mockCqlLibraries } from "../../__mocks__/MockCqlLibraries";
import { render, waitFor } from "@testing-library/react";
import SavedLibraryIncludes from "./SavedLibraryIncludes";
import { screen } from "@testing-library/dom";
import { fetchVersionedLibrariesErrorMessage } from "../../../api/useCqlLibraryServiceApi";

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

const cql =
  "library CaseWhenThen version '0.3.000'\n" +
  "using QDM version '5.6'\n" +
  "include Test12 version '2.2.000' called Test";

describe("SavedLibraryIncludes Component tests", () => {
  it("Should render included libraries", async () => {
    mockedAxios.get.mockImplementation((url) =>
      Promise.resolve({
        data: mockCqlLibraries[0],
        status: 200,
      })
    );
    render(
      <SavedLibraryIncludes
        cql={cql}
        canEdit={true}
        measureModel="QDM"
        handleDeleteLibrary={jest.fn}
        isCQLUnchanged
      />
    );
    const expectation = [
      [
        mockCqlLibraries[0].alias,
        mockCqlLibraries[0].cqlLibraryName,
        mockCqlLibraries[0].version,
        mockCqlLibraries[0].librarySet.owner,
        "",
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

  it("Should render no includes if cql does not include one", async () => {
    const cql =
      "library CaseWhenThen version '0.3.000'\nusing QDM version '5.6'";
    render(
      <SavedLibraryIncludes
        cql={cql}
        canEdit={true}
        measureModel="QDM"
        handleDeleteLibrary={jest.fn}
        isCQLUnchanged
      />
    );
    const table = screen.getByRole("table");
    const tableBody = table.querySelector("tbody");
    expect(tableBody).toHaveTextContent("No Results were found");
  });

  it("Should render an error if fetching included libraries failed", async () => {
    mockedAxios.get.mockImplementation((url) =>
      Promise.reject({
        status: 500,
      })
    );
    render(
      <SavedLibraryIncludes
        cql={cql}
        canEdit={true}
        measureModel="QDM"
        handleDeleteLibrary={jest.fn}
        isCQLUnchanged
      />
    );
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        fetchVersionedLibrariesErrorMessage
      );
    });
  });
});
