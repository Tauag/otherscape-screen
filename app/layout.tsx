import type { Metadata, Viewport } from "next";
import { Barlow, Chakra_Petch, JetBrains_Mono } from "next/font/google";
import { ServiceWorker } from "@/components/service-worker";
import "./globals.css";

const chakraPetch = Chakra_Petch({
	variable: "--font-chakra-petch",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
});

const barlow = Barlow({
	variable: "--font-barlow",
	subsets: ["latin"],
	weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-jetbrains-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Otherscape",
	description: "A character sheet and play companion for Metro:Otherscape.",
	// "black", not "black-translucent": the roster page has no top safe-area inset.
	appleWebApp: { capable: true, title: "Otherscape", statusBarStyle: "black" },
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	viewportFit: "cover",
	themeColor: "#0d0d15", // --color-chrome
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="en"
			className={`${chakraPetch.variable} ${barlow.variable} ${jetbrainsMono.variable} h-full antialiased lg:overflow-hidden`}
		>
			<body className="min-h-full flex flex-col">
				{children}
				<ServiceWorker />
			</body>
		</html>
	);
}
