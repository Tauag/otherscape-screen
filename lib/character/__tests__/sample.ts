import { CURRENT_SCHEMA_VERSION } from "../migrate.ts";
import type { Character } from "../types.ts";

// An invented Metro:Otherscape character. It is the type check for types.ts, so
// it exercises every corner of the document: mixed theme types, a burnt tag, one
// question answered twice, a cross-themebook tag, a nascent replacement theme
// with its ghost memory, a loadout at budget, non-contiguous status tiers, and a
// scratched story tag.
export const sample: Character = {
	schema_version: CURRENT_SCHEMA_VERSION,
	name: "Kira Vance",
	essence: "Nexus",
	essenceChosen: true,
	playerName: "Ash",
	appearance:
		"Short grey coat, one chrome eye she never bothers to colour-match.",
	background:
		"Ten years in corpsec, then a case that ended with a burned file and a dead witness. She took the lantern off the body and has been carrying it since.",
	essenceSpecial:
		"Once per session, when an action is generally about Self, Mythos, or Noise, use the count of themes of that type as Power.",
	veteranSpecials: [
		"Nobody Stays Bought — spend 1 Power to learn who paid for the job.",
	],
	evolutions: {
		newEssenceType: false,
		broadPowerTag: false,
		veteranSpecials: 1,
		rideOffIntoTheSunset: false,
		sunderTheCosmology: false,
		totalReconstitution: false,
	},
	crew: [
		{ id: "cr-1", member: "Tamsin", tag: "she talked me off a ledge once" },
		{ id: "cr-2", member: "Oyelaran", tag: "I owe him a body" },
	],
	themes: [
		{
			id: "th-past",
			type: "self",
			themebook: "Troubled Past",
			powerTags: [
				{
					id: "pt-1",
					themebook: "Troubled Past",
					letter: "A",
					text: "ex-corpsec detective",
					burnt: false,
				},
				{
					id: "pt-2",
					themebook: "Troubled Past",
					letter: "C",
					text: "old badge number",
					burnt: false,
				},
				{
					id: "pt-3",
					themebook: "Troubled Past",
					letter: "C",
					text: "a favour owed by a desk sergeant",
					burnt: true,
				},
			],
			weaknessTags: [
				{
					id: "wt-1",
					letter: "B",
					text: "nobody at the precinct returns my calls",
				},
			],
			quote: "I walked away clean. That is the story I tell.",
			specials: [],
			upgrade: 2,
			decay: 1,
		},
		{
			id: "th-lantern",
			type: "mythos",
			themebook: "Artifact",
			powerTags: [
				{
					id: "pt-4",
					themebook: "Artifact",
					letter: "A",
					text: "the bone lantern",
					burnt: false,
				},
				{
					id: "pt-5",
					themebook: "Artifact",
					letter: "D",
					text: "burns on borrowed memory",
					burnt: false,
				},
				{
					id: "pt-6",
					themebook: "Esoterica",
					letter: "F",
					text: "reads the residue of a death",
					burnt: false,
				},
			],
			weaknessTags: [
				{
					id: "wt-2",
					letter: "A",
					text: "the lantern wants to be carried home",
				},
			],
			quote: "Light it only for the dead who ask.",
			specials: [
				"Borrowed Rites — a power tag here may answer a question from any Mythos themebook.",
			],
			upgrade: 0,
			decay: 3,
		},
		{
			id: "th-chrome",
			type: "noise",
			themebook: "Augmentation",
			powerTags: [
				{
					id: "pt-7",
					themebook: "Augmentation",
					letter: "A",
					text: "chromed reflexes",
					burnt: false,
				},
				{
					id: "pt-8",
					themebook: "Augmentation",
					letter: "B",
					text: "subdermal armour weave",
					burnt: false,
				},
			],
			weaknessTags: [
				{ id: "wt-3", letter: "C", text: "the chrome hums when I lie" },
			],
			quote: "Faster. Always faster.",
			specials: [],
			upgrade: 3,
			decay: 0,
		},
		{
			id: "th-dive",
			type: "noise",
			themebook: "Cyberspace",
			powerTags: [
				{
					id: "pt-9",
					themebook: "Cyberspace",
					letter: "A",
					text: "deep diver",
					burnt: false,
				},
			],
			weaknessTags: [],
			quote: "",
			specials: [],
			upgrade: 0,
			decay: 0,
		},
	],
	loadout: {
		sets: [
			{
				id: "ls-1",
				title: "reflex booster kit",
				titleLoaded: true,
				features: [
					{ id: "lf-1", text: "primed for a sprint", loaded: true },
					{ id: "lf-2", text: "spare cartridge", loaded: false },
				],
				weaknesses: [{ id: "lw-1", text: "the booster leaves me shaking" }],
			},
			{
				id: "ls-2",
				title: "the bone lantern's case",
				titleLoaded: false,
				features: [{ id: "lf-3", text: "warding chalk", loaded: false }],
				weaknesses: [],
			},
		],
		wildcards: 1,
		specials: [],
		availablePower: 4,
		upgrade: 1,
	},
	ghostMemories: [
		{
			id: "gm-1",
			lostAt: "2026-07-19T22:40:00.000Z",
			reason:
				"Decay filled the week she burned the case file. She let the expertise go with it.",
			theme: {
				id: "th-forensics",
				type: "self",
				themebook: "Expertise",
				powerTags: [
					{
						id: "pt-g1",
						themebook: "Expertise",
						letter: "A",
						text: "forensic pathologist",
						burnt: false,
					},
					{
						id: "pt-g2",
						themebook: "Expertise",
						letter: "E",
						text: "reads a wound like a sentence",
						burnt: true,
					},
				],
				weaknessTags: [
					{
						id: "wt-g1",
						letter: "D",
						text: "I need to be the one who is certain",
					},
				],
				quote: "The body does not lie to me.",
				specials: [],
				upgrade: 1,
				decay: 3,
			},
		},
	],
	statuses: [
		{
			id: "st-1",
			name: "exhausted",
			valence: "negative",
			tiers: [false, true, false, true, false, false],
			owner: "mine",
			out: false,
		},
		{
			id: "st-2",
			name: "amped-up",
			valence: "positive",
			tiers: [false, false, true, false, false, false],
			owner: "mine",
			out: false,
		},
		{
			id: "st-3",
			name: "hunted-by-the-syndicate",
			valence: "negative",
			tiers: [false, false, false, false, false, true],
			owner: "mc",
			out: false,
		},
	],
	storyTags: [
		{
			id: "sg-1",
			name: "rain-slicked rooftops",
			valence: "positive",
			scratched: false,
		},
		{
			id: "sg-2",
			name: "the alarm is live",
			valence: "negative",
			scratched: true,
		},
	],
	creationStep: null,
};
