/**
 * ModelInfo — loads static model-info JSON bundles for QDM/FHIR/QICore.
 * Called once per model and cached.
 */

export interface ModelAttribute {
  name: string;
  type: string;
}

export interface ModelTypeInfo {
  name: string;
  label: string;
  baseType: string;
  retrievable: boolean;
  attributes: ModelAttribute[];
}

// Lazy-loaded caches keyed by "MODEL-version"
const _typeCache: Record<string, ModelTypeInfo[]> = {};

/** Load and cache model type info for the given model/version. */
export function loadModelInfo(model: string, version?: string): ModelTypeInfo[] {
  const key = `${model}-${version ?? ""}`;
  if (_typeCache[key]) return _typeCache[key];

  const modelUpper = model.toUpperCase();
  let types: ModelTypeInfo[] = [];

  try {
    if (modelUpper === "QDM") {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      types = require("./model-info/qdm-5.6.json") as ModelTypeInfo[];
    } else if (modelUpper === "FHIR" || modelUpper.startsWith("QICORE")) {
      // QICore is a profile on FHIR — use the FHIR type catalog as baseline
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      types = require("./model-info/fhir-4.0.1.json") as ModelTypeInfo[];
    }
  } catch {
    // Silently fail if bundle not found — intellisense degrades gracefully
    types = [];
  }

  _typeCache[key] = types;
  return types;
}

/** Get all retrievable type names for a given model (for retrieve brackets). */
export function getRetrievableTypes(model: string | null, version?: string): ModelTypeInfo[] {
  if (!model) return [];
  return loadModelInfo(model, version).filter((t) => t.retrievable);
}

/** Get attributes for a named type (for dot-access completions). */
export function getTypeAttributes(
  typeName: string,
  model: string | null,
  version?: string
): ModelAttribute[] {
  if (!model) return [];
  const types = loadModelInfo(model, version);
  // Strip model prefix (e.g., "QDM.Encounter, Performed" → "Encounter, Performed")
  const bare = typeName.replace(/^[A-Za-z]+\./, "");
  const found = types.find(
    (t) => t.name === typeName || t.name === bare || t.label === typeName || t.label === bare
  );
  return found?.attributes ?? [];
}
