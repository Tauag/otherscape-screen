// The campaign screen's autosave, on lib/character/autosave.ts's generic
// engine (sysdesign 14): same debounce, park, and conflict logic, bound here
// to Campaign instead of Character.

import { migrate } from "@/app/admin/campaigns/_lib/migrate";
import type { Campaign } from "@/app/admin/campaigns/_lib/types";
import { createAutosave } from "@/lib/character/autosave";

export const { localKey, parkedKeyPrefix, readLocal, writeLocal, parkLocal } =
	createAutosave<Campaign>("otherscape:campaign", migrate);
