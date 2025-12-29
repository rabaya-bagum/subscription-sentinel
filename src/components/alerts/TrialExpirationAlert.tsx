import { Link } from "react-router-dom";
import { Clock, AlertCircle } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { Subscription } from "@/types/subscription";
import { cn } from "@/lib/utils";

interface TrialExpirationAlertProps {
  trials: Subscription[];
  formatCurrency: (amount: number, currency: string) => string;
}

export function TrialExpirationAlert({ trials, formatCurrency }: TrialExpirationAlertProps) {
  if (trials.length === 0) return null;

  const today = new Date();

  return (
    <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
          <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <p className="font-semibold text-sm text-purple-700 dark:text-purple-300">
            Trials Ending Soon
          </p>
          <p className="text-xs text-muted-foreground">
            {trials.length} trial{trials.length !== 1 ? 's' : ''} expiring soon
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {trials.map((trial) => {
          const daysLeft = differenceInDays(parseISO(trial.nextRenewalDate), today);
          const isUrgent = daysLeft <= 3;
          
          return (
            <Link
              key={trial.id}
              to={`/subscriptions/${trial.id}`}
              className="flex items-center justify-between p-2 rounded-lg bg-background/50 hover:bg-background transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-sm text-foreground truncate">
                  {trial.name}
                </span>
                {isUrgent && (
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm flex-shrink-0">
                <span className={cn(
                  "font-medium",
                  isUrgent ? "text-destructive" : "text-purple-600 dark:text-purple-400"
                )}>
                  {daysLeft === 0 ? "Today!" : daysLeft === 1 ? "Tomorrow" : `${daysLeft} days`}
                </span>
                <span className="text-muted-foreground">
                  → {formatCurrency(trial.amount, trial.currency)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}