import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Filter, List } from "lucide-react";
import { parseISO } from "date-fns";
import { PageContainer } from "@/components/layout/PageContainer";
import { SubscriptionCard } from "@/components/subscription/SubscriptionCard";
import { EmptyState } from "@/components/subscription/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSubscriptions } from "@/lib/storage";
import { SubscriptionStatus, STATUSES } from "@/types/subscription";
import { cn } from "@/lib/utils";

export default function SubscriptionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "all">("all");

  const subscriptions = getSubscriptions();

  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => parseISO(a.nextRenewalDate).getTime() - parseISO(b.nextRenewalDate).getTime());
  }, [subscriptions, searchQuery, statusFilter]);

  const statusCounts = useMemo(() => {
    return subscriptions.reduce((acc, sub) => {
      acc[sub.status] = (acc[sub.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [subscriptions]);

  return (
    <PageContainer 
      title="Subscriptions" 
      subtitle={`${subscriptions.length} total`}
      headerAction={
        <Link to="/subscriptions/new">
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </Link>
      }
    >
      <div className="space-y-4 animate-fade-in">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search subscriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          <button
            onClick={() => setStatusFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              statusFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            All ({subscriptions.length})
          </button>
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                statusFilter === s.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {s.label} ({statusCounts[s.value] || 0})
            </button>
          ))}
        </div>

        {/* List */}
        {filteredSubscriptions.length > 0 ? (
          <div className="space-y-2">
            {filteredSubscriptions.map((sub) => (
              <SubscriptionCard key={sub.id} subscription={sub} showMonthlyEquiv />
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <EmptyState
            icon={<List className="h-7 w-7 text-muted-foreground" />}
            title="No subscriptions yet"
            description="Add your first subscription to start tracking your spending."
            action={
              <Link to="/subscriptions/new">
                <Button>Add Subscription</Button>
              </Link>
            }
          />
        ) : (
          <EmptyState
            icon={<Filter className="h-7 w-7 text-muted-foreground" />}
            title="No matches found"
            description="Try adjusting your search or filters."
          />
        )}
      </div>
    </PageContainer>
  );
}
