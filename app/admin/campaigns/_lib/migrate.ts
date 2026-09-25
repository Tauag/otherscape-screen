import type { Campaign } from "./types.ts";

export const CURRENT_SCHEMA_VERSION = 1;

type Doc = Record<string, unknown>;

/** A step upgrades a version-n document to version n+1. None exist yet: this
 *  is the schema's first version. lib/character/migrate.ts's `steps` map
 *  shows the pattern a later version follows. */
type Step = (doc: Doc) => Doc;

const steps = new Map<number, Step>();

/**
 * Upgrade a document read from the database. This is a trust boundary, so it
 * fails loudly rather than handing a wrong shape to the reducer. Mirrors
 * lib/character/migrate.ts.
 *
 * lazy: the field shapes inside the document are not checked, so a truncated or
 * hand-edited row still passes. Upgrade path: a per-version validator run at the
 * end of this function, either hand-written or Zod.
 */
export function migrate(doc: unknown): Campaign {
	if (typeof doc !== "object" || doc === null || Array.isArray(doc)) {
		throw new Error(
			`Campaign document is not an object (got ${typeName(doc)}).`,
		);
	}

	let current = doc as Doc;
	const version = current.schema_version;

	if (
		typeof version !== "number" ||
		!Number.isInteger(version) ||
		version < 1
	) {
		throw new Error(
			`Campaign document has no usable schema_version (got ${JSON.stringify(version) ?? typeName(version)}).`,
		);
	}

	if (version > CURRENT_SCHEMA_VERSION) {
		throw new Error(
			`Campaign document is schema_version ${version}, newer than this client reads (${CURRENT_SCHEMA_VERSION}). Reload to get the newer client.`,
		);
	}

	for (let from = version; from < CURRENT_SCHEMA_VERSION; from++) {
		const step = steps.get(from);
		if (!step) {
			throw new Error(
				`No migration step from schema_version ${from} to ${from + 1}.`,
			);
		}
		current = { ...step(current), schema_version: from + 1 };
	}

	return current as unknown as Campaign;
}

function typeName(value: unknown): string {
	if (value === null) return "null";
	return Array.isArray(value) ? "array" : typeof value;
}
