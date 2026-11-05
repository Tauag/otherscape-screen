// Copy of app/icon.svg as a string: Workers has no filesystem and `?raw` is
// Vite-only, so this works under both Next and vinext. icon-svg.test.ts fails
// if the two drift.
export const iconSvg =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-179 -221 1408 1408">\n\t<title>Otherscape</title>\n\t<!-- Traced at the source artwork\'s scale. The viewBox pads the mark into the maskable safe zone (radius 40%). The fill is the app background colour. -->\n\t<rect x="-179" y="-221" width="1408" height="1408" rx="310" fill="#0a0a0f"/>\n\t<g fill="none" stroke="#c8f04a" stroke-width="63">\n\t\t<path d="M229 512V447L102 200L152 108H897L947 200L820 447V512"/>\n\t\t<path d="M316 580L473 859H576L733 580"/>\n\t\t<path d="M230 456A298.5 298.5 0 0 1 820 456"/>\n\t\t<path d="M229 447A434 434 0 0 1 820 447V512A434 434 0 0 1 229 512Z"/>\n\t\t<circle cx="525" cy="432" r="95.5"/>\n\t</g>\n</svg>\n';
