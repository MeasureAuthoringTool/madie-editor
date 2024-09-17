import * as React from "react";
import axios from "../../../api/axios-instance";
import { mockServiceConfig } from "../../../__mocks__/mockServiceConfig";
import { mockCqlLibraries } from "../../__mocks__/MockCqlLibraries";
import { render, waitFor } from "@testing-library/react";
import SavedLibraryIncludes from "./SavedLibraryIncludes";
import { screen } from "@testing-library/dom";
import { fetchVersionedLibrariesErrorMessage } from "../../../api/useCqlLibraryServiceApi";
import userEvent from "@testing-library/user-event";

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

const props = {
  cql: cql,
  canEdit: true,
  measureModel: "QDM",
  handleDeleteLibrary: jest.fn(),
  isCQLUnchanged: true,
  setEditorValue: jest.fn(),
  setIsCQLUnchanged: jest.fn(),
};

describe("SavedLibraryIncludes Component tests", () => {
  beforeEach(() => {
    mockedAxios.get.mockImplementation((url) =>
      Promise.resolve({
        data: mockCqlLibraries[0],
        status: 200,
      })
    );
  });

  it("Should render included libraries", async () => {
    render(<SavedLibraryIncludes {...props} />);
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
    render(<SavedLibraryIncludes {...props} />);
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
    render(<SavedLibraryIncludes {...props} />);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        fetchVersionedLibrariesErrorMessage
      );
    });
  });

  it("Should delete included library when clicked on delete button", async () => {
    render(<SavedLibraryIncludes {...props} />);

    await waitFor(() => {
      const deleteBtn = screen.getByRole("button", {
        name: /delete-button-0/i,
      });
      userEvent.click(deleteBtn);
    });
    const confirmationDialog = screen.getByRole("dialog");
    expect(confirmationDialog).toBeInTheDocument();
    const confirmDelete = screen.getByRole("button", {
      name: /Yes, Delete/i,
    });
    userEvent.click(confirmDelete);
    expect(props.handleDeleteLibrary).toHaveBeenCalled();
  });

  it("Should show discard change dialog if cql is changes before proceeding to delete included library", async () => {
    render(<SavedLibraryIncludes {...props} isCQLUnchanged={false} />);

    await waitFor(() => {
      const deleteBtn = screen.getByRole("button", {
        name: /delete-button-0/i,
      });
      userEvent.click(deleteBtn);
    });
    const discardChangeDialog = screen.getByRole("dialog");
    expect(discardChangeDialog).toBeInTheDocument();
    const discardChangeButton = screen.getByRole("button", {
      name: /Yes, Discard All Changes/i,
    });
    userEvent.click(discardChangeButton);
    expect(props.setEditorValue).toHaveBeenCalled();
  });

  it("Should show discard change dialog if cql is changes before proceeding to edit included library", async () => {
    render(<SavedLibraryIncludes {...props} isCQLUnchanged={false} />);

    await waitFor(() => {
      const editBtn = screen.getByRole("button", {
        name: /edit-button-0/i,
      });
      userEvent.click(editBtn);
    });
    const discardChangeDialog = screen.getByRole("dialog");
    expect(discardChangeDialog).toBeInTheDocument();
    const discardChangeButton = screen.getByRole("button", {
      name: /Yes, Discard All Changes/i,
    });
    userEvent.click(discardChangeButton);
    expect(props.setEditorValue).toHaveBeenCalled();
    expect(props.isCQLUnchanged).toBe(true);
  });

  it("Should show discard change dialog if cql is changes before proceeding to edit included library and click on cancel should close the discard dialog", async () => {
    render(<SavedLibraryIncludes {...props} isCQLUnchanged={false} />);

    await waitFor(() => {
      const editBtn = screen.getByRole("button", {
        name: /edit-button-0/i,
      });
      userEvent.click(editBtn);
    });
    const discardChangeDialog = screen.getByRole("dialog");
    expect(discardChangeDialog).toBeInTheDocument();
    const keepWorkingButton = screen.getByRole("button", {
      name: /No, Keep Working/i,
    });
    userEvent.click(keepWorkingButton);

    await waitFor(() => {
      expect(discardChangeDialog).not.toBeInTheDocument();
    });
  });
});
