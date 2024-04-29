import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import * as React from "react";
import CodesSection from "./CodesSection";
import { useCodeSystems } from "./useCodeSystems";
import { ServiceConfig } from "../../api/useServiceConfig";

jest.mock("./useCodeSystems");

const mockConfig: ServiceConfig = {
  elmTranslationService: {
    baseUrl: "elm.com",
  },
  terminologyService: {
    baseUrl: "terminology.com",
  },
};
jest.mock("../../api/useServiceConfig", () => {
  return {
    useServiceConfig: jest.fn(() => Promise.resolve(mockConfig)),
  };
});

const mockCodeSystems = [
  {
    id: "1",
    title: "code0",
    version: Date.now().toString(),
    lastUpdated: Date.now().toString(),
  },
  {
    id: "2",
    title: "code1",
    version: Date.now().toString(),
    lastUpdated: Date.now().toString(),
  },
  {
    id: "3",
    title: "code3",
    version: Date.now().toString(),
    lastUpdated: Date.now().toString(),
  },
];

const mockUseCodeSystems = useCodeSystems as jest.MockedFunction<
  typeof useCodeSystems
>;
mockUseCodeSystems.mockReturnValue({
  codeSystems: mockCodeSystems,
});
const renderEditor = () => {
  return render(<CodesSection canEdit={true} />);
};

describe("CodesSection", () => {
  it("should display all codes section nav tabs and navigation works as expected", async () => {
    renderEditor();
    const codeSystems = await screen.findByText("Code Systems");
    const code = await screen.findByText("Code");
    const savedCodes = await screen.findByText("Saved Codes");

    expect(codeSystems).toHaveAttribute("aria-selected", "true");
    act(() => {
      fireEvent.click(code);
    });
    await waitFor(() => {
      expect(code).toHaveAttribute("aria-selected", "true");
    });

    act(() => {
      fireEvent.click(savedCodes);
    });
    await waitFor(() => {
      expect(savedCodes).toHaveAttribute("aria-selected", "true");
    });
    act(() => {
      fireEvent.click(codeSystems);
    });
    await waitFor(() => {
      expect(codeSystems).toHaveAttribute("aria-selected", "true");
    });
  });

  it("should display code systems sub tab section", async () => {
    renderEditor();
    const codeSystemsSubTab = await screen.findByText("Code Systems");
    expect(codeSystemsSubTab).toBeInTheDocument();
    expect(codeSystemsSubTab).toHaveAttribute("aria-selected", "true");

    const codeSystemsSection = await screen.findByText("Code Systems Section");
    expect(codeSystemsSection).toBeInTheDocument();
  });

  it("should render code sub tab section", async () => {
    renderEditor();
    const codeSubTab = await screen.findByText("Code");
    expect(codeSubTab).toBeInTheDocument();
    act(() => {
      fireEvent.click(codeSubTab);
    });
    expect(codeSubTab).toHaveAttribute("aria-selected", "true");

    const codesSectionHeading = await screen.findByText("Code(s)");
    const resultsSectionHeading = await screen.findByText("Results");
    expect(codesSectionHeading).toBeInTheDocument();
    expect(resultsSectionHeading).toBeInTheDocument();
    const listUpdated = await screen.findByText("List updated:");
    expect(listUpdated).toBeInTheDocument();
  });

  it("should render saved codes tab section", async () => {
    renderEditor();
    const savedCodesSubTab = await screen.findByText("Saved Codes");
    expect(savedCodesSubTab).toBeInTheDocument();
    act(() => {
      fireEvent.click(savedCodesSubTab);
    });
    expect(savedCodesSubTab).toHaveAttribute("aria-selected", "true");

    const savedCodesSectionButton = await screen.findAllByRole("button");
    const savedCodesSectionHeading = within(
      savedCodesSectionButton[0]
    ).getByText("Saved Codes");
    expect(savedCodesSectionHeading).toBeInTheDocument();
  });
});
