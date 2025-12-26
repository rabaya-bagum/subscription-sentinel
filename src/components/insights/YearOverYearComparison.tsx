import { useMemo } from "react";
import { ArrowUpRight, ArrowDownRight, Minus, CalendarRange } from "lucide-react";
import { getSubscriptions, getMonthlyEquivalent, formatCurrency, getSettings } from "@/lib/storage";
import { subYears, parseISO, isBefore, format } from "date-fns";

interface ComparisonData {
  label: string;
  current: number;
  lastYear: number;
  change: number;
  changePercent: number;
}

export function YearOverYearComparison() {
  const subscriptions = getSubscriptions();
  const settings = getSettings();

  const { comparisons, currency, newThisYear, removedThisYear } = useMemo(() => {
    const now = new Date();
    const oneYearAgo = subYears(now, 1);

    // Get subscriptions that were active/trial now
    const currentActive = subscriptions.filter(
      (s) => s.status === "active" || (settings.includeTrialsInTotal && s.status === "trial")
    );

    // Estimate subscriptions that would have been active a year ago
    // - Must have been created before one year ago
    // - OR if created this year, it's "new"
    const activeLastYear = subscriptions.filter((s) => {
      const createdAt = parseISO(s.createdAt);
      const wasCreatedBeforeLastYear = isBefore(createdAt, oneYearAgo);
      // Consider it active last year if it was created before and is currently active/trial/paused
      // (cancelled subs might have been active)
      return wasCreatedBeforeLastYear && (s.status === "active" || s.status === "trial" || s.status === "paused" || s.status === "cancelled");
    });

    // New subscriptions added this year
    const newSubs = subscriptions.filter((s) => {
      const createdAt = parseISO(s.createdAt);
      return !isBefore(createdAt, oneYearAgo) && (s.status === "active" || s.status === "trial");
    });

    // Subscriptions that existed last year but are now cancelled/paused
    const removedSubs = subscriptions.filter((s) => {
      const createdAt = parseISO(s.createdAt);
      const wasCreatedBeforeLastYear = isBefore(createdAt, oneYearAgo);
      return wasCreatedBeforeLastYear && (s.status === "cancelled" || s.status === "paused");
    });

    // Calculate monthly totals
    const currentMonthly = currentActive.reduce((sum, s) => sum + getMonthlyEquivalent(s), 0);
    const lastYearMonthly = activeLastYear
      .filter(s => s.status === "active" || s.status === "trial") // Only count what was likely active
      .reduce((sum, s) => sum + getMonthlyEquivalent(s), 0);

    // For last year projection, use subscriptions that existed and estimate they were active
    const lastYearEstimate = activeLastYear.reduce((sum, s) => sum + getMonthlyEquivalent(s), 0);

    const monthlyChange = currentMonthly - lastYearEstimate;
    const monthlyChangePercent = lastYearEstimate > 0 ? (monthlyChange / lastYearEstimate) * 100 : 0;

    const yearlyChange = monthlyChange * 12;
    const yearlyChangePercent = monthlyChangePercent;

    const comparisonData: ComparisonData[] = [
      {
        label: "Monthly",
        current: currentMonthly,
        lastYear: lastYearEstimate,
        change: monthlyChange,
        changePercent: Math.round(monthlyChangePercent),
      },
      {
        label: "Annual",
        current: currentMonthly * 12,
        lastYear: lastYearEstimate * 12,
        change: yearlyChange,
        changePercent: Math.round(yearlyChangePercent),
      },
    ];

    const mainCurrency = currentActive[0]?.currency || settings.defaultCurrency;

    return {
      comparisons: comparisonData,
      currency: mainCurrency,
      newThisYear: newSubs,
      removedThisYear: removedSubs,
    };
  }, [subscriptions, settings]);

  if (subscriptions.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <CalendarRange className="h-5 w-5 text-primary" />
        Year-over-Year
      </h2>

      {/* Comparison Cards */}
      <div className="grid grid-cols-2 gap-3">
        {comparisons.map((comp) => (
          <div key={comp.label} className="bg-card rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">{comp.label} Spending</p>
            <p className="text-xl font-bold text-foreground amount-display mb-2">
              {formatCurrency(comp.current, currency)}
            </p>
            <div className="flex items-center gap-1.5">
              {comp.change > 0 ? (
                <ArrowUpRight className="h-4 w-4 text-destructive" />
              ) : comp.change < 0 ? (
                <ArrowDownRight className="h-4 w-4 text-success" />
              ) : (
                <Minus className="h-4 w-4 text-muted-foreground" />
              )}
              <span
                className={`text-sm font-medium ${
                  comp.change > 0 ? "text-destructive" : comp.change < 0 ? "text-success" : "text-muted-foreground"
                }`}
              >
                {comp.change > 0 ? "+" : ""}
                {formatCurrency(Math.abs(comp.change), currency)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({comp.changePercent > 0 ? "+" : ""}{comp.changePercent}%)
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs. last year: {formatCurrency(comp.lastYear, currency)}
            </p>
          </div>
        ))}
      </div>

      {/* Changes Summary */}
      {(newThisYear.length > 0 || removedThisYear.length > 0) && (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-medium text-foreground">Changes This Year</h3>
          </div>
          <div className="p-3 space-y-3">
            {newThisYear.length > 0 && (
              <div>
                <p className="text-xs font-medium text-success mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  New Subscriptions ({newThisYear.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {newThisYear.slice(0, 5).map((sub) => (
                    <span
                      key={sub.id}
                      className="text-xs bg-success/10 text-success px-2 py-1 rounded-md"
                    >
                      {sub.name}
                    </span>
                  ))}
                  {newThisYear.length > 5 && (
                    <span className="text-xs text-muted-foreground">
                      +{newThisYear.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
            {removedThisYear.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                  Cancelled/Paused ({removedThisYear.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {removedThisYear.slice(0, 5).map((sub) => (
                    <span
                      key={sub.id}
                      className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md line-through"
                    >
                      {sub.name}
                    </span>
                  ))}
                  {removedThisYear.length > 5 && (
                    <span className="text-xs text-muted-foreground">
                      +{removedThisYear.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
