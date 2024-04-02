import React from "react";
import CodeSubSection from "./CodeSubSection";
import { fireEvent, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("CodeSub Section component", () => {
  it("should display Codes(s) and Results sections when navigated to code tab", async () => {
    const { getByTestId } = render(<CodeSubSection canEdit={false} />);

    const codeSubTabHeading = await getByTestId(
      "terminology-section-Code(s)-sub-heading"
    );
    const resultsSubTabHeading = await getByTestId(
      "terminology-section-Results-sub-heading"
    );

    expect(codeSubTabHeading).toBeInTheDocument();
    expect(resultsSubTabHeading).toBeInTheDocument();
  });
});
