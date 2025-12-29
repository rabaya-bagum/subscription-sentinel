import { AlertTriangle, TrendingUp, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BudgetAlertProps {
  currentSpending: number;
  budgetLimit: number;
  threshold: number;
  currency: string;
  formatCurrency: (amount: number, currency: string) => string;
}

export function BudgetAlert({ 
  currentSpending, 
  budgetLimit, 
  threshold, 
  currency,
  formatCurrency 
}: BudgetAlertProps) {
  const percentage = (currentSpending / budgetLimit) * 100;
  const isOverBudget = percentage >= 100;
  const isApproaching = percentage >= threshold && percentage < 100;
  const isUnderBudget = percentage < threshold;

  if (isUnderBudget) return null;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 flex items-start gap-3",
        isOverBudget 
          ? "bg-destructive/10 border-destructive/30" 
          : "bg-warning/10 border-warning/30"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
          isOverBudget ? "bg-destructive/20" : "bg-warning/20"
        )}
      >
        <AlertTriangle 
          className={cn(
            "h-5 w-5",
            isOverBudget ? "text-destructive" : "text-warning"
          )} 
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-semibold text-sm",
          isOverBudget ? "text-destructive" : "text-warning"
        )}>
          {isOverBudget ? "Budget Exceeded!" : "Approaching Budget Limit"}
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">
          {formatCurrency(currentSpending, currency)} of {formatCurrency(budgetLimit, currency)} ({percentage.toFixed(0)}%)
        </p>
        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all",
              isOverBudget ? "bg-destructive" : "bg-warning"
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}