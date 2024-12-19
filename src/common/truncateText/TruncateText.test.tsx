import * as React from "react";
import { render, screen } from "@testing-library/react";
import TruncateText from "./TruncateText";
import userEvent from "@testing-library/user-event";

describe("TruncateText component", () => {
  it("should render original value", () => {
    const description = "TestDescription";
    const testId = "definition-comments";

    render(
      <TruncateText text={description} maxLength={60} dataTestId={testId} />
    );

    expect(screen.getByTestId("definition-comments-content")).toBeTruthy();
    expect(screen.getByText(description)).toBeInTheDocument();
    expect(
      screen.queryByTestId(`${testId}-toggle-button`)
    ).not.toBeInTheDocument();
  });

  it("should render truncated value", async () => {
    const description =
      "TestDescriptionTestDescriptionTestDescriptionTestDescriptionTestDescriptionTestDescription";
    const testId = "definition-comments";

    render(
      <TruncateText text={description} maxLength={60} dataTestId={testId} />
    );

    const content = screen.getByTestId("definition-comments-content");
    expect(content).toBeTruthy();
    expect(content).toHaveTextContent(description.substring(0, 60));

    const showMoreButton = screen.getByTestId(`${testId}-toggle-button`);
    expect(showMoreButton).toHaveTextContent("Show more");

    userEvent.click(showMoreButton);
    expect(content).toHaveTextContent(description);

    expect(showMoreButton).toHaveTextContent("Show less");
    expect(content).toHaveTextContent(description.substring(0, 60));
  });
});
