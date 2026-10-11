"use client";

import { Button } from "@base-ui/react/button";
import { useParams } from "next/navigation";
import { CrewPanel } from "@/app/character/[id]/_components/board/crew-panel";
import { LoadoutPanel } from "@/app/character/[id]/_components/board/loadout-panel";
import { BoardTable } from "@/app/character/[id]/_components/board/table";
import { ThemePanel } from "@/app/character/[id]/_components/board/theme-panel";
import { PlusIcon } from "@/app/character/[id]/_components/icons";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import { useRollBoard } from "@/app/character/[id]/_hooks/use-roll-board";
import { boardWarnings } from "@/app/character/[id]/_lib/board-warnings";
import { boardGroups } from "@/app/character/[id]/_lib/roll-selection";
import { BurnOverride } from "@/app/character/[id]/roll/_components/burn-override";
import { DEFAULT_BURN_VALUE, STARTING_THEMES } from "@/lib/rules/constants";

export function Board() {
	const { character, dispatch } = useCharacter();
	const { id } = useParams<{ id: string }>();
	const board = useRollBoard(character, dispatch);
	const { tagChip, overriding, setOverriding, burnValueOfPick, setPick } =
		board;

	const groups = boardGroups(character);
	const warnings = boardWarnings(character);

	return (
		<div className="flex w-full flex-1 flex-col bg-bg">
			<div className="flex flex-1 items-start">
				<div className="flex min-w-0 flex-1 flex-col tall:h-[calc(100dvh-62px)]">
					{warnings.length > 0 && (
						<p className="shrink-0 border-b border-edge bg-recess px-5 py-2 font-sans text-sm text-negative-text">
							{warnings.join(" ")}
						</p>
					)}

					<div className="grid min-w-0 grid-cols-2 content-start gap-3.5 p-5 xl:grid-cols-3 tall:min-h-0 tall:flex-1 tall:auto-rows-fr tall:content-stretch tall:overflow-hidden">
						{character.themes.map((theme, index) => (
							<ThemePanel
								key={theme.id}
								theme={theme}
								group={groups.themes[index]}
								tagChip={tagChip}
								id={id}
							/>
						))}

						{character.themes.length < STARTING_THEMES && (
							<Button
								type="button"
								onClick={() =>
									dispatch({ type: "addTheme", id: crypto.randomUUID() })
								}
								className="notched flex min-h-[88px] items-center justify-center gap-1.5 border border-raised border-dashed bg-recess font-display text-xs font-semibold tracking-[0.08em] text-dim uppercase"
							>
								<PlusIcon /> Theme card
							</Button>
						)}

						<LoadoutPanel
							loadout={character.loadout}
							group={groups.loadout}
							tagChip={tagChip}
							id={id}
						/>

						<CrewPanel
							crewTheme={character.crewTheme}
							group={groups.crew}
							tagChip={tagChip}
							id={id}
						/>
					</div>
				</div>

				<BoardTable board={board} />
			</div>

			{overriding && (
				<BurnOverride
					named={overriding.text.trim() || "this tag"}
					value={burnValueOfPick(overriding) ?? DEFAULT_BURN_VALUE}
					open
					onOpenChange={(open) => {
						if (!open) setOverriding(null);
					}}
					onChoose={(value) => {
						setPick((current) => ({
							...current,
							burnValues: { ...current.burnValues, [overriding.id]: value },
						}));
						setOverriding(null);
					}}
				/>
			)}
		</div>
	);
}
