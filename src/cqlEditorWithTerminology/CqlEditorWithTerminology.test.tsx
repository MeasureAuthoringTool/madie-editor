import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import CqlEditorWithTerminology from "./CqlEditorWithTerminology";
import axios from "axios";
import * as React from "react";
import { ServiceConfig } from "../api/useServiceConfig";
import { useFeatureFlags } from "@madie/madie-util";

jest.mock("axios");
jest.mock("@madie/madie-util", () => ({
  useFeatureFlags: jest.fn(() => {
    return {
      QDMValueSetSearch: true,
    };
  }),
  useOktaTokens: () => ({
    getAccessToken: () => "test.jwt",
  }),
  getOidFromString: () => "oid",
}));
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockConfig: ServiceConfig = {
  elmTranslationService: {
    baseUrl: "elm.com",
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
  it("should have madie editor and terminology panel", async () => {
    const props = {
      value: "",
      onChange: jest.fn(),
      handleClick: true,
    };
    render(<CqlEditorWithTerminology {...props} />);
    const valueSets = await screen.findByText("Value Sets");
    const codes = await screen.findByText("Codes");
    const definitions = await screen.findByText("Definitions");

    expect(valueSets).toHaveAttribute("aria-selected", "true");

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
  });
});
