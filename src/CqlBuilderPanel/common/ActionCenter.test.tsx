import React from "react";
import { logRoles, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";
import ActionCenter, { PropTypes, ActionItemDef } from "./ActionCenter";

const mockActions: ActionItemDef[] = [
  { name: "Action 1", icon: <div>Icon1</div>, onClick: jest.fn() },
  { name: "Action 2", icon: <div>Icon2</div>, onClick: jest.fn() },
];

const renderComponent = (props: Partial<PropTypes> = {}) => {
  const defaultProps: PropTypes = {
    canEdit: true,
    actions: mockActions,
    idSuffix: "",
    ...props,
  } as PropTypes;
  return render(<ActionCenter {...defaultProps} />);
};

describe("ActionCenter", () => {
  it("renders without crashing", () => {
    renderComponent();
    expect(screen.getByTestId("action-center")).toBeInTheDocument();
  });

  it("displays actions when open", () => {
    renderComponent();
    const button = screen.getByRole("button", {
      name: "Measure action center",
    });
    userEvent.click(button);
    mockActions.forEach((action) => {
      expect(
        screen.getByTestId("action-center_" + action.name.replace(/\s/g, ""))
      ).toBeInTheDocument();
    });
    userEvent.click(button);
    mockActions.forEach((action) => {
      expect(
        screen.queryByTestId("action-center_" + action.name.replace(/\s/g, ""))
      ).not.toBeInTheDocument();
    });
  });

  it("calls action onClick", () => {
    renderComponent();
    const button = screen.getByRole("button", {
      name: "Measure action center",
    });
    userEvent.click(button);
    const actionButton = screen.getByTestId(
      "action-center_" + mockActions[0].name.replace(/\s/g, "")
    );
    userEvent.click(actionButton);
    expect(mockActions[0].onClick).toHaveBeenCalled();
  });

  it("applies idSuffix correctly", async () => {
    renderComponent({ idSuffix: "test" });
    const button = screen.getByRole("button", {
      name: "Measure action center",
    });
    userEvent.click(button);
    expect(await screen.findByTestId("action-center-test")).toBeInTheDocument();
    expect(screen.getByTestId("action-center-button-test")).toBeInTheDocument();
  });
});
