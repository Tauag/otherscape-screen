"use client";

import { Input } from "@base-ui/react/input";
import Link from "next/link";
import { useParams } from "next/navigation";
import { isNascent } from "@/lib/character/theme";
import { useCharacter } from "../_hooks/use-character";
import { initials } from "../_lib/initials";
import { SheetMenu } from "./menu";

export function AppBar() {
  const { character, dispatch } = useCharacter();
  const { id } = useParams<{ id: string }>();

  return (
    <header className="sticky top-0 mx-auto flex w-full max-w-md items-center gap-[11px] border-b border-edge bg-chrome px-4 pt-[max(13px,env(safe-area-inset-top))] pb-[13px]">
      <Link
        href={`/character/${id}`}
        aria-label="Back to this character"
        className="-m-1 flex shrink-0 p-1"
      >
        <span
          aria-hidden="true"
          className="flex size-9 items-center justify-center border border-raised bg-surface font-display text-[13px] font-bold tracking-[0.06em] text-quiet [clip-path:polygon(0_0,100%_0,100%_72%,72%_100%,0_100%)]"
        >
          {initials(character.name)}
        </span>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <label className="-my-[14px] flex w-full items-center py-[14px]">
          <span className="sr-only">Name</span>
          <Input
            value={character.name}
            onChange={(event) => dispatch({ type: "rename", name: event.target.value })}
            placeholder="Unnamed"
            className="w-full min-w-0 bg-transparent font-display text-[17px] leading-none font-bold tracking-[0.05em] text-text uppercase placeholder:text-dim"
          />
        </label>

        {/* Repeats what the theme cards already say, so a screen reader does
            not read it twice. */}
        <div aria-hidden="true" className="flex items-center gap-[7px]">
          <div className="flex gap-0.5">
            {character.themes.map((theme) => (
              <span
                key={theme.id}
                data-type={theme.type}
                style={{ opacity: isNascent(theme) ? 0.28 : 1 }}
                className="h-0.5 w-3 bg-[var(--hue)]"
              />
            ))}
          </div>

          {character.essence && (
            <span className="font-display text-[10px] font-semibold tracking-[0.18em] text-dim uppercase">
              {character.essence}
            </span>
          )}
        </div>
      </div>

      <SheetMenu />
    </header>
  );
}
