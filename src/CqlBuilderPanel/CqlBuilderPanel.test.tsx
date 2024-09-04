import { render, screen, waitFor } from "@testing-library/react";
import CqlBuilderPanel from "./CqlBuilderPanel";
// @ts-ignore
import { useFeatureFlags } from "@madie/madie-util";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { within } from "@testing-library/dom";
import axios from "../api/axios-instance";
import { ServiceConfig } from "../api/useServiceConfig";

jest.mock("../api/axios-instance");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockConfig: ServiceConfig = {
  qdmElmTranslationService: {
    baseUrl: "qdm-elm-translator.com",
  },
  fhirElmTranslationService: {
    baseUrl: "fhir-elm-translator.com",
  },
  terminologyService: {
    baseUrl: "terminology-service.com",
  },
  cqlLibraryService: { baseUrl: "library-service.com" },
};

const mockCqlBuilderLookUpData = {
  parameters: [
    {
      name: "Measurement Period",
      libraryName: "HospiceQDM",
      libraryAlias: "Hospice",
      logic: "interval<System.DateTime>",
    },
    {
      name: "Measurement Period",
      libraryName: null,
      libraryAlias: null,
      logic: "interval<System.DateTime>",
    },
    {
      name: "Measurement Period",
      libraryName: "AdvancedIllnessandFrailtyQDM",
      libraryAlias: "AIFrailLTCF",
      logic: "interval<System.DateTime>",
    },
  ],
  definitions: [
    {
      libraryAlias: "CQMCommon",
      libraryName: "CQMCommon",
      logic: `define "Inpatient Encounter":\n  [Encounter: "Encounter Inpatient"] EncounterInpatient\n\t\twhere EncounterInpatient.status = 'finished'\n\t\tand EncounterInpatient.period ends during day of "Measurement Period"`,
      name: "Inpatient Encounter",
    },
    {
      libraryAlias: null,
      libraryName: null,
      logic: 'define "SDE Payer":\n  SDE."SDE Payer"',
      name: "SDE Payer",
    },
  ],
  functions: [
    {
      name: "Latest",
      libraryName: "MATGlobalCommonFunctionsQDM",
      libraryAlias: "Global",
      logic:
        'define function "Latest"(period Interval<DateTime> ):\n  if ( HasEnd(period)) then \n  end of period \n    else start of period',
    },
    {
      name: "HospitalizationLengthofStay",
      libraryName: "MATGlobalCommonFunctionsQDM",
      libraryAlias: "Global",
      logic:
        'define function "HospitalizationLengthofStay"(Encounter "Encounter, Performed" ):\n  LengthInDays("Hospitalization"(Encounter))',
    },
  ],
  fluentFunctions: [
    {
      name: "Latest",
      libraryName: "MATGlobalCommonFunctionsQDM",
      libraryAlias: "Global",
      logic:
        'define function "Latest"(period Interval<DateTime> ):\n  if ( HasEnd(period)) then \n  end of period \n    else start of period',
    },
    {
      name: "HospitalizationLengthofStay",
      libraryName: "MATGlobalCommonFunctionsQDM",
      libraryAlias: "Global",
      logic:
        'define function "HospitalizationLengthofStay"(Encounter "Encounter, Performed" ):\n  LengthInDays("Hospitalization"(Encounter))',
    },
  ],
};

jest.mock("@madie/madie-util", () => ({
  useFeatureFlags: jest.fn().mockReturnValue({
    CQLBuilderIncludes: true,
    CQLBuilderDefinitions: true,
    QDMValueSetSearch: true,
    qdmCodeSearch: true,
  }),
  useOktaTokens: () => ({ getAccessToken: () => "test.jwt" }),
}));

const props = {
  canEdit: true,
  measureStoreCql: "test-cql",
  cqlMetaData: {},
  measureModel: "QDM 5.6",
  handleCodeDelete: jest.fn(),
  setEditorVal: jest.fn(),
  setIsCQLUnchanged: jest.fn(),
  isCQLUnchanged: true,
  handleApplyCode: jest.fn(),
  handleApplyValueSet: jest.fn(),
  handleApplyDefinition: jest.fn(),
  handleApplyLibrary: jest.fn(),
  handleDeleteLibrary: jest.fn(),
};
const { getByTestId } = screen;

describe("CqlBuilderPanel", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({
      data: { ...mockConfig },
    });
  });
  it("Should load to includes tab", async () => {
    render(<CqlBuilderPanel {...props} />);
    await waitFor(() => {
      expect(getByTestId("includes-tab")).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });
    userEvent.click(getByTestId("saved-libraries-tab"));
    await waitFor(() => {
      expect(getByTestId("saved-libraries-tab")).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });
  });

  it("Should load to valueSets tab", async () => {
    useFeatureFlags.mockImplementationOnce(() => ({
      CQLBuilderIncludes: false,
      QDMValueSetSearch: true,
      CQLBuilderDefinitions: false,
    }));
    render(<CqlBuilderPanel {...props} />);
    await waitFor(() => {
      expect(getByTestId("valueSets-tab")).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });
  });

  it("Should load to definitions tab", async () => {
    useFeatureFlags.mockImplementationOnce(() => ({
      CQLBuilderIncludes: true,
      QDMValueSetSearch: true,
      CQLBuilderDefinitions: true,
      qdmCodeSearch: true,
    }));
    render(<CqlBuilderPanel {...props} />);
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Definitions" })).toHaveAttribute(
        "aria-selected",
        "false"
      );
    });
    userEvent.click(screen.getByRole("tab", { name: "Definitions" }));
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Definitions" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });
  });

  it("Should display available parameters for building Expressions for QDM", async () => {
    useFeatureFlags.mockImplementationOnce(() => ({
      CQLBuilderIncludes: true,
      QDMValueSetSearch: true,
      CQLBuilderDefinitions: true,
      qdmCodeSearch: true,
    }));
    mockedAxios.put.mockResolvedValue({
      data: mockCqlBuilderLookUpData,
    });
    render(<CqlBuilderPanel {...props} />);
    userEvent.click(screen.getByRole("tab", { name: "Definitions" }));
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Definitions" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });
    const expressionEditorTab = screen.getByRole("button", {
      name: "Expression Editor",
    });
    userEvent.click(expressionEditorTab);

    const typeSelect = screen.getByTestId("type-selector");
    const typeSelectDropdown = within(typeSelect).getByRole(
      "button"
    ) as HTMLInputElement;
    userEvent.click(typeSelectDropdown);

    const optionsList = await screen.findAllByRole("option");
    expect(optionsList).toHaveLength(6);
    expect(optionsList[0]).toHaveTextContent("Parameters");
    userEvent.click(optionsList[0]);

    const nameSelect = screen.getByTestId("name-selector");
    expect(nameSelect).toBeEnabled();

    const nameSelectDropDown = within(nameSelect).getByTitle("Open");
    userEvent.click(nameSelectDropDown);

    const options = await screen.findAllByRole("option");
    expect(options.length).toBe(3);
    expect(options[0]).toHaveTextContent("AIFrailLTCF.Measurement Period");
    expect(options[1]).toHaveTextContent("Hospice.Measurement Period");
    expect(options[2]).toHaveTextContent("Measurement Period");
  });

  it("Should display error message when cql builder look up api failed for QDM", async () => {
    useFeatureFlags.mockImplementationOnce(() => ({
      CQLBuilderIncludes: true,
      QDMValueSetSearch: true,
      CQLBuilderDefinitions: true,
      qdmCodeSearch: true,
    }));
    mockedAxios.put.mockRejectedValueOnce({
      data: {
        status: 500,
        message: "Unable to parse CQL",
      },
    });
    render(<CqlBuilderPanel {...props} />);
    userEvent.click(screen.getByRole("tab", { name: "Definitions" }));
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Definitions" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });

    expect(
      screen.getByText(
        "Unable to retrieve CQL builder lookups. Please verify CQL has no errors. If CQL is valid, please contact the help desk."
      )
    ).toBeInTheDocument();
  });

  it("Should display available parameters for building Expressions for QiCore", async () => {
    useFeatureFlags.mockImplementationOnce(() => ({
      CQLBuilderIncludes: true,
      QDMValueSetSearch: true,
      CQLBuilderDefinitions: true,
      qdmCodeSearch: true,
    }));
    mockedAxios.put.mockResolvedValue({
      data: mockCqlBuilderLookUpData,
    });
    props.measureModel = "QiCore 4.1.1";
    render(<CqlBuilderPanel {...props} />);
    userEvent.click(screen.getByRole("tab", { name: "Definitions" }));
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Definitions" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });
    const expressionEditorTab = screen.getByRole("button", {
      name: "Expression Editor",
    });
    userEvent.click(expressionEditorTab);

    const typeSelect = screen.getByTestId("type-selector");
    const typeSelectDropdown = within(typeSelect).getByRole(
      "button"
    ) as HTMLInputElement;
    userEvent.click(typeSelectDropdown);

    const optionsList = await screen.findAllByRole("option");
    expect(optionsList).toHaveLength(6);
    expect(optionsList[0]).toHaveTextContent("Parameters");
    userEvent.click(optionsList[0]);

    const nameSelect = screen.getByTestId("name-selector");
    expect(nameSelect).toBeEnabled();

    const nameSelectDropDown = within(nameSelect).getByTitle("Open");
    userEvent.click(nameSelectDropDown);

    const options = await screen.findAllByRole("option");
    expect(options.length).toBe(3);
    expect(options[0]).toHaveTextContent("AIFrailLTCF.Measurement Period");
    expect(options[1]).toHaveTextContent("Hospice.Measurement Period");
    expect(options[2]).toHaveTextContent("Measurement Period");
  });

  it("Should display error message when cql builder look up api failed for QiCore", async () => {
    useFeatureFlags.mockImplementationOnce(() => ({
      CQLBuilderIncludes: true,
      QDMValueSetSearch: true,
      CQLBuilderDefinitions: true,
      qdmCodeSearch: true,
    }));
    mockedAxios.put.mockRejectedValueOnce({
      data: {
        status: 500,
        message: "Unable to parse CQL",
      },
    });
    props.measureModel = "QiCore 4.1.1";
    render(<CqlBuilderPanel {...props} />);
    userEvent.click(screen.getByRole("tab", { name: "Definitions" }));
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Definitions" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });

    expect(
      screen.getByText(
        "Unable to retrieve CQL builder lookups. Please verify CQL has no errors. If CQL is valid, please contact the help desk."
      )
    ).toBeInTheDocument();
  });

  it("Should display available definitions for building Expressions for QDM", async () => {
    useFeatureFlags.mockImplementationOnce(() => ({
      CQLBuilderIncludes: true,
      QDMValueSetSearch: true,
      CQLBuilderDefinitions: true,
      qdmCodeSearch: true,
    }));
    mockedAxios.put.mockResolvedValue({
      data: mockCqlBuilderLookUpData,
    });
    render(<CqlBuilderPanel {...props} />);
    userEvent.click(screen.getByRole("tab", { name: "Definitions" }));
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Definitions" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });
    const expressionEditorTab = screen.getByRole("button", {
      name: "Expression Editor",
    });
    userEvent.click(expressionEditorTab);

    const typeSelect = screen.getByTestId("type-selector");
    const typeSelectDropdown = within(typeSelect).getByRole(
      "button"
    ) as HTMLInputElement;
    userEvent.click(typeSelectDropdown);

    const optionsList = await screen.findAllByRole("option");
    expect(optionsList).toHaveLength(6);
    expect(optionsList[1]).toHaveTextContent("Definitions");
    userEvent.click(optionsList[1]);

    const nameSelect = screen.getByTestId("name-selector");
    expect(nameSelect).toBeEnabled();

    const nameSelectDropDown = within(nameSelect).getByTitle("Open");
    userEvent.click(nameSelectDropDown);

    const options = await screen.findAllByRole("option");
    expect(options.length).toBe(2);
    expect(options[0]).toHaveTextContent("CQMCommon");
    expect(options[1]).toHaveTextContent("SDE Payer");
  });

  it("Should display available parameters for building Expressions for QiCore", async () => {
    useFeatureFlags.mockImplementationOnce(() => ({
      CQLBuilderIncludes: true,
      QDMValueSetSearch: true,
      CQLBuilderDefinitions: true,
      qdmCodeSearch: true,
    }));
    mockedAxios.put.mockResolvedValue({
      data: mockCqlBuilderLookUpData,
    });
    props.measureModel = "QiCore 4.1.1";
    render(<CqlBuilderPanel {...props} />);
    userEvent.click(screen.getByRole("tab", { name: "Definitions" }));
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Definitions" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });
    const expressionEditorTab = screen.getByRole("button", {
      name: "Expression Editor",
    });
    userEvent.click(expressionEditorTab);

    const typeSelect = screen.getByTestId("type-selector");
    const typeSelectDropdown = within(typeSelect).getByRole(
      "button"
    ) as HTMLInputElement;
    userEvent.click(typeSelectDropdown);

    const optionsList = await screen.findAllByRole("option");
    expect(optionsList).toHaveLength(6);
    expect(optionsList[1]).toHaveTextContent("Definitions");
    userEvent.click(optionsList[1]);

    const nameSelect = screen.getByTestId("name-selector");
    expect(nameSelect).toBeEnabled();

    const nameSelectDropDown = within(nameSelect).getByTitle("Open");
    userEvent.click(nameSelectDropDown);

    const options = await screen.findAllByRole("option");
    expect(options.length).toBe(2);
    expect(options[0]).toHaveTextContent("CQMCommon");
    expect(options[1]).toHaveTextContent("SDE Payer");
  });

  it("Should display available functions for building Expressions for QDM", async () => {
    useFeatureFlags.mockImplementationOnce(() => ({
      CQLBuilderIncludes: true,
      QDMValueSetSearch: true,
      CQLBuilderDefinitions: true,
      qdmCodeSearch: true,
    }));
    mockedAxios.put.mockResolvedValue({
      data: mockCqlBuilderLookUpData,
    });
    render(<CqlBuilderPanel {...props} />);
    userEvent.click(screen.getByRole("tab", { name: "Definitions" }));
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Definitions" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });
    const expressionEditorTab = screen.getByRole("button", {
      name: "Expression Editor",
    });
    userEvent.click(expressionEditorTab);

    const typeSelect = screen.getByTestId("type-selector");
    const typeSelectDropdown = within(typeSelect).getByRole(
      "button"
    ) as HTMLInputElement;
    userEvent.click(typeSelectDropdown);

    const optionsList = await screen.findAllByRole("option");
    expect(optionsList).toHaveLength(6);
    expect(optionsList[2]).toHaveTextContent("Functions");
    userEvent.click(optionsList[2]);

    const nameSelect = screen.getByTestId("name-selector");
    expect(nameSelect).toBeEnabled();

    const nameSelectDropDown = within(nameSelect).getByTitle("Open");
    userEvent.click(nameSelectDropDown);

    const options = await screen.findAllByRole("option");
    expect(options.length).toBe(2);
    expect(options[0]).toHaveTextContent(
      "Global.HospitalizationLengthofStay()"
    );
    expect(options[1]).toHaveTextContent("Global.Latest()");
  });

  it("Should display available functions for building Expressions for QiCore", async () => {
    useFeatureFlags.mockImplementationOnce(() => ({
      CQLBuilderIncludes: true,
      QDMValueSetSearch: true,
      CQLBuilderDefinitions: true,
      qdmCodeSearch: true,
    }));
    mockedAxios.put.mockResolvedValue({
      data: mockCqlBuilderLookUpData,
    });
    props.measureModel = "QiCore 4.1.1";
    render(<CqlBuilderPanel {...props} />);
    userEvent.click(screen.getByRole("tab", { name: "Definitions" }));
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Definitions" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });
    const expressionEditorTab = screen.getByRole("button", {
      name: "Expression Editor",
    });
    userEvent.click(expressionEditorTab);

    const typeSelect = screen.getByTestId("type-selector");
    const typeSelectDropdown = within(typeSelect).getByRole(
      "button"
    ) as HTMLInputElement;
    userEvent.click(typeSelectDropdown);

    const optionsList = await screen.findAllByRole("option");
    expect(optionsList).toHaveLength(6);
    expect(optionsList[2]).toHaveTextContent("Functions");
    userEvent.click(optionsList[2]);

    const nameSelect = screen.getByTestId("name-selector");
    expect(nameSelect).toBeEnabled();

    const nameSelectDropDown = within(nameSelect).getByTitle("Open");
    userEvent.click(nameSelectDropDown);

    const options = await screen.findAllByRole("option");
    expect(options.length).toBe(2);
    expect(options[0]).toHaveTextContent(
      "Global.HospitalizationLengthofStay()"
    );
    expect(options[1]).toHaveTextContent("Global.Latest()");
  });

  it("Should display available fluent functions for building Expressions for QDM", async () => {
    useFeatureFlags.mockImplementationOnce(() => ({
      CQLBuilderIncludes: true,
      QDMValueSetSearch: true,
      CQLBuilderDefinitions: true,
      qdmCodeSearch: true,
    }));
    mockedAxios.put.mockResolvedValue({
      data: mockCqlBuilderLookUpData,
    });
    render(<CqlBuilderPanel {...props} />);
    userEvent.click(screen.getByRole("tab", { name: "Definitions" }));
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Definitions" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });
    const expressionEditorTab = screen.getByRole("button", {
      name: "Expression Editor",
    });
    userEvent.click(expressionEditorTab);

    const typeSelect = screen.getByTestId("type-selector");
    const typeSelectDropdown = within(typeSelect).getByRole(
      "button"
    ) as HTMLInputElement;
    userEvent.click(typeSelectDropdown);

    const optionsList = await screen.findAllByRole("option");
    expect(optionsList).toHaveLength(6);
    expect(optionsList[3]).toHaveTextContent("Fluent Functions");
    userEvent.click(optionsList[3]);

    const nameSelect = screen.getByTestId("name-selector");
    expect(nameSelect).toBeEnabled();

    const nameSelectDropDown = within(nameSelect).getByTitle("Open");
    userEvent.click(nameSelectDropDown);

    const options = await screen.findAllByRole("option");
    expect(options.length).toBe(2);
    expect(options[0]).toHaveTextContent("HospitalizationLengthofStay()");
    expect(options[1]).toHaveTextContent("Latest()");
  });

  it("Should display available fluent functions for building Expressions for QiCore", async () => {
    useFeatureFlags.mockImplementationOnce(() => ({
      CQLBuilderIncludes: true,
      QDMValueSetSearch: true,
      CQLBuilderDefinitions: true,
      qdmCodeSearch: true,
    }));
    mockedAxios.put.mockResolvedValue({
      data: mockCqlBuilderLookUpData,
    });
    props.measureModel = "QiCore 4.1.1";
    render(<CqlBuilderPanel {...props} />);
    userEvent.click(screen.getByRole("tab", { name: "Definitions" }));
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Definitions" })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });
    const expressionEditorTab = screen.getByRole("button", {
      name: "Expression Editor",
    });
    userEvent.click(expressionEditorTab);

    const typeSelect = screen.getByTestId("type-selector");
    const typeSelectDropdown = within(typeSelect).getByRole(
      "button"
    ) as HTMLInputElement;
    userEvent.click(typeSelectDropdown);

    const optionsList = await screen.findAllByRole("option");
    expect(optionsList).toHaveLength(6);
    expect(optionsList[3]).toHaveTextContent("Fluent Functions");
    userEvent.click(optionsList[3]);

    const nameSelect = screen.getByTestId("name-selector");
    expect(nameSelect).toBeEnabled();

    const nameSelectDropDown = within(nameSelect).getByTitle("Open");
    userEvent.click(nameSelectDropDown);

    const options = await screen.findAllByRole("option");
    expect(options.length).toBe(2);
    expect(options[0]).toHaveTextContent("HospitalizationLengthofStay()");
    expect(options[1]).toHaveTextContent("Latest()");
  });
});
