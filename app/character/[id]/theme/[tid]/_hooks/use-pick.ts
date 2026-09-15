"use client";

import { useRouter } from "next/navigation";
import { useCharacter } from "@/app/character/[id]/_hooks/use-character";
import type { CharacterAction } from "@/app/character/[id]/_lib/reducer";

/**
 * Pick, then land on the theme screen with the value already set: the document
 * is client state under the /character/[id] layout, so there is no round trip.
 * `replace`, not `push`, so the back button leaves the picker behind.
 */
export function usePick(id: string, tid: string) {
  const { dispatch } = useCharacter();
  const router = useRouter();

  return (action: CharacterAction) => {
    dispatch(action);
    router.replace(`/character/${id}/theme/${tid}`);
  };
}
