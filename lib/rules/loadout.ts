// The loadout Power budget (PRD 7.6). It warns and never blocks (PRD section 4).

import type { Loadout, LoadoutTagKind } from "../character/types.ts";
import { LOADOUT_TAG_COST, WILDCARD_TAG_COST } from "./constants.ts";

const COST: Record<LoadoutTagKind, number> = {
  tag: LOADOUT_TAG_COST,
  wildcard: WILDCARD_TAG_COST,
  flaw: 0,
};

export function loadoutSpend(loadout: Loadout): {
  spent: number;
  available: number;
  over: number;
  warning: string | null;
} {
  const spent = loadout.tags.reduce((total, tag) => total + COST[tag.kind], 0);
  const available = loadout.availablePower;
  const over = Math.max(0, spent - available);
  return {
    spent,
    available,
    over,
    warning: over > 0 ? `The loadout spends ${spent} Power against ${available} available.` : null,
  };
}
