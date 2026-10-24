import { LABEL } from "@/components/styles";

/** Heads a group of tags inside a card ("Loaded · 2", "Relationships · 1").
 *  `spaced` adds room above it when another group sits before it. */
export function GroupLabel({
	children,
	spaced = false,
}: {
	children: React.ReactNode;
	spaced?: boolean;
}) {
	return <p className={`${LABEL} ${spaced ? "pt-1" : ""}`}>{children}</p>;
}
