"use client";

import Link from "next/link";
import { PAGE } from "@/app/character/[id]/_components/picker";
import { QUIET } from "@/components/styles";

function Missing({
	href,
	label,
	sentence,
}: {
	href: string;
	label: string;
	sentence: string;
}) {
	return (
		<main className={PAGE}>
			<p className="font-sans text-base text-dim">{sentence}</p>
			<Link href={href} className={`${QUIET} self-start`}>
				{label}
			</Link>
		</main>
	);
}

/** The theme went while a picker was open: another device can lose one. */
export const MissingTheme = ({ id }: { id: string }) => (
	<Missing
		href={`/character/${id}`}
		label="Back to the sheet"
		sentence="This character has no such theme. It may have been lost or replaced."
	/>
);

export const MissingTag = ({ id, tid }: { id: string; tid: string }) => (
	<Missing
		href={`/character/${id}/theme/${tid}`}
		label="Back to the theme"
		sentence="This theme has no such tag. It may have been deleted."
	/>
);
