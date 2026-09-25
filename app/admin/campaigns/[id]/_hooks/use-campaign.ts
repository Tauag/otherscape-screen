"use client";

import { useContext } from "react";
import { CampaignContext } from "../_components/campaign-provider";

export function useCampaign() {
	const value = useContext(CampaignContext);
	if (!value) throw new Error("useCampaign needs a CampaignProvider above it.");
	return value;
}
