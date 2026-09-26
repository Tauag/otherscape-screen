"use client";

import { Switch } from "@base-ui/react/switch";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { setDiscordEnabled } from "@/app/admin/users/[userId]/_lib/actions";

/** Admin-only control: whether this character's rolls post to Discord. */
export function DiscordToggle({
	characterId,
	name,
	enabled,
}: {
	characterId: string;
	name: string;
	enabled: boolean;
}) {
	const router = useRouter();
	const [checked, setChecked] = useState(enabled);
	const [pending, startTransition] = useTransition();

	// Resync after router.refresh() lands the server's actual value, in case
	// the write was rejected (only an admin may set this column).
	useEffect(() => setChecked(enabled), [enabled]);

	return (
		<Switch.Root
			checked={checked}
			disabled={pending}
			onCheckedChange={(next) => {
				// Optimistic: flip now, then reconcile with the server's actual
				// value in case the write was rejected (only an admin may set it).
				setChecked(next);
				startTransition(async () => {
					try {
						await setDiscordEnabled(characterId, next);
					} finally {
						// Reconciles the switch to the DB's real value either way,
						// including when the write above failed or was rejected.
						router.refresh();
					}
				});
			}}
			aria-label={`Post ${name}'s rolls to Discord`}
			className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-edge transition-colors data-[checked]:bg-primary"
		>
			<Switch.Thumb className="size-3.5 translate-x-1 rounded-full bg-surface transition-transform data-[checked]:translate-x-[18px]" />
		</Switch.Root>
	);
}
