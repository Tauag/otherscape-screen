"use client";

import { Missing } from "@/app/character/[id]/_components/picker";

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
