"use client";

import { Button } from "@base-ui/react/button";
import Link from "next/link";
import { LABEL } from "@/components/styles";

const CLASSNAME =
	"inline-flex min-h-11 items-center gap-[5px] font-display text-[11px] font-semibold tracking-[0.1em] text-noise uppercase";

type LabelActionProps = {
	label: string;
	onClick?: () => void;
	/** Optional so `render={<LabelAction label="..." />}` type-checks; the
	 *  rendering trigger (e.g. Dialog.Trigger) supplies the real children. */
	children?: React.ReactNode;
	href?: string;
};

export function LabelAction({
	label,
	onClick = () => {},
	children,
	href,
}: LabelActionProps) {
	return (
		<div className="flex items-baseline justify-between">
			<h2 className={LABEL}>{label}</h2>
			{href ? (
				<Link className={CLASSNAME} href={href}>
					{children}
				</Link>
			) : (
				<Button className={CLASSNAME} type="button" onClick={onClick}>
					{children}
				</Button>
			)}
		</div>
	);
}
