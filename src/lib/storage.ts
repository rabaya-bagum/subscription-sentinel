import { Subscription, EventLog, UsageCheck, AppSettings, DEFAULT_SETTINGS, EventType } from '@/types/subscription';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'squeeze_subscriptions',
  EVENTS: 'squeeze_events',
  USAGE_CHECKS: 'squeeze_usage_checks',
  SETTINGS: 'squeeze_settings',
};

// Subscriptions
export const getSubscriptions = (): Subscription[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
  return data ? JSON.parse(data) : [];
};

export const saveSubscription = (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Subscription => {
  const subscriptions = getSubscriptions();
  const now = new Date().toISOString();
  const newSubscription: Subscription = {
    ...subscription,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  subscriptions.push(newSubscription);
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
  
  // Log event
  logEvent(newSubscription.id, 'created', { subscription: newSubscription });
  
  return newSubscription;
};

export const updateSubscription = (id: string, updates: Partial<Subscription>): Subscription | null => {
  const subscriptions = getSubscriptions();
  const index = subscriptions.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  const oldSubscription = subscriptions[index];
  const updatedSubscription: Subscription = {
    ...oldSubscription,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  subscriptions[index] = updatedSubscription;
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
  
  // Log appropriate event
  if (updates.status && updates.status !== oldSubscription.status) {
    logEvent(id, 'status_change', { from: oldSubscription.status, to: updates.status });
  }
  if (updates.amount && updates.amount !== oldSubscription.amount) {
    logEvent(id, 'price_change', { from: oldSubscription.amount, to: updates.amount });
  }
  if (!updates.status && !updates.amount) {
    logEvent(id, 'edited', { changes: updates });
  }
  
  return updatedSubscription;
};

export const deleteSubscription = (id: string): boolean => {
  const subscriptions = getSubscriptions();
  const filtered = subscriptions.filter(s => s.id !== id);
  if (filtered.length === subscriptions.length) return false;
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(filtered));
  return true;
};

export const getSubscription = (id: string): Subscription | null => {
  const subscriptions = getSubscriptions();
  return subscriptions.find(s => s.id === id) || null;
};

// Events
export const getEvents = (subscriptionId?: string): EventLog[] => {
  const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
  const events: EventLog[] = data ? JSON.parse(data) : [];
  if (subscriptionId) {
    return events.filter(e => e.subscriptionId === subscriptionId);
  }
  return events;
};

export const logEvent = (subscriptionId: string, type: EventType, payload: object): EventLog => {
  const events = getEvents();
  const newEvent: EventLog = {
    id: uuidv4(),
    subscriptionId,
    type,
    payloadJson: JSON.stringify(payload),
    timestamp: new Date().toISOString(),
  };
  events.push(newEvent);
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  return newEvent;
};

// Usage Checks
export const getUsageChecks = (subscriptionId?: string): UsageCheck[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USAGE_CHECKS);
  const checks: UsageCheck[] = data ? JSON.parse(data) : [];
  if (subscriptionId) {
    return checks.filter(c => c.subscriptionId === subscriptionId);
  }
  return checks;
};

export const saveUsageCheck = (subscriptionId: string, month: string, used: 'yes' | 'no' | 'skip'): UsageCheck => {
  const checks = getUsageChecks();
  // Remove existing check for same subscription and month
  const filtered = checks.filter(c => !(c.subscriptionId === subscriptionId && c.month === month));
  const newCheck: UsageCheck = {
    id: uuidv4(),
    subscriptionId,
    month,
    used,
    timestamp: new Date().toISOString(),
  };
  filtered.push(newCheck);
  localStorage.setItem(STORAGE_KEYS.USAGE_CHECKS, JSON.stringify(filtered));
  return newCheck;
};

// Settings
export const getSettings = (): AppSettings => {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
};

export const saveSettings = (settings: Partial<AppSettings>): AppSettings => {
  const current = getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  return updated;
};

// Utility functions
export const getMonthlyEquivalent = (subscription: Subscription): number => {
  const { amount, cadence, customDays } = subscription;
  switch (cadence) {
    case 'weekly':
      return amount * (52 / 12);
    case 'yearly':
      return amount / 12;
    case 'custom':
      if (customDays) {
        return amount * (365 / customDays / 12);
      }
      return amount;
    case 'monthly':
    default:
      return amount;
  }
};

export const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const exportToCSV = (): string => {
  const subscriptions = getSubscriptions();
  const headers = [
    'Name', 'Amount', 'Currency', 'Cadence', 'Custom Days', 'Next Renewal', 
    'Category', 'Status', 'Reminder Enabled', 'Reminder Days', 'Notes', 'Cancel URL',
    'Created At', 'Updated At'
  ];
  
  const rows = subscriptions.map(s => [
    s.name,
    s.amount.toString(),
    s.currency,
    s.cadence,
    s.customDays?.toString() || '',
    s.nextRenewalDate,
    s.category,
    s.status,
    s.reminderEnabled.toString(),
    s.reminderDaysBefore.toString(),
    s.notes,
    s.cancelUrl,
    s.createdAt,
    s.updatedAt,
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  
  return csvContent;
};
