import { CrewBlock } from "@/components/crew-block";
import { LoadoutBlock } from "@/components/loadout-block";
import { StatusRow } from "@/components/status-row";
import { StoryTagChip } from "@/components/story-tag-chip";
import { LABEL } from "@/components/styles";
import { ThemeBlock } from "@/components/theme-block";
import type { Character } from "@/lib/character/types";

export function ShareSheet({ character }: { character: Character }) {
	return (
		<main className="mx-auto grid w-full max-w-md flex-1 grid-cols-1 items-start gap-4 px-5 pt-6 pb-8 md:max-w-3xl md:grid-cols-2 xl:max-w-5xl xl:grid-cols-3">
			<header className="col-span-full flex flex-col gap-[3px]">
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
				<section className="col-span-full flex flex-col gap-2">
					<p className={LABEL}>Statuses</p>
					{character.statuses.map((status) => (
						<StatusRow key={status.id} status={status} />
					))}
				</section>
			)}

			{character.storyTags.length > 0 && (
				<section className="col-span-full flex flex-wrap gap-1.5">
					{character.storyTags.map((tag) => (
						<StoryTagChip key={tag.id} tag={tag} />
					))}
				</section>
			)}
		</main>
	);
}
