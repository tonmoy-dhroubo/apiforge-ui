import * as React from "react";
import { cn } from "@/lib/utils";

const Empty = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-6 rounded-xl border border-dashed border-border/60 bg-background/70 px-6 py-10 text-center",
        className
      )}
      {...props}
    />
  )
);
Empty.displayName = "Empty";

const EmptyHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col items-center gap-3", className)} {...props} />
  )
);
EmptyHeader.displayName = "EmptyHeader";

type EmptyMediaProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "icon";
};

const EmptyMedia = React.forwardRef<HTMLDivElement, EmptyMediaProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center",
        variant === "icon" && "h-12 w-12 rounded-full border border-border/60 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
);
EmptyMedia.displayName = "EmptyMedia";

const EmptyTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-base font-semibold text-foreground", className)} {...props} />
  )
);
EmptyTitle.displayName = "EmptyTitle";

const EmptyDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
EmptyDescription.displayName = "EmptyDescription";

const EmptyContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-center gap-2", className)} {...props} />
  )
);
EmptyContent.displayName = "EmptyContent";

export {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
};
