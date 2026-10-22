// The pure half of a 2d6 roll: checking what the client sent, and the Discord
// webhook body that announces the result. roll-action.ts does the I/O.

import { signed } from "@/app/character/[id]/_lib/roll-selection";

/** One `power().lines` entry with the name rollLabels() gave it. */
export type RollLine = { label: string; value: number; counted: boolean };

export type Dice = [number, number];

const MAX_LINES = 40;
const MAX_VALUE = 20;
const MAX_LABEL = 80;

/** The client is untrusted: anything off-shape rejects the whole roll. */
export function cleanLines(value: unknown): RollLine[] | null {
	if (!Array.isArray(value) || value.length > MAX_LINES) return null;
	const lines: RollLine[] = [];
	for (const line of value) {
		if (typeof line !== "object" || line === null) return null;
		const { label, value: power, counted } = line as Record<string, unknown>;
		if (
			typeof label !== "string" ||
			typeof power !== "number" ||
			!Number.isInteger(power) ||
			Math.abs(power) > MAX_VALUE ||
			typeof counted !== "boolean"
		)
			return null;
		lines.push({
			label: label.trim().slice(0, MAX_LABEL) || "Unnamed",
			value: power,
			counted,
		});
	}
	return lines;
}

export function powerOf(lines: RollLine[]): number {
	return lines.reduce(
		(sum, line) => (line.counted ? sum + line.value : sum),
		0,
	);
}

const COLOR = { "Strong hit": 0x57f287, "Mixed hit": 0xfee75c, Miss: 0xed4245 };

/** Snake eyes always miss and boxcars always strong-hit, whatever the power. */
export function outcome(score: number, dice?: Dice): keyof typeof COLOR {
	if (dice?.[0] === 1 && dice[1] === 1) return "Miss";
	if (dice?.[0] === 6 && dice[1] === 6) return "Strong hit";
	if (score >= 10) return "Strong hit";
	if (score >= 7) return "Mixed hit";
	return "Miss";
}

// Tag names are player text: escape Discord markdown so a name can't restyle
// the post.
const escapeMarkdown = (text: string) =>
	text.replace(/[\\`*_~|>[\]()]/g, "\\$&");

function breakdownOf(lines: RollLine[]): string[] {
	return lines.map((line) => {
		const text = `\`${signed(line.value)}\` ${escapeMarkdown(line.label)}`;
		return line.counted ? text : `~~${text}~~`;
	});
}

const authorOf = (name: string, mitigation: boolean) =>
	`${name.trim().slice(0, MAX_LABEL) || "Unnamed"}${mitigation ? " · mitigation" : ""}`;

/**
 * Text to paste into Discord next to a Dice Maiden roll, so the GM sees what
 * the power is made of. A code fence keeps player text from restyling it.
 */
export function requestBlock(lines: RollLine[], mitigation: boolean): string {
	return [
		"```",
		`${mitigation ? "Mitigation Roll" : "Power Roll"}`,
		`Total Power ${signed(powerOf(lines))}`,
		...lines.map(
			(line) =>
				`${signed(line.value)} ${line.label.replaceAll("`", "'")}${line.counted ? "" : " (not counted)"}`,
		),
		"```",
	].join("\n");
}

/**
 * What goes in the `dice` option of Dice Maiden's /roll: the 2d6 with this
 * power, and everything after "!" is a comment it echoes. Discord only runs a
 * slash command picked from its menu, so the player types /roll and pastes
 * this. One line, because a slash option cannot hold a newline.
 */
export function diceMaidenArgs(lines: RollLine[], mitigation: boolean): string {
	const power = powerOf(lines);
	const parts = lines.map(
		(line) =>
			`${signed(line.value)} ${line.label.replace(/\s+/g, " ")}${line.counted ? "" : " (not counted)"}`,
	);
	return `2d6${power > 0 ? "+" : ""}${power || ""} ! ${mitigation ? "Mitigation Roll" : "Power Roll"}: ${parts.join(", ")}`;
}

/** Asks the GM to approve a roll: the tags, no dice. */
export function requestMessage(
	name: string,
	lines: RollLine[],
	mitigation: boolean,
) {
	return {
		allowed_mentions: { parse: [] },
		embeds: [
			{
				author: { name: authorOf(name, mitigation) },
				title: "Requests a roll",
				description: [
					`Power **${signed(powerOf(lines))}**`,
					...breakdownOf(lines),
				].join("\n"),
				color: 0x5865f2,
			},
		],
	};
}

export function rollMessage(
	name: string,
	lines: RollLine[],
	dice: Dice,
	mitigation: boolean,
) {
	const power = powerOf(lines);
	const score = dice[0] + dice[1] + power;
	const result = outcome(score, dice);
	const breakdown = breakdownOf(lines);
	return {
		// Player text can't ping @everyone or a role.
		allowed_mentions: { parse: [] },
		embeds: [
			{
				author: { name: authorOf(name, mitigation) },
				title: `${score} · ${result}`,
				description: [
					`🎲 **${dice[0]}** + **${dice[1]}**  Power **${signed(power)}**`,
					...breakdown,
				].join("\n"),
				color: COLOR[result],
			},
		],
	};
}
