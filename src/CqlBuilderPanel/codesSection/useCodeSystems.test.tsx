import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useCodeSystems } from "./useCodeSystems";
import useTerminologyServiceApi from "../../api/useTerminologyServiceApi";
import { mockedCodeSystems } from "../mockedCodeSystems";

jest.mock("../../api/useTerminologyServiceApi");

const UseCodeSystemsOutput = () => {
  const { codeSystems, codeSystemsLastUpdated } = useCodeSystems();
  return (
    <>
      <div data-testid="code-systems-count">{codeSystems.length}</div>
      <div data-testid="code-systems-last-updated">
        {codeSystemsLastUpdated}
      </div>
    </>
  );
};

describe("useCodeSystems", () => {
  it("should load the code systems and the date they were last updated", async () => {
    (useTerminologyServiceApi as jest.Mock).mockReturnValue({
      getAllCodeSystems: jest.fn().mockResolvedValue(mockedCodeSystems),
      getCodeSystemsLastUpdated: jest.fn().mockResolvedValue({
        status: "COMPLETED",
        completedAt: "2026-11-09T12:00:00Z",
      }),
    });

    render(<UseCodeSystemsOutput />);

    await waitFor(() => {
      expect(screen.getByTestId("code-systems-count")).toHaveTextContent(
        String(mockedCodeSystems.length)
      );
      expect(screen.getByTestId("code-systems-last-updated")).toHaveTextContent(
        "2026-11-09T12:00:00Z"
      );
    });
  });
});
