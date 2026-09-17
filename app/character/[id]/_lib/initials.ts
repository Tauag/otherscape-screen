/**
 * The monogram's letters: the first letter of up to the first two words in
 * the character's name, uppercase. A nameless (blank) character shows nothing.
 */
export function initials(name: string): string {
	const words = name.trim().split(/\s+/).filter(Boolean);
	return words
		.slice(0, 2)
		.map((word) => word[0]!.toUpperCase())
		.join("");
}
