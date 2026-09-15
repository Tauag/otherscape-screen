import Link from "next/link";

type Props = {
    href: string;
    text: string;
}

export function BackLink({ href, text }: Props) {
    return (
        <Link
            href={href}
            className="inline-flex max-h-24 items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-dim uppercase"
        >
            <span aria-hidden>←</span>
            {text}
        </Link>
    );
}