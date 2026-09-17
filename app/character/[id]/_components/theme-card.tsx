"use client";

import Link from "next/link";
import { useState } from "react";
import { Chip } from "@/app/character/[id]/_components/chip";
import { DecayWarning } from "@/app/character/[id]/_components/decay-warning";
import {
	LoseThemeButton,
	LoseThemeDialog,
} from "@/app/character/[id]/_components/lose-theme";
import { Track, UpgradeDialog } from "@/app/character/[id]/_components/track";
import { decayFull } from "@/lib/character/loss";
import { isNascent, themeLine, themeTitle } from "@/lib/character/theme";
import type { Theme } from "@/lib/character/types";
import { specialName } from "@/lib/pickers";

export function ThemeCard({ theme, href }: { theme: Theme; href: string }) {
	const title = themeTitle(theme);
	const nascent = isNascent(theme);
	const named = title?.text.trim() || "this theme";
	const [upgradeOpen, setUpgradeOpen] = useState(false);
	const [loseOpen, setLoseOpen] = useState(false);

	return (
		<>
			<Link
				href={href}
				data-type={theme.type}
				className={`flex overflow-hidden rounded-md border transition-colors ${
					nascent
						? "border-dashed border-raised bg-recess hover:border-[var(--hue)]/60"
						: "border-border bg-surface hover:border-[var(--hue)]"
				}`}
			>
				<div
					aria-hidden="true"
					className={`w-[3px] shrink-0 ${nascent ? "bg-[var(--hue)]/35" : "bg-[var(--hue)]"}`}
				/>

				<div className="flex min-w-0 flex-1 flex-col gap-[9px] px-3 pt-[11px] pb-2.5">
					<div className="flex items-center justify-between gap-2">
						<span
							className={`font-display text-[10px] font-semibold tracking-[0.17em] uppercase ${
								nascent ? "text-muted" : "text-dim"
							}`}
						>
							{theme.type} · {theme.themebook.trim() || "No themebook"}
						</span>

						<div className="flex items-center gap-3">
							{nascent && (
								<span className="border border-pip px-[5px] py-0.5 font-mono text-[8px] font-bold tracking-[0.1em] text-dim">
									NASCENT
								</span>
							)}
							<div className="flex items-center gap-4">
								<Track
									themeId={theme.id}
									track="upgrade"
									marked={theme.upgrade}
									size="sm"
									onComplete={() => setUpgradeOpen(true)}
								/>
								<Track
									themeId={theme.id}
									track="decay"
									marked={theme.decay}
									size="sm"
								/>
							</div>
						</div>
					</div>

					{title ? (
						<h2
							data-burnt={title.burnt ? "true" : undefined}
							className={`font-display text-[21px] leading-tight font-bold tracking-[0.045em] uppercase ${
								title.burnt ? "line-through" : ""
							} ${
								nascent
									? "text-[var(--hue-title)]/60"
									: "text-[var(--hue-title)] [text-shadow:0_0_20px_color-mix(in_oklab,var(--hue)_38%,transparent)]"
							}`}
						>
							{title.text}
						</h2>
					) : (
						<h2 className="min-h-11 content-center font-sans text-sm text-dim">
							No title tag yet.
						</h2>
					)}

					<ul className="flex flex-wrap gap-1.5">
						{theme.powerTags
							.filter((tag) => tag.id !== title?.id)
							.map((tag) => (
								<Chip
									key={tag.id}
									label={tag.letter}
									text={tag.text}
									burnt={tag.burnt}
								/>
							))}

						{theme.weaknessTags.map((tag) => (
							<Chip key={tag.id} label={tag.letter} text={tag.text} negative />
						))}
					</ul>

					{theme.quote.trim() && (
						<div className="flex items-baseline gap-[7px] pt-0.5">
							<span className="shrink-0 font-mono text-[8px] font-bold tracking-[0.14em] text-faint uppercase">
								{themeLine(theme.type)}
							</span>
							<span className="font-sans text-[12.5px] text-quiet italic">
								{theme.quote}
							</span>
						</div>
					)}

					{theme.specials.length > 0 && (
						<ul className="flex flex-col gap-1">
							{theme.specials.map((special) => (
								<li key={special} className="font-sans text-[13px] text-dim">
									{specialName(special)}
								</li>
							))}
						</ul>
					)}

					{decayFull(theme) && (
						<>
							<DecayWarning />
							<LoseThemeButton named={named} onOpen={() => setLoseOpen(true)} />
						</>
					)}
				</div>
			</Link>

			{/* Both dialogs sit outside the Link: a portalled dialog leaves the DOM
          but stays in the React tree, so under the Link its clicks navigate. */}
			<UpgradeDialog
				themeId={theme.id}
				themeHref={href}
				nascent={nascent}
				open={upgradeOpen}
				onOpenChange={setUpgradeOpen}
			/>
			{decayFull(theme) && (
				<LoseThemeDialog
					themeId={theme.id}
					named={named}
					open={loseOpen}
					onOpenChange={setLoseOpen}
				/>
			)}
		</>
	);
}
