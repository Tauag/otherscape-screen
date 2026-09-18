export function FlameIcon({ burnt }: { burnt: boolean }) {
	return (
		<svg
			aria-hidden="true"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill={burnt ? "currentColor" : "none"}
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4" />
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

export function PlusIcon() {
	return (
		<svg
			aria-hidden="true"
			width="13"
			height="13"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.2"
			strokeLinecap="round"
		>
			<path d="M12 5v14M5 12h14" />
		</svg>
	);
}

export function CopyIcon() {
	return (
		<svg
			aria-hidden="true"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect x="9" y="9" width="12" height="12" rx="2" />
			<path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
		</svg>
	);
}

export function SearchIcon({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			width="15"
			height="15"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.9"
			strokeLinecap="round"
			className={className}
		>
			<circle cx="11" cy="11" r="6" />
			<path d="M16 16l4 4" />
		</svg>
	);
}

// The tab bar renders these inside one shared <svg> wrapper (tabs.tsx), so
// each icon here is path content only, not a self-contained <svg>.
export function TabSheetIcon() {
	return (
		<>
			<path d="M5 3h11l4 4v14H5z" />
			<path d="M9 9h7M9 13h7M9 17h4" />
		</>
	);
}

export function TabPlayIcon() {
	return (
		<>
			<rect x="3" y="6" width="18" height="12" rx="2" />
			<path d="M7 10v4M17 10v4M12 9v6" />
		</>
	);
}

export function TabPlaceholderIcon() {
	return (
		<>
			<path d="M4 7h16v13H4z" />
			<path d="M9 7V4h6v3" />
			<path d="M4 12h16" />
		</>
	);
}

export function TabReferenceIcon() {
	return (
		<>
			<path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z" />
			<path d="M8 3v18" />
		</>
	);
}
