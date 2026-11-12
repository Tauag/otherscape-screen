"use client";

import { Button } from "@base-ui/react/button";
import { Dialog } from "@base-ui/react/dialog";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { useEffect, useId, useState } from "react";
import {
	ANSWERS,
	answerIndex,
	artPath,
	askOracle,
	BACK_ART,
	type Draw,
	drawCards,
	MAJOR_ARCANA,
	type Odds,
} from "@/app/character/[id]/_lib/oracle";
import {
	DIALOG_BACKDROP,
	HEADING,
	LABEL,
	PRIMARY,
	QUIET,
} from "@/components/styles";

// Same tumble as Roll 2d6, so asking twice with the same answer still reads
// as a new roll.
const TUMBLE_MS = 600;
const d6 = () => Math.floor(Math.random() * 6) + 1;

const SEGMENTS =
	"inline-flex self-start overflow-hidden rounded-sm border border-border";
const SEGMENT =
	"grid min-h-11 min-w-11 cursor-pointer place-items-center border-r border-border px-3 font-display text-[13px] font-semibold tracking-[0.05em] text-dim uppercase last:border-r-0 data-pressed:bg-primary/12 data-pressed:text-primary";
/** Full width on a phone, beside its controls from md up. */
const ACTION = `${PRIMARY} w-full justify-center px-7 disabled:opacity-40 md:w-auto`;

const ODDS: { value: Odds; label: string }[] = [
	{ value: "lean no", label: "Lean No" },
	{ value: "even", label: "Even" },
	{ value: "lean yes", label: "Lean Yes" },
];

export function OracleDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Backdrop className={DIALOG_BACKDROP} />
				{/* Full screen on a phone, a fixed 800px modal from md up so a draw
				    never resizes it. 90vh caps it on short screens; it scrolls there. */}
				<Dialog.Popup className="fixed inset-0 flex flex-col overflow-y-auto bg-surface pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-text outline-none md:m-auto md:h-[800px] md:max-h-[90vh] md:w-[90vw] md:max-w-[900px] md:rounded-md md:border md:border-border md:p-0">
					<div className="flex items-center gap-4 border-b border-border px-5 py-3">
						<Dialog.Title className={`${HEADING} flex-1`}>Oracle</Dialog.Title>
						<Dialog.Close
							aria-label="Close"
							className="-mr-2 grid size-11 place-items-center text-xl text-dim"
						>
							<span aria-hidden="true">✕</span>
						</Dialog.Close>
					</div>

					{/* One page, no tabs: Yes / No is a short strip on top, so both
					    results stay in view and the cards get the full width. */}
					<YesNo />
					<Tarot />
					{/* Full screen on a phone, so the corner ✕ is out of thumb reach.
					    -mt-3 pulls it up to sit 12px under Draw. */}
					<Dialog.Close
						className={`${QUIET} mx-5 -mt-3 mb-6 justify-center md:hidden`}
					>
						Close
					</Dialog.Close>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

type Answer = { dice: number[]; kept: number; odds: Odds };

function YesNo() {
	const label = useId();
	const [odds, setOdds] = useState<Odds>("even");
	const [faces, setFaces] = useState<number[]>([]);
	const [answer, setAnswer] = useState<Answer | null>(null);
	const rolling = faces.length > 0 && answer === null;

	async function ask() {
		const next = { ...askOracle(odds), odds };
		setAnswer(null);
		const tumbleFaces = () => setFaces(next.dice.map(d6));
		tumbleFaces();
		const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const tumble = still ? undefined : setInterval(tumbleFaces, 90);
		await new Promise((resolve) => setTimeout(resolve, TUMBLE_MS));
		clearInterval(tumble);
		setAnswer(next);
	}

	const landed = answer && answerIndex(answer.kept);
	const yes = landed !== null && landed >= 2;
	const keptAt = answer ? answer.dice.indexOf(answer.kept) : -1;

	return (
		<section className="flex flex-col gap-4 border-b border-border px-5 py-5 md:flex-row md:items-end md:gap-5">
			<div className="flex flex-col gap-1.5">
				<span id={label} className={LABEL}>
					Yes / No · Odds
				</span>
				<ToggleGroup
					aria-labelledby={label}
					value={[odds]}
					// Tapping the pressed segment empties the group; keep the old pick.
					onValueChange={(value) => value[0] && setOdds(value[0] as Odds)}
					className={SEGMENTS}
				>
					{ODDS.map((option) => (
						<Toggle key={option.value} value={option.value} className={SEGMENT}>
							{option.label}
						</Toggle>
					))}
				</ToggleGroup>
			</div>

			<div className="flex min-h-11 flex-1 items-center gap-4">
				{faces.length === 0 ? (
					<p className="font-sans text-sm text-dim">
						Ask a yes or no question.
					</p>
				) : (
					<>
						<div aria-hidden="true" className="flex gap-3">
							{(answer?.dice ?? faces).map((face, index) => (
								<span
									// biome-ignore lint/suspicious/noArrayIndexKey: one or two dice, fixed order
									key={index}
									className={`grid size-11 place-items-center rounded-sm border bg-bg font-display text-2xl font-bold ${
										rolling
											? "border-border opacity-60"
											: index === keptAt
												? "border-border"
												: "border-dashed border-pip opacity-30"
									}`}
								>
									{face}
								</span>
							))}
						</div>
						<p role="status" className="flex min-w-0 flex-col gap-0.5">
							{answer === null || landed === null ? (
								<span className="font-sans text-sm text-dim">Rolling…</span>
							) : (
								<>
									<span
										className={`font-display text-[26px] leading-tight font-bold tracking-[0.04em] uppercase ${yes ? "text-positive" : "text-negative"}`}
									>
										{ANSWERS[landed]}
									</span>
									<span className="font-mono text-xs text-dim">
										<span className="sr-only">
											, rolled {answer.dice.join(" and ")}
										</span>
									</span>
								</>
							)}
						</p>
					</>
				)}
			</div>

			<Button type="button" disabled={rolling} onClick={ask} className={ACTION}>
				Ask
			</Button>
		</section>
	);
}

function Tarot() {
	const label = useId();
	const [count, setCount] = useState("1");
	const [drawn, setDrawn] = useState<Draw[]>([]);
	const [shuffling, setShuffling] = useState(false);

	// lazy: fetches all 22 cards (~1.3MB, cached after the first open) so the
	// shuffle never flashes a blank card. Preload on first Draw instead if
	// that ever costs too much on mobile data.
	useEffect(() => {
		for (const card of MAJOR_ARCANA) new Image().src = artPath(card);
		new Image().src = BACK_ART;
	}, []);

	// The dice tumble, with cards: each slot flicks through random art, then
	// lands on the real draw.
	async function draw() {
		const next = drawCards(Number(count));
		setShuffling(true);
		const flick = () => setDrawn(drawCards(next.length));
		flick();
		const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const timer = still ? undefined : setInterval(flick, 110);
		await new Promise((resolve) => setTimeout(resolve, TUMBLE_MS));
		clearInterval(timer);
		setDrawn(next);
		setShuffling(false);
	}

	return (
		<section className="flex flex-1 flex-wrap content-start items-end gap-4 px-5 py-5">
			<div className="flex w-full flex-col gap-1.5 md:w-auto md:flex-1">
				<span id={label} className={LABEL}>
					Tarot · Cards
				</span>
				<ToggleGroup
					aria-labelledby={label}
					value={[count]}
					// A new count deals that many fresh face-down cards.
					onValueChange={(value) => {
						if (!value[0]) return;
						setCount(value[0]);
						setDrawn([]);
					}}
					className={SEGMENTS}
				>
					{["1", "2", "3"].map((n) => (
						<Toggle key={n} value={n} className={SEGMENT}>
							{n}
						</Toggle>
					))}
				</ToggleGroup>
			</div>

			<p role="status" className="sr-only">
				{shuffling
					? "Drawing…"
					: drawn.length > 0 &&
						`Drew ${drawn
							.map(
								(d) => `${d.card.name}, ${d.reversed ? "reversed" : "upright"}`,
							)
							.join("; ")}.`}
			</p>

			{drawn.length === 0 ? (
				// Face down until the first draw, and again after a count change.
				<ol
					aria-hidden="true"
					className="order-1 flex w-full justify-center gap-3 md:order-2 md:gap-4"
				>
					{Array.from({ length: Number(count) }, (_, index) => (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: identical face-down slots
							key={index}
							className="flex w-20 flex-col gap-2.5 md:w-52"
						>
							<span className="hidden font-display text-[10px] font-semibold tracking-[0.16em] text-faint uppercase md:block">
								Card {index + 1}
							</span>
							{/* biome-ignore lint/performance/noImgElement: static SVG art from public/, nothing for next/image to optimize. */}
							<img
								src={BACK_ART}
								alt=""
								className="aspect-[443/702] w-full max-w-full invert"
							/>
						</li>
					))}
				</ol>
			) : (
				<ol className="order-1 flex w-full flex-col gap-3 md:order-2 md:flex-row md:justify-center md:gap-4">
					{drawn.map(({ card, reversed }, index) => (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: slots are fixed while the shuffle swaps their cards
							key={index}
							className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 border-t border-border pt-3 first:border-t-0 first:pt-0 md:flex md:w-52 md:flex-col md:gap-2.5 md:border-t-0 md:pt-0"
						>
							<span className="hidden font-display text-[10px] font-semibold tracking-[0.16em] text-faint uppercase md:block">
								Card {index + 1}
							</span>
							{/* Black line art, so invert it for the dark UI. Each SVG's
								    viewBox is cropped to the card frame, which keeps the art
								    centred when a reversed card rotates. */}
							{/* biome-ignore lint/performance/noImgElement: static SVG art from public/, nothing for next/image to optimize. */}
							<img
								src={artPath(card)}
								alt=""
								className={`aspect-[443/702] w-full max-w-full invert ${reversed ? "rotate-180" : ""} ${shuffling ? "opacity-60" : ""}`}
							/>
							<div
								className={`flex min-w-0 flex-col gap-1.5 ${shuffling ? "invisible" : ""}`}
							>
								<span className="flex flex-wrap items-center gap-2 font-display text-[15px] font-semibold">
									{card.name}
									<span
										className={`rounded-[3px] border px-1.5 py-px text-[10px] font-bold tracking-[0.12em] uppercase ${
											reversed
												? "border-negative/50 text-negative"
												: "border-positive/50 text-positive"
										}`}
									>
										{reversed ? "Reversed" : "Upright"}
									</span>
								</span>
								<Keywords
									title="Upright"
									text={card.upright}
									drawn={!reversed}
								/>
								<Keywords
									title="Reversed"
									text={card.reversed}
									drawn={reversed}
								/>
							</div>
						</li>
					))}
				</ol>
			)}

			<Button
				type="button"
				disabled={shuffling}
				onClick={draw}
				className={`${ACTION} order-2 md:order-1`}
			>
				Draw
			</Button>
		</section>
	);
}

/** Both orientations show; the drawn one is bright, so the player can read against the other. */
function Keywords({
	title,
	text,
	drawn,
}: {
	title: string;
	text: string;
	drawn: boolean;
}) {
	return (
		<p
			className={`font-sans text-[13px] leading-snug ${drawn ? "text-text" : "text-faint"}`}
		>
			<span
				className={`block font-display text-[10px] font-semibold tracking-[0.16em] uppercase ${drawn ? "text-dim" : "text-faint"}`}
			>
				{title}
			</span>
			{text}
		</p>
	);
}
