import * as React from "react";
import { act, render, screen } from "@testing-library/react";
import MadieAceEditor, {
  mapParserErrorsToAceAnnotations,
  mapParserErrorsToAceMarkers,
  useTranslateCqlToElm,
  useValidateCodes,
  validateValueSets,
} from "./madie-ace-editor";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-monokai";
import userEvent from "@testing-library/user-event";
import CqlError from "@madie/cql-antlr-parser/dist/src/dto/CqlError";
import {
  ElmTranslation,
  ElmTranslationError,
  ElmTranslationLibrary,
  ElmValueSet,
} from "../api/useElmTranslationServiceApi";
import { FHIRValueSet, CustomCqlCode } from "../api/useTerminologyServiceApi";
import { ServiceConfig } from "../api/useServiceConfig";
import {
  useTerminologyServiceApi,
  TerminologyServiceApi,
} from "@madie/madie-util";
import axios from "axios";

const elmTranslationLibraryWithValueSets: ElmTranslationLibrary = {
  annotation: [],
  contexts: undefined,
  identifier: undefined,
  parameters: undefined,
  schemaIdentifier: undefined,
  statements: undefined,
  usings: undefined,
  valueSets: {
    def: [
      {
        localId: "test1",
        locator: "25:1-25:97",
        id: "https://test.com/ValueSet/2.16.840.1.113762.1.4.1",
      },
      {
        localId: "test2",
        locator: "26:1-26:81",
        id: "https://test.com/ValueSet/2.16.840.1.114222.4.11.836",
      },
    ],
  },
};
const elmTranslationWithNoErrors: ElmTranslation = {
  externalErrors: [],
  errorExceptions: [],
  library: elmTranslationLibraryWithValueSets,
};

const fhirValuesetWithError: FHIRValueSet = {
  resourceType: "test",
  id: "2",
  url: "http://testurl.com",
  status: "active",
  errorMsg:
    "Request failed with status code 404 for oid = 2.16.840.1.113762.1.4. location = 26:1-26:96",
};

jest.mock("@madie/madie-util", () => ({
  useTerminologyServiceApi: jest.fn(),
  useOktaTokens: () => ({
    getAccessToken: () => "test.jwt",
  }),
}));

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockServiceConfig: ServiceConfig = {
  elmTranslationService: {
    baseUrl: "elm-translator.com",
  },
  terminologyService: {
    baseUrl: "terminology-service.com",
  },
};
jest.mock("../api/useServiceConfig", () => {
  return {
    useServiceConfig: jest.fn(() => Promise.resolve(mockServiceConfig)),
  };
});

describe("MadieAceEditor component", () => {
  beforeEach(() => {
    (useTerminologyServiceApi as jest.Mock).mockImplementation(() => {
      return {
        checkLogin: jest
          .fn()
          .mockRejectedValueOnce({ status: 404, data: false }),
      } as unknown as TerminologyServiceApi;
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should create madie editor", async () => {
    const props = {
      value: "",
      onChange: jest.fn(),
      handleClick: true,
    };
    const container = render(<MadieAceEditor {...props} />);
    expect(container).toBeDefined();
  });

  it("should create madie editor without default value prop", async () => {
    const props = {
      value: "",
      onChange: jest.fn(),
      setParseErrors: jest.fn(),
      handleClick: true,
    };
    const container = render(<MadieAceEditor {...props} />);
    expect(container).toBeDefined();
  });

  it("should call AceEditor with expected props", async () => {
    jest.useFakeTimers("modern");
    const handleValueChanges = (val) => val;
    const outputProps = {
      value: "",
      onChange: handleValueChanges,
    };
    const result = render(<MadieAceEditor {...outputProps} />);
    const editorValue = "using FHIR version 4.0.1";
    let aceEditor: any = await result.container.querySelector(
      "#ace-editor-wrapper textarea"
    );
    userEvent.paste(aceEditor, editorValue);

    aceEditor = await result.container.querySelector(
      "#ace-editor-wrapper textarea"
    );

    expect(aceEditor.value).toContain(editorValue);
  });

  it("should call props handleValueChanges with the expected value", async () => {
    jest.useFakeTimers("modern");
    const handleValueChanges = jest.fn();
    const typedValue = "this is invalid CQL";
    const outputProps = {
      value: "",
      onChange: handleValueChanges,
      setParseErrors: jest.fn(),
      handleClick: true,
      parseDebounceTime: 300,
      inboundAnnotations: [],
    };

    await act(async () => {
      const result = render(<MadieAceEditor {...outputProps} />);
      let aceEditor: any = await result.container.querySelector(
        "#ace-editor-wrapper textarea"
      );
      userEvent.paste(aceEditor, typedValue);
      jest.advanceTimersByTime(600);
      expect(handleValueChanges).toBeCalledWith(typedValue);
    });
  });

  it("should display parsing feedback followed by valid feedback", async () => {
    jest.useFakeTimers("modern");
    const props = {
      value: "",
      onChange: jest.fn(),
      parseDebounceTime: 300,
      setParseErrors: jest.fn(),
      handleClick: true,
      inboundAnnotations: [],
    };
    const typedText = "using FHIR version '4.0.1'";

    await act(async () => {
      const { rerender } = render(<MadieAceEditor {...props} />);
      const aceEditorInput = await screen.findByRole("textbox");
      userEvent.paste(aceEditorInput, typedText);
      props.value = typedText;
      rerender(<MadieAceEditor {...props} />);

      const parsingMessage = await screen.findByText("Parsing...");
      expect(parsingMessage).toBeInTheDocument();
      jest.advanceTimersByTime(600);
      const parseSuccess = await screen.findByText(
        "Parsing complete, CQL is valid"
      );
      expect(parseSuccess).toBeInTheDocument();
    });
  });

  it("should display parsing feedback followed by errors feedback", async () => {
    jest.useFakeTimers("modern");
    const props = {
      value: "",
      onChange: jest.fn(),
      parseDebounceTime: 300,
      setParseErrors: jest.fn(),
      handleClick: true,
      inboundAnnotations: [],
    };
    const typedText = "using FHIR version 4.0.1";

    await act(async () => {
      const { rerender } = render(<MadieAceEditor {...props} />);
      const parseSuccess = await screen.findByText(
        "Parsing complete, CQL is valid"
      );
      expect(parseSuccess).toBeInTheDocument();

      const aceEditorInput = await screen.findByRole("textbox");
      userEvent.paste(aceEditorInput, typedText);
      props.value = typedText;
      rerender(<MadieAceEditor {...props} />);

      const parsingMessage = await screen.findByText("Parsing...");
      expect(parsingMessage).toBeInTheDocument();
      jest.advanceTimersByTime(600);
      const parseError = await screen.findByText(
        //"1 issues were found with CQL...Please log in to UMLS"
        "1 issues were found with CQL..."
      );
      expect(parseError).toBeInTheDocument();
    });
  });

  it("should display parsing feedback followed by errors feedback with inbound errors included", async () => {
    jest.useFakeTimers("modern");
    const props = {
      value: "",
      onChange: jest.fn(),
      parseDebounceTime: 300,
      setParseErrors: jest.fn(),
      handleClick: true,
      inboundAnnotations: [
        {
          row: 0,
          column: 15,
          type: "error",
          text: `ELM: ${15}:${25} | ELM translation error`,
        },
      ],
    };
    const typedText = "using FHIR version 4.0.1";

    await act(async () => {
      const { rerender } = render(<MadieAceEditor {...props} />);
      const parseSuccess = await screen.findByText(
        "Parsing complete, CQL is valid"
      );
      expect(parseSuccess).toBeInTheDocument();

      const aceEditorInput = await screen.findByRole("textbox");
      userEvent.paste(aceEditorInput, typedText);
      props.value = typedText;
      rerender(<MadieAceEditor {...props} />);

      const parsingMessage = await screen.findByText("Parsing...");
      expect(parsingMessage).toBeInTheDocument();
      jest.advanceTimersByTime(600);
      const parseError = await screen.findByText(
        //"2 issues were found with CQL...Please log in to UMLS"
        "2 issues were found with CQL..."
      );
      expect(parseError).toBeInTheDocument();
    });
  });

  it("should display user content in the editor", async () => {
    jest.useFakeTimers("modern");
    const props = {
      value: "", // initial value before data is loaded
      onChange: jest.fn(),
      setParseErrors: jest.fn(),
      handleClick: true,
      parseDebounceTime: 300,
      inboundAnnotations: [],
    };

    await act(async () => {
      const { rerender } = render(<MadieAceEditor {...props} />);
      const aceEditorInput = await screen.findByRole("textbox");
      const parseSuccess = await screen.findByText(
        "Parsing complete, CQL is valid"
      );
      expect(parseSuccess).toBeInTheDocument();
      props.value = "library MATGlobalCommonFunctionsFHIR4 version '6.1.000'";
      rerender(<MadieAceEditor {...props} />);

      jest.advanceTimersByTime(600);
      const parseSuccess2 = await screen.findByText(
        "Parsing complete, CQL is valid"
      );
      expect(parseSuccess2).toBeInTheDocument();
    });
  });

  it("should apply readonly attribute", () => {
    jest.useFakeTimers("modern");
    const props = {
      value: "", // initial value before data is loaded
      onChange: jest.fn(),
      parseDebounceTime: 300,
      inboundAnnotations: [],
      readOnly: true,
    };

    render(<MadieAceEditor {...props} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("readonly");
  });

  describe("mapParserErrorsToAceAnnotations", () => {
    test("that the function returns an empty array with null input", () => {
      const annotations = mapParserErrorsToAceAnnotations(null);
      expect(annotations).toEqual([]);
    });

    test("that the function returns an empty array with undefined input", () => {
      const annotations = mapParserErrorsToAceAnnotations(undefined);
      expect(annotations).toEqual([]);
    });

    test("that the function maps parser errors to annotations", () => {
      const errors: CqlError[] = [
        {
          text: "error text",
          name: "error name",
          start: { line: 5, position: 10 },
          stop: { line: 5, position: 12 },
          message: `Cannot find symbol "Measurement Period"`,
        },
        {
          text: "error text",
          name: "error name",
          start: { line: 8, position: 24 },
          stop: { line: 8, position: 33 },
          message: `Cannot find symbol "LengthInDays"`,
        },
      ];

      const source = "error name";
      const annotations = mapParserErrorsToAceAnnotations(errors);
      expect(annotations).toHaveLength(2);
      expect(annotations).toEqual([
        {
          row: 4,
          column: 10,
          type: "error",
          text: `${source}: 10:12 | Cannot find symbol "Measurement Period"`,
        },
        {
          row: 7,
          column: 24,
          type: "error",
          text: `${source}: 24:33 | Cannot find symbol "LengthInDays"`,
        },
      ]);
    });
  });

  describe("map parser errors to ace markers", () => {
    test("that the function returns an empty array with null input", () => {
      const markers = mapParserErrorsToAceMarkers(null);
      expect(markers).toEqual([]);
    });

    test("that the function returns an empty array with undefined input", () => {
      const markers = mapParserErrorsToAceMarkers(undefined);
      expect(markers).toEqual([]);
    });

    test("that the function maps parser errors to annotations", () => {
      const errors: CqlError[] = [
        {
          text: "error text",
          name: "error name",
          start: { line: 5, position: 10 },
          stop: { line: 5, position: 12 },
          message: `Cannot find symbol "Measurement Period"`,
        },
        {
          text: "error text",
          name: "error name",
          start: { line: 8, position: 24 },
          stop: { line: 8, position: 33 },
          message: `Cannot find symbol "LengthInDays"`,
        },
      ];

      const markers = mapParserErrorsToAceMarkers(errors);
      expect(markers).toHaveLength(errors.length);
      expect(markers).toEqual([
        {
          range: {
            start: {
              row: 4,
              column: 10,
            },
            end: {
              row: 4,
              column: 12,
            },
          },
          clazz: "editor-error-underline",
          type: "text",
        },
        {
          range: {
            start: {
              row: 7,
              column: 24,
            },
            end: {
              row: 7,
              column: 33,
            },
          },
          clazz: "editor-error-underline",
          type: "text",
        },
      ]);
    });
  });

  describe("translateCqlToElm", () => {
    beforeEach(() => {
      (useTerminologyServiceApi as jest.Mock).mockImplementation(() => {
        return {
          checkLogin: jest
            .fn()
            .mockResolvedValueOnce({ status: 200, data: true }),
        } as unknown as TerminologyServiceApi;
      });
    });
    afterEach(() => {
      jest.clearAllMocks();
    });
    test("translateCqlToElm no errors", async () => {
      mockedAxios.put.mockImplementation((args) => {
        if (
          args &&
          args.startsWith(mockServiceConfig.elmTranslationService.baseUrl)
        ) {
          return Promise.resolve({
            data: { json: JSON.stringify(elmTranslationWithNoErrors) },
            status: 200,
          });
        }
      });
      const elmTranslation: ElmTranslation = await useTranslateCqlToElm("test");
      expect(elmTranslation.errorExceptions.length).toBe(0);
    });

    test("translateCqlToElm had errors", async () => {
      const translationErrors = [
        {
          startLine: 4,
          startChar: 19,
          endLine: 19,
          endChar: 23,
          errorSeverity: "Error",
          errorType: null,
          message: "Test error 123",
          targetIncludeLibraryId: "TestLibrary_QICore",
          targetIncludeLibraryVersionId: "5.0.000",
          type: null,
        },
        {
          startLine: 24,
          startChar: 7,
          endLine: 24,
          endChar: 15,
          errorSeverity: "Warning",
          errorType: null,
          message: "Test Warning 456",
          targetIncludeLibraryId: "TestLibrary_QICore",
          targetIncludeLibraryVersionId: "5.0.000",
          type: null,
        },
      ];

      const elmTranslationWithErrors: ElmTranslation = {
        externalErrors: [],
        errorExceptions: translationErrors,
        library: null,
      };
      mockedAxios.put.mockImplementation((args) => {
        if (
          args &&
          args.startsWith(mockServiceConfig.elmTranslationService.baseUrl)
        ) {
          return Promise.resolve({
            data: { json: JSON.stringify(elmTranslationWithErrors) },
            status: 200,
          });
        }
      });
      const elmTranslation: ElmTranslation = await useTranslateCqlToElm("test");
      expect(elmTranslation.errorExceptions.length).toBe(2);
    });
  });

  describe("validateCodes", () => {
    const customCqlCodesWithCodeSystemValid: CustomCqlCode[] = [
      {
        codeId: "'P'",
        codeSystem: {
          oid: "'https://terminology.hl7.org/CodeSystem/v3-ActPriority'",
          hits: 0,
          version: "'HL7V3.0_2021-03'",
          text:
            "codesystem 'ActPriority:HL7V3.0_2021-03':" +
            " 'https://terminology.hl7.org/CodeSystem/v3-ActPriority' version 'HL7V3.0_2021-03'",
          name: '"ActPriority:HL7V3.0_2021-03"',
          start: {
            line: 9,
            position: 0,
          },
          stop: {
            line: 9,
            position: 121,
          },
          errorMessage: "",
          valid: true,
        },
        hits: 0,
        text: "code 'preop': 'P' from 'ActPriority:HL7V3.0_2021-03' display 'preop'",
        name: '"preop"',
        start: {
          line: 11,
          position: 0,
        },
        stop: {
          line: 11,
          position: 67,
        },
        errorMessage: "invalid code",
        valid: false,
      },
    ];
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("validateCodes when user not logged in UMLS", async () => {
      const codesystemErrors: ElmTranslationError[] = await useValidateCodes(
        customCqlCodesWithCodeSystemValid,
        false
      );
      expect(codesystemErrors.length).toBe(2);
    });

    it("validateCodes has errors", async () => {
      mockedAxios.put.mockImplementation((args) => {
        if (
          args &&
          args.startsWith(mockServiceConfig.terminologyService.baseUrl)
        ) {
          return Promise.resolve({
            data: customCqlCodesWithCodeSystemValid,
            status: 200,
          });
        }
      });
      const codesystemErrors: ElmTranslationError[] = await useValidateCodes(
        customCqlCodesWithCodeSystemValid,
        true
      );
      expect(codesystemErrors.length).toBe(1);
    });
  });

  describe("validateValueSets", () => {
    const elmValuesets: ElmValueSet[] = [
      {
        localId: 1,
        locator: "25:1-25:97",
        name: "ONC Administrative Sex",
        id: "ValueSet/2.16.840.1.113762.1.4.",
      },
    ];
    const fhirValueset: FHIRValueSet = {
      resourceType: "ValueSet",
      id: "1-96",
      url: "http://testurl.com",
      status: "active",
      errorMsg: "",
    };

    it("validateValueSets has validation errors", async () => {
      mockedAxios.get.mockImplementation((args) => {
        if (
          args &&
          args.startsWith(mockServiceConfig.terminologyService.baseUrl)
        ) {
          return Promise.reject({
            data: null,
            status: 404,
            error: { message: "Not found!" },
          });
        }
      });
      const elmTranslationErrors: ElmTranslationError[] =
        await validateValueSets(elmValuesets, true);
      expect(elmTranslationErrors.length).toBe(1);
    });

    it("validateValueSets has no validation errors", async () => {
      mockedAxios.get.mockImplementation((args) => {
        if (
          args &&
          args.startsWith(mockServiceConfig.terminologyService.baseUrl)
        ) {
          return Promise.resolve({
            data: fhirValueset,
            status: 200,
          });
        }
      });
      const elmTranslationErrors: ElmTranslationError[] =
        await validateValueSets(elmValuesets, true);
      expect(elmTranslationErrors.length).toBe(0);
    });
  });

  describe("MadieAceEditor component with parse and translation errors as well as VSAC errors", () => {
    beforeEach(() => {
      (useTerminologyServiceApi as jest.Mock).mockImplementation(() => {
        return {
          checkLogin: jest
            .fn()
            .mockResolvedValueOnce({ status: 200, data: true }),
        } as unknown as TerminologyServiceApi;
      });
    });
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("MadieAceEditor component with parse errors and VSAC errors", async () => {
      mockedAxios.put.mockImplementation((args) => {
        if (
          args &&
          args.startsWith(mockServiceConfig.elmTranslationService.baseUrl)
        ) {
          return Promise.resolve({
            data: { json: JSON.stringify(elmTranslationWithNoErrors) },
            status: 200,
          });
        }
      });
      mockedAxios.get.mockImplementation((args) => {
        if (
          args &&
          args.startsWith(mockServiceConfig.terminologyService.baseUrl)
        ) {
          return Promise.reject({
            data: fhirValuesetWithError,
            status: 404,
          });
        }
      });

      jest.useFakeTimers("modern");
      const props = {
        value: "",
        onChange: jest.fn(),
        parseDebounceTime: 300,
        setParseErrors: jest.fn(),
        handleClick: true,
        inboundAnnotations: [
          {
            row: 0,
            column: 15,
            type: "error",
            text: `ELM: ${15}:${25} | ELM translation error`,
          },
        ],
      };

      const typedText =
        "using FHIR version 4.0.1" +
        "\n" +
        "codesystem \"ActPriority:HL7V3.0_2021-03\": 'http://terminology.hl7.org/CodeSystem/v3-ActPriority' version 'HL7V3.0_2021-03'" +
        "\n" +
        "code \"preop\": 'p' from \"ActPriority:HL7V3.0_2021-03\" display 'preop'" +
        "\n" +
        "valueset \"ONC Administrative Sex\": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.'";
      await act(async () => {
        const { rerender } = render(<MadieAceEditor {...props} />);
        const parseSuccess = await screen.findByText(
          "Parsing complete, CQL is valid"
        );
        expect(parseSuccess).toBeInTheDocument();

        const aceEditorInput = await screen.findByRole("textbox");
        userEvent.paste(aceEditorInput, typedText);
        props.value = typedText;
        rerender(<MadieAceEditor {...props} />);

        const parsingMessage = await screen.findByText("Parsing...");
        expect(parsingMessage).toBeInTheDocument();
        jest.advanceTimersByTime(600);
      });
      const parseError = await screen.findByText(
        "2 issues were found with CQL..."
      );
      expect(parseError).toBeInTheDocument();
    });
  });

  it("MadieAceEditor component with parse, translation errors", async () => {
    const translationErrors = [
      {
        startLine: 4,
        startChar: 19,
        endLine: 19,
        endChar: 23,
        errorSeverity: "Error",
        errorType: null,
        message: "Test error 123",
        targetIncludeLibraryId: "TestLibrary_QICore",
        targetIncludeLibraryVersionId: "5.0.000",
        type: null,
      },
      {
        startLine: 24,
        startChar: 7,
        endLine: 24,
        endChar: 15,
        errorSeverity: "Warning",
        errorType: null,
        message: "Test Warning 456",
        targetIncludeLibraryId: "TestLibrary_QICore",
        targetIncludeLibraryVersionId: "5.0.000",
        type: null,
      },
    ];
    const elmTranslationWithErrors: ElmTranslation = {
      externalErrors: [],
      errorExceptions: translationErrors,
      library: null,
    };
    mockedAxios.put.mockImplementation((args) => {
      if (
        args &&
        args.startsWith(mockServiceConfig.elmTranslationService.baseUrl)
      ) {
        return Promise.resolve({
          data: { json: JSON.stringify(elmTranslationWithErrors) },
          status: 200,
        });
      }
    });
    mockedAxios.get.mockImplementation((args) => {
      if (
        args &&
        args.startsWith(mockServiceConfig.terminologyService.baseUrl)
      ) {
        return Promise.reject({
          data: fhirValuesetWithError,
          status: 404,
        });
      }
    });

    jest.useFakeTimers("modern");
    const props = {
      value: "",
      onChange: jest.fn(),
      parseDebounceTime: 300,
      setParseErrors: jest.fn(),
      handleClick: true,
      inboundAnnotations: [
        {
          row: 0,
          column: 15,
          type: "error",
          text: `ELM: ${15}:${25} | ELM translation error`,
        },
      ],
    };

    const typedText =
      "using FHIR version 4.0.1" +
      "\n" +
      "codesystem \"ActPriority:HL7V3.0_2021-03\": 'http://terminology.hl7.org/CodeSystem/v3-ActPriority' version 'HL7V3.0_2021-03'" +
      "\n" +
      "code \"preop\": 'p' from \"ActPriority:HL7V3.0_2021-03\" display 'preop'" +
      "\n" +
      "valueset \"ONC Administrative Sex\": 'http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.'";
    await act(async () => {
      const { rerender } = render(<MadieAceEditor {...props} />);
      const parseSuccess = await screen.findByText(
        "Parsing complete, CQL is valid"
      );
      expect(parseSuccess).toBeInTheDocument();

      const aceEditorInput = await screen.findByRole("textbox");
      userEvent.paste(aceEditorInput, typedText);
      props.value = typedText;
      rerender(<MadieAceEditor {...props} />);

      const parsingMessage = await screen.findByText("Parsing...");
      expect(parsingMessage).toBeInTheDocument();
      jest.advanceTimersByTime(600);
    });
    const parseError = await screen.findByText(
      "2 issues were found with CQL..."
    );
    expect(parseError).toBeInTheDocument();
  });
});
