import React, { createContext, useContext, ReactNode } from 'react';

// Feature definitions
export type Feature =
  | 'analytics_advanced'
  | 'chatbot_ai'
  | 'booking_calendar'
  | 'email_automation'
  | 'social_scheduling'
  | 'team_collaboration'
  | 'white_label'
  | 'api_access'
  | 'priority_support'
  | 'custom_integrations';

// Subscription tiers
export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'enterprise';

// Feature access mapping
const FEATURE_ACCESS: Record<Feature, SubscriptionTier[]> = {
  analytics_advanced: ['professional', 'enterprise'],
  chatbot_ai: ['professional', 'enterprise'],
  booking_calendar: ['starter', 'professional', 'enterprise'],
  email_automation: ['starter', 'professional', 'enterprise'],
  social_scheduling: ['professional', 'enterprise'],
  team_collaboration: ['professional', 'enterprise'],
  white_label: ['enterprise'],
  api_access: ['professional', 'enterprise'],
  priority_support: ['professional', 'enterprise'],
  custom_integrations: ['enterprise']
};

// Feature metadata
const FEATURE_METADATA: Record<Feature, { name: string; description: string; icon: string }> = {
  analytics_advanced: {
    name: 'Advanced Analytics',
    description: 'Deep insights with predictive analytics and custom reports',
    icon: '📊'
  },
  chatbot_ai: {
    name: 'AI Chatbot',
    description: '24/7 AI-powered customer support and lead qualification',
    icon: '🤖'
  },
  booking_calendar: {
    name: 'Calendar Booking',
    description: 'Integrated scheduling with Google Calendar and Outlook',
    icon: '📅'
  },
  email_automation: {
    name: 'Email Automation',
    description: 'Automated email sequences and drip campaigns',
    icon: '✉️'
  },
  social_scheduling: {
    name: 'Social Media Scheduler',
    description: 'Schedule and auto-post to all major platforms',
    icon: '📱'
  },
  team_collaboration: {
    name: 'Team Collaboration',
    description: 'Multi-user access with role-based permissions',
    icon: '👥'
  },
  white_label: {
    name: 'White Label',
    description: 'Custom branding and domain for your clients',
    icon: '🏷️'
  },
  api_access: {
    name: 'API Access',
    description: 'Full REST API access for custom integrations',
    icon: '🔌'
  },
  priority_support: {
    name: 'Priority Support',
    description: '24/7 dedicated support with 1-hour response time',
    icon: '🎯'
  },
  custom_integrations: {
    name: 'Custom Integrations',
    description: 'Build custom integrations with our engineering team',
    icon: '⚙️'
  }
};

// Context
interface FeatureGateContextType {
  tier: SubscriptionTier;
  hasFeature: (feature: Feature) => boolean;
  getFeatureMetadata: (feature: Feature) => typeof FEATURE_METADATA[Feature];
  upgradeTier: (newTier: SubscriptionTier) => void;
}

const FeatureGateContext = createContext<FeatureGateContextType | null>(null);

// Provider
interface FeatureGateProviderProps {
  children: ReactNode;
  initialTier?: SubscriptionTier;
}

export const FeatureGateProvider: React.FC<FeatureGateProviderProps> = ({
  children,
  initialTier = 'free'
}) => {
  const [tier, setTier] = React.useState<SubscriptionTier>(initialTier);

  const hasFeature = (feature: Feature): boolean => {
    return FEATURE_ACCESS[feature].includes(tier);
  };

  const getFeatureMetadata = (feature: Feature) => {
    return FEATURE_METADATA[feature];
  };

  const upgradeTier = (newTier: SubscriptionTier) => {
    setTier(newTier);
  };

  return (
    <FeatureGateContext.Provider value={{ tier, hasFeature, getFeatureMetadata, upgradeTier }}>
      {children}
    </FeatureGateContext.Provider>
  );
};

// Hook
export const useFeatureGate = () => {
  const context = useContext(FeatureGateContext);
  if (!context) {
    throw new Error('useFeatureGate must be used within FeatureGateProvider');
  }
  return context;
};

// Feature Gate Component
interface FeatureGateProps {
  feature: Feature;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback,
  showUpgrade = true
}) => {
  const { hasFeature, getFeatureMetadata, tier } = useFeatureGate();
  const metadata = getFeatureMetadata(feature);

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  const requiredTier = FEATURE_ACCESS[feature][0];

  return (
    <div className="panel-dark border-gold p-6 text-center">
      <div className="text-5xl mb-4">{metadata.icon}</div>
      <div className="badge-gold mb-3">PREMIUM FEATURE</div>
      <h3 className="text-2xl font-bold text-gold mb-2">{metadata.name}</h3>
      <p className="text-gold-300 mb-6">{metadata.description}</p>
      <div className="space-y-3">
        <p className="text-gold-100">
          Available on <span className="font-bold text-gold capitalize">{requiredTier}</span> plan and above
        </p>
        <p className="text-sm text-gold-300">
          Current plan: <span className="capitalize font-semibold">{tier}</span>
        </p>
        <button className="btn-gold w-full md:w-auto">
          Upgrade to {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}
        </button>
      </div>
    </div>
  );
};

// Feature Badge Component
interface FeatureBadgeProps {
  feature: Feature;
}

export const FeatureBadge: React.FC<FeatureBadgeProps> = ({ feature }) => {
  const { hasFeature } = useFeatureGate();
  const requiredTier = FEATURE_ACCESS[feature][0];

  if (hasFeature(feature)) {
    return null;
  }

  return (
    <span className="badge-gold text-xs ml-2">
      {requiredTier.toUpperCase()}
    </span>
  );
};

// Subscription Plans Component
export const SubscriptionPlans: React.FC = () => {
  const { tier, upgradeTier } = useFeatureGate();

  const plans = [
    {
      tier: 'free' as const,
      name: 'Free',
      price: 0,
      features: ['Basic analytics', 'Email support', '1 user', 'Up to 100 contacts']
    },
    {
      tier: 'starter' as const,
      name: 'Starter',
      price: 29,
      features: ['Calendar booking', 'Email automation', '3 users', 'Up to 1,000 contacts', 'Priority email support']
    },
    {
      tier: 'professional' as const,
      name: 'Professional',
      price: 99,
      popular: true,
      features: [
        'Everything in Starter',
        'Advanced analytics',
        'AI Chatbot',
        'Social scheduling',
        'API access',
        '10 users',
        'Up to 10,000 contacts',
        'Priority support'
      ]
    },
    {
      tier: 'enterprise' as const,
      name: 'Enterprise',
      price: 299,
      features: [
        'Everything in Professional',
        'White label',
        'Custom integrations',
        'Unlimited users',
        'Unlimited contacts',
        'Dedicated account manager',
        'Custom SLA'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gold mb-2">Choose Your Plan</h2>
        <p className="text-gold-300">Unlock features as you grow</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.tier}
            className={`panel-dark ${
              plan.popular ? 'border-gold scale-105' : 'border-gold-800'
            } relative`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="badge-gold">MOST POPULAR</span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gold mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold text-gold-shine mb-1">
                ${plan.price}
              </div>
              <p className="text-gold-300 text-sm">per month</p>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gold-100 text-sm">
                  <span className="text-gold-500 mt-0.5">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => upgradeTier(plan.tier)}
              className={`w-full ${
                tier === plan.tier
                  ? 'btn-gold-ghost cursor-default'
                  : plan.popular
                  ? 'btn-gold'
                  : 'btn-gold-ghost'
              }`}
              disabled={tier === plan.tier}
            >
              {tier === plan.tier ? 'Current Plan' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureGate;
