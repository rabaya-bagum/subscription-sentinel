import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, addMonths, subMonths, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import { EmptyState } from "@/components/subscription/EmptyState";
import { Button } from "@/components/ui/button";
import { getSubscriptions } from "@/lib/storage";
import { cn } from "@/lib/utils";

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const subscriptions = getSubscriptions();

  const { calendarDays, renewalsByDate } = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Pad start of month to align with weekday
    const startPadding = monthStart.getDay();
    const paddedDays = Array(startPadding).fill(null).concat(days);

    // Group renewals by date
    const renewals: Record<string, typeof subscriptions> = {};
    subscriptions
      .filter(s => s.status !== 'cancelled')
      .forEach(sub => {
        const dateKey = format(parseISO(sub.nextRenewalDate), 'yyyy-MM-dd');
        if (!renewals[dateKey]) {
          renewals[dateKey] = [];
        }
        renewals[dateKey].push(sub);
      });

    return { calendarDays: paddedDays, renewalsByDate: renewals };
  }, [currentMonth, subscriptions]);

  const selectedDateRenewals = selectedDate
    ? renewalsByDate[format(selectedDate, 'yyyy-MM-dd')] || []
    : [];

  const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  return (
    <PageContainer title="Calendar" subtitle="View your renewal schedule">
      <div className="space-y-4 animate-fade-in">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={goToPrevMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <Button variant="ghost" size="sm" onClick={goToToday} className="text-xs text-primary">
              Today
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-card rounded-xl border border-border p-3">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dateKey = format(day, 'yyyy-MM-dd');
              const hasRenewals = renewalsByDate[dateKey]?.length > 0;
              const renewalCount = renewalsByDate[dateKey]?.length || 0;
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const dayIsToday = isToday(day);

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "aspect-square rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors relative",
                    isSelected && "bg-primary text-primary-foreground",
                    !isSelected && dayIsToday && "bg-muted",
                    !isSelected && hasRenewals && "bg-accent/10",
                    !isSelected && "hover:bg-muted"
                  )}
                >
                  <span className={cn(
                    "text-sm font-medium",
                    !isSelected && dayIsToday && "text-primary",
                    !isSelected && !dayIsToday && "text-foreground"
                  )}>
                    {format(day, 'd')}
                  </span>
                  {hasRenewals && (
                    <div className="flex gap-0.5">
                      {Array.from({ length: Math.min(renewalCount, 3) }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isSelected ? "bg-primary-foreground" : "bg-primary"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Renewals */}
        {selectedDate && (
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">
              {format(selectedDate, 'EEEE, MMMM d')}
            </h3>
            {selectedDateRenewals.length > 0 ? (
              <div className="space-y-2">
                {selectedDateRenewals.map((sub) => (
                  <SubscriptionCard key={sub.id} subscription={sub} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<CalendarIcon className="h-6 w-6 text-muted-foreground" />}
                title="No renewals"
                description="No subscriptions renewing on this date."
                className="py-8"
              />
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
