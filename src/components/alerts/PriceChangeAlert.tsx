import { Link } from "react-router-dom";
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Subscription, EventLog } from "@/types/subscription";

interface PriceChangeInfo {
  subscription: Subscription;
  event: EventLog;
  from: number;
  to: number;
  isIncrease: boolean;
}

interface PriceChangeAlertProps {
  priceChanges: PriceChangeInfo[];
  formatCurrency: (amount: number, currency: string) => string;
}

export function PriceChangeAlert({ priceChanges, formatCurrency }: PriceChangeAlertProps) {
  if (priceChanges.length === 0) return null;

  const increases = priceChanges.filter(p => p.isIncrease);
  const decreases = priceChanges.filter(p => !p.isIncrease);

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
          <TrendingUp className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="font-semibold text-sm text-amber-700 dark:text-amber-300">
            Recent Price Changes
          </p>
          <p className="text-xs text-muted-foreground">
            {increases.length} increase{increases.length !== 1 ? 's' : ''}, {decreases.length} decrease{decreases.length !== 1 ? 's' : ''} in the last 30 days
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {priceChanges.slice(0, 3).map(({ subscription, from, to, isIncrease }) => (
          <Link
            key={subscription.id}
            to={`/subscriptions/${subscription.id}`}
            className="flex items-center justify-between p-2 rounded-lg bg-background/50 hover:bg-background transition-colors"
          >
            <span className="font-medium text-sm text-foreground truncate">
              {subscription.name}
            </span>
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              isIncrease ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
            )}>
              {isIncrease ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span>
                {formatCurrency(from, subscription.currency)} → {formatCurrency(to, subscription.currency)}
              </span>
            </div>
          </Link>
        ))}
        {priceChanges.length > 3 && (
          <p className="text-xs text-muted-foreground text-center pt-1">
            +{priceChanges.length - 3} more
          </p>
        )}
      </div>
    </div>
  );
}