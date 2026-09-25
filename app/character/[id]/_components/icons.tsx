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

export function BroadIcon({ broad }: { broad: boolean }) {
	return broad ? (
		<svg
			aria-hidden="true"
			width="20"
			height="20"
			viewBox="0 -960 960 960"
			fill="currentColor"
		>
			<path d="M120-120v-240h80v104l124-124 56 56-124 124h104v80H120Zm480 0v-80h104L580-324l56-56 124 124v-104h80v240H600ZM324-580 200-704v104h-80v-240h240v80H256l124 124-56 56Zm312 0-56-56 124-124H600v-80h240v240h-80v-104L636-580ZM480-400q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Z" />
		</svg>
	) : (
		<svg
			aria-hidden="true"
			width="20"
			height="20"
			viewBox="0 -960 960 960"
			fill="currentColor"
		>
			<path d="m156-100-56-56 124-124H120v-80h240v240h-80v-104L156-100Zm648 0L680-224v104h-80v-240h240v80H736l124 124-56 56ZM120-600v-80h104L100-804l56-56 124 124v-104h80v240H120Zm480 0v-240h80v104l124-124 56 56-124 124h104v80H600ZM480-400q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Z" />
		</svg>
	);
}

export function EditIcon() {
	return (
		<svg
			aria-hidden="true"
			width="15"
			height="15"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M12 20h9" />
			<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
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

export function TabEvolutionIcon() {
	return (
		<>
			<circle cx="12" cy="12" r="9" />
			<path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
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
