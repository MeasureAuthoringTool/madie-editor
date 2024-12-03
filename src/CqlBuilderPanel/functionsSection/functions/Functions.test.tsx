import * as React from "react";
import { render, waitFor, act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Functions from "./Functions";
import { FunctionLookup } from "../../../model/CqlBuilderLookup";

const saveFunctions = [
  {
    name: "isFinishedEncounter",
    libraryName: null,
    libraryAlias: null,
    logic:
      "define fluent function \"isFinishedEncounter\"(Enc Encounter):\n(Enc E where E.status = 'finished') is not null",
    comment: "",
    isFluent: "Yes",
    argumentNames: [
      "Enc1 Encounter",
      "Enc2 Encounter",
      "Enc3 Encounter",
      "Enc4 Encounter",
    ],
  },
];

const testFunctions = [
  {
    name: "Test Function 1",
    libraryName: undefined,
    libraryAlias: null,
    logic:
      "define fluent function \"isFinishedEncounter\"(Enc Encounter):\n(Enc E where E.status = 'finished') is not null",
    isFluent: "Yes",
    argumentNames: ["Enc Encounter"],
  },
  {
    name: "Test Function 2",
    libraryName: null,
    libraryAlias: null,
    logic:
      "define fluent function \"isFinishedEncounter\"(Enc Encounter):\n(Enc E where E.status = 'finished') is not null",
    isFluent: "Yes",
    argumentNames: ["Enc Encounter"],
  },
  {
    name: "Test Function 3",
    libraryName: null,
    libraryAlias: null,
    logic:
      "define fluent function \"isFinishedEncounter\"(Enc Encounter):\n(Enc E where E.status = 'finished') is not null",
    isFluent: "Yes",
    argumentNames: ["Enc Encounter"],
  },
  {
    name: "Test Function 4",
    libraryName: null,
    libraryAlias: null,
    logic:
      "define fluent function \"isFinishedEncounter\"(Enc Encounter):\n(Enc E where E.status = 'finished') is not null",
    isFluent: "Yes",
    argumentNames: ["Enc Encounter"],
  },
  {
    name: "Test Function 5",
    libraryName: null,
    libraryAlias: null,
    logic:
      "define fluent function \"isFinishedEncounter\"(Enc Encounter):\n(Enc E where E.status = 'finished') is not null",
    isFluent: "Yes",
    argumentNames: ["Enc Encounter"],
  },
  {
    name: "Test Function 6",
    libraryName: null,
    libraryAlias: null,
    logic:
      "define fluent function \"isFinishedEncounter\"(Enc Encounter):\n(Enc E where E.status = 'finished') is not null",
    isFluent: "Yes",
    argumentNames: ["Enc Encounter"],
  },
];

describe("Saved Functions Component tests", () => {
  it("Should render saved Functions", async () => {
    render(
      <Functions
        canEdit={true}
        loading={false}
        functions={saveFunctions}
        isCQLUnchanged={false}
      />
    );

    await waitFor(() => {
      const table = screen.getByRole("table");
      const rows = table.querySelectorAll("tbody tr");
      rows.forEach((row, index) => {
        const columns = row.querySelectorAll("td");
        const rowText = Array.from(columns).map((c) => c.textContent?.trim());
        expect(rowText).toEqual([
          "isFinishedEncounter",
          "Yes",
          "Enc Encounter",
          "",
          "",
        ]);
      });
    });

    const deleteBtn = screen.getByTestId("delete-button-0");
    expect(deleteBtn).toBeInTheDocument();
    //currently do nothing
    userEvent.click(deleteBtn);

    const editBtn = screen.getByTestId("edit-button-0");
    expect(editBtn).toBeInTheDocument();
    //currently do nothing
    userEvent.click(editBtn);
  });

  it("Should display loading", async () => {
    render(
      <Functions
        canEdit={true}
        loading={true}
        functions={saveFunctions}
        isCQLUnchanged={false}
      />
    );
    expect(screen.getByTitle("loading")).toBeInTheDocument();
  });

  it("Should render No Results were found message when there are no SavedParameters", async () => {
    render(
      <Functions
        canEdit={true}
        loading={false}
        functions={[]}
        isCQLUnchanged={false}
      />
    );

    const table = screen.getByRole("table");
    const tableBody = table.querySelector("tbody");
    expect(tableBody).toHaveTextContent("No Results were found");
  });

  it("Should NOT render saved Functions actions when canEdit is false", async () => {
    render(
      <Functions
        canEdit={false}
        loading={false}
        functions={saveFunctions}
        isCQLUnchanged={false}
      />
    );
    expect(screen.queryByTestId("functions-actions")).not.toBeInTheDocument();
  });

  it("Test saved Functions pagination", async () => {
    render(
      <Functions
        canEdit={true}
        loading={false}
        functions={testFunctions}
        isCQLUnchanged={false}
      />
    );

    expect(screen.getByText("Test Function 1")).toBeInTheDocument();
    expect(screen.getByText("Test Function 2")).toBeInTheDocument();
    expect(screen.getByText("Test Function 3")).toBeInTheDocument();
    expect(screen.getByText("Test Function 4")).toBeInTheDocument();
    expect(screen.getByText("Test Function 5")).toBeInTheDocument();
    expect(screen.queryByText("Test Function 6")).not.toBeInTheDocument();

    const pageButton = await screen.findByRole("button", {
      name: /page 2/i,
    });
    expect(pageButton).toHaveTextContent("2");

    act(() => {
      userEvent.click(pageButton);
    });

    await waitFor(() => {
      expect(screen.getByText("Test Function 6")).toBeInTheDocument();
    });
  });

  it("Should handle limit change", async () => {
    render(
      <Functions
        canEdit={true}
        loading={false}
        functions={testFunctions}
        isCQLUnchanged={false}
      />
    );

    expect(screen.getByText("Test Function 1")).toBeInTheDocument();
    expect(screen.getByText("Test Function 2")).toBeInTheDocument();
    expect(screen.getByText("Test Function 3")).toBeInTheDocument();
    expect(screen.getByText("Test Function 4")).toBeInTheDocument();
    expect(screen.getByText("Test Function 5")).toBeInTheDocument();
    expect(screen.queryByText("Test Function 6")).not.toBeInTheDocument();

    const limitChangeButton = await screen.findByRole("combobox", {
      expanded: false,
    });
    expect(limitChangeButton).toBeInTheDocument();
    userEvent.click(limitChangeButton);
    const options = await screen.findAllByRole("option");
    expect(options).toHaveLength(4);
    userEvent.click(options[3]);
    const tableBody = screen.getByTestId("functions-table-body");
    await waitFor(() => {
      expect(tableBody.children.length).toBe(6);
      expect(screen.getByText("Test Function 6")).toBeInTheDocument();
    });
  });
});
