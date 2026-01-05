import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type SpinnerEmptyProps = {
  className?: string;
  title?: string;
  description?: string;
  showCancel?: boolean;
  onCancel?: () => void;
};

export function SpinnerEmpty({
  className,
  title = "Processing your request",
  description = "Please wait while we process your request. Do not refresh the page.",
  showCancel = false,
  onCancel,
}: SpinnerEmptyProps) {
  return (
    <Empty className={cn("w-full", className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {showCancel && (
        <EmptyContent>
          <Button variant="outline" size="sm" onClick={onCancel} type="button">
            Cancel
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}
