import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import Link from "next/link";
import { BroadButton } from "@/app/character/[id]/_components/broad-button";
import { BurnButton } from "@/app/character/[id]/_components/burn-button";
import { ChipBadge } from "@/components/chip-badge";
import type { MoveDirection, TagKind } from "@/lib/character/theme";
import type {
	PowerQuestionLetter,
	WeaknessQuestionLetter,
} from "@/lib/character/types";

const ICON =
	"grid size-11 shrink-0 place-items-center text-base disabled:text-faint";

type RowTag = {
	id: string;
	letter: PowerQuestionLetter | WeaknessQuestionLetter;
	text: string;
	burnt?: boolean;
	broad?: boolean;
};

/**
 * A power or weakness tag's row: the question link, its text field, optional
 * broad/burn toggles, and reorder/delete. Presentational - a theme's tag
 * and the crew theme's tag both dispatch differently, so the caller owns
 * what each callback actually does.
 */
export function TagRow({
	kind,
	tag,
	href,
	index,
	count,
	onTextChange,
	onMove,
	onDelete,
	onBurntChange,
	onBroadChange,
}: {
	kind: TagKind;
	tag: RowTag;
	/** The question picker for this tag. */
	href: string;
	index: number;
	count: number;
	onTextChange: (text: string) => void;
	onMove: (direction: MoveDirection) => void;
	onDelete: () => void;
	/** Power tags only: absent leaves the burn toggle off the row. */
	onBurntChange?: (burnt: boolean) => void;
	/** Power tags only: absent leaves the broad toggle off the row. */
	onBroadChange?: (broad: boolean) => void;
}) {
	const label = tag.letter;
	const named = tag.text.trim() || `the blank ${label} tag`;
	const power = kind === "power";

	function move(
		event: React.MouseEvent<HTMLButtonElement>,
		direction: MoveDirection,
	) {
		const to = direction === "up" ? index - 1 : index + 1;
		if (to === 0 || to === count - 1) {
			const twin =
				direction === "up"
					? event.currentTarget.nextElementSibling
					: event.currentTarget.previousElementSibling;
			if (twin instanceof HTMLElement) twin.focus();
		}
		onMove(direction);
	}

	return (
		<li
			id={`tag-${tag.id}`}
			data-burnt={tag.burnt ? "true" : undefined}
			data-valence={power ? undefined : "negative"}
			className="flex scroll-mt-20 flex-col gap-1.5 border-l-2 border-[var(--hue)] pl-2"
		>
			<div className="flex divide-x divide-border overflow-hidden rounded-sm border border-border">
				<Link
					href={href}
					aria-label={`Question ${label} for ${named}`}
					className="grid size-11 shrink-0 place-items-center bg-bg font-mono text-[13px] text-[var(--hue)]"
				>
					{label}
				</Link>

				<Input
					type="text"
					autoComplete="off"
					value={tag.text}
					onChange={(event) => onTextChange(event.target.value)}
					aria-label={`${power ? "Power" : "Weakness"} tag ${label}`}
					placeholder="Answer the question"
					className={`min-h-11 min-w-32 flex-1 bg-bg px-3 font-display text-[15px] tracking-[0.03em] text-[var(--hue-text)] ${
						tag.burnt ? "line-through" : ""
					}`}
				/>

				{power && onBroadChange && (
					<BroadButton
						broad={tag.broad ?? false}
						onBroadChange={onBroadChange}
						named={named}
					/>
				)}

				{power && onBurntChange && (
					<BurnButton
						bare
						burnt={tag.burnt ?? false}
						onBurntChange={onBurntChange}
						named={named}
					/>
				)}
			</div>

			<div className="flex flex-wrap items-center">
				{power && tag.broad && <ChipBadge>BROAD POWER TAG</ChipBadge>}

				<div className="ml-auto flex divide-x divide-border overflow-hidden rounded-sm border border-border">
					<Button
						type="button"
						disabled={index === 0}
						onClick={(event) => move(event, "up")}
						aria-label={`Move ${named} up`}
						className={ICON}
					>
						↑
					</Button>
					<Button
						type="button"
						disabled={index === count - 1}
						onClick={(event) => move(event, "down")}
						aria-label={`Move ${named} down`}
						className={ICON}
					>
						↓
					</Button>
					<Button
						type="button"
						onClick={onDelete}
						aria-label={`Delete ${named}`}
						className={ICON}
					>
						✕
					</Button>
				</div>
			</div>
		</li>
	);
}
