import { render, screen, waitFor, within } from "@testing-library/react";
import * as React from "react";
import CodesSection from "./CodesSection";
import { useCodeSystems } from "./useCodeSystems";
import { ServiceConfig } from "../../api/useServiceConfig";
import { CodeSystem } from "../../api/useTerminologyServiceApi";
import userEvent from "@testing-library/user-event";

jest.mock("./useCodeSystems");

const mockConfig: ServiceConfig = {
  qdmElmTranslationService: {
    baseUrl: "elm.com",
  },
  fhirElmTranslationService: {
    baseUrl: "fhir.elm.com",
  },
  terminologyService: {
    baseUrl: "terminology.com",
  },
  cqlLibraryService: { baseUrl: "library.com" },
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
    oid: "urn:oid:2.16.840.1.113883.6.1",
    fullUr: "http://loinc.org",
  },
  {
    id: "2",
    title: "code1",
    version: Date.now().toString(),
    lastUpdated: Date.now().toString(),
    oid: "1.2.3.2",
    fullUr: "http://loinc.org",
  },
  {
    id: "3",
    title: "code3",
    version: Date.now().toString(),
    lastUpdated: Date.now().toString(),
    oid: "4.5.6.6",
    fullUr: "http://snomed.com",
  },
] as unknown as Array<CodeSystem>;

const mockCql =
  "code \"Birth date\": '21112-8' from \"LOINC\" display 'Birth date'\ncodesystem \"LOINC\": 'urn:oid:2.16.840.1.113883.6.1'";

const mockCqlWithNoCode =
  "valueset \"Emergency Department Visit\": 'urn:oid:2.16.840.1.113883.3.117.1.7.1.292'";

const mockUseCodeSystems = useCodeSystems as jest.MockedFunction<
  typeof useCodeSystems
>;
mockUseCodeSystems.mockReturnValue({
  codeSystems: mockCodeSystems,
});
const renderEditor = () => {
  // @ts-ignore: required props not required for tests
  return render(<CodesSection canEdit={true} hasCqlError={false} />);
};

describe("CodesSection", () => {
  it("should display all codes section nav tabs and navigation works as expected", async () => {
    renderEditor();
    const code = await screen.findByTestId("code-tab");
    const savedCodes = await screen.findByText("Saved Codes(0)");
    userEvent.click(code);
    await waitFor(() => {
      expect(code).toHaveAttribute("aria-selected", "true");
    });
    userEvent.click(savedCodes);
    await waitFor(() => {
      expect(savedCodes).toHaveAttribute("aria-selected", "true");
    });
  });

  it("should render code sub tab section", async () => {
    renderEditor();
    const codeSubTab = await screen.findByTestId("code-tab");
    expect(codeSubTab).toBeInTheDocument();
    userEvent.click(codeSubTab);
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
    const savedCodesSubTab = await screen.findByText("Saved Codes(0)");
    expect(savedCodesSubTab).toBeInTheDocument();
    userEvent.click(savedCodesSubTab);
    expect(savedCodesSubTab).toHaveAttribute("aria-selected", "true");
  });

  it("should render saved codes tab section with 1 saved code", async () => {
    render(
      <CodesSection
        canEdit={true}
        measureStoreCql={mockCql}
        measureModel=""
        handleCodeDelete={jest.fn()}
        setEditorVal={jest.fn()}
        setIsCQLUnchanged={jest.fn()}
        isCQLUnchanged={true}
        handleApplyCode={jest.fn()}
        editorVal={""}
      />
    );
    const savedCodesSubTab = await screen.findByText("Saved Codes(1)");
    expect(savedCodesSubTab).toBeInTheDocument();
    userEvent.click(savedCodesSubTab);
    expect(savedCodesSubTab).toHaveAttribute("aria-selected", "true");
  });

  it("should render saved codes tab section with 0 saved code", async () => {
    render(
      <CodesSection
        canEdit={true}
        measureStoreCql={mockCqlWithNoCode}
        measureModel=""
        handleCodeDelete={jest.fn()}
        setEditorVal={jest.fn()}
        setIsCQLUnchanged={jest.fn()}
        isCQLUnchanged={true}
        handleApplyCode={jest.fn()}
        editorVal={""}
      />
    );
    const savedCodesSubTab = await screen.findByText("Saved Codes(0)");
    expect(savedCodesSubTab).toBeInTheDocument();
    userEvent.click(savedCodesSubTab);
    expect(savedCodesSubTab).toHaveAttribute("aria-selected", "true");
  });

  it("Should not render saved codes list when CQL has errors", async () => {
    renderEditor();
    const savedCodesSubTab = await screen.findByText("Saved Codes(0)");
    expect(savedCodesSubTab).toBeInTheDocument();
    userEvent.click(savedCodesSubTab);

    const savedCodesTable = await screen.findByTestId("saved-codes-tbl");
    expect(savedCodesTable).toBeInTheDocument();
    const tableBody = await screen.findByTestId("saved-codes-tbl-body");
    expect(tableBody).toBeInTheDocument();
    const visibleRows = await within(tableBody).findAllByRole("row");
    expect(visibleRows).toHaveLength(1);
    expect(visibleRows[0]).toHaveTextContent("No Results were found");
  });
});
