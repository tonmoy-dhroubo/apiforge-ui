"use client";

import { cn } from "@/lib/utils";

type LogoProps = {
	className?: string;
	size?: number;
	showText?: boolean;
};

export function Logo({ className, size = 40, showText = true }: LogoProps) {
	return (
		<div className={cn("flex items-center gap-3", className)}>
			<div
				className="flex items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
				style={{ width: size, height: size }}
				aria-hidden="true"
			>
				<svg
					width={size * 0.6}
					height={size * 0.6}
					viewBox="0 0 64 64"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M32 6L54 18V46L32 58L10 46V18L32 6Z"
						stroke="currentColor"
						strokeWidth="4"
						strokeLinejoin="round"
					/>
					<path
						d="M22 42L32 22L42 42"
						stroke="currentColor"
						strokeWidth="4"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M26 34H38"
						stroke="currentColor"
						strokeWidth="4"
						strokeLinecap="round"
					/>
				</svg>
			</div>
			{showText && (
				<div className="leading-tight">
					<p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
						APIFORGE
					</p>
					<p className="text-sm font-semibold uppercase tracking-[0.2em]">
						STUDIO
					</p>
				</div>
			)}
		</div>
	);
}
