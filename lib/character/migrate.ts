import type { Character } from "./types.ts";

export const CURRENT_SCHEMA_VERSION = 2;

type Doc = Record<string, unknown>;

/** A step upgrades a version-n document to version n+1. */
type Step = (doc: Doc) => Doc;

// Adding a version is one entry here plus a bump of CURRENT_SCHEMA_VERSION.
// migrate sets schema_version itself, so a step only reshapes fields.
const steps = new Map<number, Step>();

// v1 predates essenceChosen: reducer.ts's autoEssence overwrote `essence`
// once, on whichever addTheme first reached 4 themes, then never touched it
// again - the exact staleness essenceChosen exists to fix. A v1 document's
// existing value is therefore never a real choice, only the old code's one-shot
// guess, so it starts unchosen and goes back to tracking the theme mix live.
steps.set(1, (doc) => ({ ...doc, essenceChosen: false }));

/**
 * Upgrade a document read from the database. This is a trust boundary, so it
 * fails loudly rather than handing a wrong shape to the reducer.
 *
 * lazy: the field shapes inside the document are not checked, so a truncated or
 * hand-edited row still passes. Upgrade path: a per-version validator run at the
 * end of this function, either hand-written or Zod.
 */
export function migrate(doc: unknown): Character {
  if (typeof doc !== "object" || doc === null || Array.isArray(doc)) {
    throw new Error(`Character document is not an object (got ${typeName(doc)}).`);
  }

  let current = doc as Doc;
  const version = current.schema_version;

  if (typeof version !== "number" || !Number.isInteger(version) || version < 1) {
    throw new Error(
      `Character document has no usable schema_version (got ${JSON.stringify(version) ?? typeName(version)}).`,
    );
  }

  if (version > CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `Character document is schema_version ${version}, newer than this client reads (${CURRENT_SCHEMA_VERSION}). Reload to get the newer client.`,
    );
  }

  for (let from = version; from < CURRENT_SCHEMA_VERSION; from++) {
    const step = steps.get(from);
    if (!step) {
      throw new Error(`No migration step from schema_version ${from} to ${from + 1}.`);
    }
    current = { ...step(current), schema_version: from + 1 };
  }

  return current as unknown as Character;
}

function typeName(value: unknown): string {
  if (value === null) return "null";
  return Array.isArray(value) ? "array" : typeof value;
}
