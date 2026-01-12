import * as React from "react";
import { cn } from "@/lib/utils";

type SpinnerProps = React.HTMLAttributes<HTMLSpanElement> & {
	size?: number;
};

export function Spinner({ className, size = 24, ...props }: SpinnerProps) {
	return (
		<span
			className={cn(
				"relative inline-block rounded-full text-primary",
				"motion-reduce:animate-none motion-reduce:opacity-80",
				"animate-spin [animation-duration:900ms] [animation-timing-function:cubic-bezier(.4,0,.2,1)]",
				"bg-[conic-gradient(from_90deg,transparent_0deg,currentColor_80deg,transparent_230deg,transparent_360deg)]",
				"[mask:radial-gradient(farthest-side,transparent_calc(100%-3px),#000_calc(100%-3px))]",
				"[-webkit-mask:radial-gradient(farthest-side,transparent_calc(100%-3px),#000_calc(100%-3px))]",
				"after:absolute after:inset-0 after:rounded-full after:content-['']",
				"after:[box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.16)] dark:after:[box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.10)]",
				"before:absolute before:left-1/2 before:top-0 before:size-1.5 before:-translate-x-1/2 before:rounded-full before:bg-current before:content-['']",
				"before:shadow-[0_0_0_2px_rgba(0,0,0,0.18),0_0_12px_currentColor] dark:before:shadow-[0_0_0_2px_rgba(0,0,0,0.45),0_0_12px_currentColor]",
				className,
			)}
			style={{ width: size, height: size }}
			aria-label="Loading"
			{...props}
		/>
	);
}
