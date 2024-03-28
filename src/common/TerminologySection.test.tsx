import * as React from "react";
import "@testing-library/jest-dom";
import { describe, expect, test } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { TestCase } from "@madie/madie-models";

import TerminologySection from "./TerminologySection";

const { findByText, findByTestId } = screen;
const testcase: TestCase = {
  id: "1",
  title: "Test Case",
} as TestCase;

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
    render(<TerminologySection title={title} />);
    const foundTitle = await findByText(title);
    // open
    expect(foundTitle).toBeInTheDocument();
    const foundBody = await findByTestId(expectedId);
    expect(foundBody).toBeInTheDocument();

    act(() => {
      fireEvent.click(foundTitle);
    });
    expect(foundBody).not.toBeInTheDocument();
  });
});
