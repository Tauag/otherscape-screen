import { ImageResponse } from "next/og";
import { iconSvg } from "./icon-svg";

/** app/icon.svg as a PNG, for the two places that take no SVG: iOS and the manifest. */
export function iconPng(size: number) {
	const svg = btoa(iconSvg);
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
