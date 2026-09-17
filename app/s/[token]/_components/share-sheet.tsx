import { CrewBlock } from "@/app/s/[token]/_components/crew-block";
import { LoadoutBlock } from "@/app/s/[token]/_components/loadout-block";
import { StatusRow } from "@/app/s/[token]/_components/status-row";
import { StoryTagChip } from "@/app/s/[token]/_components/story-tag-chip";
import { ThemeBlock } from "@/app/s/[token]/_components/theme-block";
import { LABEL } from "@/components/styles";
import type { Character } from "@/lib/character/types";

export function ShareSheet({ character }: { character: Character }) {
	return (
		<main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-5 pt-6 pb-8">
			<header className="flex flex-col gap-[3px]">
				<p className={LABEL}>Read-only</p>
				<h1 className="font-display text-[21px] font-bold tracking-[0.05em] text-text uppercase">
					{character.name.trim() || "Unnamed"}
				</h1>
				{character.essence && (
					<p className="font-display text-[11px] font-semibold tracking-[0.16em] text-dim uppercase">
						{character.essence}
					</p>
				)}
			</header>

			{character.themes.map((theme) => (
				<ThemeBlock key={theme.id} theme={theme} />
			))}

			<LoadoutBlock loadout={character.loadout} />

			<CrewBlock crew={character.crewTheme} relationships={character.crew} />

			{character.statuses.length > 0 && (
				<section className="flex flex-col gap-2">
					<p className={LABEL}>Statuses</p>
					{character.statuses.map((status) => (
						<StatusRow key={status.id} status={status} />
					))}
				</section>
			)}

			{character.storyTags.length > 0 && (
				<section className="flex flex-wrap gap-1.5">
					{character.storyTags.map((tag) => (
						<StoryTagChip key={tag.id} tag={tag} />
					))}
				</section>
			)}
		</main>
	);
}
