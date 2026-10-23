import * as React from "react";
import axios from "../../../api/axios-instance";
import { mockServiceConfig } from "../../../__mocks__/mockServiceConfig";
import { render, waitFor, within, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SavedLibraryIncludes from "./SavedLibraryIncludes";

jest.mock("../../../api/axios-instance");
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock("../../../api/useServiceConfig", () => ({
  useServiceConfig: jest.fn(() => mockServiceConfig),
}));

jest.mock("@madie/madie-util", () => ({
  useOktaTokens: () => ({ getAccessToken: () => "test.jwt" }),
}));

const cql =
  "library NpmTest version '0.0.000'\n" +
  "using QICore version '4.1.1'\n" +
  "include hl7.fhir.uv.cql.FHIRCommon version '2.0.0' called FC";

const npmLibraryVersions = [
  {
    id: "ext-1",
    cqlLibraryName: "FHIRCommon",
    version: "1.0.0",
    librarySetId: "ext-set",
    namespacePrefix: "hl7.fhir.uv.cql",
    publisher: "HL7 International",
    cql: "library FHIRCommon version '1.0.0'",
    external: true,
  },
  {
    id: "ext-2",
    cqlLibraryName: "FHIRCommon",
    version: "2.0.0",
    librarySetId: "ext-set",
    namespacePrefix: "hl7.fhir.uv.cql",
    publisher: "HL7 International",
    cql: "library FHIRCommon version '2.0.0'",
    external: true,
  },
];

const props = {
  cql,
  canEdit: true,
  measureModel: "US Quality Core v0.5.0",
  handleDeleteLibrary: jest.fn(),
  isCQLUnchanged: true,
  hasCqlError: false,
  setEditorValue: jest.fn(),
  setIsCQLUnchanged: jest.fn(),
  handleEditLibrary: jest.fn(),
};

describe("SavedLibraryIncludes with NPM libraries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes("/cql-libraries/library-set/ext-set")) {
        return Promise.resolve({
          data: { librarySet: {}, libraries: npmLibraryVersions },
          status: 200,
        });
      }
      return Promise.resolve({ data: npmLibraryVersions[1], status: 200 });
    });
  });

  it("Should fetch the NPM library using its namespace prefix", async () => {
    render(<SavedLibraryIncludes {...props} />);
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "library-service.com/cql-libraries/versioned",
        expect.objectContaining({
          params: {
            name: "FHIRCommon",
            version: "2.0.0",
            includeElm: false,
            namespacePrefix: "hl7.fhir.uv.cql",
          },
        })
      );
    });
  });

  it("Should list the NPM library with its prefix and the From HL7 IG pill", async () => {
    render(<SavedLibraryIncludes {...props} />);
    const table = screen.getByRole("table");
    await waitFor(() => {
      const columns = table.querySelectorAll("tbody tr td");
      expect(Array.from(columns).map((c) => c.textContent.trim())).toEqual([
        "FC",
        "hl7.fhir.uv.cql.FHIRCommonFrom HL7 IG",
        "2.0.0",
        "HL7 International",
        "",
      ]);
    });
    const chip = screen.getByLabelText("External");
    expect(chip).toHaveTextContent("From HL7 IG");
    expect(chip).toHaveClass("chip-external");
    userEvent.hover(chip);
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "These libraries are created and stored in NPM and cannot be edited in MADiE"
    );
  });

  it("Should open NPM library details with prefixed name and CQL on edit", async () => {
    render(<SavedLibraryIncludes {...props} />);
    userEvent.click(await screen.findByTestId("edit-button-0"));

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "library-service.com/cql-libraries/library-set/ext-set",
        expect.anything()
      );
    });
    const dialog = await screen.findByTestId("view-apply-library-dialog");
    const nameContainer = within(dialog).getByTestId("library-name-container");
    expect(nameContainer).toHaveTextContent("hl7.fhir.uv.cql.FHIRCommon");
    expect(within(dialog).getByTestId("library-alias-input")).toHaveValue("FC");
    expect(within(dialog).getByTestId("version-select-input")).toHaveValue(
      "2.0.0"
    );
    expect(
      within(dialog).getByTestId("library-owner-container")
    ).toHaveTextContent("HL7 International");
  });

  it("Should delete the NPM library using its prefixed name", async () => {
    render(<SavedLibraryIncludes {...props} />);
    userEvent.click(await screen.findByTestId("delete-button-0"));
    userEvent.click(screen.getByRole("button", { name: /Yes, Delete/i }));
    expect(props.handleDeleteLibrary).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "hl7.fhir.uv.cql.FHIRCommon",
        version: "2.0.0",
        alias: "FC",
      })
    );
  });

  it("Should look up an NPM library with a quoted prefix segment without the quotes", async () => {
    const quotedCql =
      "library NpmTest version '0.0.000'\n" +
      "using USQualityCore version '0.5.0'\n" +
      "include fhir.onc.\"us-quality-core\".USQualityCoreCommon version '0.5.0' called UQC";
    mockedAxios.get.mockImplementation(() =>
      Promise.resolve({
        data: {
          id: "ext-uqc",
          cqlLibraryName: "USQualityCoreCommon",
          version: "0.5.0",
          librarySetId: "ext-uqc-set",
          namespacePrefix: "fhir.onc.us-quality-core",
          publisher: "ONC",
          external: true,
        },
        status: 200,
      })
    );
    render(<SavedLibraryIncludes {...props} cql={quotedCql} />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "library-service.com/cql-libraries/versioned",
        expect.objectContaining({
          params: {
            name: "USQualityCoreCommon",
            version: "0.5.0",
            includeElm: false,
            namespacePrefix: "fhir.onc.us-quality-core",
          },
        })
      );
    });
    const table = screen.getByRole("table");
    await waitFor(() => {
      const columns = table.querySelectorAll("tbody tr td");
      expect(columns[0]).toHaveTextContent("UQC");
      expect(columns[1].textContent).toEqual(
        "fhir.onc.us-quality-core.USQualityCoreCommon" + "From HL7 IG"
      );
    });

    userEvent.click(screen.getByTestId("delete-button-0"));
    userEvent.click(screen.getByRole("button", { name: /Yes, Delete/i }));
    expect(props.handleDeleteLibrary).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'fhir.onc."us-quality-core".USQualityCoreCommon',
        version: "0.5.0",
        alias: "UQC",
      })
    );
  });
});
