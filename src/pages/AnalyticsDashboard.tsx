/**
 * 🔥 Analytics Dashboard - Production Ready
 *
 * Beautiful data visualization with SFS Family Theme
 * Real-time metrics, charts, and insights
 */

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Heart,
  Eye,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Zap,
  Target,
  Share2,
  MousePointerClick
} from 'lucide-react';
import {
  SFSCard,
  SFSButton,
  SFSBadge,
  ScoreCircle,
  SFSProgressBar,
  SFSSelect,
  StatCard,
  LoadingSpinner
} from '../components/SFSComponents';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Simulated data - replace with real API calls
  const [metrics, setMetrics] = useState({
    totalPosts: 247,
    totalEngagement: 12500,
    avgEngagementRate: 8.5,
    totalReach: 45600,
    totalClicks: 3200,
    followers: 8750,
    postsChange: 23,
    engagementChange: 15,
    reachChange: -5,
    clicksChange: 42
  });

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  // Chart configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#F5F5DC',
          font: {
            family: 'Inter, sans-serif',
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#FFD700',
        bodyColor: '#F5F5DC',
        borderColor: '#FFD700',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 215, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#F5F5DC'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 215, 0, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#F5F5DC'
        }
      }
    }
  };

  // Engagement over time data
  const engagementData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Engagement',
        data: [1200, 1900, 1500, 2800, 2200, 3100, 2600],
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#FFD700',
        pointBorderColor: '#FFA500',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  // Platform performance data
  const platformData = {
    labels: ['Instagram', 'Twitter', 'LinkedIn', 'Facebook', 'TikTok'],
    datasets: [
      {
        label: 'Posts',
        data: [89, 67, 54, 43, 32],
        backgroundColor: [
          'rgba(255, 215, 0, 0.8)',
          'rgba(255, 215, 0, 0.6)',
          'rgba(255, 215, 0, 0.5)',
          'rgba(255, 215, 0, 0.4)',
          'rgba(255, 215, 0, 0.3)'
        ],
        borderColor: '#FFD700',
        borderWidth: 2
      }
    ]
  };

  // Content type distribution
  const contentTypeData = {
    labels: ['Photo', 'Video', 'Carousel', 'Story', 'Reel'],
    datasets: [
      {
        data: [35, 25, 20, 12, 8],
        backgroundColor: [
          '#FFD700',
          '#FFA500',
          '#FFED4E',
          '#FFB700',
          '#FFC850'
        ],
        borderColor: '#1A1A1A',
        borderWidth: 3
      }
    ]
  };

  const topPosts = [
    { id: 1, platform: 'Instagram', content: 'Product launch announcement...', engagement: 3200, likes: 2800, comments: 400 },
    { id: 2, platform: 'LinkedIn', content: 'Industry insights on AI trends...', engagement: 2800, likes: 2200, comments: 600 },
    { id: 3, platform: 'Twitter', content: 'Breaking news about our latest feature...', engagement: 2400, likes: 2000, comments: 400 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-[#FFD700] font-bold">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-8 h-8 text-[#FFD700]" />
                <h1 className="text-4xl font-black bg-gradient-to-r from-[#FFD700] via-[#FFED4E] to-[#FFA500] bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
              </div>
              <p className="text-[#F5F5DC]/70">Track your performance and grow faster 📈</p>
            </div>

            <div className="flex items-center gap-3">
              <SFSSelect
                options={[
                  { value: '24h', label: 'Last 24 Hours' },
                  { value: '7d', label: 'Last 7 Days' },
                  { value: '30d', label: 'Last 30 Days' },
                  { value: '90d', label: 'Last 90 Days' }
                ]}
                value={timeRange}
                onChange={setTimeRange}
              />
              <SFSButton
                variant="outline"
                onClick={handleRefresh}
                loading={refreshing}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Refresh
              </SFSButton>
              <SFSButton
                variant="primary"
                icon={<Download className="w-4 h-4" />}
              >
                Export
              </SFSButton>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Posts"
            value={metrics.totalPosts.toLocaleString()}
            change={metrics.postsChange}
            icon={<MessageSquare className="w-6 h-6" />}
            trend="up"
          />
          <StatCard
            title="Total Engagement"
            value={metrics.totalEngagement.toLocaleString()}
            change={metrics.engagementChange}
            icon={<Heart className="w-6 h-6" />}
            trend="up"
          />
          <StatCard
            title="Total Reach"
            value={metrics.totalReach.toLocaleString()}
            change={metrics.reachChange}
            icon={<Eye className="w-6 h-6" />}
            trend={metrics.reachChange > 0 ? 'up' : 'down'}
          />
          <StatCard
            title="Total Clicks"
            value={metrics.totalClicks.toLocaleString()}
            change={metrics.clicksChange}
            icon={<MousePointerClick className="w-6 h-6" />}
            trend="up"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Engagement Over Time */}
          <SFSCard variant="elevated" className="h-96">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#FFD700] flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Engagement Over Time
              </h3>
              <SFSBadge variant="success">
                +15% vs last week
              </SFSBadge>
            </div>
            <div className="h-72">
              <Line data={engagementData} options={chartOptions} />
            </div>
          </SFSCard>

          {/* Platform Performance */}
          <SFSCard variant="elevated" className="h-96">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-[#FFD700] flex items-center gap-2">
                <Target className="w-5 h-5" />
                Platform Performance
              </h3>
              <SFSBadge variant="info">
                5 Platforms
              </SFSBadge>
            </div>
            <div className="h-72">
              <Bar data={platformData} options={chartOptions} />
            </div>
          </SFSCard>
        </div>

        {/* Additional Charts & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Content Type Distribution */}
          <SFSCard variant="elevated" className="lg:col-span-1">
            <h3 className="text-xl font-bold text-[#FFD700] flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5" />
              Content Types
            </h3>
            <div className="h-64 flex items-center justify-center">
              <Doughnut
                data={contentTypeData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      position: 'bottom' as const,
                      labels: {
                        color: '#F5F5DC',
                        padding: 15,
                        font: {
                          size: 11
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </SFSCard>

          {/* Engagement Rate Breakdown */}
          <SFSCard variant="elevated" className="lg:col-span-2">
            <h3 className="text-xl font-bold text-[#FFD700] flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5" />
              Engagement Rate Breakdown
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#F5F5DC]">Likes</span>
                  <span className="text-sm font-bold text-[#FFD700]">62%</span>
                </div>
                <SFSProgressBar value={62} variant="animated" size="lg" showLabel={false} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#F5F5DC]">Comments</span>
                  <span className="text-sm font-bold text-[#FFD700]">18%</span>
                </div>
                <SFSProgressBar value={18} variant="gradient" size="lg" showLabel={false} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#F5F5DC]">Shares</span>
                  <span className="text-sm font-bold text-[#FFD700]">12%</span>
                </div>
                <SFSProgressBar value={12} variant="default" size="lg" showLabel={false} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#F5F5DC]">Saves</span>
                  <span className="text-sm font-bold text-[#FFD700]">8%</span>
                </div>
                <SFSProgressBar value={8} variant="gradient" size="lg" showLabel={false} />
              </div>
            </div>
          </SFSCard>
        </div>

        {/* Top Performing Posts */}
        <SFSCard variant="premium">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-[#FFD700] flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Top Performing Posts
            </h3>
            <SFSButton variant="ghost" size="sm">
              View All
            </SFSButton>
          </div>

          <div className="space-y-4">
            {topPosts.map((post, index) => (
              <div
                key={post.id}
                className="p-4 bg-black/40 rounded-xl border border-[#FFD700]/20 hover:border-[#FFD700]/40 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <ScoreCircle score={90 - (index * 5)} size="sm" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <SFSBadge variant="gold" className="mb-2">
                          {post.platform}
                        </SFSBadge>
                        <p className="text-[#F5F5DC] font-medium">{post.content}</p>
                      </div>
                      <SFSButton variant="ghost" size="sm" icon={<Share2 className="w-4 h-4" />}>
                        Share
                      </SFSButton>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-[#F5F5DC]/70">
                        <Heart className="w-4 h-4 text-red-400" />
                        <span className="font-semibold">{post.likes.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#F5F5DC]/70">
                        <MessageSquare className="w-4 h-4 text-blue-400" />
                        <span className="font-semibold">{post.comments.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#F5F5DC]/70">
                        <Eye className="w-4 h-4 text-green-400" />
                        <span className="font-semibold">{post.engagement.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SFSCard>
      </div>
    </div>
  );
}
