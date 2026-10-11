"use client";

import { type CSSProperties, useId, useRef, useState } from "react";
import type { ThemeType } from "@/lib/character/types";

// Horizontal bands the glitch shifts apart, as [top, height, shift] in viewBox units.
const SLICES = [
	[-221, 521, 70],
	[300, 160, -120],
	[460, 160, 90],
	[620, 567, -50],
];

/*
 * How to change the number of passes (N) or the pass length (P seconds).
 * One pass = one glitch + one eye sweep. The hue animation spans N passes.
 *
 * 1. PASSES below = N. It must be a multiple of the theme type count
 *    (3 types: N = 3, 6, 9), or the colors will not loop evenly.
 * 2. globals.css: set `otherscape-hue` duration to N * P.
 *    Set the `otherscape-glitch` and `otherscape-look` durations to P.
 * 3. globals.css, `@keyframes otherscape-hue`: write one block of four
 *    stops per pass k (0 to N-1). With S = 100 / N, the stops are:
 *      k*S        color: var(--c{k})
 *      k*S + 0.9*S    color: var(--c{(k+1) % N})   (the change)
 *      k*S + 0.92*S   color: var(--c{k})           (flicker back)
 *      k*S + 0.94*S   color: var(--c{(k+1) % N})   (flicker again)
 *    The glitch keyframes use the same 90/92/94% points of one pass.
 * 4. Every --c{i} used in the keyframes must exist. This file sets
 *    --c0 to --c{N-1}. A missing variable makes the icon fall back to
 *    the default color.
 * 5. RUN_CYCLES = how many full hue cycles (N * P seconds each) it runs
 *    before it stops. It counts the animation's own iterations, so it
 *    stops exactly on a cycle boundary.
 */
const DEFAULT_TYPES: readonly ThemeType[] = ["mythos", "self", "noise"];
const PASSES = 3;
const RUN_CYCLES = 1;

/** Glows in each theme hue in turn, glitching at every change. Animated in
 *  globals.css (.otherscape-icon). Stops after RUN_CYCLES, restarts on hover. */
export function OtherscapeIcon({
	themes,
	size = 36,
}: {
	themes?: readonly { type: ThemeType }[];
	size?: number;
}) {
	const id = useId();
	const [running, setRunning] = useState(true);
	const cycles = useRef(0);

	const types = [...new Set(themes?.map((t) => t.type))];
	const list = types.length ? types : DEFAULT_TYPES;
	const vars: Record<string, string> = {};
	for (let i = 0; i < PASSES; i++)
		vars[`--c${i}`] = `var(--color-${list[i % list.length]})`;

	return (
		<svg
			aria-hidden="true"
			width={size}
			height={size}
			viewBox="-179 -221 1408 1408"
			fill="none"
			stroke="currentColor"
			strokeWidth="63"
			className="otherscape-icon"
			data-paused={!running || undefined}
			style={vars as CSSProperties}
			onPointerEnter={() => {
				cycles.current = 0;
				setRunning(true);
			}}
			onAnimationIteration={(e) => {
				if (e.target !== e.currentTarget) return;
				if (++cycles.current >= RUN_CYCLES) setRunning(false);
			}}
		>
			<defs>
				<pattern
					id={`${id}scan`}
					width="1408"
					height="94"
					patternUnits="userSpaceOnUse"
				>
					<rect width="1408" height="60" fill="white" />
				</pattern>
				<mask id={`${id}mask`}>
					<rect
						x="-179"
						y="-221"
						width="1408"
						height="1408"
						fill={`url(#${id}scan)`}
					/>
				</mask>
				{SLICES.map(([y, h], i) => (
					<clipPath key={y} id={`${id}slice${i}`}>
						<rect x="-179" y={y} width="1408" height={h} />
					</clipPath>
				))}
			</defs>
			<g mask={`url(#${id}mask)`}>
				{/* lazy: the art repeats per slice instead of <use>, since Safari skips CSS animations inside <use> clones. */}
				{SLICES.map(([y, , dx], i) => (
					<g key={y} clipPath={`url(#${id}slice${i})`}>
						<g
							className="otherscape-slice"
							style={{ "--dx": `${dx}px` } as CSSProperties}
						>
							<path d="M229 512V447L102 200L152 108H897L947 200L820 447V512" />
							<path d="M316 580L473 859H576L733 580" />
							<path d="M230 456A298.5 298.5 0 0 1 820 456" />
							<path d="M229 447A434 434 0 0 1 820 447V512A434 434 0 0 1 229 512Z" />
							<circle className="otherscape-pupil" cx="525" cy="432" r="95.5" />
						</g>
					</g>
				))}
			</g>
		</svg>
	);
}
