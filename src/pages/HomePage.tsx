import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Calendar, TrendingUp, ArrowRight } from "lucide-react";
import { differenceInDays, parseISO, addDays, subDays } from "date-fns";
import { PageContainer } from "@/components/layout/PageContainer";
import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import { EmptyState } from "@/components/subscription/EmptyState";
import { Button } from "@/components/ui/button";
import { BudgetAlert } from "@/components/alerts/BudgetAlert";
import { PriceChangeAlert } from "@/components/alerts/PriceChangeAlert";
import { TrialExpirationAlert } from "@/components/alerts/TrialExpirationAlert";
import { getSubscriptions, getSettings, getMonthlyEquivalent, formatCurrency, getEvents } from "@/lib/storage";

export default function HomePage() {
  const subscriptions = getSubscriptions();
  const settings = getSettings();
  const events = getEvents();

  const { monthlyTotal, upcomingRenewals, currencyTotals, expiringTrials, recentPriceChanges } = useMemo(() => {
    const activeOrTrial = subscriptions.filter(
      s => s.status === 'active' || (settings.includeTrialsInTotal && s.status === 'trial')
    );

    // Calculate monthly totals per currency
    const totals = activeOrTrial.reduce((acc, sub) => {
      const monthly = getMonthlyEquivalent(sub);
      acc[sub.currency] = (acc[sub.currency] || 0) + monthly;
      return acc;
    }, {} as Record<string, number>);

    const today = new Date();
    const sevenDaysLater = addDays(today, 7);
    const thirtyDaysAgo = subDays(today, 30);
    
    const upcoming = subscriptions
      .filter(s => {
        if (s.status === 'cancelled' || s.status === 'paused') return false;
        const renewalDate = parseISO(s.nextRenewalDate);
        const daysUntil = differenceInDays(renewalDate, today);
        return daysUntil >= 0 && daysUntil <= 7;
      })
      .sort((a, b) => parseISO(a.nextRenewalDate).getTime() - parseISO(b.nextRenewalDate).getTime());

    // Find trials expiring within settings.trialExpirationDays
    const trials = subscriptions
      .filter(s => {
        if (s.status !== 'trial') return false;
        const renewalDate = parseISO(s.nextRenewalDate);
        const daysUntil = differenceInDays(renewalDate, today);
        return daysUntil >= 0 && daysUntil <= settings.trialExpirationDays;
      })
      .sort((a, b) => parseISO(a.nextRenewalDate).getTime() - parseISO(b.nextRenewalDate).getTime());

    // Find price changes in last 30 days
    const priceChangeEvents = events
      .filter(e => {
        if (e.type !== 'price_change') return false;
        const eventDate = parseISO(e.timestamp);
        return eventDate >= thirtyDaysAgo;
      })
      .map(e => {
        const sub = subscriptions.find(s => s.id === e.subscriptionId);
        if (!sub) return null;
        const payload = JSON.parse(e.payloadJson);
        return {
          subscription: sub,
          event: e,
          from: payload.from as number,
          to: payload.to as number,
          isIncrease: payload.to > payload.from,
        };
      })
      .filter(Boolean) as { subscription: typeof subscriptions[0]; event: typeof events[0]; from: number; to: number; isIncrease: boolean }[];

    // Main total in default currency
    const mainTotal = totals[settings.defaultCurrency] || 0;

    return {
      monthlyTotal: mainTotal,
      currencyTotals: totals,
      upcomingRenewals: upcoming,
      expiringTrials: trials,
      recentPriceChanges: priceChangeEvents,
    };
  }, [subscriptions, settings, events]);

  const hasMultipleCurrencies = Object.keys(currencyTotals).length > 1;
  const showBudgetAlert = settings.monthlyBudgetLimit && settings.monthlyBudgetLimit > 0;

  return (
    <PageContainer 
      title="Subscription Squeeze" 
      subtitle="Track your subscriptions"
      headerAction={
        <Link to="/subscriptions/new">
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </Link>
      }
    >
      <div className="space-y-6 animate-fade-in">
        {/* Budget Alert */}
        {showBudgetAlert && (
          <BudgetAlert
            currentSpending={monthlyTotal}
            budgetLimit={settings.monthlyBudgetLimit!}
            threshold={settings.budgetAlertThreshold}
            currency={settings.defaultCurrency}
            formatCurrency={formatCurrency}
          />
        )}

        {/* Trial Expiration Alert */}
        {expiringTrials.length > 0 && (
          <TrialExpirationAlert 
            trials={expiringTrials} 
            formatCurrency={formatCurrency}
          />
        )}

        {/* Price Change Alert */}
        {recentPriceChanges.length > 0 && (
          <PriceChangeAlert 
            priceChanges={recentPriceChanges}
            formatCurrency={formatCurrency}
          />
        )}

        {/* Monthly Total Card */}
        <div className="bg-primary text-primary-foreground rounded-2xl p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-primary-foreground/80 text-sm font-medium mb-1">
                Estimated Monthly Total
              </p>
              <p className="text-3xl font-bold amount-display">
                {formatCurrency(monthlyTotal, settings.defaultCurrency)}
              </p>
              {hasMultipleCurrencies && (
                <div className="mt-2 space-y-0.5">
                  {Object.entries(currencyTotals)
                    .filter(([cur]) => cur !== settings.defaultCurrency)
                    .map(([currency, total]) => (
                      <p key={currency} className="text-sm text-primary-foreground/70">
                        + {formatCurrency(total, currency)}
                      </p>
                    ))}
                </div>
              )}
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-primary-foreground/20 flex items-center gap-4 text-sm">
            <div>
              <span className="text-primary-foreground/70">Active: </span>
              <span className="font-medium">
                {subscriptions.filter(s => s.status === 'active').length}
              </span>
            </div>
            <div>
              <span className="text-primary-foreground/70">Trial: </span>
              <span className="font-medium">
                {subscriptions.filter(s => s.status === 'trial').length}
              </span>
            </div>
          </div>
        </div>

        {/* Upcoming Renewals */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Next 7 Days
            </h2>
            <Link to="/calendar" className="text-sm text-primary font-medium flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {upcomingRenewals.length > 0 ? (
            <div className="space-y-2">
              {upcomingRenewals.map((sub) => (
                <SubscriptionCard key={sub.id} subscription={sub} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Calendar className="h-7 w-7 text-muted-foreground" />}
              title="No renewals this week"
              description="You're all set! No subscriptions are renewing in the next 7 days."
            />
          )}
        </section>

        {/* Quick Actions */}
        {subscriptions.length === 0 && (
          <EmptyState
            icon={<Plus className="h-7 w-7 text-muted-foreground" />}
            title="No subscriptions yet"
            description="Start tracking your subscriptions to avoid surprise renewals."
            action={
              <Link to="/subscriptions/new">
                <Button>Add your first subscription</Button>
              </Link>
            }
          />
        )}
      </div>
    </PageContainer>
  );
}