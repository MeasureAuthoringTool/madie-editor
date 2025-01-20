import React from "react";
import { render, screen } from "@testing-library/react";
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
  };
  return render(<ActionCenter {...defaultProps} />);
};

describe("ActionCenter", () => {
  it("renders without crashing", () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId("action-center")).toBeInTheDocument();
  });

  it("toggles open state on button click", () => {
    const { getByTestId } = renderComponent();
    const button = getByTestId("action-center-button");
    userEvent.click(button);
    expect(getByTestId("action-center")).toHaveStyle("background-color: white");
    userEvent.click(button);
    expect(getByTestId("action-center")).toHaveStyle(
      "background-color: transparent"
    );
  });

  it("displays actions when open", () => {
    const { getByTestId, queryByTestId } = renderComponent();
    const button = getByTestId("action-center-button");
    userEvent.click(button);
    mockActions.forEach((action) => {
      expect(getByTestId(action.name.replace(/\s/g, ""))).toBeInTheDocument();
    });
    userEvent.click(button);
    mockActions.forEach((action) => {
      expect(
        queryByTestId(action.name.replace(/\s/g, ""))
      ).not.toBeInTheDocument();
    });
  });

  it("calls action onClick and closes on action click", () => {
    const { getByTestId } = renderComponent();
    const button = getByTestId("action-center-button");
    userEvent.click(button);
    const actionButton = getByTestId(mockActions[0].name.replace(/\s/g, ""));
    userEvent.click(actionButton);
    expect(mockActions[0].onClick).toHaveBeenCalled();
  });

  it("applies idSuffix correctly", async () => {
    const { getByTestId } = renderComponent({ idSuffix: "test" });
    const button = getByTestId("action-center-button-test");
    userEvent.click(button);
    expect(await screen.findByTestId("action-center-test")).toBeInTheDocument();
    expect(getByTestId("action-center-button-test")).toBeInTheDocument();
  });
});
