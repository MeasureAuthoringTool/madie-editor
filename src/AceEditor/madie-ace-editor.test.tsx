import { render } from "@testing-library/react";
import MadieAceEditor from "./madie-ace-editor";

describe("MadieAceEditor component", () => {
  it("should be madie editor", async () => {
    const container = render(<MadieAceEditor props="" />);
    expect(container).toBeDefined();
  });
});
