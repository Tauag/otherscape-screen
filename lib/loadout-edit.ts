import type { Loadout, LoadoutSet, MarkCount } from "./character/types.ts";
import { UPGRADE_TRACK_LENGTH } from "./rules/constants.ts";

/** Every set verb below edits one set and leaves the rest alone. */
function inSet(
	loadout: Loadout,
	setId: string,
	edit: (set: LoadoutSet) => LoadoutSet,
): Loadout {
	return {
		...loadout,
		sets: loadout.sets.map((set) => (set.id === setId ? edit(set) : set)),
	};
}

export function addLoadoutSet(loadout: Loadout, id: string): Loadout {
	return {
		...loadout,
		sets: [
			...loadout.sets,
			{ id, title: "", titleLoaded: false, features: [], weaknesses: [] },
		],
	};
}

export function editLoadoutSetTitle(
	loadout: Loadout,
	setId: string,
	text: string,
): Loadout {
	return inSet(loadout, setId, (set) => ({ ...set, title: text }));
}

export function removeLoadoutSet(loadout: Loadout, setId: string): Loadout {
	return { ...loadout, sets: loadout.sets.filter((set) => set.id !== setId) };
}

/**
 * A feature can't stay loaded without its title, so turning the title off
 * unloads every feature in the same stroke.
 */
export function toggleLoadoutSetTitle(
	loadout: Loadout,
	setId: string,
): Loadout {
	return inSet(loadout, setId, (set) => {
		const titleLoaded = !set.titleLoaded;
		return {
			...set,
			titleLoaded,
			features: titleLoaded
				? set.features
				: set.features.map((f) => ({ ...f, loaded: false })),
		};
	});
}

export function addLoadoutFeature(
	loadout: Loadout,
	setId: string,
	id: string,
): Loadout {
	return inSet(loadout, setId, (set) => ({
		...set,
		features: [...set.features, { id, text: "", loaded: false }],
	}));
}

export function editLoadoutFeature(
	loadout: Loadout,
	setId: string,
	featureId: string,
	text: string,
): Loadout {
	return inSet(loadout, setId, (set) => ({
		...set,
		features: set.features.map((f) =>
			f.id === featureId ? { ...f, text } : f,
		),
	}));
}

export function removeLoadoutFeature(
	loadout: Loadout,
	setId: string,
	featureId: string,
): Loadout {
	return inSet(loadout, setId, (set) => ({
		...set,
		features: set.features.filter((f) => f.id !== featureId),
	}));
}

/** A no-op while the title isn't loaded: a feature can never load ahead of it. */
export function toggleLoadoutFeature(
	loadout: Loadout,
	setId: string,
	featureId: string,
): Loadout {
	return inSet(loadout, setId, (set) => ({
		...set,
		features: set.features.map((f) =>
			f.id === featureId && (f.loaded || set.titleLoaded)
				? { ...f, loaded: !f.loaded }
				: f,
		),
	}));
}

export function addLoadoutWeakness(
	loadout: Loadout,
	setId: string,
	id: string,
): Loadout {
	return inSet(loadout, setId, (set) => ({
		...set,
		weaknesses: [...set.weaknesses, { id, text: "" }],
	}));
}

export function editLoadoutWeakness(
	loadout: Loadout,
	setId: string,
	weaknessId: string,
	text: string,
): Loadout {
	return inSet(loadout, setId, (set) => ({
		...set,
		weaknesses: set.weaknesses.map((w) =>
			w.id === weaknessId ? { ...w, text } : w,
		),
	}));
}

export function removeLoadoutWeakness(
	loadout: Loadout,
	setId: string,
	weaknessId: string,
): Loadout {
	return inSet(loadout, setId, (set) => ({
		...set,
		weaknesses: set.weaknesses.filter((w) => w.id !== weaknessId),
	}));
}

export function incrementWildcards(loadout: Loadout): Loadout {
	return { ...loadout, wildcards: loadout.wildcards + 1 };
}

export function decrementWildcards(loadout: Loadout): Loadout {
	return { ...loadout, wildcards: Math.max(0, loadout.wildcards - 1) };
}

export function adjustLoadoutPower(loadout: Loadout, delta: number): Loadout {
	return {
		...loadout,
		availablePower: Math.max(0, loadout.availablePower + delta),
	};
}

export function markLoadoutUpgrade(loadout: Loadout): Loadout {
	const { upgrade } = loadout;
	const next =
		upgrade >= UPGRADE_TRACK_LENGTH ? 0 : ((upgrade + 1) as MarkCount);
	return { ...loadout, upgrade: next >= UPGRADE_TRACK_LENGTH ? 0 : next };
}

export type UpgradeChoice = "power" | "special";

export function takeLoadoutUpgrade(
	loadout: Loadout,
	choice: UpgradeChoice,
): Loadout {
	return {
		...loadout,
		upgrade: 0,
		availablePower: loadout.availablePower + (choice === "power" ? 1 : 0),
	};
}
