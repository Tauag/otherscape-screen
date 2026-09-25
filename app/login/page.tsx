import { Button } from "@base-ui/react/button";
import type { Metadata } from "next";
import { CheckInviteError } from "@/app/login/_components/check-invite-error";
import { signInWithDiscord, signInWithGoogle } from "@/lib/actions";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
	return (
		<main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
			<CheckInviteError />
			<div className="flex flex-col items-center gap-2">
				<h1 className="font-display text-xl font-bold tracking-[0.16em] uppercase">
					Otherscape
				</h1>
				<p className="max-w-xs text-sm text-dim">
					Sign in to reach your characters.
				</p>
			</div>

			<div className="flex w-full max-w-xs flex-col gap-3">
				<form action={signInWithGoogle}>
					<Button
						type="submit"
						className="h-14 w-full rounded-[5px] bg-primary font-display text-base font-bold tracking-[0.12em] text-bg uppercase shadow-[0_0_30px_rgba(255,46,136,0.3)]"
					>
						Continue with Google
					</Button>
				</form>

				<form action={signInWithDiscord}>
					<Button
						type="submit"
						className="h-14 w-full rounded-[5px] bg-[#5865F2] font-display text-base font-bold tracking-[0.12em] text-white uppercase shadow-[0_0_30px_rgba(88,101,242,0.3)]"
					>
						Continue with Discord
					</Button>
				</form>
			</div>
		</main>
	);
}
