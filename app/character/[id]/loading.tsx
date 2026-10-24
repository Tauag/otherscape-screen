const CARD = "notched border border-border bg-surface";

// lazy: lg shows the board skeleton for every route, so a desktop editor
// (theme, loadout) briefly loads under a board shape. Upgrade path: a
// loading.tsx in each editor segment.
export default function Loading() {
	return (
		<main
			aria-busy="true"
			aria-label="Loading"
			className="flex w-full flex-1 motion-safe:animate-pulse"
		>
			{/* Mirrors the mobile view of the character board */}
			<div className="mx-auto flex w-full max-w-md flex-col gap-4 px-5 pt-3 pb-8 lg:hidden">
				{[128, 128, 96, 128, 96, 96].map((height, i) => (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
						key={i}
						style={{ height }}
						className={CARD}
					/>
				))}
			</div>

			{/* Mirrors Board: panel grid beside the BoardTable sidebar. */}
			<div className="hidden flex-1 items-start lg:flex">
				<div className="grid min-w-0 flex-1 grid-cols-2 content-start gap-3.5 p-5 xl:grid-cols-3 tall:h-[calc(100dvh-62px)] tall:auto-rows-fr tall:content-stretch">
					{Array.from({ length: 6 }, (_, i) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
							key={i}
							className={`${CARD} min-h-[15.25rem] border-t-[3px] [--bt:3px]`}
						/>
					))}
				</div>
				{/* Mirrors BoardTable. Heights match the real rows: LabelAction 44,
				    StatusCard 86, story tag chip 34, RollControls 46, RollTotal 107. */}
				<div className="flex h-[calc(100dvh-62px)] w-[340px] shrink-0 flex-col border-l border-edge bg-chrome/40 xl:w-[370px]">
					<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4">
						{[
							{ row: 86, gap: "gap-2" },
							{ row: 34, gap: "gap-1.5" },
						].map(({ row, gap }) => (
							<div key={row} className="flex flex-col gap-2">
								<div className="flex h-11 items-center">
									<div className="h-3 w-24 bg-surface" />
								</div>
								<div className={`flex flex-col ${gap}`}>
									<div style={{ height: row }} className={CARD} />
									<div style={{ height: row }} className={CARD} />
								</div>
							</div>
						))}
					</div>
					<div className="flex shrink-0 flex-col gap-3 border-t border-edge bg-chrome p-3">
						<div className="h-[46px] shrink-0 rounded-[5px] border border-hairline bg-recess" />
						<div className="h-[107px] shrink-0 rounded-[5px] bg-surface" />
					</div>
				</div>
			</div>
		</main>
	);
}
