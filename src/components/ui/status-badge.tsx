import { cn } from "@/lib/utils";
import { SubscriptionStatus } from "@/types/subscription";

interface StatusBadgeProps {
  status: SubscriptionStatus;
  className?: string;
}

const statusConfig: Record<SubscriptionStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-success text-success-foreground' },
  trial: { label: 'Trial', className: 'bg-trial text-trial-foreground' },
  paused: { label: 'Paused', className: 'bg-paused text-paused-foreground' },
  cancelled: { label: 'Cancelled', className: 'bg-destructive text-destructive-foreground' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
