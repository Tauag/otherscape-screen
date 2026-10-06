"use client";

import { Button } from "@base-ui/react/button";
import { Input } from "@base-ui/react/input";
import { useActionState } from "react";
import { createCampaign } from "@/app/admin/campaigns/_lib/actions";
import { LABEL, PRIMARY } from "@/components/styles";

export function NewCampaignForm() {
	const [error, create, pending] = useActionState(createCampaign, null);

	return (
		<form action={create} className="flex flex-col gap-2">
			<label htmlFor="campaign-name" className={LABEL}>
				New campaign
			</label>
			<div className="flex gap-2">
				<Input
					id="campaign-name"
					name="name"
					autoComplete="off"
					placeholder="Campaign name"
					className="min-h-11 w-full flex-1 rounded-sm border border-border bg-bg px-3 font-sans text-sm text-text"
				/>
				<Button
					type="submit"
					disabled={pending}
					className={`${PRIMARY} shrink-0 gap-2`}
				>
					<span aria-hidden="true" className="text-base leading-none">
						+
					</span>
					Create
				</Button>
			</div>
			<p
				role="status"
				className={`font-sans text-[11px] ${error ? "text-negative-text" : "text-dim"}`}
			>
				{pending ? "Creating" : (error ?? "")}
			</p>
		</form>
	);
}
