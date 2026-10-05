import * as React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import Includes from "./Includes";
import userEvent from "@testing-library/user-event";
import { mockServiceConfig } from "../../__mocks__/mockServiceConfig";

jest.mock("../../api/axios-instance");

jest.mock("../../api/useServiceConfig", () => {
  return {
    useServiceConfig: jest.fn(() => Promise.resolve(mockServiceConfig)),
  };
});

const { getByTestId, getByRole } = screen;
const cql =
  "library CaseWhenThen version '0.3.000'\n" +
  "using QDM version '5.6'\n" +
  "include CancerLinQ version '1.5.000' called CancerLinQQ";

const props = {
  cql: cql,
  canEdit: true,
  measureModel: "QDM",
  isCQLUnchanged: false,
  setIsCQLUnchanged: () => jest.fn(),
  setEditorValue: () => jest.fn(),
  handleApplyLibrary: () => jest.fn(),
  handleEditLibrary: () => jest.fn(),
  handleDeleteLibrary: () => jest.fn(),
  hasCqlError: false,
};

describe("Includes", () => {
  it("Should renders Includes component", async () => {
    render(<Includes {...props} />);
    expect(getByTestId("includes-panel")).toBeInTheDocument();
    expect(getByTestId("searchTerm-text-input")).toBeEnabled();
    // by default Library tab active
    expect(getByRole("tab", { name: /Library/i })).toHaveAttribute(
      "aria-selected"
    );
    // switch over to saved library tab
    const savedLibraryTab = getByRole("tab", { name: /Saved Libraries/i });
    userEvent.click(savedLibraryTab);
    expect(savedLibraryTab).toHaveAttribute("aria-selected");
    await waitFor(() => {
      expect(savedLibraryTab).toHaveTextContent("Saved Libraries (1)");
    });
  });

  it("Should display not display included libraries when CQL has errors", async () => {
    const newProps = { ...props, hasCqlError: true };
    render(<Includes {...newProps} />);
    userEvent.click(await screen.findByTestId("saved-libraries-tab"));

    const savedLibrariesTable = await screen.findByTestId(
      "library-results-tbl"
    );
    expect(savedLibrariesTable).toBeInTheDocument();
    const tableBody = await screen.findByTestId("library-results-table-body");
    expect(tableBody).toBeInTheDocument();
    const visibleRows = await within(tableBody).findAllByRole("row");
    expect(visibleRows).toHaveLength(1);
    expect(visibleRows[0]).toHaveTextContent("No Results were found");
  });
});
