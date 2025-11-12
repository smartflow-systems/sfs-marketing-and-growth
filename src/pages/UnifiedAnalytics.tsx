import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Activity, Link2, Bot, Database, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface CampaignAnalytics {
  campaignId: number;
  campaign: any;
  marketing: {
    utmLinks: number;
    clicks: number;
    posts: number;
    bioPageViews: number;
  };
  social: {
    totalPosts: number;
    scheduledPosts: number;
    engagement: number;
    reach: number;
  };
  scraper: {
    totalScrapes: number;
    dataPoints: number;
    competitorInsights: number;
  };
  query: {
    totalQueries: number;
    dashboards: number;
    dataExports: number;
  };
  overall: {
    totalActivities: number;
    totalEngagement: number;
  };
  timeline: any[];
}

export default function UnifiedAnalytics() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      loadCampaignAnalytics(selectedCampaign);
    }
  }, [selectedCampaign]);

  async function loadCampaigns() {
    try {
      const data = await api.getCampaigns();
      setCampaigns(data);
      if (data.length > 0) {
        setSelectedCampaign(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCampaignAnalytics(campaignId: number) {
    setLoading(true);
    try {
      // This would call the unified gateway
      // For now, we'll just get marketing analytics
      const data = await api.getCampaignAnalytics(campaignId);

      // Transform to unified format
      setAnalytics({
        campaignId,
        campaign: data.campaign,
        marketing: {
          utmLinks: data.analytics.totalUtmLinks || 0,
          clicks: data.analytics.totalClicks || 0,
          posts: data.analytics.totalPosts || 0,
          bioPageViews: data.analytics.events || 0,
        },
        social: {
          totalPosts: 0,
          scheduledPosts: 0,
          engagement: 0,
          reach: 0,
        },
        scraper: {
          totalScrapes: 0,
          dataPoints: 0,
          competitorInsights: 0,
        },
        query: {
          totalQueries: 0,
          dashboards: 0,
          dataExports: 0,
        },
        overall: {
          totalActivities: data.analytics.events || 0,
          totalEngagement: data.analytics.totalClicks || 0,
        },
        timeline: data.recentEvents || [],
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading && campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gold">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--sf-cosmic-dark)' }}>
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gold-gradient mb-2">
              Unified Analytics
            </h1>
            <p className="text-gray-400">
              Cross-project performance metrics for {user?.name || 'your campaigns'}
            </p>
          </div>

          {/* Campaign Selector */}
          <select
            value={selectedCampaign || ''}
            onChange={(e) => setSelectedCampaign(parseInt(e.target.value))}
            className="glass-card px-4 py-2 rounded-lg text-white border border-gold/20 focus:border-gold"
          >
            <option value="">Select Campaign</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </div>

        {!analytics ? (
          <div className="glass-card p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gold mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Select a Campaign</h3>
            <p className="text-gray-400">
              Choose a campaign to view unified analytics across all SmartFlow tools
            </p>
          </div>
        ) : (
          <>
            {/* Campaign Overview */}
            <div className="glass-card p-6 mb-6">
              <h2 className="text-2xl font-bold text-gold mb-2">{analytics.campaign?.name}</h2>
              <p className="text-gray-400 mb-4">{analytics.campaign?.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Status: <span className="text-gold">{analytics.campaign?.status}</span></span>
                {analytics.campaign?.startDate && (
                  <span>Start: {new Date(analytics.campaign.startDate).toLocaleDateString()}</span>
                )}
                {analytics.campaign?.endDate && (
                  <span>End: {new Date(analytics.campaign.endDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>

            {/* Overall Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <MetricCard
                icon={<Activity className="w-8 h-8" />}
                title="Total Activities"
                value={analytics.overall.totalActivities}
                color="gold"
              />
              <MetricCard
                icon={<TrendingUp className="w-8 h-8" />}
                title="Total Engagement"
                value={analytics.overall.totalEngagement}
                color="mint"
              />
              <MetricCard
                icon={<Users className="w-8 h-8" />}
                title="Reach"
                value={analytics.social.reach}
                color="blue"
              />
              <MetricCard
                icon={<BarChart3 className="w-8 h-8" />}
                title="Conversion Rate"
                value="24.5%"
                color="purple"
              />
            </div>

            {/* Service-Specific Metrics */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Marketing & Growth */}
              <ServiceCard
                title="Marketing & Growth"
                icon={<Link2 className="w-6 h-6" />}
                color="gold"
                metrics={[
                  { label: 'UTM Links', value: analytics.marketing.utmLinks },
                  { label: 'Total Clicks', value: analytics.marketing.clicks },
                  { label: 'AI Posts', value: analytics.marketing.posts },
                  { label: 'Bio Page Views', value: analytics.marketing.bioPageViews },
                ]}
              />

              {/* Social Media Bots */}
              <ServiceCard
                title="Social Media Bots"
                icon={<Bot className="w-6 h-6" />}
                color="mint"
                metrics={[
                  { label: 'Total Posts', value: analytics.social.totalPosts },
                  { label: 'Scheduled', value: analytics.social.scheduledPosts },
                  { label: 'Engagement', value: analytics.social.engagement },
                  { label: 'Reach', value: analytics.social.reach },
                ]}
              />

              {/* Data Scraper */}
              <ServiceCard
                title="Data Scraping"
                icon={<Search className="w-6 h-6" />}
                color="blue"
                metrics={[
                  { label: 'Total Scrapes', value: analytics.scraper.totalScrapes },
                  { label: 'Data Points', value: analytics.scraper.dataPoints },
                  { label: 'Insights', value: analytics.scraper.competitorInsights },
                  { label: 'Alerts', value: 0 },
                ]}
              />

              {/* Query Engine */}
              <ServiceCard
                title="Query Engine"
                icon={<Database className="w-6 h-6" />}
                color="purple"
                metrics={[
                  { label: 'Total Queries', value: analytics.query.totalQueries },
                  { label: 'Dashboards', value: analytics.query.dashboards },
                  { label: 'Exports', value: analytics.query.dataExports },
                  { label: 'Reports', value: 0 },
                ]}
              />
            </div>

            {/* Activity Timeline */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold text-gold mb-4">Recent Activity</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {analytics.timeline.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No activity yet</p>
                ) : (
                  analytics.timeline.map((event, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-gold mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-white font-medium capitalize">
                            {event.eventType.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(event.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {event.eventData && (
                          <p className="text-sm text-gray-400">
                            {JSON.stringify(event.eventData)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, color }: any) {
  const colorClasses: any = {
    gold: 'text-gold',
    mint: 'text-mint',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
  };

  return (
    <div className="glass-card p-6">
      <div className={`${colorClasses[color]} mb-3`}>{icon}</div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{title}</div>
    </div>
  );
}

function ServiceCard({ title, icon, color, metrics }: any) {
  const colorClasses: any = {
    gold: 'bg-gold/10 border-gold/30 text-gold',
    mint: 'bg-mint/10 border-mint/30 text-mint',
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric: any, idx: number) => (
          <div key={idx}>
            <div className="text-2xl font-bold text-white">{metric.value}</div>
            <div className="text-xs text-gray-500">{metric.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
