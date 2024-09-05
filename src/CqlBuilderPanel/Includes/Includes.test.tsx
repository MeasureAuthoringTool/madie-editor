import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Includes from "./Includes";
import userEvent from "@testing-library/user-event";

const { getByTestId, getByRole } = screen;
const cql =
  "library CaseWhenThen version '0.3.000'\n" +
  "using QDM version '5.6'\n" +
  "include CancerLinQ version '1.5.000' called CancerLinQQ";

describe("Includes", () => {
  it("Should renders Includes component", async () => {
    render(
      <Includes
        canEdit
        measureModel={"QDM"}
        handleApplyLibrary={jest.fn}
        cql={cql}
        handleDeleteLibrary={jest.fn}
        isCQLUnchanged={false}
        setEditorValue={jest.fn}
      />
    );
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
});
