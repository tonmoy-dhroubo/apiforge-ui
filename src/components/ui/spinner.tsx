import * as React from "react";
import { cn } from "@/lib/utils";

type SpinnerProps = React.HTMLAttributes<HTMLSpanElement> & {
  size?: number;
};

export function Spinner({ className, size = 24, ...props }: SpinnerProps) {
  return (
    <span
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
        className
      )}
      style={{ width: size, height: size }}
      aria-label="Loading"
      {...props}
    />
  );
}
