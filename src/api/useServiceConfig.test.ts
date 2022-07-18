import * as React from "react";
import { useServiceConfig, ServiceConfig } from "./useServiceConfig";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ELM Translation Service Config", () => {
  it("should retrieve ELM translation service configuration info", () => {
    expect.assertions(1);
    const config: ServiceConfig = {
      elmTranslationService: {
        baseUrl: "url",
      },
      terminologyService: {
        baseUrl: "url",
      },
    };
    const resp = { data: config };
    mockedAxios.get.mockResolvedValue(resp);
    useServiceConfig().then((result) => expect(result).toEqual(config));
  });

  it("should error if the config is inaccessible", async () => {
    expect.assertions(1);
    const resp = {
      data: {
        anotherService: {
          baseUrl: "url",
        },
      },
    };
    mockedAxios.get.mockResolvedValue(resp);
    try {
      await useServiceConfig();
    } catch (err) {
      expect(err.message).toBe("Invalid ELM Translation Service Config");
    }
  });
});

describe("Terminology Service Config", () => {
  it("should retrieve terminology service configuration info", () => {
    expect.assertions(1);
    const config: ServiceConfig = {
      elmTranslationService: {
        baseUrl: "url",
      },
      terminologyService: {
        baseUrl: "url",
      },
    };
    const resp = { data: config };
    mockedAxios.get.mockResolvedValue(resp);
    useServiceConfig().then((result) => expect(result).toEqual(config));
  });

  it("should error if the config is inaccessible", async () => {
    expect.assertions(1);
    const resp = {
      data: {
        elmTranslationService: {
          baseUrl: "url",
        },
      },
    };
    mockedAxios.get.mockResolvedValue(resp);
    try {
      await useServiceConfig();
    } catch (err) {
      expect(err.message).toBe("Invalid Terminology Service Config");
    }
  });
});
