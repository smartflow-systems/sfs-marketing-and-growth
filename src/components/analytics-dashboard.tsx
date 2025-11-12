import React, { useState, useMemo } from 'react';
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

// Register Chart.js components
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

interface AnalyticsDashboardProps {
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ timeRange = '30d' }) => {
  const [selectedRange, setSelectedRange] = useState(timeRange);
  const [activeTab, setActiveTab] = useState<'overview' | 'marketing' | 'sales' | 'customers'>('overview');

  // Generate sample data based on time range
  const generateData = useMemo(() => {
    const days = selectedRange === '7d' ? 7 : selectedRange === '30d' ? 30 : selectedRange === '90d' ? 90 : 365;
    const labels = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const revenue = Array.from({ length: days }, () => Math.floor(Math.random() * 5000) + 2000);
    const visitors = Array.from({ length: days }, () => Math.floor(Math.random() * 1000) + 500);
    const conversions = Array.from({ length: days }, () => Math.floor(Math.random() * 50) + 10);

    return { labels, revenue, visitors, conversions };
  }, [selectedRange]);

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#FFF7CC',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: '#0A0A0A',
        titleColor: '#FFD700',
        bodyColor: '#FFF7CC',
        borderColor: '#7A5A00',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: { color: '#FFE58A', maxRotation: 45, minRotation: 0 },
        grid: { color: 'rgba(122, 90, 0, 0.1)' }
      },
      y: {
        ticks: { color: '#FFE58A' },
        grid: { color: 'rgba(122, 90, 0, 0.1)' }
      }
    }
  };

  const revenueChartData = {
    labels: generateData.labels,
    datasets: [
      {
        label: 'Revenue ($)',
        data: generateData.revenue,
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const trafficChartData = {
    labels: generateData.labels,
    datasets: [
      {
        label: 'Visitors',
        data: generateData.visitors,
        backgroundColor: '#B58E00',
      }
    ]
  };

  const conversionChartData = {
    labels: ['Completed', 'Pending', 'Abandoned'],
    datasets: [
      {
        data: [65, 20, 15],
        backgroundColor: ['#FFD700', '#E6C200', '#7A5A00'],
        borderColor: '#0A0A0A',
        borderWidth: 2
      }
    ]
  };

  // Calculate totals
  const totals = useMemo(() => ({
    revenue: generateData.revenue.reduce((a, b) => a + b, 0),
    visitors: generateData.visitors.reduce((a, b) => a + b, 0),
    conversions: generateData.conversions.reduce((a, b) => a + b, 0),
    avgRevenue: Math.round(generateData.revenue.reduce((a, b) => a + b, 0) / generateData.revenue.length),
    conversionRate: ((generateData.conversions.reduce((a, b) => a + b, 0) / generateData.visitors.reduce((a, b) => a + b, 0)) * 100).toFixed(2)
  }), [generateData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gold">Analytics Dashboard</h1>
          <p className="text-gold-300 mt-1">Track your marketing and growth metrics</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedRange === range
                  ? 'btn-gold'
                  : 'btn-gold-ghost'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gold-800 pb-2">
        {(['overview', 'marketing', 'sales', 'customers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg font-semibold capitalize transition-all ${
              activeTab === tab
                ? 'bg-black-900 text-gold-500 border-b-2 border-gold-500'
                : 'text-gold-300 hover:text-gold-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-card-title">Total Revenue</div>
          <div className="stat-card-value">${totals.revenue.toLocaleString()}</div>
          <div className="stat-card-change positive">↑ 12.5% from last period</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Total Visitors</div>
          <div className="stat-card-value">{totals.visitors.toLocaleString()}</div>
          <div className="stat-card-change positive">↑ 8.3% from last period</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Conversion Rate</div>
          <div className="stat-card-value">{totals.conversionRate}%</div>
          <div className="stat-card-change positive">↑ 3.2% from last period</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Avg. Daily Revenue</div>
          <div className="stat-card-value">${totals.avgRevenue.toLocaleString()}</div>
          <div className="stat-card-change negative">↓ 2.1% from last period</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Total Conversions</div>
          <div className="stat-card-value">{totals.conversions.toLocaleString()}</div>
          <div className="stat-card-change positive">↑ 15.7% from last period</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-title">Active Campaigns</div>
          <div className="stat-card-value">12</div>
          <div className="stat-card-change positive">↑ 2 new this week</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Over Time */}
        <div className="panel-dark border-gold">
          <h3 className="text-xl font-bold text-gold mb-4">Revenue Trend</h3>
          <div className="h-64">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        {/* Traffic Over Time */}
        <div className="panel-dark border-gold">
          <h3 className="text-xl font-bold text-gold mb-4">Visitor Traffic</h3>
          <div className="h-64">
            <Bar data={trafficChartData} options={chartOptions} />
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="panel-dark border-gold">
          <h3 className="text-xl font-bold text-gold mb-4">Conversion Funnel</h3>
          <div className="h-64 flex items-center justify-center">
            <div className="w-64 h-64">
              <Doughnut data={conversionChartData} options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'bottom',
                    labels: {
                      color: '#FFF7CC',
                      font: { size: 12 }
                    }
                  }
                }
              }} />
            </div>
          </div>
        </div>

        {/* Top Channels */}
        <div className="panel-dark border-gold">
          <h3 className="text-xl font-bold text-gold mb-4">Top Channels</h3>
          <div className="space-y-3">
            {[
              { name: 'Organic Search', value: 42, color: '#FFD700' },
              { name: 'Direct', value: 28, color: '#E6C200' },
              { name: 'Social Media', value: 18, color: '#B58E00' },
              { name: 'Email', value: 12, color: '#7A5A00' }
            ].map((channel) => (
              <div key={channel.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-gold-100">{channel.name}</span>
                  <span className="text-gold-500 font-semibold">{channel.value}%</span>
                </div>
                <div className="w-full bg-black-900 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${channel.value}%`, backgroundColor: channel.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="flex justify-end gap-3">
        <button className="btn-gold-ghost">Export PDF</button>
        <button className="btn-gold-ghost">Export CSV</button>
        <button className="btn-gold">Generate Report</button>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
