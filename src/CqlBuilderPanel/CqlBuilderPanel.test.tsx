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
};
jest.mock("@madie/madie-util", () => ({
  useFeatureFlags: jest.fn().mockReturnValue({
    CQLBuilderIncludes: true,
    CQLBuilderDefinitions: true,
    QDMValueSetSearch: true,
    qdmCodeSearch: true,
  }),
  useOktaTokens: () => ({}),
  getAccessToken: () => "test.jwt",
  getOidFromString: () => "oid",
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

  it("Should display available parameters for building Expressions", async () => {
    useFeatureFlags.mockImplementationOnce(() => ({
      CQLBuilderIncludes: true,
      QDMValueSetSearch: true,
      CQLBuilderDefinitions: true,
      qdmCodeSearch: true,
    }));
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
    expect(optionsList).toHaveLength(5);
    expect(optionsList[0]).toHaveTextContent("Parameters");
    userEvent.click(optionsList[0]);

    const nameComboBox = screen.getByRole("combobox", { name: "Name" });
    expect(nameComboBox).toBeEnabled();

    // userEvent.click(nameComboBox);
    // const nameOptionsList = await screen.findAllByRole(/name-selector-option/i);
  });
});
