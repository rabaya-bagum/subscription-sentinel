import { v4 as uuidv4 } from 'uuid';
import { subMonths, subYears, addDays, format, subDays } from 'date-fns';
import { Subscription, EventLog, UsageCheck, SubscriptionStatus, SubscriptionCadence, SubscriptionCategory } from '@/types/subscription';

const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'squeeze_subscriptions',
  EVENTS: 'squeeze_events',
  USAGE_CHECKS: 'squeeze_usage_checks',
};

interface SeedSubscription {
  name: string;
  amount: number;
  cadence: SubscriptionCadence;
  category: SubscriptionCategory;
  status: SubscriptionStatus;
  createdMonthsAgo: number;
  cancelUrl?: string;
  notes?: string;
  usagePattern: 'always' | 'sometimes' | 'rarely' | 'never';
}

const SEED_SUBSCRIPTIONS: SeedSubscription[] = [
  // Streaming - Active
  { name: 'Netflix', amount: 22.99, cadence: 'monthly', category: 'streaming', status: 'active', createdMonthsAgo: 24, cancelUrl: 'https://netflix.com/cancel', usagePattern: 'always' },
  { name: 'Spotify Premium', amount: 11.99, cadence: 'monthly', category: 'streaming', status: 'active', createdMonthsAgo: 30, cancelUrl: 'https://spotify.com/account', usagePattern: 'always' },
  { name: 'Disney+', amount: 13.99, cadence: 'monthly', category: 'streaming', status: 'active', createdMonthsAgo: 18, usagePattern: 'sometimes' },
  { name: 'YouTube Premium', amount: 13.99, cadence: 'monthly', category: 'streaming', status: 'active', createdMonthsAgo: 12, usagePattern: 'always' },
  { name: 'HBO Max', amount: 19.99, cadence: 'monthly', category: 'streaming', status: 'cancelled', createdMonthsAgo: 20, usagePattern: 'rarely' },
  { name: 'Apple TV+', amount: 8.99, cadence: 'monthly', category: 'streaming', status: 'trial', createdMonthsAgo: 0, usagePattern: 'sometimes' },
  
  // Software - Active
  { name: 'Adobe Creative Cloud', amount: 79.99, cadence: 'monthly', category: 'software', status: 'active', createdMonthsAgo: 24, notes: 'Work expense - get reimbursed', usagePattern: 'always' },
  { name: 'Microsoft 365', amount: 129.99, cadence: 'yearly', category: 'software', status: 'active', createdMonthsAgo: 36, usagePattern: 'always' },
  { name: 'Notion', amount: 10.00, cadence: 'monthly', category: 'software', status: 'active', createdMonthsAgo: 8, usagePattern: 'always' },
  { name: '1Password', amount: 35.88, cadence: 'yearly', category: 'software', status: 'active', createdMonthsAgo: 24, cancelUrl: 'https://1password.com/account', usagePattern: 'always' },
  { name: 'Canva Pro', amount: 14.99, cadence: 'monthly', category: 'software', status: 'paused', createdMonthsAgo: 15, notes: 'Paused - not doing design work currently', usagePattern: 'never' },
  { name: 'Grammarly', amount: 144.00, cadence: 'yearly', category: 'software', status: 'active', createdMonthsAgo: 14, usagePattern: 'sometimes' },
  
  // Utilities
  { name: 'iCloud Storage', amount: 3.99, cadence: 'monthly', category: 'utilities', status: 'active', createdMonthsAgo: 48, usagePattern: 'always' },
  { name: 'Google One', amount: 39.99, cadence: 'yearly', category: 'utilities', status: 'active', createdMonthsAgo: 24, usagePattern: 'always' },
  { name: 'Dropbox Plus', amount: 15.99, cadence: 'monthly', category: 'utilities', status: 'cancelled', createdMonthsAgo: 30, notes: 'Switched to Google One', usagePattern: 'never' },
  { name: 'NordVPN', amount: 99.00, cadence: 'yearly', category: 'utilities', status: 'active', createdMonthsAgo: 10, usagePattern: 'sometimes' },
  
  // Fitness
  { name: 'Gym Membership', amount: 49.99, cadence: 'monthly', category: 'fitness', status: 'active', createdMonthsAgo: 18, cancelUrl: 'https://mygym.com/membership', usagePattern: 'sometimes' },
  { name: 'Strava Premium', amount: 79.99, cadence: 'yearly', category: 'fitness', status: 'active', createdMonthsAgo: 12, usagePattern: 'rarely' },
  { name: 'Headspace', amount: 69.99, cadence: 'yearly', category: 'fitness', status: 'active', createdMonthsAgo: 6, notes: 'Mental wellness', usagePattern: 'rarely' },
  { name: 'Peloton App', amount: 16.99, cadence: 'monthly', category: 'fitness', status: 'cancelled', createdMonthsAgo: 14, usagePattern: 'never' },
  
  // Other
  { name: 'Amazon Prime', amount: 139.00, cadence: 'yearly', category: 'other', status: 'active', createdMonthsAgo: 36, usagePattern: 'always' },
  { name: 'Costco Membership', amount: 65.00, cadence: 'yearly', category: 'other', status: 'active', createdMonthsAgo: 24, usagePattern: 'always' },
  { name: 'Medium', amount: 5.00, cadence: 'monthly', category: 'other', status: 'active', createdMonthsAgo: 4, usagePattern: 'rarely' },
  { name: 'The Athletic', amount: 9.99, cadence: 'monthly', category: 'other', status: 'trial', createdMonthsAgo: 0, usagePattern: 'sometimes' },
];

function getNextRenewalDate(cadence: SubscriptionCadence, customDays?: number): string {
  const now = new Date();
  const daysToAdd = Math.floor(Math.random() * 28) + 1; // Random day in next month
  
  switch (cadence) {
    case 'weekly':
      return format(addDays(now, Math.floor(Math.random() * 7) + 1), 'yyyy-MM-dd');
    case 'monthly':
      return format(addDays(now, daysToAdd), 'yyyy-MM-dd');
    case 'yearly':
      return format(addDays(now, Math.floor(Math.random() * 90) + 30), 'yyyy-MM-dd');
    case 'custom':
      return format(addDays(now, customDays || 14), 'yyyy-MM-dd');
    default:
      return format(addDays(now, daysToAdd), 'yyyy-MM-dd');
  }
}

function generateUsageChecks(subscriptionId: string, createdMonthsAgo: number, pattern: SeedSubscription['usagePattern']): UsageCheck[] {
  const checks: UsageCheck[] = [];
  const now = new Date();
  const monthsToGenerate = Math.min(createdMonthsAgo, 12); // Last 12 months max
  
  for (let i = 1; i <= monthsToGenerate; i++) {
    const monthDate = subMonths(now, i);
    const month = format(monthDate, 'yyyy-MM');
    
    let used: 'yes' | 'no' | 'skip';
    const rand = Math.random();
    
    switch (pattern) {
      case 'always':
        used = rand < 0.9 ? 'yes' : 'skip';
        break;
      case 'sometimes':
        used = rand < 0.6 ? 'yes' : rand < 0.8 ? 'no' : 'skip';
        break;
      case 'rarely':
        used = rand < 0.2 ? 'yes' : rand < 0.7 ? 'no' : 'skip';
        break;
      case 'never':
        used = rand < 0.1 ? 'skip' : 'no';
        break;
      default:
        used = 'skip';
    }
    
    checks.push({
      id: uuidv4(),
      subscriptionId,
      month,
      used,
      timestamp: format(subDays(monthDate, Math.floor(Math.random() * 5)), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
    });
  }
  
  return checks;
}

function generateEvents(subscription: Subscription, createdAt: Date): EventLog[] {
  const events: EventLog[] = [];
  
  // Created event
  events.push({
    id: uuidv4(),
    subscriptionId: subscription.id,
    type: 'created',
    payloadJson: JSON.stringify({ subscription }),
    timestamp: format(createdAt, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
  });
  
  // Random price change for some subscriptions
  if (Math.random() < 0.3) {
    const priceChangeDate = subMonths(new Date(), Math.floor(Math.random() * 6) + 1);
    const oldAmount = subscription.amount * (0.8 + Math.random() * 0.15);
    events.push({
      id: uuidv4(),
      subscriptionId: subscription.id,
      type: 'price_change',
      payloadJson: JSON.stringify({ from: Math.round(oldAmount * 100) / 100, to: subscription.amount }),
      timestamp: format(priceChangeDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
    });
  }
  
  // Status change for cancelled/paused
  if (subscription.status === 'cancelled' || subscription.status === 'paused') {
    const statusChangeDate = subMonths(new Date(), Math.floor(Math.random() * 3) + 1);
    events.push({
      id: uuidv4(),
      subscriptionId: subscription.id,
      type: 'status_change',
      payloadJson: JSON.stringify({ from: 'active', to: subscription.status }),
      timestamp: format(statusChangeDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
    });
  }
  
  return events;
}

export function seedDemoData(): { subscriptions: number; events: number; usageChecks: number } {
  const subscriptions: Subscription[] = [];
  const allEvents: EventLog[] = [];
  const allUsageChecks: UsageCheck[] = [];
  
  for (const seed of SEED_SUBSCRIPTIONS) {
    const now = new Date();
    const createdAt = subMonths(now, seed.createdMonthsAgo);
    const id = uuidv4();
    
    const subscription: Subscription = {
      id,
      name: seed.name,
      amount: seed.amount,
      currency: 'CAD',
      cadence: seed.cadence,
      nextRenewalDate: getNextRenewalDate(seed.cadence),
      category: seed.category,
      status: seed.status,
      reminderEnabled: Math.random() > 0.3,
      reminderDaysBefore: [1, 3, 7][Math.floor(Math.random() * 3)],
      notes: seed.notes || '',
      cancelUrl: seed.cancelUrl || '',
      createdAt: format(createdAt, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
      updatedAt: format(subDays(now, Math.floor(Math.random() * 30)), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
    };
    
    subscriptions.push(subscription);
    
    // Generate events
    const events = generateEvents(subscription, createdAt);
    allEvents.push(...events);
    
    // Generate usage checks for active/trial subscriptions
    if (seed.status === 'active' || seed.status === 'trial') {
      const usageChecks = generateUsageChecks(id, seed.createdMonthsAgo, seed.usagePattern);
      allUsageChecks.push(...usageChecks);
    }
  }
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(allEvents));
  localStorage.setItem(STORAGE_KEYS.USAGE_CHECKS, JSON.stringify(allUsageChecks));
  
  return {
    subscriptions: subscriptions.length,
    events: allEvents.length,
    usageChecks: allUsageChecks.length,
  };
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
  localStorage.removeItem(STORAGE_KEYS.EVENTS);
  localStorage.removeItem(STORAGE_KEYS.USAGE_CHECKS);
}
