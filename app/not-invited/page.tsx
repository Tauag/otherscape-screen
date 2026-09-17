import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Not invited" };

export default function NotInvitedPage() {
	return (
		<main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
			<div className="flex flex-col items-center gap-2">
				<h1 className="font-display text-xl font-bold tracking-[0.16em] uppercase">
					Otherscape
				</h1>
				<p className="max-w-xs text-sm text-dim">
					This account isn&apos;t invited yet. Ask whoever runs your game to add
					your email.
				</p>
			</div>

			<Link
				href="/login"
				className="font-display text-sm font-bold tracking-[0.12em] text-primary uppercase"
			>
				Back to sign in
			</Link>
		</main>
	);
}
