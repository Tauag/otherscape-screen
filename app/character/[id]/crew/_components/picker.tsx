"use client";

import Link from "next/link";
import { PAGE } from "@/app/character/[id]/_components/picker";
import { QUIET } from "@/components/styles";

/** The tag went while a picker was open: another device can delete one. */
export const MissingCrewTag = ({ id }: { id: string }) => (
	<main className={PAGE}>
		<p className="font-sans text-base text-dim">
			The crew theme has no such tag. It may have been deleted.
		</p>
		<Link href={`/character/${id}/crew`} className={`${QUIET} self-start`}>
			Back to the crew theme
		</Link>
	</main>
);
