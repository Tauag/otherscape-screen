import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { Toggle } from "@base-ui/react/toggle";
import {
	REMOVE_BUTTON,
	SMALL_BUTTON,
} from "@/app/character/[id]/_components/styles";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import type { LoadoutSet } from "@/lib/character/types";

const LOAD_TOGGLE = `${SMALL_BUTTON} shrink-0 text-dim data-pressed:border-[var(--hue)] data-pressed:text-[var(--hue-text)] disabled:opacity-40`;

export function SetCard({ set }: { set: LoadoutSet }) {
	const { dispatch } = useCharacter();

	return (
		<section className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4">
			<div className="flex items-center gap-2">
				<Toggle
					pressed={set.titleLoaded}
					onPressedChange={() =>
						dispatch({ type: "toggleLoadoutSetTitle", setId: set.id })
					}
					className={LOAD_TOGGLE}
				>
					{set.titleLoaded ? "Loaded" : "Load"}
				</Toggle>
				<Input
					type="text"
					value={set.title}
					placeholder="Title tag"
					onChange={(event) =>
						dispatch({
							type: "editLoadoutSetTitle",
							setId: set.id,
							text: event.target.value,
						})
					}
					className="min-h-11 w-full rounded-sm bg-bg px-2 font-display text-[15px] tracking-[0.03em] text-text uppercase"
				/>
				<Button
					type="button"
					onClick={() => dispatch({ type: "removeLoadoutSet", setId: set.id })}
					className={`${REMOVE_BUTTON} size-11`}
				>
					<span aria-hidden>✕</span>
					<span className="sr-only">{`Remove loadout set ${set.title}`}</span>
				</Button>
			</div>

			{set.features.length > 0 && (
				<ul className="flex flex-col gap-2">
					{set.features.map((feature) => (
						<li
							key={feature.id}
							className="flex items-center gap-2 border-l-2 border-[var(--hue,var(--color-border))] pl-2"
						>
							<Toggle
								pressed={feature.loaded}
								disabled={!set.titleLoaded && !feature.loaded}
								onPressedChange={() =>
									dispatch({
										type: "toggleLoadoutFeature",
										setId: set.id,
										featureId: feature.id,
									})
								}
								className={LOAD_TOGGLE}
							>
								{feature.loaded ? "Loaded" : "Load"}
							</Toggle>
							<Input
								type="text"
								value={feature.text}
								onChange={(event) =>
									dispatch({
										type: "editLoadoutFeature",
										setId: set.id,
										featureId: feature.id,
										text: event.target.value,
									})
								}
								className="min-h-11 w-full rounded-sm bg-bg px-2 font-display text-[15px] tracking-[0.03em] text-[var(--hue-text,var(--color-text))]"
							/>
							<Button
								type="button"
								onClick={() =>
									dispatch({
										type: "removeLoadoutFeature",
										setId: set.id,
										featureId: feature.id,
									})
								}
								className={`${REMOVE_BUTTON} size-11`}
							>
								<span aria-hidden>✕</span>
								<span className="sr-only">{`Remove feature ${feature.text}`}</span>
							</Button>
						</li>
					))}
				</ul>
			)}

			{set.weaknesses.length > 0 && (
				<ul className="flex flex-col gap-2">
					{set.weaknesses.map((weakness) => (
						<li
							key={weakness.id}
							data-valence="negative"
							className={`flex items-center gap-2 border-l-2 border-[var(--hue,var(--color-border))] pl-2 ${set.titleLoaded ? "" : "opacity-40"}`}
						>
							<span className="font-mono text-[10px] text-[var(--hue,var(--color-dim))]">
								Weakness
							</span>
							<Input
								type="text"
								value={weakness.text}
								onChange={(event) =>
									dispatch({
										type: "editLoadoutWeakness",
										setId: set.id,
										weaknessId: weakness.id,
										text: event.target.value,
									})
								}
								className="min-h-11 w-full rounded-sm bg-bg px-2 font-display text-[15px] tracking-[0.03em] text-[var(--hue-text,var(--color-text))]"
							/>
							<Button
								type="button"
								onClick={() =>
									dispatch({
										type: "removeLoadoutWeakness",
										setId: set.id,
										weaknessId: weakness.id,
									})
								}
								className={`${REMOVE_BUTTON} size-11`}
							>
								<span aria-hidden>✕</span>
								<span className="sr-only">{`Remove weakness ${weakness.text}`}</span>
							</Button>
						</li>
					))}
				</ul>
			)}

			<div className="flex flex-wrap gap-2">
				<Button
					type="button"
					onClick={() =>
						dispatch({
							type: "addLoadoutFeature",
							setId: set.id,
							id: crypto.randomUUID(),
						})
					}
					className={`${SMALL_BUTTON} text-dim`}
				>
					+ Feature
				</Button>
				<Button
					type="button"
					onClick={() =>
						dispatch({
							type: "addLoadoutWeakness",
							setId: set.id,
							id: crypto.randomUUID(),
						})
					}
					className={`${SMALL_BUTTON} text-dim`}
				>
					+ Weakness
				</Button>
			</div>
		</section>
	);
}
