import { useState, useMemo } from "react";
import { format } from "date-fns";
import { TrendingUp, AlertTriangle, CheckCircle, XCircle, SkipForward } from "lucide-react";
import { YearlyProjection } from "@/components/insights/YearlyProjection";
import { SpendingTrendsChart } from "@/components/insights/SpendingTrendsChart";
import { PageContainer } from "@/components/layout/PageContainer";
import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import { EmptyState } from "@/components/subscription/EmptyState";
import { Button } from "@/components/ui/button";
import { getSubscriptions, getUsageChecks, saveUsageCheck, getMonthlyEquivalent, formatCurrency } from "@/lib/storage";
import { Subscription } from "@/types/subscription";

export default function InsightsPage() {
  const subscriptions = getSubscriptions();
  const usageChecks = getUsageChecks();
  const currentMonth = format(new Date(), 'yyyy-MM');
  const [, forceUpdate] = useState(0);

  const { topSpenders, needsReview, pendingChecks } = useMemo(() => {
    const activeOrTrial = subscriptions.filter(s => s.status === 'active' || s.status === 'trial');

    // Top 5 by monthly equivalent
    const sorted = [...activeOrTrial]
      .map(sub => ({
        subscription: sub,
        monthlyEquiv: getMonthlyEquivalent(sub),
      }))
      .sort((a, b) => b.monthlyEquiv - a.monthlyEquiv)
      .slice(0, 5);

    // Check which subscriptions need review (answered "no" to usage)
    const noUsage = usageChecks.filter(c => c.used === 'no');
    const noUsageIds = new Set(noUsage.map(c => c.subscriptionId));
    const reviewList = activeOrTrial.filter(s => noUsageIds.has(s.id));

    // Find subscriptions without a check for current month
    const currentMonthChecks = new Set(
      usageChecks.filter(c => c.month === currentMonth).map(c => c.subscriptionId)
    );
    const pending = activeOrTrial.filter(s => !currentMonthChecks.has(s.id));

    return {
      topSpenders: sorted,
      needsReview: reviewList,
      pendingChecks: pending,
    };
  }, [subscriptions, usageChecks, currentMonth]);

  const handleUsageCheck = (subscriptionId: string, used: 'yes' | 'no' | 'skip') => {
    saveUsageCheck(subscriptionId, currentMonth, used);
    forceUpdate(n => n + 1);
  };

  return (
    <PageContainer title="Insights" subtitle="Understand your spending">
      <div className="space-y-6 animate-fade-in">
        {/* Spending Trends Chart */}
        <SpendingTrendsChart />

        {/* Yearly Projection */}
        <YearlyProjection />

        {/* Top Spenders */}
        <section>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            Top 5 Subscriptions
          </h2>
          {topSpenders.length > 0 ? (
            <div className="space-y-2">
              {topSpenders.map(({ subscription, monthlyEquiv }, index) => (
                <div
                  key={subscription.id}
                  className="flex items-center gap-3 bg-card rounded-lg border border-border p-3"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{subscription.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{subscription.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold amount-display text-foreground">
                      {formatCurrency(monthlyEquiv, subscription.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">/month</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<TrendingUp className="h-6 w-6 text-muted-foreground" />}
              title="No active subscriptions"
              description="Add subscriptions to see your top spenders."
              className="py-8"
            />
          )}
        </section>

        {/* Monthly Usage Check */}
        {pendingChecks.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Monthly Check-in
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              Did you use these subscriptions in the last 30 days?
            </p>
            <div className="space-y-3">
              {pendingChecks.slice(0, 3).map((sub) => (
                <UsageCheckCard
                  key={sub.id}
                  subscription={sub}
                  onCheck={(used) => handleUsageCheck(sub.id, used)}
                />
              ))}
              {pendingChecks.length > 3 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{pendingChecks.length - 3} more to check
                </p>
              )}
            </div>
          </section>
        )}

        {/* Review List */}
        {needsReview.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-accent" />
              Consider Reviewing
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              These subscriptions were marked as unused. Consider cancelling or pausing them.
            </p>
            <div className="space-y-2">
              {needsReview.map((sub) => (
                <SubscriptionCard key={sub.id} subscription={sub} showMonthlyEquiv />
              ))}
            </div>
          </section>
        )}

        {pendingChecks.length === 0 && needsReview.length === 0 && topSpenders.length > 0 && (
          <div className="bg-success/10 border border-success/30 rounded-lg p-4 text-center">
            <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="font-medium text-success">All caught up!</p>
            <p className="text-sm text-muted-foreground">No subscriptions need review this month.</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

function UsageCheckCard({ 
  subscription, 
  onCheck 
}: { 
  subscription: Subscription; 
  onCheck: (used: 'yes' | 'no' | 'skip') => void 
}) {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="min-w-0">
          <h4 className="font-medium text-foreground truncate">{subscription.name}</h4>
          <p className="text-sm text-muted-foreground capitalize">{subscription.category}</p>
        </div>
        <p className="font-semibold amount-display text-foreground flex-shrink-0">
          {formatCurrency(subscription.amount, subscription.currency)}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1 text-success hover:text-success hover:bg-success/10 hover:border-success/30"
          onClick={() => onCheck('yes')}
        >
          <CheckCircle className="h-4 w-4" />
          Yes
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
          onClick={() => onCheck('no')}
        >
          <XCircle className="h-4 w-4" />
          No
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1"
          onClick={() => onCheck('skip')}
        >
          <SkipForward className="h-4 w-4" />
          Skip
        </Button>
      </div>
    </div>
  );
}
