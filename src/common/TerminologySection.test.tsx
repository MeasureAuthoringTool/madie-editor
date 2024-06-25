import * as React from "react";
import "@testing-library/jest-dom";
import { describe, test } from "@jest/globals";
import { fireEvent, waitFor, render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import TerminologySection from "./TerminologySection";

const { findByText, findByTestId, getByTestId } = screen;

describe("TabHeadings", () => {
  test("TabHeading does in fact exist with specified text", async () => {
    const title = "FakeTitle";
    render(<TerminologySection title={title} />);
    const foundTitle = await findByText(title);
    expect(foundTitle).toBeInTheDocument();
  });

  test("Tab Headings display descriptions when clicked on, hides after", async () => {
    const title = "Code(s)";
    const expectedId = `terminology-section-sub-header-content-${title}`;
    const setShowHeaderContent = jest.fn();
    render(
      <TerminologySection
        title={title}
        setShowHeaderContent={setShowHeaderContent}
      />
    );
    const foundTitle = await findByText(title);
    // open
    expect(foundTitle).toBeInTheDocument();
    const foundBody = await findByTestId(expectedId);
    expect(foundBody).toBeInTheDocument();
    act(() => {
      fireEvent.click(foundTitle);
    });
    expect(foundBody).not.toBeInTheDocument();
    act(() => {
      fireEvent.keyDown(foundTitle, { key: "Enter", keyCode: 13 });
    });
    await waitFor(() => {
      expect(getByTestId(expectedId)).toBeInTheDocument();
    });
  });
});
