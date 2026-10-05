import * as React from "react";
import { render, waitFor, act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SavedParameters from "./SavedParameters";

const saveParameters = [
  {
    name: "Measurement Period",
    libraryName: null,
    libraryAlias: null,
    logic: "interval<System.DateTime>",
  },
];

const testParameters = [
  {
    name: "Test Period 1",
    libraryName: null,
    libraryAlias: null,
    logic: "interval<System.DateTime>",
  },
  {
    name: "Test Period 2",
    libraryName: null,
    libraryAlias: null,
    logic: "interval<System.DateTime>",
  },
  {
    name: "Test Period 3",
    libraryName: null,
    libraryAlias: null,
    logic: "interval<System.DateTime>",
  },
  {
    name: "Test Period 4",
    libraryName: null,
    libraryAlias: null,
    logic: "interval<System.DateTime>",
  },
  {
    name: "Test Period 5",
    libraryName: null,
    libraryAlias: null,
    logic: "interval<System.DateTime>",
  },
  {
    name: "Test Period 6",
    libraryName: null,
    libraryAlias: null,
    logic: "interval<System.DateTime>",
  },
];

const setEditorValue = jest.fn();
const handleApplyParameter = jest.fn();
const handleParameterEdit = jest.fn();
const handleParameterDelete = jest.fn();
const resetCql = jest.fn();

describe("SavedParameters Component tests", () => {
  it("Should render SavedParameters", async () => {
    render(
      <SavedParameters
        canEdit={true}
        parameters={saveParameters}
        isCQLUnchanged={false}
        cql="test CQL"
        setEditorValue={setEditorValue}
        handleApplyParameter={handleApplyParameter}
        handleParameterEdit={handleParameterEdit}
        handleParameterDelete={handleParameterDelete}
        resetCql={resetCql}
        loading={false}
      />
    );

    await waitFor(() => {
      const table = screen.getByRole("table");
      const rows = table.querySelectorAll("tbody tr");
      rows.forEach((row, index) => {
        const columns = row.querySelectorAll("td");
        const rowText = Array.from(columns).map((c) => c.textContent?.trim());
        expect(rowText).toEqual(["Measurement Period", ""]);
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

  it("Should render No Results were found message when there are no SavedParameters", async () => {
    render(
      <SavedParameters
        canEdit={true}
        parameters={[]}
        isCQLUnchanged={false}
        cql="test CQL"
        setEditorValue={setEditorValue}
        handleApplyParameter={handleApplyParameter}
        handleParameterEdit={handleParameterEdit}
        handleParameterDelete={handleParameterDelete}
        resetCql={resetCql}
        loading={false}
      />
    );

    const table = screen.getByRole("table");
    const tableBody = table.querySelector("tbody");
    expect(tableBody).toHaveTextContent("No Results were found");
  });

  it("Should open Discard Dialog when CQL is changed", async () => {
    render(
      <SavedParameters
        canEdit={true}
        parameters={saveParameters}
        isCQLUnchanged={false}
        cql="test CQL"
        setEditorValue={setEditorValue}
        handleApplyParameter={handleApplyParameter}
        handleParameterEdit={handleParameterEdit}
        handleParameterDelete={handleParameterDelete}
        resetCql={resetCql}
        loading={false}
      />
    );

    const editBtn = screen.getByTestId("edit-button-0");
    expect(editBtn).toBeInTheDocument();

    userEvent.click(editBtn);

    const discardDialog = screen.getByTestId("discard-dialog");
    expect(discardDialog).toBeInTheDocument();
    const cancelDiscard = screen.getByTestId("discard-dialog-cancel-button");
    expect(cancelDiscard).toBeInTheDocument();
    const continueDiscard = screen.getByTestId(
      "discard-dialog-continue-button"
    );
    expect(continueDiscard).toBeInTheDocument();

    userEvent.click(cancelDiscard);
    //expect(await screen.queryByTestId("discard-dialog")).not.toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByTestId("discard-dialog")).not.toBeInTheDocument();
    });
  });

  it("Should open EditParameterDialog when CQL is changed and user clicked discard change", async () => {
    render(
      <SavedParameters
        canEdit={true}
        parameters={saveParameters}
        isCQLUnchanged={false}
        cql="test CQL"
        setEditorValue={setEditorValue}
        handleApplyParameter={handleApplyParameter}
        handleParameterEdit={handleParameterEdit}
        handleParameterDelete={handleParameterDelete}
        resetCql={resetCql}
        loading={false}
      />
    );

    const editBtn = screen.getByTestId("edit-button-0");
    expect(editBtn).toBeInTheDocument();

    userEvent.click(editBtn);

    const discardDialog = screen.getByTestId("discard-dialog");
    expect(discardDialog).toBeInTheDocument();
    const cancelDiscard = screen.getByTestId("discard-dialog-cancel-button");
    expect(cancelDiscard).toBeInTheDocument();
    const continueDiscard = screen.getByTestId(
      "discard-dialog-continue-button"
    );
    expect(continueDiscard).toBeInTheDocument();

    userEvent.click(continueDiscard);

    await waitFor(() => {
      expect(screen.queryByTestId("discard-dialog")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("edit-parameter-dialog")).toBeInTheDocument();
  });

  it("Should open EditParameterDialog when CQL is unchanged", async () => {
    render(
      <SavedParameters
        canEdit={true}
        parameters={saveParameters}
        isCQLUnchanged={true}
        cql="test CQL"
        setEditorValue={setEditorValue}
        handleApplyParameter={handleApplyParameter}
        handleParameterEdit={handleParameterEdit}
        handleParameterDelete={handleParameterDelete}
        resetCql={resetCql}
        loading={false}
      />
    );

    const editBtn = screen.getByTestId("edit-button-0");
    expect(editBtn).toBeInTheDocument();

    userEvent.click(editBtn);
    expect(screen.getByTestId("edit-parameter-dialog")).toBeInTheDocument();
  });

  it("Should NOT render SavedParameters actions when canEdit is false", async () => {
    render(
      <SavedParameters
        canEdit={false}
        parameters={testParameters}
        isCQLUnchanged={false}
        cql="test CQL"
        setEditorValue={setEditorValue}
        handleApplyParameter={handleApplyParameter}
        handleParameterEdit={handleParameterEdit}
        handleParameterDelete={handleParameterDelete}
        resetCql={resetCql}
        loading={false}
      />
    );
    expect(screen.queryByTestId("parameters-actions")).not.toBeInTheDocument();
  });

  it("Test SavedParameters pagination", async () => {
    render(
      <SavedParameters
        canEdit={true}
        parameters={testParameters}
        isCQLUnchanged={false}
        cql="test CQL"
        setEditorValue={setEditorValue}
        handleApplyParameter={handleApplyParameter}
        handleParameterEdit={handleParameterEdit}
        handleParameterDelete={handleParameterDelete}
        resetCql={resetCql}
        loading={false}
      />
    );

    expect(screen.getByText("Test Period 1")).toBeInTheDocument();
    expect(screen.getByText("Test Period 2")).toBeInTheDocument();
    expect(screen.getByText("Test Period 3")).toBeInTheDocument();
    expect(screen.getByText("Test Period 4")).toBeInTheDocument();
    expect(screen.getByText("Test Period 5")).toBeInTheDocument();
    expect(screen.queryByText("Test Period 6")).not.toBeInTheDocument();

    const pageButton = await screen.findByRole("button", {
      name: /page 2/i,
    });
    expect(pageButton).toHaveTextContent("2");

    act(() => {
      userEvent.click(pageButton);
    });

    await waitFor(() => {
      expect(screen.getByText("Test Period 6")).toBeInTheDocument();
    });
  });

  it("Should handle limit change", async () => {
    render(
      <SavedParameters
        canEdit={true}
        parameters={testParameters}
        isCQLUnchanged={false}
        cql="test CQL"
        setEditorValue={setEditorValue}
        handleApplyParameter={handleApplyParameter}
        handleParameterEdit={handleParameterEdit}
        handleParameterDelete={handleParameterDelete}
        resetCql={resetCql}
        loading={false}
      />
    );

    expect(screen.getByText("Test Period 1")).toBeInTheDocument();
    expect(screen.getByText("Test Period 2")).toBeInTheDocument();
    expect(screen.getByText("Test Period 3")).toBeInTheDocument();
    expect(screen.getByText("Test Period 4")).toBeInTheDocument();
    expect(screen.getByText("Test Period 5")).toBeInTheDocument();
    expect(screen.queryByText("Test Period 6")).not.toBeInTheDocument();

    const limitChangeButton = await screen.findByRole("combobox", {
      expanded: false,
    });
    expect(limitChangeButton).toBeInTheDocument();
    userEvent.click(limitChangeButton);
    const options = await screen.findAllByRole("option");
    expect(options).toHaveLength(4);
    userEvent.click(options[3]);
    const tableBody = screen.getByTestId("parameters-table-body");
    await waitFor(() => {
      expect(tableBody.children.length).toBe(6);
      expect(screen.getByText("Test Period 6")).toBeInTheDocument();
    });
  });

  it("test cancel delete parameter when CQL is unchanged", async () => {
    render(
      <SavedParameters
        canEdit={true}
        parameters={saveParameters}
        isCQLUnchanged={true}
        cql="test CQL"
        setEditorValue={setEditorValue}
        handleApplyParameter={handleApplyParameter}
        handleParameterEdit={handleParameterEdit}
        handleParameterDelete={handleParameterDelete}
        resetCql={resetCql}
        loading={false}
      />
    );

    const deleteBtn = screen.getByTestId("delete-button-0");
    expect(deleteBtn).toBeInTheDocument();

    userEvent.click(deleteBtn);
    expect(screen.getByTestId("delete-dialog")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();

    const cancelBtn = screen.getByTestId("delete-dialog-cancel-button");
    const continueDeleteBtn = screen.getByTestId(
      "delete-dialog-continue-button"
    );
    expect(cancelBtn).toBeInTheDocument();
    expect(continueDeleteBtn).toBeInTheDocument();

    userEvent.click(cancelBtn);

    expect(screen.getByTestId("parameters-row-0")).toBeInTheDocument();
    expect(handleParameterDelete).not.toHaveBeenCalled();
  });

  it("test continue delete parameter when CQL is unchanged", async () => {
    render(
      <SavedParameters
        canEdit={true}
        parameters={saveParameters}
        isCQLUnchanged={true}
        cql="test CQL"
        setEditorValue={setEditorValue}
        handleApplyParameter={handleApplyParameter}
        handleParameterEdit={handleParameterEdit}
        handleParameterDelete={handleParameterDelete}
        resetCql={resetCql}
        loading={false}
      />
    );

    const deleteBtn = screen.getByTestId("delete-button-0");
    expect(deleteBtn).toBeInTheDocument();

    userEvent.click(deleteBtn);
    expect(screen.getByTestId("delete-dialog")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();

    const cancelBtn = screen.getByTestId("delete-dialog-cancel-button");
    const continueDeleteBtn = screen.getByTestId(
      "delete-dialog-continue-button"
    );
    expect(cancelBtn).toBeInTheDocument();
    expect(continueDeleteBtn).toBeInTheDocument();

    userEvent.click(continueDeleteBtn);

    expect(screen.getByTestId("parameters-row-0")).toBeInTheDocument();
    expect(handleParameterDelete).toHaveBeenCalled();
  });

  it("test delete parameter discard changes when cql has changes", async () => {
    render(
      <SavedParameters
        canEdit={true}
        parameters={saveParameters}
        isCQLUnchanged={false}
        cql="test CQL"
        setEditorValue={setEditorValue}
        handleApplyParameter={handleApplyParameter}
        handleParameterEdit={handleParameterEdit}
        handleParameterDelete={handleParameterDelete}
        resetCql={resetCql}
        loading={false}
      />
    );

    const deleteBtn = screen.getByTestId("delete-button-0");
    expect(deleteBtn).toBeInTheDocument();

    userEvent.click(deleteBtn);
    expect(screen.getByTestId("discard-dialog")).toBeInTheDocument();
    expect(screen.getByText("Discard Changes?")).toBeInTheDocument();
    expect(screen.getByText("You have unsaved changes.")).toBeInTheDocument();

    const cancelBtn = screen.getByTestId("discard-dialog-cancel-button");
    const discardBtn = screen.getByTestId("discard-dialog-continue-button");
    expect(cancelBtn).toBeInTheDocument();
    expect(discardBtn).toBeInTheDocument();

    userEvent.click(discardBtn);

    expect(screen.getByTestId("delete-dialog")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });
});
