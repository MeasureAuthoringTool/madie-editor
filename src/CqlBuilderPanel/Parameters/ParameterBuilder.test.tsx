import * as React from "react";
import { render, fireEvent, act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ParameterBuilder, { Parameter } from "./ParameterBuilder";

const parameter = {
  parameterName: "Measurement Period",
  expressionValue: "interval<System.DateTime>",
} as Parameter;

const handleApplyParameter = jest.fn();
const handleParameterEdit = jest.fn();
const onClose = jest.fn();
const setOpenParameterDialog = jest.fn();

describe("ParameterBuilder Component tests", () => {
  it("Should render ParameterBuilder", async () => {
    render(
      <ParameterBuilder
        canEdit={true}
        handleApplyParameter={handleApplyParameter}
        handleParameterEdit={handleParameterEdit}
        parameter={parameter}
        operation={"edit"}
        onClose={onClose}
        setOpenParameterDialog={setOpenParameterDialog}
      />
    );

    const parameterName = screen.getByTestId("parameter-name-text-input");
    expect(parameterName).toBeInTheDocument();
    expect(parameterName.value).toBe("Measurement Period");
  });

  it("Should validate parameter name and not allow special characters, action buttons are disabled", async () => {
    render(
      <ParameterBuilder
        canEdit={true}
        handleApplyParameter={handleApplyParameter}
        handleParameterEdit={handleParameterEdit}
        parameter={parameter}
        operation={"edit"}
        onClose={onClose}
        setOpenParameterDialog={setOpenParameterDialog}
      />
    );

    const parameterName = screen.getByTestId("parameter-name-text-input");
    expect(parameterName).toBeInTheDocument();
    expect(parameterName.value).toBe("Measurement Period");

    // fireEvent.change(parameterName, {
    //   target: { value: "!@#$" },
    // });
    fireEvent.keyPress(parameterName, { key: "-", charCode: 173 });

    const cancelBtn = screen.getByTestId("parameter-cancel-btn");
    expect(cancelBtn).not.toBeEnabled();
    const saveBtn = screen.getByTestId("parameter-save-btn");
    expect(saveBtn).not.toBeEnabled();
  });

  it("Should allow cancel parameter change", async () => {
    render(
      <ParameterBuilder
        canEdit={true}
        handleApplyParameter={handleApplyParameter}
        handleParameterEdit={handleParameterEdit}
        parameter={parameter}
        operation={"edit"}
        onClose={onClose}
        setOpenParameterDialog={setOpenParameterDialog}
      />
    );

    const parameterName = screen.getByTestId("parameter-name-text-input");
    expect(parameterName).toBeInTheDocument();
    expect(parameterName.value).toBe("Measurement Period");

    fireEvent.change(parameterName, {
      target: { value: "New Measurement Period" },
    });
    expect(parameterName.value).toBe("New Measurement Period");

    const cancelBtn = screen.getByTestId("parameter-cancel-btn");
    expect(cancelBtn).toBeEnabled();
    fireEvent.click(cancelBtn);
  });

  it("Should allow save parameter change", async () => {
    render(
      <ParameterBuilder
        canEdit={true}
        handleApplyParameter={handleApplyParameter}
        handleParameterEdit={handleParameterEdit}
        parameter={parameter}
        operation={"edit"}
        onClose={onClose}
        setOpenParameterDialog={setOpenParameterDialog}
      />
    );

    const parameterName = screen.getByTestId("parameter-name-text-input");
    expect(parameterName).toBeInTheDocument();
    expect(parameterName.value).toBe("Measurement Period");

    fireEvent.change(parameterName, {
      target: { value: "New Measurement Period" },
    });
    expect(parameterName.value).toBe("New Measurement Period");

    const saveBtn = screen.getByTestId("parameter-save-btn");
    expect(saveBtn).toBeEnabled();
    fireEvent.click(saveBtn);
  });
});
