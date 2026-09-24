import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Otherscape",
		short_name: "Otherscape",
		description: "A character sheet and play companion for Metro:Otherscape.",
		start_url: "/",
		display: "standalone",
		// --color-bg and --color-chrome in globals.css.
		background_color: "#0a0a0f",
		theme_color: "#0d0d15",
		icons: [
			{ src: "/icon/192", sizes: "192x192", type: "image/png" },
			{ src: "/icon/512", sizes: "512x512", type: "image/png" },
			{
				src: "/icon/512",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
	};
}
