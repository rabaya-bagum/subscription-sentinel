import { useMemo } from "react";
import { PiggyBank, TrendingDown, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { getSubscriptions, getUsageChecks, getMonthlyEquivalent, formatCurrency, getSettings } from "@/lib/storage";
import { Button } from "@/components/ui/button";

export function SavingsCalculator() {
  const subscriptions = getSubscriptions();
  const usageChecks = getUsageChecks();
  const settings = getSettings();

  const { unusedSubscriptions, monthlySavings, yearlySavings, currency } = useMemo(() => {
    // Find subscriptions marked as unused
    const noUsageCheckIds = new Set(
      usageChecks.filter((c) => c.used === "no").map((c) => c.subscriptionId)
    );

    // Get active/trial subscriptions that are marked as unused
    const unused = subscriptions.filter(
      (s) =>
        (s.status === "active" || s.status === "trial") &&
        noUsageCheckIds.has(s.id)
    );

    // Also include paused subscriptions as potential savings if resumed
    const paused = subscriptions.filter((s) => s.status === "paused");

    // Calculate potential savings
    const unusedMonthlySavings = unused.reduce(
      (sum, s) => sum + getMonthlyEquivalent(s),
      0
    );

    const mainCurrency =
      unused[0]?.currency ||
      subscriptions.find((s) => s.status === "active")?.currency ||
      settings.defaultCurrency;

    return {
      unusedSubscriptions: unused,
      monthlySavings: unusedMonthlySavings,
      yearlySavings: unusedMonthlySavings * 12,
      currency: mainCurrency,
    };
  }, [subscriptions, usageChecks, settings]);

  // Don't show if no potential savings
  if (unusedSubscriptions.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <PiggyBank className="h-5 w-5 text-primary" />
        Savings Calculator
      </h2>

      {/* Savings Summary Card */}
      <div className="bg-gradient-to-br from-success/15 via-success/5 to-transparent border border-success/30 rounded-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Potential Monthly Savings
            </p>
            <p className="text-3xl font-bold text-success amount-display">
              {formatCurrency(monthlySavings, currency)}
            </p>
          </div>
          <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center">
            <TrendingDown className="h-6 w-6 text-success" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-success/20">
          <div>
            <p className="text-xs text-muted-foreground">Yearly Savings</p>
            <p className="text-lg font-semibold text-foreground amount-display">
              {formatCurrency(yearlySavings, currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Unused Subscriptions</p>
            <p className="text-lg font-semibold text-foreground">
              {unusedSubscriptions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Unused Subscriptions List */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-3 border-b border-border bg-muted/30 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-warning" />
          <h3 className="text-sm font-medium text-foreground">
            Consider Cancelling
          </h3>
        </div>
        <div className="divide-y divide-border">
          {unusedSubscriptions.map((sub) => {
            const monthlyEquiv = getMonthlyEquivalent(sub);
            return (
              <div
                key={sub.id}
                className="p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {sub.name}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {sub.category} • {sub.cadence}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-destructive amount-display">
                      -{formatCurrency(monthlyEquiv, sub.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">/month</p>
                  </div>
                  <Link to={`/subscriptions/${sub.id}`}>
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tip */}
      <div className="bg-muted/50 rounded-lg p-3 text-center">
        <p className="text-sm text-muted-foreground">
          💡 Mark subscriptions as "unused" during monthly check-ins to see them here
        </p>
      </div>
    </section>
  );
}
