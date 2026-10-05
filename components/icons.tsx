export function ChevronRightIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			className={className}
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M15 17l5-5-5-5" />
			<path d="M20 12H9" />
			<path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
		</svg>
	);
}

export function OtherscapeIcon() {
	return (
		<svg
			aria-hidden="true"
			width="30"
			height="30"
			viewBox="-179 -221 1408 1408"
			fill="none"
			stroke="currentColor"
			strokeWidth="63"
		>
			<path d="M229 512V447L102 200L152 108H897L947 200L820 447V512" />
			<path d="M316 580L473 859H576L733 580" />
			<path d="M230 456A298.5 298.5 0 0 1 820 456" />
			<path d="M229 447A434 434 0 0 1 820 447V512A434 434 0 0 1 229 512Z" />
			<circle cx="525" cy="432" r="95.5" />
		</svg>
	);
}

export function BackIcon() {
	return (
		<svg
			aria-hidden="true"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M19 12H5M11 18l-6-6 6-6" />
		</svg>
	);
}

export function MoreIcon() {
	return (
		<svg
			aria-hidden="true"
			width="4"
			height="18"
			viewBox="0 0 4 18"
			fill="currentColor"
		>
			<circle cx="2" cy="2" r="2" />
			<circle cx="2" cy="9" r="2" />
			<circle cx="2" cy="16" r="2" />
		</svg>
	);
}

export function ArrowDownIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			width="18"
			height="18"
			viewBox="0 0 24 24"
			className={className}
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M12 5v14M6 13l6 6 6-6" />
		</svg>
	);
}
