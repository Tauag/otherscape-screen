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

export function LinkIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			className={className}
			fill="none"
			strokeWidth={2.5}
			strokeLinecap="round"
		>
			<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
			<path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
		</svg>
	);
}
