import * as React from "react";
import { render, waitFor, act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Functions from "./Functions";
import {
  FunctionLookup,
  CqlBuilderLookup,
  FunctionArgument,
} from "../../../model/CqlBuilderLookup";

const arg: FunctionArgument = {
  argumentName: "Enc",
  dataType: "Encounter",
} as unknown as FunctionArgument;
const arg1: FunctionArgument = {
  argumentName: "Enc1",
  dataType: "Encounter",
} as unknown as FunctionArgument;
const arg2: FunctionArgument = {
  argumentName: "Enc2",
  dataType: "Encounter",
} as unknown as FunctionArgument;
const arg3: FunctionArgument = {
  argumentName: "Enc3",
  dataType: "Encounter",
} as unknown as FunctionArgument;
const arg4: FunctionArgument = {
  argumentName: "Enc4",
  dataType: "Encounter",
} as unknown as FunctionArgument;
const saveFunctions = [
  {
    name: "isFinishedEncounter",
    libraryName: null,
    libraryAlias: null,
    logic:
      "define fluent function \"isFinishedEncounter\"(Enc Encounter):\n(Enc E where E.status = 'finished') is not null",
    comment: "",
    isFluent: "Yes",
    arguments: [arg1, arg2, arg3, arg4],
  },
] as unknown as FunctionLookup[];

const cqlBuilderLookupsTypes = {
  parameters: [],
  definitions: [],
  functions: [],
  fluentFunctions: [
    {
      name: "isFinishedEncounter",
      libraryName: null,
      libraryAlias: null,
      logic:
        "define fluent function \"isFinishedEncounter\"(Enc Encounter):\n(Enc E where E.status = 'finished') is not null",
      comment: "",
      isFluent: "Yes",
      arguments: [arg1, arg2, arg3, arg4],
    },
  ],
} as unknown as CqlBuilderLookup;

const testFunctions = [
  {
    name: "Test Function 1",
    libraryName: undefined,
    libraryAlias: null,
    logic:
      "define fluent function \"isFinishedEncounter\"(Enc Encounter):\n(Enc E where E.status = 'finished') is not null",
    isFluent: "Yes",
    comment: "test comment",
    arguments: [arg],
  },
  {
    name: "Test Function 2",
    libraryName: null,
    libraryAlias: null,
    logic:
      "define fluent function \"isFinishedEncounter\"(Enc Encounter):\n(Enc E where E.status = 'finished') is not null",
    isFluent: "Yes",
    comment: "test comment test comment test comment test comment",
    arguments: [arg],
  },
  {
    name: "Test Function 3",
    libraryName: null,
    libraryAlias: null,
    logic:
      "define fluent function \"isFinishedEncounter\"(Enc Encounter):\n(Enc E where E.status = 'finished') is not null",
    isFluent: "Yes",
    arguments: [arg],
  },
  {
    name: "Test Function 4",
    libraryName: null,
    libraryAlias: null,
    logic:
      "define fluent function \"isFinishedEncounter\"(Enc Encounter):\n(Enc E where E.status = 'finished') is not null",
    isFluent: "Yes",
    arguments: [arg],
  },
  {
    name: "Test Function 5",
    libraryName: null,
    libraryAlias: null,
    logic:
      "define fluent function \"isFinishedEncounter\"(Enc Encounter):\n(Enc E where E.status = 'finished') is not null",
    isFluent: "Yes",
    arguments: [arg],
  },
  {
    name: "Test Function 6",
    libraryName: null,
    libraryAlias: null,
    logic:
      "define fluent function \"isFinishedEncounter\"(Enc Encounter):\n(Enc E where E.status = 'finished') is not null",
    isFluent: "Yes",
    arguments: [arg],
  },
] as unknown as FunctionLookup[];

const handleApplyFunction = jest.fn();
const handleFunctionDelete = jest.fn();
const resetCql = jest.fn();

describe("Saved Functions Component tests", () => {
  it("Should render saved Functions", async () => {
    render(
      <Functions
        canEdit={true}
        loading={false}
        functions={saveFunctions}
        isCQLUnchanged={false}
        handleApplyFunction={handleApplyFunction}
        handleFunctionDelete={handleFunctionDelete}
        cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
        cql="test cql"
        resetCql={resetCql}
      />
    );

    await waitFor(() => {
      const table = screen.getByRole("table");
      const rows = table.querySelectorAll("tbody tr");
      rows.forEach((row, index) => {
        const columns = row.querySelectorAll("td");
        const rowText = Array.from(columns).map((c) => c.textContent?.trim());
        expect(rowText[0]).toEqual("isFinishedEncounter");
        expect(rowText[1]).toEqual("Yes");
        expect(rowText[2]).toContain("Enc1 Encounter");
        expect(rowText[2]).toContain("Enc2 Encounter...");
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
        handleApplyFunction={handleApplyFunction}
        handleFunctionDelete={handleFunctionDelete}
        cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
        cql="test cql"
        resetCql={resetCql}
      />
    );
    expect(screen.getByTitle("loading")).toBeInTheDocument();
  });

  it("Should render No Results were found message when there are no saved Functions", async () => {
    render(
      <Functions
        canEdit={true}
        loading={false}
        functions={[]}
        isCQLUnchanged={false}
        handleApplyFunction={handleApplyFunction}
        handleFunctionDelete={handleFunctionDelete}
        cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
        cql="test cql"
        resetCql={resetCql}
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
        handleApplyFunction={handleApplyFunction}
        handleFunctionDelete={handleFunctionDelete}
        cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
        cql="test cql"
        resetCql={resetCql}
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
        handleApplyFunction={handleApplyFunction}
        handleFunctionDelete={handleFunctionDelete}
        cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
        cql="test cql"
        resetCql={resetCql}
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
        handleApplyFunction={handleApplyFunction}
        handleFunctionDelete={handleFunctionDelete}
        cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
        cql="test cql"
        resetCql={resetCql}
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

  it("Should bring up confirm delete dialog when clicked delete button", async () => {
    render(
      <Functions
        canEdit={true}
        loading={false}
        functions={saveFunctions}
        isCQLUnchanged={true}
        handleApplyFunction={handleApplyFunction}
        handleFunctionDelete={handleFunctionDelete}
        cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
        cql="test cql"
        resetCql={resetCql}
      />
    );

    await waitFor(() => {
      const table = screen.getByRole("table");
      const rows = table.querySelectorAll("tbody tr");
      rows.forEach((row, index) => {
        const columns = row.querySelectorAll("td");
        const rowText = Array.from(columns).map((c) => c.textContent?.trim());
        expect(rowText[0]).toEqual("isFinishedEncounter");
        expect(rowText[1]).toEqual("Yes");
        expect(rowText[2]).toContain("Enc1 Encounter");
        expect(rowText[2]).toContain("Enc2 Encounter...");
      });
    });

    const deleteBtn = screen.getByTestId("delete-button-0");
    expect(deleteBtn).toBeInTheDocument();
    userEvent.click(deleteBtn);

    expect(screen.getByTestId("delete-dialog")).toBeInTheDocument();
    expect(screen.getByText("delete this Function")).toBeInTheDocument();
    const deleteCancelBtn = screen.getByTestId("delete-dialog-cancel-button");
    expect(deleteCancelBtn).toBeInTheDocument();
    const deleteContinueBtn = screen.getByTestId(
      "delete-dialog-continue-button"
    );
    expect(deleteContinueBtn).toBeInTheDocument();

    userEvent.click(deleteCancelBtn);
    expect(handleFunctionDelete).not.toHaveBeenCalled();
  });

  it("Should delete function", async () => {
    render(
      <Functions
        canEdit={true}
        loading={false}
        functions={saveFunctions}
        isCQLUnchanged={true}
        handleApplyFunction={handleApplyFunction}
        handleFunctionDelete={handleFunctionDelete}
        cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
        cql="test cql"
        resetCql={resetCql}
      />
    );

    await waitFor(() => {
      const table = screen.getByRole("table");
      const rows = table.querySelectorAll("tbody tr");
      rows.forEach((row, index) => {
        const columns = row.querySelectorAll("td");
        const rowText = Array.from(columns).map((c) => c.textContent?.trim());
        expect(rowText[0]).toEqual("isFinishedEncounter");
        expect(rowText[1]).toEqual("Yes");
        expect(rowText[2]).toContain("Enc1 Encounter");
        expect(rowText[2]).toContain("Enc2 Encounter...");
      });
    });

    const deleteBtn = screen.getByTestId("delete-button-0");
    expect(deleteBtn).toBeInTheDocument();
    userEvent.click(deleteBtn);

    expect(screen.getByTestId("delete-dialog")).toBeInTheDocument();
    expect(screen.getByText("delete this Function")).toBeInTheDocument();
    const deleteCancelBtn = screen.getByTestId("delete-dialog-cancel-button");
    expect(deleteCancelBtn).toBeInTheDocument();
    const deleteContinueBtn = screen.getByTestId(
      "delete-dialog-continue-button"
    );
    expect(deleteContinueBtn).toBeInTheDocument();

    userEvent.click(deleteContinueBtn);
    expect(handleFunctionDelete).toHaveBeenCalled();
  });

  it("Should bring up discard dialog when clicked delete button", async () => {
    render(
      <Functions
        canEdit={true}
        loading={false}
        functions={saveFunctions}
        isCQLUnchanged={false}
        handleApplyFunction={handleApplyFunction}
        handleFunctionDelete={handleFunctionDelete}
        cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
        cql="test cql"
        resetCql={resetCql}
      />
    );

    await waitFor(() => {
      const table = screen.getByRole("table");
      const rows = table.querySelectorAll("tbody tr");
      rows.forEach((row, index) => {
        const columns = row.querySelectorAll("td");
        const rowText = Array.from(columns).map((c) => c.textContent?.trim());
        expect(rowText[0]).toEqual("isFinishedEncounter");
        expect(rowText[1]).toEqual("Yes");
        expect(rowText[2]).toContain("Enc1 Encounter");
        expect(rowText[2]).toContain("Enc2 Encounter...");
      });
    });

    const deleteBtn = screen.getByTestId("delete-button-0");
    expect(deleteBtn).toBeInTheDocument();
    userEvent.click(deleteBtn);

    expect(screen.getByTestId("discard-dialog")).toBeInTheDocument();
    expect(screen.getByText("You have unsaved changes.")).toBeInTheDocument();
    const discardCancelBtn = screen.getByTestId("discard-dialog-cancel-button");
    expect(discardCancelBtn).toBeInTheDocument();
    const discardContinueBtn = screen.getByTestId(
      "discard-dialog-continue-button"
    );
    expect(discardContinueBtn).toBeInTheDocument();

    const closeBtn = screen.getByTestId("close-button");
    userEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByTestId("discard-dialog")).not.toBeInTheDocument();
    });
  });

  it("Should bring up delete dialog when clicked discard continue button", async () => {
    render(
      <Functions
        canEdit={true}
        loading={false}
        functions={saveFunctions}
        isCQLUnchanged={false}
        handleApplyFunction={handleApplyFunction}
        handleFunctionDelete={handleFunctionDelete}
        cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
        cql="test cql"
        resetCql={resetCql}
      />
    );

    await waitFor(() => {
      const table = screen.getByRole("table");
      const rows = table.querySelectorAll("tbody tr");
      rows.forEach((row, index) => {
        const columns = row.querySelectorAll("td");
        const rowText = Array.from(columns).map((c) => c.textContent?.trim());
        expect(rowText[0]).toEqual("isFinishedEncounter");
        expect(rowText[1]).toEqual("Yes");
        expect(rowText[2]).toContain("Enc1 Encounter");
        expect(rowText[2]).toContain("Enc2 Encounter...");
      });
    });

    const deleteBtn = screen.getByTestId("delete-button-0");
    expect(deleteBtn).toBeInTheDocument();
    userEvent.click(deleteBtn);

    expect(screen.getByTestId("discard-dialog")).toBeInTheDocument();
    expect(screen.getByText("You have unsaved changes.")).toBeInTheDocument();
    const discardCancelBtn = screen.getByTestId("discard-dialog-cancel-button");
    expect(discardCancelBtn).toBeInTheDocument();
    const discardContinueBtn = screen.getByTestId(
      "discard-dialog-continue-button"
    );
    expect(discardContinueBtn).toBeInTheDocument();

    userEvent.click(discardContinueBtn);
    expect(screen.getByTestId("delete-dialog")).toBeInTheDocument();
    expect(screen.getByText("delete this Function")).toBeInTheDocument();
  });

  it("Should bring up edit dialog", async () => {
    render(
      <Functions
        canEdit={true}
        loading={false}
        functions={saveFunctions}
        isCQLUnchanged={true}
        handleApplyFunction={handleApplyFunction}
        handleFunctionDelete={handleFunctionDelete}
        cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
        cql="test cql"
        resetCql={resetCql}
      />
    );

    await waitFor(() => {
      const table = screen.getByRole("table");
      const rows = table.querySelectorAll("tbody tr");
      rows.forEach((row, index) => {
        const columns = row.querySelectorAll("td");
        const rowText = Array.from(columns).map((c) => c.textContent?.trim());
        expect(rowText[0]).toEqual("isFinishedEncounter");
        expect(rowText[1]).toEqual("Yes");
        expect(rowText[2]).toContain("Enc1 Encounter");
        expect(rowText[2]).toContain("Enc2 Encounter...");
      });
    });

    const editBtn = screen.getByTestId("edit-button-0");
    expect(editBtn).toBeInTheDocument();
    userEvent.click(editBtn);

    expect(screen.getByTestId("edit-parameter-dialog")).toBeInTheDocument();

    const closeBtn = screen.getByTestId("close-button");
    userEvent.click(closeBtn);

    await waitFor(() => {
      expect(
        screen.queryByTestId("edit-parameter-dialog")
      ).not.toBeInTheDocument();
    });
  });

  it("Should bring up discard dialog when there is cql change and user clicks Edit button", async () => {
    render(
      <Functions
        canEdit={true}
        loading={false}
        functions={saveFunctions}
        isCQLUnchanged={false}
        handleApplyFunction={handleApplyFunction}
        handleFunctionDelete={handleFunctionDelete}
        cqlBuilderLookupsTypes={cqlBuilderLookupsTypes}
        cql="test cql"
        resetCql={resetCql}
      />
    );

    await waitFor(() => {
      const table = screen.getByRole("table");
      const rows = table.querySelectorAll("tbody tr");
      rows.forEach((row, index) => {
        const columns = row.querySelectorAll("td");
        const rowText = Array.from(columns).map((c) => c.textContent?.trim());
        expect(rowText[0]).toEqual("isFinishedEncounter");
        expect(rowText[1]).toEqual("Yes");
        expect(rowText[2]).toContain("Enc1 Encounter");
        expect(rowText[2]).toContain("Enc2 Encounter...");
      });
    });

    const editBtn = screen.getByTestId("edit-button-0");
    expect(editBtn).toBeInTheDocument();
    userEvent.click(editBtn);

    expect(screen.getByTestId("discard-dialog")).toBeInTheDocument();
    expect(screen.getByText("You have unsaved changes.")).toBeInTheDocument();
    const discardCancelBtn = screen.getByTestId("discard-dialog-cancel-button");
    expect(discardCancelBtn).toBeInTheDocument();
    const discardContinueBtn = screen.getByTestId(
      "discard-dialog-continue-button"
    );
    expect(discardContinueBtn).toBeInTheDocument();

    userEvent.click(discardContinueBtn);
    expect(screen.getByTestId("edit-parameter-dialog")).toBeInTheDocument();
  });
});
