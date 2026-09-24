import { iconPng } from "./_lib/icon-png";

// The manifest's PNG sizes: Android needs 192 and 512 to install.
export const contentType = "image/png";

export const generateImageMetadata = () =>
	[192, 512].map((px) => ({
		id: String(px),
		size: { width: px, height: px },
		contentType,
	}));

export default async function Icon({ id }: { id: Promise<string> }) {
	return iconPng(Number(await id));
}
