import * as React from "react";
import { parseArgumentsFromLogicString } from "./EditFunctionDialog";

describe("parseArgumentsFromLogicString", () => {
  test("Can parse out empty arguments", () => {
    const logicString = `define function "Empty Arguments" (): true`;
    const result = parseArgumentsFromLogicString(logicString);
    expect(result).toEqual([]);
  });
  test("Can parse out multiple arguments", () => {
    const logicString2 = `define function "Function name here" (arg1 "Integer", arg2 "Integer", arg3 "Date"):\n  true`;
    const result = parseArgumentsFromLogicString(logicString2);

    expect(result).toEqual([
      { argumentName: "arg1", dataType: "Integer" },
      { argumentName: "arg2", dataType: "Integer" },
      { argumentName: "arg3", dataType: "Date" },
    ]);
  });
  test("Can parse out arguments with commas embedded in dataType", () => {
    const logicString3 = `define fluent function "Numerator Observation"(Encounter "Encounter, Performed" ):
    duration in hours of Encounter.relevantPeriod`;
    const result = parseArgumentsFromLogicString(logicString3);
    expect(result).toEqual([
      { argumentName: "Encounter", dataType: "Encounter, Performed" },
    ]);
  });
});
