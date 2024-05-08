import * as React from "react";
import axios from "axios";
import { render, screen } from "@testing-library/react";
import SavedCodesSubSection from "./SavedCodesSubSection";
import { mockMeasureStoreCql } from "./MockMeasureStoreCql";
import { ServiceConfig } from "../../../../api/useServiceConfig";
import useTerminologyServiceApi, {
  Code,
  CodeStatus,
  TerminologyServiceApi,
} from "../../../../api/useTerminologyServiceApi";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockConfig: ServiceConfig = {
  elmTranslationService: {
    baseUrl: "elm.com",
  },
  terminologyService: {
    baseUrl: "terminology.com",
  },
};

const mockeCodeDetailsList = {
  data: [
    {
      name: "8462-4",
      display: "Diastolic blood pressure",
      version: "2.72",
      codeSystem: "LOINC",
      codeSystemOid: "2.16.840.1.113883.6.1",
      status: "ACTIVE",
    },
    {
      name: "8480-6",
      display: "Systolic blood pressure",
      version: "2.72",
      codeSystem: "LOINC",
      codeSystemOid: "2.16.840.1.113883.6.1",
      status: "ACTIVE",
    },
  ],
};

const mockTerminologyServiceApi = {
  getCodesListDetails: jest.fn().mockResolvedValue(mockeCodeDetailsList),
} as unknown as TerminologyServiceApi;

jest.mock("../../../../api/useTerminologyServiceApi", () =>
  jest.fn(() => mockTerminologyServiceApi)
);

const mockCodeList = [
  {
    code: "8462-4",
    codeSystem: "LOINC",
    oid: "'urn:oid:2.16.840.1.113883.6.1'",
  },
  {
    code: "8480-6",
    codeSystem: "LOINC",
    oid: "'urn:oid:2.16.840.1.113883.6.1'",
  },
];

describe("Saved Codes section component", () => {
  it("should display the saved codes table when navigated to the saved codes tab ", () => {
    render(<SavedCodesSubSection />);
    expect(
      screen.getByRole("columnheader", {
        name: "Code",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", {
        name: "Description",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", {
        name: "Code System",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", {
        name: "System Version",
      })
    ).toBeInTheDocument();
    const savedCodesTable = screen.getByTestId("saved-codes-tbl");
    expect(savedCodesTable).toBeInTheDocument();
  });

  it("should render the data in the table", async () => {
    mockedAxios.get.mockImplementation((url) => {
      if (url === "/env-config/serviceConfig.json") {
        return Promise.resolve({ data: mockConfig });
      }
    });
    await render(
      <SavedCodesSubSection measureStoreCql={mockMeasureStoreCql} />
    );

    expect(mockTerminologyServiceApi.getCodesListDetails).toHaveBeenCalledWith(
      mockCodeList
    );
  });
});
