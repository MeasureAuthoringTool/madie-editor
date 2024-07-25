import { render, screen, waitFor } from "@testing-library/react";
import CqlBuilderPanel from "./CqlBuilderPanel";
import { useFeatureFlags } from "@madie/madie-util";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { ServiceConfig } from "../api/useServiceConfig";

const mockConfig: ServiceConfig = {
  qdmElmTranslationService: {
    baseUrl: "qdm.elm.com",
  },
  fhirElmTranslationService: {
    baseUrl: "fhir.elm.com",
  },
  terminologyService: {
    baseUrl: "terminology.com",
  },
};

jest.mock("@madie/madie-util", () => ({
  useFeatureFlags: jest.fn(),
  useOktaTokens: () => ({
    getAccessToken: () => "test.jwt",
  }),
  getOidFromString: () => "oid",
}));

jest.mock("../api/useServiceConfig", () => {
  return {
    useServiceConfig: jest.fn(() => Promise.resolve(mockConfig)),
  };
});

const props = {
  canEdit: true,
  measureStoreCql: "",
  cqlMetaData: {},
  measureModel: "QDM 5.6",
  handleCodeDelete: jest.fn(),
  setEditorVal: jest.fn(),
  setIsCQLUnchanged: jest.fn(),
  isCQLUnchanged: true,
  handleApplyCode: jest.fn(),
  handleApplyValueSet: jest.fn(),
};
const { getByTestId } = screen;
describe("CqlBuilderPanel", () => {
  it("Should load to includes page", async () => {
    useFeatureFlags.mockImplementationOnce(() => ({
      CQLBuilderIncludes: true,
      CQLBuilderDefinitions: true,
      QDMValueSetSearch: true,
      qdmCodeSearch: true,
    }));
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
  it("Should load to valueSets", async () => {
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
  it("Should load to includes tab", async () => {
    useFeatureFlags.mockImplementationOnce(() => ({
      CQLBuilderIncludes: true,
      QDMValueSetSearch: true,
      CQLBuilderDefinitions: true,
      qdmCodeSearch: true,
    }));
    render(<CqlBuilderPanel {...props} />);
    await waitFor(() => {
      expect(getByTestId("includes-tab")).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });
  });
});
