import { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getSubscriptions, getMonthlyEquivalent, formatCurrency, getSettings } from "@/lib/storage";
import { Subscription } from "@/types/subscription";
import { addMonths, subMonths, format, startOfMonth, parseISO, isBefore, isAfter } from "date-fns";

interface MonthData {
  month: string;
  label: string;
  total: number;
  projected: boolean;
}

export function SpendingTrendsChart() {
  const subscriptions = getSubscriptions();
  const settings = getSettings();

  const { chartData, currency, avgSpending, trend } = useMemo(() => {
    const activeSubscriptions = subscriptions.filter(
      (s) => s.status === "active" || (settings.includeTrialsInTotal && s.status === "trial")
    );

    if (activeSubscriptions.length === 0) {
      return { chartData: [], currency: settings.defaultCurrency, avgSpending: 0, trend: 0 };
    }

    const now = new Date();
    const data: MonthData[] = [];

    // Show 3 months past, current month, and 2 months future (6 months total)
    for (let i = -3; i <= 2; i++) {
      const monthDate = addMonths(startOfMonth(now), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = addMonths(monthStart, 1);

      let monthTotal = 0;

      activeSubscriptions.forEach((sub) => {
        const renewals = getSubscriptionRenewalsInMonth(sub, monthStart, monthEnd);
        monthTotal += sub.amount * renewals;
      });

      data.push({
        month: format(monthDate, "yyyy-MM"),
        label: format(monthDate, "MMM"),
        total: Math.round(monthTotal * 100) / 100,
        projected: i > 0,
      });
    }

    const mainCurrency = activeSubscriptions[0]?.currency || settings.defaultCurrency;
    
    // Calculate average and trend
    const pastMonths = data.filter(d => !d.projected);
    const avg = pastMonths.reduce((sum, d) => sum + d.total, 0) / pastMonths.length;
    
    // Trend: compare last 2 months
    const trendChange = pastMonths.length >= 2 
      ? ((pastMonths[pastMonths.length - 1].total - pastMonths[pastMonths.length - 2].total) / pastMonths[pastMonths.length - 2].total) * 100
      : 0;

    return {
      chartData: data,
      currency: mainCurrency,
      avgSpending: avg,
      trend: Math.round(trendChange),
    };
  }, [subscriptions, settings]);

  if (subscriptions.filter((s) => s.status === "active" || s.status === "trial").length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        Spending Trends
      </h2>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground mb-1">Monthly Average</p>
          <p className="text-lg font-bold text-foreground amount-display">
            {formatCurrency(avgSpending, currency)}
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground mb-1">Month-over-Month</p>
          <p className={`text-lg font-bold ${trend > 0 ? 'text-destructive' : trend < 0 ? 'text-success' : 'text-foreground'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                vertical={false}
              />
              <XAxis 
                dataKey="label" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as MonthData;
                    return (
                      <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
                        <p className="text-sm font-medium text-foreground">
                          {label} {data.projected && <span className="text-muted-foreground">(projected)</span>}
                        </p>
                        <p className="text-lg font-bold text-primary amount-display">
                          {formatCurrency(data.total, currency)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#spendingGradient)"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle
                      key={payload.month}
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={payload.projected ? 'hsl(var(--muted-foreground))' : 'hsl(var(--primary))'}
                      stroke={payload.projected ? 'hsl(var(--muted))' : 'hsl(var(--background))'}
                      strokeWidth={2}
                    />
                  );
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-muted-foreground" />
            <span>Projected</span>
          </div>
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
  let renewalDate = new Date(nextRenewal);
  let count = 0;

  const daysBetweenRenewals = getDaysBetweenRenewals(sub);

  // Backtrack to find the earliest renewal before month start
  while (isAfter(renewalDate, monthStart)) {
    renewalDate = new Date(renewalDate.getTime() - daysBetweenRenewals * 24 * 60 * 60 * 1000);
  }

  // Move forward to first renewal in or after month start
  while (isBefore(renewalDate, monthStart)) {
    renewalDate = new Date(renewalDate.getTime() + daysBetweenRenewals * 24 * 60 * 60 * 1000);
  }

  // Count renewals within the month
  while (isBefore(renewalDate, monthEnd)) {
    count++;
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
