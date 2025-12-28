import { Subscription, EventLog, UsageCheck, AppSettings, DEFAULT_SETTINGS, EventType, PaymentMethod, SharedMember } from '@/types/subscription';
import { v4 as uuidv4 } from 'uuid';
import { parseISO, addDays, addMonths, addYears, isBefore, startOfDay } from 'date-fns';

const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'squeeze_subscriptions',
  EVENTS: 'squeeze_events',
  USAGE_CHECKS: 'squeeze_usage_checks',
  SETTINGS: 'squeeze_settings',
  PAYMENT_METHODS: 'squeeze_payment_methods',
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

// Payment Methods
export const getPaymentMethods = (): PaymentMethod[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
  return data ? JSON.parse(data) : [];
};

export const savePaymentMethod = (paymentMethod: Omit<PaymentMethod, 'id'>): PaymentMethod => {
  const methods = getPaymentMethods();
  const newMethod: PaymentMethod = {
    ...paymentMethod,
    id: uuidv4(),
  };
  methods.push(newMethod);
  localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(methods));
  return newMethod;
};

export const updatePaymentMethod = (id: string, updates: Partial<PaymentMethod>): PaymentMethod | null => {
  const methods = getPaymentMethods();
  const index = methods.findIndex(m => m.id === id);
  if (index === -1) return null;
  
  methods[index] = { ...methods[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(methods));
  return methods[index];
};

export const deletePaymentMethod = (id: string): boolean => {
  const methods = getPaymentMethods();
  const filtered = methods.filter(m => m.id !== id);
  if (filtered.length === methods.length) return false;
  localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(filtered));
  
  // Remove from subscriptions that use this payment method
  const subscriptions = getSubscriptions();
  const updated = subscriptions.map(s => 
    s.paymentMethodId === id ? { ...s, paymentMethodId: undefined } : s
  );
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(updated));
  
  return true;
};

export const getPaymentMethod = (id: string): PaymentMethod | null => {
  const methods = getPaymentMethods();
  return methods.find(m => m.id === id) || null;
};

// Auto-advance renewal dates
export const advanceRenewalDates = (): number => {
  const subscriptions = getSubscriptions();
  const today = startOfDay(new Date());
  let advancedCount = 0;
  
  for (const sub of subscriptions) {
    if (sub.status === 'cancelled' || sub.status === 'paused') continue;
    
    let renewalDate = parseISO(sub.nextRenewalDate);
    const originalDate = renewalDate;
    
    // Keep advancing until the renewal date is in the future
    while (isBefore(startOfDay(renewalDate), today)) {
      switch (sub.cadence) {
        case 'weekly':
          renewalDate = addDays(renewalDate, 7);
          break;
        case 'monthly':
          renewalDate = addMonths(renewalDate, 1);
          break;
        case 'yearly':
          renewalDate = addYears(renewalDate, 1);
          break;
        case 'custom':
          renewalDate = addDays(renewalDate, sub.customDays || 30);
          break;
      }
    }
    
    // Only update if the date actually changed
    if (renewalDate.getTime() !== originalDate.getTime()) {
      const updatedSubs = getSubscriptions();
      const index = updatedSubs.findIndex(s => s.id === sub.id);
      if (index !== -1) {
        updatedSubs[index] = {
          ...updatedSubs[index],
          nextRenewalDate: renewalDate.toISOString(),
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(updatedSubs));
        logEvent(sub.id, 'renewal_advanced', { from: originalDate.toISOString(), to: renewalDate.toISOString() });
        advancedCount++;
      }
    }
  }
  
  return advancedCount;
};

// Import from CSV
export const importFromCSV = (csvContent: string): { imported: number; skipped: number; errors: string[] } => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    return { imported: 0, skipped: 0, errors: ['CSV file is empty or has no data rows'] };
  }
  
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
  const errors: string[] = [];
  let imported = 0;
  let skipped = 0;
  
  const existingNames = getSubscriptions().map(s => s.name.toLowerCase());
  
  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx]?.replace(/"/g, '').trim() || '';
      });
      
      // Check for required fields
      if (!row.name) {
        errors.push(`Row ${i + 1}: Missing name`);
        skipped++;
        continue;
      }
      
      // Check for duplicates
      if (existingNames.includes(row.name.toLowerCase())) {
        skipped++;
        continue;
      }
      
      const amount = parseFloat(row.amount) || 0;
      const cadence = (['weekly', 'monthly', 'yearly', 'custom'].includes(row.cadence) ? row.cadence : 'monthly') as 'weekly' | 'monthly' | 'yearly' | 'custom';
      const category = (['streaming', 'utilities', 'software', 'fitness', 'other'].includes(row.category) ? row.category : 'other') as 'streaming' | 'utilities' | 'software' | 'fitness' | 'other';
      const status = (['active', 'trial', 'paused', 'cancelled'].includes(row.status) ? row.status : 'active') as 'active' | 'trial' | 'paused' | 'cancelled';
      
      saveSubscription({
        name: row.name,
        amount,
        currency: row.currency || 'CAD',
        cadence,
        customDays: row['custom days'] ? parseInt(row['custom days']) : undefined,
        nextRenewalDate: row['next renewal'] || new Date().toISOString(),
        category,
        status,
        reminderEnabled: row['reminder enabled']?.toLowerCase() === 'true',
        reminderDaysBefore: parseInt(row['reminder days']) || 3,
        notes: row.notes || '',
        cancelUrl: row['cancel url'] || '',
      });
      
      existingNames.push(row.name.toLowerCase());
      imported++;
    } catch (e) {
      errors.push(`Row ${i + 1}: Parse error`);
      skipped++;
    }
  }
  
  return { imported, skipped, errors };
};

// Helper to parse CSV lines with quoted values
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
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

export const getUserShare = (subscription: Subscription): number => {
  if (!subscription.sharedWith || subscription.sharedWith.length === 0) {
    return subscription.amount;
  }
  
  // Check if custom percentages are set
  const hasCustomPercentages = subscription.sharedWith.some(m => m.sharePercent !== undefined);
  
  if (hasCustomPercentages) {
    const othersPercent = subscription.sharedWith.reduce((sum, m) => sum + (m.sharePercent || 0), 0);
    const userPercent = Math.max(0, 100 - othersPercent);
    return subscription.amount * (userPercent / 100);
  }
  
  // Equal split (including user)
  const totalPeople = subscription.sharedWith.length + 1;
  return subscription.amount / totalPeople;
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
