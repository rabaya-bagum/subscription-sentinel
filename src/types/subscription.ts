export type SubscriptionStatus = 'active' | 'trial' | 'paused' | 'cancelled';
export type SubscriptionCadence = 'weekly' | 'monthly' | 'yearly' | 'custom';
export type SubscriptionCategory = 'streaming' | 'utilities' | 'software' | 'fitness' | 'other';
export type PaymentMethodType = 'credit_card' | 'debit_card' | 'bank_account' | 'paypal' | 'other';

export interface SharedMember {
  id: string;
  name: string;
  sharePercent?: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentMethodType;
  lastFour?: string;
  color?: string;
}

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
  // New fields
  sharedWith?: SharedMember[];
  paymentMethodId?: string;
}

export type EventType = 'created' | 'edited' | 'status_change' | 'price_change' | 'reminder_sent' | 'renewal_advanced';

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
  monthlyBudgetLimit?: number;
  budgetAlertThreshold: number; // Percentage (e.g., 80 = warn at 80%)
  trialExpirationDays: number; // Warn when trial ends within X days
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultCurrency: 'CAD',
  defaultReminderDays: 3,
  includeTrialsInTotal: true,
  monthlyBudgetLimit: undefined,
  budgetAlertThreshold: 80,
  trialExpirationDays: 7,
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

export const PAYMENT_METHOD_TYPES: { value: PaymentMethodType; label: string }[] = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'bank_account', label: 'Bank Account' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'other', label: 'Other' },
];
