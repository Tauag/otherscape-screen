"use client";

import { Accordion } from "@base-ui/react/accordion";
import Link from "next/link";
import { use } from "react";
import { SpecialList } from "@/app/character/[id]/_components/special-card";
import { FILLED } from "@/app/character/[id]/_components/styles";
import { TrackPips } from "@/app/character/[id]/_components/track";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import {
	CountedMomentRow,
	MomentRow,
} from "@/app/character/[id]/evolution/_components/moment-row";
import { LABEL } from "@/components/styles";
import type { Evolutions } from "@/lib/character/types";
import { EVOLUTION_MOMENT_NAMES } from "@/lib/content/fallback";
import { useContentPack } from "@/lib/content/load";
import { evolutionMomentsOf } from "@/lib/pickers";
import { EVOLUTION_POINTS_TRACK_LENGTH } from "@/lib/rules/constants";

const BOOLEAN_MOMENTS: {
	key: Exclude<keyof Evolutions, "veteranSpecials">;
	momentIndex: number;
}[] = [
	{ key: "newEssenceType", momentIndex: 0 },
	{ key: "broadPowerTag", momentIndex: 1 },
	{ key: "rideOffIntoTheSunset", momentIndex: 3 },
	{ key: "sunderTheCosmology", momentIndex: 4 },
	{ key: "totalReconstitution", momentIndex: 5 },
];

const VETERAN_SPECIAL_MOMENT_INDEX = 2;

export default function EvolutionPage({
	params,
}: PageProps<"/character/[id]/evolution">) {
	const { id } = use(params);
	const { character, dispatch } = useCharacter();
	const pack = useContentPack();
	const moments = evolutionMomentsOf(pack);
	const momentText = (index: number) => moments[index]?.text ?? "";

	return (
		<main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 pt-6 pb-8">
			<h1 className="font-display text-[26px] leading-tight font-bold tracking-[0.05em] text-text uppercase">
				Evolution
			</h1>

			<TrackPips
				name="Evolution"
				short="EVO"
				length={EVOLUTION_POINTS_TRACK_LENGTH}
				marked={character.evolutionPoints}
				size="lg"
				active
				onMark={() => dispatch({ type: "markEvolutionPoints" })}
			/>

			<section className="flex flex-col gap-1.5">
				<h2 className={LABEL}>Moments of Evolution</h2>
				<Accordion.Root render={<ul />} className="flex flex-col gap-1.5">
					{BOOLEAN_MOMENTS.map(({ key, momentIndex }) => (
						<MomentRow
							key={key}
							name={EVOLUTION_MOMENT_NAMES[momentIndex]}
							text={momentText(momentIndex)}
							checked={character.evolutions[key]}
							onCheckedChange={() =>
								dispatch({ type: "toggleEvolutionMoment", moment: key })
							}
						/>
					))}

					<CountedMomentRow
						name={EVOLUTION_MOMENT_NAMES[VETERAN_SPECIAL_MOMENT_INDEX]}
						text={momentText(VETERAN_SPECIAL_MOMENT_INDEX)}
						marked={character.evolutions.veteranSpecials}
						onMark={() => dispatch({ type: "markVeteranSpecialsMoment" })}
					/>
				</Accordion.Root>
			</section>

			<section className="flex flex-col gap-1.5">
				<h2 className={LABEL}>Veteran specials</h2>
				{character.veteranSpecials.length === 0 ? (
					<p className="font-sans text-sm text-dim">No veteran specials yet.</p>
				) : (
					<SpecialList
						specials={character.veteranSpecials}
						onRemove={(special) =>
							dispatch({ type: "removeVeteranSpecial", special })
						}
					/>
				)}
				<Link
					href={`/character/${id}/evolution/veteran-specials`}
					className={`${FILLED} mt-1`}
				>
					+ veteran specials
				</Link>
			</section>
		</main>
	);
}
