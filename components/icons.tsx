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
