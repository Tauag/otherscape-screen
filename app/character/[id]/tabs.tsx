"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { power } from "@/lib/rules/power";

export const TABS: { label: string; segment: string }[] = [{ label: "Sheet", segment: "" }];

const KEY =
  "grid min-h-11 flex-1 place-items-center rounded-sm px-3 font-display text-xs font-semibold tracking-[0.08em] uppercase";

export function TabBar({ id }: { id: string }) {
  const pathname = usePathname();

  const keys = TABS.map((tab) => {
    const href = `/character/${id}${tab.segment}`;
    const active = pathname === href;
    return (
      <Link
        key={tab.segment}
        href={href}
        aria-current={active ? "page" : undefined}
        className={`${KEY} ${active ? "bg-primary text-bg" : "text-dim"}`}
      >
        {tab.label}
      </Link>
    );
  });

  const half = Math.ceil(keys.length / 2);

  return (
    <nav aria-label="Character screens" className="flex items-stretch gap-1 pt-2">
      {keys.slice(0, half)}

      <p className="flex min-h-11 min-w-20 flex-col items-center justify-center rounded-sm border border-primary px-3">
        <span className="font-mono text-[9px] tracking-[0.08em] text-faint uppercase">Power</span>
        <span className="font-display text-lg leading-none font-bold text-primary">
          {power({ tags: [], statuses: [], modifier: 0 }).total}
        </span>
      </p>

      {keys.slice(half)}
    </nav>
  );
}
