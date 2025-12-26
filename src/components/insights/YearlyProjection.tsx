import { useMemo } from "react";
import { Calendar, TrendingUp } from "lucide-react";
import { getSubscriptions, getMonthlyEquivalent, formatCurrency, getSettings } from "@/lib/storage";
import { Subscription } from "@/types/subscription";
import { addMonths, format, startOfMonth, isBefore, isAfter, parseISO } from "date-fns";

interface MonthlyBreakdown {
  month: string;
  monthLabel: string;
  total: number;
  subscriptions: { name: string; amount: number; currency: string }[];
}

export function YearlyProjection() {
  const subscriptions = getSubscriptions();
  const settings = getSettings();

  const { yearlyTotal, monthlyBreakdown, currency } = useMemo(() => {
    const activeSubscriptions = subscriptions.filter(
      (s) => s.status === "active" || (settings.includeTrialsInTotal && s.status === "trial")
    );

    if (activeSubscriptions.length === 0) {
      return { yearlyTotal: 0, monthlyBreakdown: [], currency: settings.defaultCurrency };
    }

    // Calculate yearly total from monthly equivalents
    const yearly = activeSubscriptions.reduce((sum, sub) => {
      return sum + getMonthlyEquivalent(sub) * 12;
    }, 0);

    // Generate 12-month breakdown starting from current month
    const now = new Date();
    const breakdown: MonthlyBreakdown[] = [];

    for (let i = 0; i < 12; i++) {
      const monthDate = addMonths(startOfMonth(now), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = addMonths(monthStart, 1);

      const monthSubs: { name: string; amount: number; currency: string }[] = [];

      activeSubscriptions.forEach((sub) => {
        // Calculate how many times this subscription renews in this month
        const renewals = getSubscriptionRenewalsInMonth(sub, monthStart, monthEnd);
        if (renewals > 0) {
          monthSubs.push({
            name: sub.name,
            amount: sub.amount * renewals,
            currency: sub.currency,
          });
        }
      });

      const monthTotal = monthSubs.reduce((sum, s) => sum + s.amount, 0);

      breakdown.push({
        month: format(monthDate, "yyyy-MM"),
        monthLabel: format(monthDate, "MMM yyyy"),
        total: monthTotal,
        subscriptions: monthSubs,
      });
    }

    // Use most common currency
    const mainCurrency = activeSubscriptions[0]?.currency || settings.defaultCurrency;

    return {
      yearlyTotal: yearly,
      monthlyBreakdown: breakdown,
      currency: mainCurrency,
    };
  }, [subscriptions, settings]);

  if (subscriptions.filter((s) => s.status === "active" || s.status === "trial").length === 0) {
    return null;
  }

  const maxMonthTotal = Math.max(...monthlyBreakdown.map((m) => m.total), 1);

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        Yearly Projection
      </h2>

      {/* Annual Total Card */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Estimated Annual Cost</p>
            <p className="text-3xl font-bold text-foreground amount-display">
              {formatCurrency(yearlyTotal, currency)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              ~{formatCurrency(yearlyTotal / 12, currency)}/month average
            </p>
          </div>
          <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center">
            <TrendingUp className="h-7 w-7 text-primary" />
          </div>
        </div>
      </div>

      {/* Month-by-Month Breakdown */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-medium text-foreground">12-Month Breakdown</h3>
        </div>
        <div className="divide-y divide-border">
          {monthlyBreakdown.map((month, index) => (
            <div key={month.month} className="p-3 hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  {month.monthLabel}
                  {index === 0 && (
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </span>
                <span className="text-sm font-semibold amount-display text-foreground">
                  {formatCurrency(month.total, currency)}
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/60 rounded-full transition-all duration-300"
                  style={{ width: `${(month.total / maxMonthTotal) * 100}%` }}
                />
              </div>
              {/* Subscription breakdown for non-zero months */}
              {month.subscriptions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {month.subscriptions.slice(0, 3).map((sub, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground"
                    >
                      {sub.name}
                    </span>
                  ))}
                  {month.subscriptions.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{month.subscriptions.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Helper function to count renewals in a given month
function getSubscriptionRenewalsInMonth(
  sub: Subscription,
  monthStart: Date,
  monthEnd: Date
): number {
  const nextRenewal = parseISO(sub.nextRenewalDate);
  let renewalDate = nextRenewal;
  let count = 0;

  // If next renewal is after month end, backtrack to find if it falls in this month
  if (isAfter(renewalDate, monthEnd)) {
    // Project forward from past
    const daysBetweenRenewals = getDaysBetweenRenewals(sub);
    const daysToMonthStart = Math.floor((monthStart.getTime() - nextRenewal.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysToMonthStart > 0) {
      const cyclesPassed = Math.floor(daysToMonthStart / daysBetweenRenewals);
      renewalDate = new Date(nextRenewal.getTime() + cyclesPassed * daysBetweenRenewals * 24 * 60 * 60 * 1000);
    }
  }

  // Count renewals within the month
  const daysBetweenRenewals = getDaysBetweenRenewals(sub);
  
  // Start from the earliest possible date before month start
  while (isBefore(renewalDate, monthStart)) {
    renewalDate = new Date(renewalDate.getTime() + daysBetweenRenewals * 24 * 60 * 60 * 1000);
  }

  while (isBefore(renewalDate, monthEnd) && !isBefore(renewalDate, monthStart)) {
    if (!isBefore(renewalDate, monthStart) && isBefore(renewalDate, monthEnd)) {
      count++;
    }
    renewalDate = new Date(renewalDate.getTime() + daysBetweenRenewals * 24 * 60 * 60 * 1000);
  }

  return count;
}

function getDaysBetweenRenewals(sub: Subscription): number {
  switch (sub.cadence) {
    case "weekly":
      return 7;
    case "monthly":
      return 30;
    case "yearly":
      return 365;
    case "custom":
      return sub.customDays || 30;
    default:
      return 30;
  }
}
