import React from "react";
import { expect, describe, it } from "@jest/globals";
import { getNameOptionsByType } from "./ExpressionEditorHelper";

describe("Expression Editor Helper getNameOptionsByType", () => {
  it("Should return empty string list for parameter names", () => {
    const result = getNameOptionsByType("Parameters");
    expect(result.length).toBe(1);
    expect(result[0]).toBe("");
  });

  it("Should return empty string list for definition names", () => {
    const result = getNameOptionsByType("Definitions");
    expect(result.length).toBe(1);
    expect(result[0]).toBe("");
  });

  it("Should return empty string list for function names", () => {
    const result = getNameOptionsByType("Functions");
    expect(result.length).toBe(1);
    expect(result[0]).toBe("");
  });

  it("Should return full list for pre-defined function names", () => {
    const result = getNameOptionsByType("Pre-Defined Functions");
    expect(result.length).toBe(83);
    expect(result[0]).toBe("Abs()");
    expect(result[82]).toBe("Variance()");
  });
});
