import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format, parseISO, differenceInDays } from "date-fns";
import { 
  ArrowLeft, Edit, ExternalLink, Trash2, Pause, Play, XCircle, 
  Clock, DollarSign, Tag, Calendar, Bell, FileText, History
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { StatusBadge } from "@/components/ui/status-badge";
import { SubscriptionForm } from "@/components/subscription/SubscriptionForm";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getSubscription, updateSubscription, deleteSubscription, getEvents, formatCurrency, getMonthlyEquivalent } from "@/lib/storage";
import { Subscription, EventLog } from "@/types/subscription";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [events, setEvents] = useState<EventLog[]>([]);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const sub = getSubscription(id);
      if (sub) {
        setSubscription(sub);
        setEvents(getEvents(id));
      } else {
        navigate("/subscriptions", { replace: true });
      }
    }
  }, [id, navigate, editOpen]);

  if (!subscription) {
    return null;
  }

  const daysUntilRenewal = differenceInDays(parseISO(subscription.nextRenewalDate), new Date());
  const isUrgent = daysUntilRenewal >= 0 && daysUntilRenewal <= 3;
  const monthlyEquiv = getMonthlyEquivalent(subscription);

  const handleStatusChange = (newStatus: 'active' | 'paused' | 'cancelled') => {
    updateSubscription(subscription.id, { status: newStatus });
    setSubscription({ ...subscription, status: newStatus });
    setEvents(getEvents(subscription.id));
    toast.success(`Subscription ${newStatus === 'cancelled' ? 'cancelled' : newStatus === 'paused' ? 'paused' : 'resumed'}`);
  };

  const handleDelete = () => {
    deleteSubscription(subscription.id);
    toast.success("Subscription deleted");
    navigate("/subscriptions");
  };

  const getCadenceLabel = () => {
    switch (subscription.cadence) {
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      case 'custom': return `Every ${subscription.customDays} days`;
    }
  };

  const formatEventType = (type: string) => {
    switch (type) {
      case 'created': return 'Created';
      case 'edited': return 'Edited';
      case 'status_change': return 'Status Changed';
      case 'price_change': return 'Price Changed';
      case 'reminder_sent': return 'Reminder Sent';
      default: return type;
    }
  };

  return (
    <PageContainer>
      <div className="mb-4 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="gap-1 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Sheet open={editOpen} onOpenChange={setEditOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
              <SubscriptionForm 
                subscription={subscription} 
                onClose={() => setEditOpen(false)} 
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="space-y-4 animate-fade-in">
        {/* Header Card */}
        <div className={cn(
          "bg-card rounded-xl border p-5",
          isUrgent && subscription.status === 'active' ? "border-accent/40 renewal-urgent" : "border-border"
        )}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">{subscription.name}</h1>
              <StatusBadge status={subscription.status} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold amount-display text-foreground">
              {formatCurrency(subscription.amount, subscription.currency)}
              <span className="text-base font-normal text-muted-foreground ml-1">
                /{subscription.cadence === 'custom' ? `${subscription.customDays}d` : subscription.cadence.slice(0, -2)}
              </span>
            </p>
            {subscription.cadence !== 'monthly' && (
              <p className="text-sm text-muted-foreground">
                ~{formatCurrency(monthlyEquiv, subscription.currency)}/month equivalent
              </p>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          <DetailRow icon={Calendar} label="Next Renewal">
            <span className={cn(
              isUrgent && subscription.status === 'active' && "text-accent font-medium"
            )}>
              {format(parseISO(subscription.nextRenewalDate), 'MMMM d, yyyy')}
              {daysUntilRenewal >= 0 && (
                <span className="text-muted-foreground ml-1">
                  ({daysUntilRenewal === 0 ? 'Today' : `in ${daysUntilRenewal} days`})
                </span>
              )}
            </span>
          </DetailRow>
          <DetailRow icon={Clock} label="Billing Cycle">
            {getCadenceLabel()}
          </DetailRow>
          <DetailRow icon={Tag} label="Category">
            <span className="capitalize">{subscription.category}</span>
          </DetailRow>
          <DetailRow icon={Bell} label="Reminder">
            {subscription.reminderEnabled 
              ? `${subscription.reminderDaysBefore} day${subscription.reminderDaysBefore !== 1 ? 's' : ''} before`
              : 'Off'
            }
          </DetailRow>
          {subscription.notes && (
            <DetailRow icon={FileText} label="Notes">
              {subscription.notes}
            </DetailRow>
          )}
          {subscription.cancelUrl && (
            <DetailRow icon={ExternalLink} label="Cancel URL">
              <a 
                href={subscription.cancelUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary underline truncate block"
              >
                {subscription.cancelUrl}
              </a>
            </DetailRow>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {subscription.status === 'active' && (
            <>
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={() => handleStatusChange('paused')}
              >
                <Pause className="h-4 w-4" />
                Pause
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 gap-2 text-destructive hover:text-destructive"
                onClick={() => handleStatusChange('cancelled')}
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </Button>
            </>
          )}
          {subscription.status === 'paused' && (
            <>
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={() => handleStatusChange('active')}
              >
                <Play className="h-4 w-4" />
                Resume
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 gap-2 text-destructive hover:text-destructive"
                onClick={() => handleStatusChange('cancelled')}
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </Button>
            </>
          )}
          {subscription.status === 'cancelled' && (
            <Button 
              variant="outline" 
              className="flex-1 gap-2"
              onClick={() => handleStatusChange('active')}
            >
              <Play className="h-4 w-4" />
              Reactivate
            </Button>
          )}
          {subscription.status === 'trial' && (
            <Button 
              variant="outline" 
              className="flex-1 gap-2 text-destructive hover:text-destructive"
              onClick={() => handleStatusChange('cancelled')}
            >
              <XCircle className="h-4 w-4" />
              Cancel Trial
            </Button>
          )}
        </div>

        {/* History */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-muted-foreground" />
            History
          </h3>
          <div className="space-y-3">
            {events.length > 0 ? (
              events.slice().reverse().map((event) => (
                <div key={event.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{formatEventType(event.type)}</p>
                    <p className="text-muted-foreground text-xs">
                      {format(parseISO(event.timestamp), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No history yet</p>
            )}
          </div>
        </div>

        {/* Delete */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="w-full text-destructive hover:text-destructive gap-2">
              <Trash2 className="h-4 w-4" />
              Delete Subscription
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete subscription?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{subscription.name}" and all its history. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageContainer>
  );
}

function DetailRow({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-4">
      <Icon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground mb-0.5">{label}</p>
        <div className="text-foreground">{children}</div>
      </div>
    </div>
  );
}
