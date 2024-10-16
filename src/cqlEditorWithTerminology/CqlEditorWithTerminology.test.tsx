import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CqlEditorWithTerminology from "./CqlEditorWithTerminology";
import * as React from "react";
import { ServiceConfig } from "../api/useServiceConfig";

jest.mock("../api/axios-instance");
jest.mock("@madie/madie-util", () => ({
  useFeatureFlags: jest.fn(() => {
    return {
      QDMValueSetSearch: true,
      CQLBuilderDefinitions: true,
      CQLBuilderIncludes: true,
      qdmCodeSearch: true,
    };
  }),
  useOktaTokens: () => ({
    getAccessToken: () => "test.jwt",
  }),
  getOidFromString: () => "oid",
}));

const mockConfig: ServiceConfig = {
  cqlLibraryService: { baseUrl: "cql.library.service" },
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
jest.mock("../api/useServiceConfig", () => {
  return {
    useServiceConfig: jest.fn(() => Promise.resolve(mockConfig)),
  };
});
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe("CqlEditorWithTerminology component", () => {
  it("should have CQL Builder panel closed by default", async () => {
    const props = {
      value: "",
      onChange: jest.fn(),
      handleClick: true,
      handleApplyValueSet: jest.fn(),
      handleApplyLibrary: jest.fn(),
      handleDeleteLibrary: jest.fn(),
      measureModel: "QDM 5.6",
    };
    render(<CqlEditorWithTerminology {...props} />);

    expect(screen.getByTestId("expanded-button")).toBeInTheDocument();
    expect(screen.queryByTestId("valueSets-tab")).not.toBeInTheDocument();
  });

  it("should emit toggleEditorSearchBox event on search button click", async () => {
    const eventListenerSpy = jest.fn();
    window.addEventListener("toggleEditorSearchBox", eventListenerSpy);
    const props = {
      value: "",
      onChange: jest.fn(),
      handleClick: true,
      handleApplyValueSet: jest.fn(),
      handleApplyLibrary: jest.fn(),
      handleDeleteLibrary: jest.fn(),
      measureModel: "QDM 5.6",
    };
    render(<CqlEditorWithTerminology {...props} />);
    const searchButton = screen.getByTestId("editor-search-button");
    userEvent.click(searchButton);
    expect(eventListenerSpy).toHaveBeenCalledTimes(1);
    window.removeEventListener("toggleEditorSearchBox", eventListenerSpy);
  });

  it("should have madie editor and CQL Builder panel after clicking expanded icon", async () => {
    const props = {
      value: "",
      onChange: jest.fn(),
      handleClick: true,
      handleApplyValueSet: jest.fn(),
      handleApplyLibrary: jest.fn(),
      measureModel: "QDM 5.6",
    };
    render(<CqlEditorWithTerminology {...props} />);

    const expandBtn = screen.getByTestId("expanded-button");
    expect(expandBtn).toBeInTheDocument();

    act(() => {
      fireEvent.click(expandBtn);
    });

    const collapseBtn = screen.getByTestId("collapsed-button");
    expect(collapseBtn).toBeInTheDocument();

    expect(await screen.findByTestId("valueSets-tab")).toBeInTheDocument();

    const valueSets = await screen.findByText("Value Sets");
    const codes = await screen.findByText("Codes");
    const definitions = await screen.findByText("Definitions");
    const includes = await screen.findByText("Includes");

    expect(includes).toHaveAttribute("aria-selected", "true");

    act(() => {
      fireEvent.click(codes);
    });
    await waitFor(() => {
      expect(codes).toHaveAttribute("aria-selected", "true");
    });

    act(() => {
      fireEvent.click(definitions);
    });
    await waitFor(() => {
      expect(definitions).toHaveAttribute("aria-selected", "true");
    });
    act(() => {
      fireEvent.click(valueSets);
    });
    await waitFor(() => {
      expect(valueSets).toHaveAttribute("aria-selected", "true");
    });

    fireEvent.click(collapseBtn);
    expect(await screen.queryByTestId("valueSets-tab")).not.toBeInTheDocument();
  });
});
