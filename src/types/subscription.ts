export type SubscriptionStatus = 'active' | 'trial' | 'paused' | 'cancelled';
export type SubscriptionCadence = 'weekly' | 'monthly' | 'yearly' | 'custom';
export type SubscriptionCategory = 'streaming' | 'utilities' | 'software' | 'fitness' | 'other';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  cadence: SubscriptionCadence;
  customDays?: number;
  nextRenewalDate: string;
  category: SubscriptionCategory;
  status: SubscriptionStatus;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  notes: string;
  cancelUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type EventType = 'created' | 'edited' | 'status_change' | 'price_change' | 'reminder_sent';

export interface EventLog {
  id: string;
  subscriptionId: string;
  type: EventType;
  payloadJson: string;
  timestamp: string;
}

export interface UsageCheck {
  id: string;
  subscriptionId: string;
  month: string;
  used: 'yes' | 'no' | 'skip';
  timestamp: string;
}

export interface AppSettings {
  defaultCurrency: string;
  defaultReminderDays: number;
  includeTrialsInTotal: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultCurrency: 'CAD',
  defaultReminderDays: 3,
  includeTrialsInTotal: true,
};

export const CURRENCIES = ['CAD', 'USD', 'EUR', 'GBP', 'AUD', 'JPY', 'INR'];

export const CATEGORIES: { value: SubscriptionCategory; label: string }[] = [
  { value: 'streaming', label: 'Streaming' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'software', label: 'Software' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'other', label: 'Other' },
];

export const CADENCES: { value: SubscriptionCadence; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
];

export const STATUSES: { value: SubscriptionStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'trial', label: 'Trial' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
];
