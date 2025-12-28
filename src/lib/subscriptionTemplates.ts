import { SubscriptionCategory, SubscriptionCadence } from '@/types/subscription';

export interface SubscriptionTemplate {
  id: string;
  name: string;
  icon: string;
  defaultAmount: number;
  defaultCurrency: string;
  cadence: SubscriptionCadence;
  category: SubscriptionCategory;
  cancelUrl: string;
}

export const SUBSCRIPTION_TEMPLATES: SubscriptionTemplate[] = [
  // Streaming
  {
    id: 'netflix',
    name: 'Netflix',
    icon: '🎬',
    defaultAmount: 16.49,
    defaultCurrency: 'CAD',
    cadence: 'monthly',
    category: 'streaming',
    cancelUrl: 'https://www.netflix.com/cancelplan',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: '🎵',
    defaultAmount: 10.99,
    defaultCurrency: 'CAD',
    cadence: 'monthly',
    category: 'streaming',
    cancelUrl: 'https://www.spotify.com/account/subscription/',
  },
  {
    id: 'disney-plus',
    name: 'Disney+',
    icon: '🏰',
    defaultAmount: 11.99,
    defaultCurrency: 'CAD',
    cadence: 'monthly',
    category: 'streaming',
    cancelUrl: 'https://www.disneyplus.com/account/subscription',
  },
  {
    id: 'youtube-premium',
    name: 'YouTube Premium',
    icon: '📺',
    defaultAmount: 13.99,
    defaultCurrency: 'CAD',
    cadence: 'monthly',
    category: 'streaming',
    cancelUrl: 'https://www.youtube.com/paid_memberships',
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    icon: '🍎',
    defaultAmount: 10.99,
    defaultCurrency: 'CAD',
    cadence: 'monthly',
    category: 'streaming',
    cancelUrl: 'https://support.apple.com/en-us/HT202039',
  },
  {
    id: 'hbo-max',
    name: 'HBO Max',
    icon: '🎭',
    defaultAmount: 15.99,
    defaultCurrency: 'USD',
    cadence: 'monthly',
    category: 'streaming',
    cancelUrl: 'https://www.max.com/account/subscription',
  },
  {
    id: 'hulu',
    name: 'Hulu',
    icon: '📗',
    defaultAmount: 7.99,
    defaultCurrency: 'USD',
    cadence: 'monthly',
    category: 'streaming',
    cancelUrl: 'https://secure.hulu.com/account',
  },
  {
    id: 'amazon-prime-video',
    name: 'Amazon Prime Video',
    icon: '📦',
    defaultAmount: 8.99,
    defaultCurrency: 'CAD',
    cadence: 'monthly',
    category: 'streaming',
    cancelUrl: 'https://www.amazon.com/gp/video/settings',
  },
  {
    id: 'apple-tv-plus',
    name: 'Apple TV+',
    icon: '📱',
    defaultAmount: 8.99,
    defaultCurrency: 'CAD',
    cadence: 'monthly',
    category: 'streaming',
    cancelUrl: 'https://support.apple.com/en-us/HT202039',
  },
  {
    id: 'paramount-plus',
    name: 'Paramount+',
    icon: '⭐',
    defaultAmount: 5.99,
    defaultCurrency: 'USD',
    cadence: 'monthly',
    category: 'streaming',
    cancelUrl: 'https://www.paramountplus.com/account/',
  },
  
  // Software
  {
    id: 'adobe-creative-cloud',
    name: 'Adobe Creative Cloud',
    icon: '🎨',
    defaultAmount: 54.99,
    defaultCurrency: 'USD',
    cadence: 'monthly',
    category: 'software',
    cancelUrl: 'https://account.adobe.com/plans',
  },
  {
    id: 'microsoft-365',
    name: 'Microsoft 365',
    icon: '📊',
    defaultAmount: 99.99,
    defaultCurrency: 'CAD',
    cadence: 'yearly',
    category: 'software',
    cancelUrl: 'https://account.microsoft.com/services',
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: '📝',
    defaultAmount: 10.00,
    defaultCurrency: 'USD',
    cadence: 'monthly',
    category: 'software',
    cancelUrl: 'https://www.notion.so/my-account',
  },
  {
    id: '1password',
    name: '1Password',
    icon: '🔐',
    defaultAmount: 2.99,
    defaultCurrency: 'USD',
    cadence: 'monthly',
    category: 'software',
    cancelUrl: 'https://my.1password.com/settings/billing',
  },
  {
    id: 'chatgpt-plus',
    name: 'ChatGPT Plus',
    icon: '🤖',
    defaultAmount: 20.00,
    defaultCurrency: 'USD',
    cadence: 'monthly',
    category: 'software',
    cancelUrl: 'https://chat.openai.com/settings/subscription',
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    icon: '👨‍💻',
    defaultAmount: 10.00,
    defaultCurrency: 'USD',
    cadence: 'monthly',
    category: 'software',
    cancelUrl: 'https://github.com/settings/copilot',
  },
  {
    id: 'figma',
    name: 'Figma',
    icon: '🎯',
    defaultAmount: 12.00,
    defaultCurrency: 'USD',
    cadence: 'monthly',
    category: 'software',
    cancelUrl: 'https://www.figma.com/settings',
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: '💬',
    defaultAmount: 8.75,
    defaultCurrency: 'USD',
    cadence: 'monthly',
    category: 'software',
    cancelUrl: 'https://slack.com/help/articles/203950728-Downgrade-your-workspace-to-the-free-version',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    icon: '📹',
    defaultAmount: 15.99,
    defaultCurrency: 'USD',
    cadence: 'monthly',
    category: 'software',
    cancelUrl: 'https://zoom.us/account',
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    icon: '📁',
    defaultAmount: 11.99,
    defaultCurrency: 'USD',
    cadence: 'monthly',
    category: 'software',
    cancelUrl: 'https://www.dropbox.com/account/plan',
  },
  
  // Utilities
  {
    id: 'icloud',
    name: 'iCloud+',
    icon: '☁️',
    defaultAmount: 3.99,
    defaultCurrency: 'CAD',
    cadence: 'monthly',
    category: 'utilities',
    cancelUrl: 'https://support.apple.com/en-us/HT207594',
  },
  {
    id: 'google-one',
    name: 'Google One',
    icon: '🔵',
    defaultAmount: 2.99,
    defaultCurrency: 'CAD',
    cadence: 'monthly',
    category: 'utilities',
    cancelUrl: 'https://one.google.com/settings',
  },
  {
    id: 'nordvpn',
    name: 'NordVPN',
    icon: '🛡️',
    defaultAmount: 12.99,
    defaultCurrency: 'USD',
    cadence: 'monthly',
    category: 'utilities',
    cancelUrl: 'https://my.nordaccount.com/dashboard/nordvpn/',
  },
  {
    id: 'expressvpn',
    name: 'ExpressVPN',
    icon: '🔒',
    defaultAmount: 12.95,
    defaultCurrency: 'USD',
    cadence: 'monthly',
    category: 'utilities',
    cancelUrl: 'https://www.expressvpn.com/subscriptions',
  },
  
  // Fitness
  {
    id: 'strava',
    name: 'Strava',
    icon: '🏃',
    defaultAmount: 11.99,
    defaultCurrency: 'USD',
    cadence: 'monthly',
    category: 'fitness',
    cancelUrl: 'https://www.strava.com/settings/subscription',
  },
  {
    id: 'headspace',
    name: 'Headspace',
    icon: '🧘',
    defaultAmount: 12.99,
    defaultCurrency: 'USD',
    cadence: 'monthly',
    category: 'fitness',
    cancelUrl: 'https://www.headspace.com/settings/subscription',
  },
  {
    id: 'peloton',
    name: 'Peloton',
    icon: '🚴',
    defaultAmount: 44.00,
    defaultCurrency: 'USD',
    cadence: 'monthly',
    category: 'fitness',
    cancelUrl: 'https://members.onepeloton.com/settings/subscriptions',
  },
  {
    id: 'calm',
    name: 'Calm',
    icon: '🌙',
    defaultAmount: 69.99,
    defaultCurrency: 'USD',
    cadence: 'yearly',
    category: 'fitness',
    cancelUrl: 'https://www.calm.com/account',
  },
];

export const getTemplatesByCategory = () => {
  const categories: Record<string, SubscriptionTemplate[]> = {
    streaming: [],
    software: [],
    utilities: [],
    fitness: [],
  };
  
  SUBSCRIPTION_TEMPLATES.forEach(template => {
    if (categories[template.category]) {
      categories[template.category].push(template);
    }
  });
  
  return categories;
};
