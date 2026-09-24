import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/** app/icon.svg as a PNG, for the two places that take no SVG: iOS and the manifest. */
export async function iconPng(size: number) {
	const svg = await readFile(join(process.cwd(), "app/icon.svg"), "base64");
	return new ImageResponse(
		// biome-ignore lint/performance/noImgElement: Satori draws this into a PNG; next/image does not apply.
		<img
			src={`data:image/svg+xml;base64,${svg}`}
			width={size}
			height={size}
			alt=""
		/>,
		{ width: size, height: size },
	);
}
