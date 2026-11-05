import {
  getCqlIncludeName,
  getQualifiedLibraryName,
  getUsingModels,
  parseQualifiedLibraryName,
} from "./cqlLibraryUtils";

describe("cqlLibraryUtils", () => {
  it("Should quote name segments that are not valid CQL identifiers", () => {
    expect(
      getCqlIncludeName("fhir.onc.us-quality-core.USQualityCoreCommon")
    ).toEqual('fhir.onc."us-quality-core".USQualityCoreCommon');
    expect(getCqlIncludeName('fhir.onc."us-quality-core".Common')).toEqual(
      'fhir.onc."us-quality-core".Common'
    );
    expect(getCqlIncludeName("hl7.fhir.uv.cql.FHIRCommon")).toEqual(
      "hl7.fhir.uv.cql.FHIRCommon"
    );
    expect(getCqlIncludeName("FHIRHelpers")).toEqual("FHIRHelpers");
  });

  it("Should get the models declared by the using statements of the CQL", () => {
    const cql =
      "library Test1bjjb version '1.0.000'\n" +
      "using USQualityCore version '0.5.0'\n" +
      "using USCore version '6.1.0-derived'\n" +
      "// using USCore version '7.1.0-derived'\n" +
      "/* using QICore version '4.1.1' */\n" +
      "using \"FHIR\" version '4.0.1' called FHIR\n" +
      'define "using statements": true';
    expect(getUsingModels(cql)).toEqual([
      "USQualityCore:0.5.0",
      "USCore:6.1.0-derived",
      "FHIR:4.0.1",
    ]);
    expect(getUsingModels("")).toEqual([]);
    expect(getUsingModels(undefined)).toEqual([]);
  });

  it("Should build and parse qualified library names", () => {
    expect(
      getQualifiedLibraryName({
        cqlLibraryName: "FHIRCommon",
        namespacePrefix: "hl7.fhir.uv.cql",
        externalLibrary: true,
      })
    ).toEqual("hl7.fhir.uv.cql.FHIRCommon");
    expect(getQualifiedLibraryName({ cqlLibraryName: "Test_1" })).toEqual(
      "Test_1"
    );
    expect(parseQualifiedLibraryName("hl7.fhir.uv.cql.FHIRCommon")).toEqual({
      namespacePrefix: "hl7.fhir.uv.cql",
      name: "FHIRCommon",
    });
    expect(parseQualifiedLibraryName("FHIRHelpers")).toEqual({
      name: "FHIRHelpers",
    });
  });
});
