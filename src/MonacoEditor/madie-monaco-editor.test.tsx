import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import MadieMonacoEditor from "./madie-monaco-editor";

describe("MadieMonacoEditor", () => {
  it("renders editor textbox", () => {
    render(
      <MadieMonacoEditor serviceConfig={{}} value="" onChange={jest.fn()} />
    );
    expect(screen.getByLabelText("Cql editor")).toBeInTheDocument();
  });

  it("calls onChange", () => {
    const onChange = jest.fn();
    render(
      <MadieMonacoEditor serviceConfig={{}} value="" onChange={onChange} />
    );

    fireEvent.change(screen.getByLabelText("Cql editor"), {
      target: { value: 'define "A": true' },
    });

    expect(onChange).toHaveBeenCalledWith('define "A": true');
  });
});
