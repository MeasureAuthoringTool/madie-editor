import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it } from "@jest/globals";
import "@testing-library/jest-dom";
import DefinitionsSection from "./DefinitionsSection";

describe("CQL Definition Builder Section", () => {
  it("Should display name and comment fields", async () => {
    render(<DefinitionsSection canEdit={true} />);
    const definitionNameTextBox = await screen.findByRole("textbox", {
      name: "Definition Name",
    });
    expect(definitionNameTextBox).toBeInTheDocument();

    const definitionCommentTextBox = await screen.findByRole("textbox", {
      name: "Comment",
    });
    expect(definitionCommentTextBox).toBeInTheDocument();
  });
});
