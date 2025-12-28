import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { Subscription, SubscriptionStatus, SubscriptionCadence, SubscriptionCategory, CURRENCIES, CATEGORIES, CADENCES, STATUSES, SharedMember } from "@/types/subscription";
import { getSettings, saveSubscription, updateSubscription, getSubscriptions, getPaymentMethods } from "@/lib/storage";
import { SubscriptionTemplate } from "@/lib/subscriptionTemplates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SharedMembersInput } from "@/components/subscription/SharedMembersInput";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SubscriptionFormProps {
  subscription?: Subscription;
  template?: SubscriptionTemplate | null;
  onClose?: () => void;
}

export function SubscriptionForm({ subscription, template, onClose }: SubscriptionFormProps) {
  const navigate = useNavigate();
  const settings = getSettings();
  const paymentMethods = getPaymentMethods();
  const isEdit = !!subscription;

  const [name, setName] = useState(subscription?.name || template?.name || "");
  const [amount, setAmount] = useState(subscription?.amount?.toString() || template?.defaultAmount?.toString() || "");
  const [currency, setCurrency] = useState(subscription?.currency || template?.defaultCurrency || settings.defaultCurrency);
  const [cadence, setCadence] = useState<SubscriptionCadence>(subscription?.cadence || template?.cadence || "monthly");
  const [customDays, setCustomDays] = useState(subscription?.customDays?.toString() || "");
  const [nextRenewalDate, setNextRenewalDate] = useState<Date | undefined>(
    subscription?.nextRenewalDate ? new Date(subscription.nextRenewalDate) : undefined
  );
  const [category, setCategory] = useState<SubscriptionCategory>(subscription?.category || template?.category || "other");
  const [status, setStatus] = useState<SubscriptionStatus>(subscription?.status || "active");
  const [reminderEnabled, setReminderEnabled] = useState(subscription?.reminderEnabled ?? true);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(
    subscription?.reminderDaysBefore?.toString() || settings.defaultReminderDays.toString()
  );
  const [notes, setNotes] = useState(subscription?.notes || "");
  const [cancelUrl, setCancelUrl] = useState(subscription?.cancelUrl || template?.cancelUrl || "");
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [sharedWith, setSharedWith] = useState<SharedMember[]>(subscription?.sharedWith || []);
  const [paymentMethodId, setPaymentMethodId] = useState<string>(subscription?.paymentMethodId || "");

  useEffect(() => {
    if (name.trim()) {
      const existing = getSubscriptions();
      const duplicate = existing.find(
        s => s.name.toLowerCase() === name.trim().toLowerCase() && s.id !== subscription?.id
      );
      setDuplicateWarning(duplicate ? `A subscription named "${duplicate.name}" already exists` : null);
    } else {
      setDuplicateWarning(null);
    }
  }, [name, subscription?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Amount must be a positive number");
      return;
    }
    if (!nextRenewalDate) {
      toast.error("Next renewal date is required");
      return;
    }
    if (cadence === "custom" && (!customDays || parseInt(customDays) <= 0)) {
      toast.error("Custom days must be a positive number");
      return;
    }

    const subscriptionData = {
      name: name.trim(),
      amount: amountNum,
      currency,
      cadence,
      customDays: cadence === "custom" ? parseInt(customDays) : undefined,
      nextRenewalDate: nextRenewalDate.toISOString(),
      category,
      status,
      reminderEnabled,
      reminderDaysBefore: parseInt(reminderDaysBefore) || settings.defaultReminderDays,
      notes: notes.trim(),
      cancelUrl: cancelUrl.trim(),
      sharedWith: sharedWith.length > 0 ? sharedWith : undefined,
      paymentMethodId: paymentMethodId || undefined,
    };

    if (isEdit && subscription) {
      updateSubscription(subscription.id, subscriptionData);
      toast.success("Subscription updated");
      if (onClose) {
        onClose();
      } else {
        navigate(`/subscriptions/${subscription.id}`);
      }
    } else {
      const newSub = saveSubscription(subscriptionData);
      toast.success("Subscription added");
      navigate(`/subscriptions/${newSub.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          {isEdit ? "Edit Subscription" : template ? `Add ${template.name}` : "Add Subscription"}
        </h2>
        {onClose && (
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Netflix, Spotify, etc." />
          {duplicateWarning && <p className="text-xs text-warning">{duplicateWarning}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input id="amount" type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Cadence</Label>
          <Select value={cadence} onValueChange={(v) => setCadence(v as SubscriptionCadence)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CADENCES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        {cadence === "custom" && (
          <div className="space-y-2">
            <Label htmlFor="customDays">Every X days</Label>
            <Input id="customDays" type="number" min="1" value={customDays} onChange={(e) => setCustomDays(e.target.value)} placeholder="30" />
          </div>
        )}

        <div className="space-y-2">
          <Label>Next Renewal Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !nextRenewalDate && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {nextRenewalDate ? format(nextRenewalDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={nextRenewalDate} onSelect={setNextRenewalDate} initialFocus className="pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as SubscriptionCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as SubscriptionStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        {paymentMethods.length > 0 && (
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
              <SelectTrigger><SelectValue placeholder="Select payment method" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {paymentMethods.map((pm) => <SelectItem key={pm.id} value={pm.id}>{pm.name}{pm.lastFour && ` •••• ${pm.lastFour}`}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        <SharedMembersInput members={sharedWith} onChange={setSharedWith} totalAmount={parseFloat(amount) || 0} currency={currency} />

        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <Label htmlFor="reminder" className="cursor-pointer">Enable Reminder</Label>
            <Switch id="reminder" checked={reminderEnabled} onCheckedChange={setReminderEnabled} />
          </div>
          {reminderEnabled && (
            <div className="space-y-2">
              <Label htmlFor="reminderDays">Days before renewal</Label>
              <Select value={reminderDaysBefore} onValueChange={setReminderDaysBefore}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Same day</SelectItem>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional notes..." rows={3} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cancelUrl">Cancel URL</Label>
          <Input id="cancelUrl" type="url" value={cancelUrl} onChange={(e) => setCancelUrl(e.target.value)} placeholder="https://..." />
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg">
        {isEdit ? "Save Changes" : "Add Subscription"}
      </Button>
    </form>
  );
}
