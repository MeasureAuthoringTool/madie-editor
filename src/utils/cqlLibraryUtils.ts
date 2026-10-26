export const getQualifiedLibraryName = (library: {
  cqlLibraryName: string;
  namespacePrefix?: string;
  externalLibrary?: boolean;
}): string =>
  library?.externalLibrary && library?.namespacePrefix
    ? `${library.namespacePrefix}.${library.cqlLibraryName}`
    : library?.cqlLibraryName;

// Segments that are not valid CQL identifiers are quoted
// e.g. fhir.onc.us-quality-core.USQualityCoreCommon -> fhir.onc."us-quality-core".USQualityCoreCommon
export const getCqlIncludeName = (qualifiedName: string): string =>
  qualifiedName
    ?.split(".")
    .map((segment) =>
      /^[A-Za-z_][A-Za-z0-9_]*$/.test(segment) || segment.startsWith('"')
        ? segment
        : `"${segment}"`
    )
    .join(".");

// Splits an included library name into its namespace prefix and library name, e.g.
// hl7.fhir.uv.cql.FHIRCommon -> { namespacePrefix: "hl7.fhir.uv.cql", name: "FHIRCommon" }
export const parseQualifiedLibraryName = (
  qualifiedName: string
): { namespacePrefix?: string; name: string } => {
  const lastDot = qualifiedName?.lastIndexOf(".") ?? -1;
  if (lastDot <= 0) {
    return { name: qualifiedName };
  }
  return {
    namespacePrefix: qualifiedName.substring(0, lastDot),
    name: qualifiedName.substring(lastDot + 1),
  };
};

export const getUsingModels = (cql: string): string[] => {
  if (!cql) {
    return [];
  }
  const cqlWithoutComments = cql
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  const usingStatement = /^\s*using\s+(.+?)\s+version\s+'([^']*)'/gm;
  const models: string[] = [];
  let match: RegExpExecArray;
  while ((match = usingStatement.exec(cqlWithoutComments)) !== null) {
    models.push(`${match[1].replace(/"/g, "")}:${match[2]}`);
  }
  return models;
};
