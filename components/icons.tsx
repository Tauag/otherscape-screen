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
