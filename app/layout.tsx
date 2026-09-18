import type { Metadata, Viewport } from "next";
import { Barlow, Chakra_Petch, JetBrains_Mono } from "next/font/google";
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
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="en"
			className={`${chakraPetch.variable} ${barlow.variable} ${jetbrainsMono.variable} h-full antialiased`}
		>
			<body className="min-h-full flex flex-col">{children}</body>
		</html>
	);
}
