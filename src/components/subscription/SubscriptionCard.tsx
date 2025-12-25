import { Link } from "react-router-dom";
import { format, differenceInDays, parseISO } from "date-fns";
import { ChevronRight } from "lucide-react";
import { Subscription } from "@/types/subscription";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, getMonthlyEquivalent } from "@/lib/storage";
import { cn } from "@/lib/utils";

interface SubscriptionCardProps {
  subscription: Subscription;
  showMonthlyEquiv?: boolean;
}

export function SubscriptionCard({ subscription, showMonthlyEquiv }: SubscriptionCardProps) {
  const daysUntilRenewal = differenceInDays(parseISO(subscription.nextRenewalDate), new Date());
  const isUrgent = daysUntilRenewal >= 0 && daysUntilRenewal <= 3;
  const isPast = daysUntilRenewal < 0;

  const getCadenceLabel = () => {
    switch (subscription.cadence) {
      case 'weekly': return '/wk';
      case 'monthly': return '/mo';
      case 'yearly': return '/yr';
      case 'custom': return `/${subscription.customDays}d`;
    }
  };

  return (
    <Link
      to={`/subscriptions/${subscription.id}`}
      className={cn(
        "block bg-card rounded-lg border border-border p-4 transition-all hover:shadow-md hover:border-primary/30 active:scale-[0.98]",
        isUrgent && subscription.status === 'active' && "renewal-urgent border-accent/40"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-foreground truncate">{subscription.name}</h3>
            <StatusBadge status={subscription.status} />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="capitalize">{subscription.category}</span>
            <span>•</span>
            <span>
              {isPast ? (
                <span className="text-destructive">Overdue</span>
              ) : daysUntilRenewal === 0 ? (
                <span className={cn(subscription.status === 'active' && "text-accent font-medium")}>Today</span>
              ) : (
                <span className={cn(isUrgent && subscription.status === 'active' && "text-accent font-medium")}>
                  {format(parseISO(subscription.nextRenewalDate), 'MMM d')}
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="amount-display text-foreground">
            {formatCurrency(subscription.amount, subscription.currency)}
            <span className="text-xs text-muted-foreground ml-0.5">{getCadenceLabel()}</span>
          </div>
          {showMonthlyEquiv && subscription.cadence !== 'monthly' && (
            <div className="text-xs text-muted-foreground">
              ~{formatCurrency(getMonthlyEquivalent(subscription), subscription.currency)}/mo
            </div>
          )}
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
      </div>
    </Link>
  );
}
