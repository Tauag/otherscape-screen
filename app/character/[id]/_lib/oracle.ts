// The solo oracle: a d6 yes/no answer and a major arcana draw. Pure, with the
// random source passed in, so the check in __tests__/oracle.test.ts can pin it.

export type Odds = "lean no" | "even" | "lean yes";

export const ANSWERS = ["No", "No, but…", "Yes, but…", "Yes"] as const;

/** Index into ANSWERS for a kept die. */
export const answerIndex = (face: number) =>
	face === 1 ? 0 : face <= 3 ? 1 : face <= 5 ? 2 : 3;

/** Uniform 0..n-1 from a [0, 1) source like Math.random. */
const below = (n: number, random: () => number) => Math.floor(random() * n);

/** Even rolls one d6. Lean yes and lean no roll two and keep the higher or
 *  lower, so the odds shift without changing the answer table. */
export function askOracle(odds: Odds, random = Math.random) {
	const dice =
		odds === "even"
			? [below(6, random) + 1]
			: [below(6, random) + 1, below(6, random) + 1];
	const kept = odds === "lean no" ? Math.min(...dice) : Math.max(...dice);
	return { dice, kept };
}

export type Card = {
	/** 0-21. */
	number: number;
	name: string;
	upright: string;
	reversed: string;
};

export type Draw = { card: Card; reversed: boolean };

/** A partial Fisher-Yates over a copy: no card repeats inside one spread. */
export function drawCards(count: number, random = Math.random): Draw[] {
	const deck = [...MAJOR_ARCANA];
	const drawn: Draw[] = [];
	for (let i = 0; i < count; i++) {
		const j = i + below(deck.length - i, random);
		[deck[i], deck[j]] = [deck[j], deck[i]];
		drawn.push({ card: deck[i], reversed: random() < 0.5 });
	}
	return drawn;
}

/** The card back, shown face down before a draw. */
export const BACK_ART = "/tarot/Back.svg";

/** The art in public/tarot/, named <Card_Name>_<two-digit number>.svg. */
export const artPath = (card: Card) =>
	`/tarot/${card.name.replaceAll(" ", "_")}_${String(card.number).padStart(2, "0")}.svg`;

export const MAJOR_ARCANA: Card[] = [
	{
		number: 0,
		name: "The Fool",
		upright: "Beginnings, a leap of faith, freedom, innocence",
		reversed: "Recklessness, hesitation, a foolish risk",
	},
	{
		number: 1,
		name: "The Magician",
		upright: "Willpower, skill, resources at hand, action",
		reversed: "Manipulation, trickery, untapped talent",
	},
	{
		number: 2,
		name: "The High Priestess",
		upright: "Intuition, hidden knowledge, the unseen",
		reversed: "Secrets kept, ignored instincts, surface answers",
	},
	{
		number: 3,
		name: "The Empress",
		upright: "Abundance, nurture, growth, comfort",
		reversed: "Smothering, neglect, stagnation",
	},
	{
		number: 4,
		name: "The Emperor",
		upright: "Authority, order, structure, control",
		reversed: "Tyranny, rigidity, a loss of control",
	},
	{
		number: 5,
		name: "The Hierophant",
		upright: "Tradition, institutions, doctrine, mentorship",
		reversed: "Rebellion, dogma questioned, a new path",
	},
	{
		number: 6,
		name: "The Lovers",
		upright: "Union, a choice of the heart, alignment",
		reversed: "Disharmony, a bad choice, divided loyalty",
	},
	{
		number: 7,
		name: "The Chariot",
		upright: "Drive, victory, momentum, control",
		reversed: "Lost direction, opposition, a stall",
	},
	{
		number: 8,
		name: "Strength",
		upright: "Courage, patience, quiet control",
		reversed: "Self-doubt, raw impulse, weakness",
	},
	{
		number: 9,
		name: "The Hermit",
		upright: "Solitude, reflection, searching, a guide",
		reversed: "Isolation, withdrawal, lost in thought",
	},
	{
		number: 10,
		name: "Wheel of Fortune",
		upright: "Fate, a turning point, cycles, luck",
		reversed: "Bad luck, resistance to change, a broken cycle",
	},
	{
		number: 11,
		name: "Justice",
		upright: "Truth, fairness, cause and effect, law",
		reversed: "Injustice, dishonesty, avoided accountability",
	},
	{
		number: 12,
		name: "The Hanged Man",
		upright: "Surrender, a new perspective, a pause",
		reversed: "Stalling, needless sacrifice, indecision",
	},
	{
		number: 13,
		name: "Death",
		upright: "Endings, transformation, transition",
		reversed: "Resisting change, stagnation, lingering",
	},
	{
		number: 14,
		name: "Temperance",
		upright: "Balance, moderation, patience, blending",
		reversed: "Excess, imbalance, haste",
	},
	{
		number: 15,
		name: "The Devil",
		upright: "Bondage, temptation, addiction, power",
		reversed: "Release, breaking free, facing a vice",
	},
	{
		number: 16,
		name: "The Tower",
		upright: "Sudden upheaval, revelation, collapse",
		reversed: "Averted disaster, fear of change, delayed collapse",
	},
	{
		number: 17,
		name: "The Star",
		upright: "Hope, renewal, guidance from afar",
		reversed: "Despair, lost faith, disconnection",
	},
	{
		number: 18,
		name: "The Moon",
		upright: "Illusion, fear, the subconscious, confusion",
		reversed: "Truth revealed, fear released, clarity",
	},
	{
		number: 19,
		name: "The Sun",
		upright: "Success, warmth, vitality, clarity",
		reversed: "Clouded joy, delay, overconfidence",
	},
	{
		number: 20,
		name: "Judgement",
		upright: "Reckoning, a calling, rebirth, absolution",
		reversed: "Self-doubt, ignoring the call, harsh judgment",
	},
	{
		number: 21,
		name: "The World",
		upright: "Completion, fulfillment, wholeness, travel",
		reversed: "Unfinished business, a shortcut, delay",
	},
];
