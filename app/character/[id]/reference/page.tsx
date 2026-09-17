"use client";

import { Input } from "@base-ui/react/input";
import { useState } from "react";
import { HEADING } from "@/app/character/[id]/_components/styles";
import { ReferenceRow } from "@/app/character/[id]/reference/_components/reference-row";
import { filter, sections } from "@/app/character/[id]/reference/_lib/sections";
import { LABEL } from "@/components/styles";
import { useContentPack } from "@/lib/content/load";

const EMPTY =
	"rounded-sm border border-dashed border-pip px-3 py-3 font-sans text-[13px] text-faint";

export default function ReferencePage() {
	const pack = useContentPack();
	const [query, setQuery] = useState("");
	const found = filter(sections(pack.reference), query);

	return (
		<main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-5 pt-6 pb-8">
			<h1 className={HEADING}>Reference</h1>

			<p className="font-sans text-sm text-dim">
				The cheatsheet, read-only. It never selects anything for a roll. A
				dashed slot is a line the content pack has not filled yet.
			</p>

			{/* biome-ignore lint/a11y/noLabelWithoutControl: Base UI's Input renders a real <input> inside this label; biome can't see through the component boundary. */}
			<label className="flex items-center gap-2 rounded-sm border border-border bg-bg px-3">
				<span className="sr-only">Search the reference</span>
				<svg
					aria-hidden="true"
					width="15"
					height="15"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.9"
					strokeLinecap="round"
					className="shrink-0 text-muted"
				>
					<circle cx="11" cy="11" r="6" />
					<path d="M16 16l4 4" />
				</svg>
				<Input
					type="search"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Search"
					className="min-h-11 w-full min-w-0 bg-transparent font-sans text-base placeholder:text-faint"
				/>
			</label>

			{found.length === 0 && (
				<p className="font-sans text-sm text-dim">
					Nothing in the reference matches that.
				</p>
			)}

			{found.map((section) => (
				<section key={section.title} className="flex flex-col gap-2">
					<h2 className={LABEL}>{section.title}</h2>

					{section.rows.length === 0 ? (
						<p className={EMPTY}>
							The content pack has not filled this section yet.
						</p>
					) : (
						<ul className="flex flex-col gap-1.5">
							{section.rows.map((row, index) => (
								<ReferenceRow
									// biome-ignore lint/suspicious/noArrayIndexKey: the rows come from a fixed content-pack list that is never reordered, and an unfilled row has no name to key on.
									key={index}
									row={row}
								/>
							))}
						</ul>
					)}
				</section>
			))}
		</main>
	);
}
