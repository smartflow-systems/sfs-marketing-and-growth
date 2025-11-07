import React, { useState, useEffect } from 'react';

interface PerformanceMetric {
  id: string;
  category: 'speed' | 'seo' | 'accessibility' | 'best-practices';
  title: string;
  score: number;
  impact: 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
  implemented: boolean;
}

interface PerformanceSuggestion {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'hard';
  category: string;
  estimatedImprovement: string;
}

export const PerformanceOptimizer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'suggestions' | 'metrics'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Sample performance metrics
  const metrics: PerformanceMetric[] = [
    {
      id: '1',
      category: 'speed',
      title: 'Page Load Time',
      score: 78,
      impact: 'high',
      description: 'Your pages load in 2.3 seconds on average',
      recommendation: 'Implement lazy loading for images and optimize bundle size',
      implemented: false
    },
    {
      id: '2',
      category: 'speed',
      title: 'First Contentful Paint',
      score: 85,
      impact: 'high',
      description: 'Users see content within 1.2 seconds',
      recommendation: 'Good! Consider implementing service workers for better caching',
      implemented: false
    },
    {
      id: '3',
      category: 'seo',
      title: 'SEO Score',
      score: 92,
      impact: 'high',
      description: 'Your SEO is excellent',
      recommendation: 'Add more structured data markup for rich snippets',
      implemented: false
    },
    {
      id: '4',
      category: 'accessibility',
      title: 'Accessibility',
      score: 88,
      impact: 'medium',
      description: 'Most accessibility standards met',
      recommendation: 'Add ARIA labels to interactive elements',
      implemented: false
    },
    {
      id: '5',
      category: 'best-practices',
      title: 'Security',
      score: 95,
      impact: 'high',
      description: 'Strong security practices detected',
      recommendation: 'Implement Content Security Policy headers',
      implemented: false
    }
  ];

  const suggestions: PerformanceSuggestion[] = [
    {
      id: '1',
      title: 'Enable Image Lazy Loading',
      description: 'Load images only when they enter the viewport to reduce initial page load time',
      impact: 'high',
      effort: 'easy',
      category: 'Speed',
      estimatedImprovement: '20-30% faster initial load'
    },
    {
      id: '2',
      title: 'Implement Code Splitting',
      description: 'Split your JavaScript bundle into smaller chunks loaded on demand',
      impact: 'high',
      effort: 'medium',
      category: 'Speed',
      estimatedImprovement: '15-25% smaller bundle size'
    },
    {
      id: '3',
      title: 'Add Service Worker Caching',
      description: 'Cache static assets and API responses for offline access and faster loads',
      impact: 'medium',
      effort: 'medium',
      category: 'Speed',
      estimatedImprovement: '50-70% faster repeat visits'
    },
    {
      id: '4',
      title: 'Optimize Database Queries',
      description: 'Add indexes to frequently queried fields and optimize N+1 queries',
      impact: 'high',
      effort: 'medium',
      category: 'Backend',
      estimatedImprovement: '40-60% faster API responses'
    },
    {
      id: '5',
      title: 'Enable HTTP/2 Server Push',
      description: 'Push critical resources before the browser requests them',
      impact: 'medium',
      effort: 'easy',
      category: 'Speed',
      estimatedImprovement: '10-15% faster page loads'
    },
    {
      id: '6',
      title: 'Implement CDN Distribution',
      description: 'Distribute static assets across global CDN nodes',
      impact: 'high',
      effort: 'easy',
      category: 'Speed',
      estimatedImprovement: '30-50% faster global load times'
    },
    {
      id: '7',
      title: 'Add Structured Data',
      description: 'Implement JSON-LD schema markup for better search engine understanding',
      impact: 'medium',
      effort: 'easy',
      category: 'SEO',
      estimatedImprovement: 'Rich snippets in search results'
    },
    {
      id: '8',
      title: 'Optimize Critical Rendering Path',
      description: 'Inline critical CSS and defer non-critical JavaScript',
      impact: 'high',
      effort: 'hard',
      category: 'Speed',
      estimatedImprovement: '25-35% faster First Contentful Paint'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-gold-500';
    return 'text-red-400';
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'medium':
        return 'bg-gold-500/20 text-gold-300 border-gold-500/50';
      case 'low':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'easy':
        return 'bg-green-500/20 text-green-300 border-green-500/50';
      case 'medium':
        return 'bg-gold-500/20 text-gold-300 border-gold-500/50';
      case 'hard':
        return 'bg-red-500/20 text-red-300 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  const overallScore = Math.round(
    metrics.reduce((acc, m) => acc + m.score, 0) / metrics.length
  );

  const categories = ['all', ...new Set(suggestions.map(s => s.category))];

  const filteredSuggestions = selectedCategory === 'all'
    ? suggestions
    : suggestions.filter(s => s.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gold mb-2">Performance Optimizer</h1>
        <p className="text-gold-300">Analyze and improve your site performance</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gold-800 pb-2">
        {(['overview', 'suggestions', 'metrics'] as const).map((tab) => (
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Overall Score */}
          <div className="panel-dark border-gold text-center">
            <h2 className="text-xl font-bold text-gold mb-4">Overall Performance Score</h2>
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(overallScore)}`}>
              {overallScore}
            </div>
            <p className="text-gold-300">out of 100</p>
            <div className="mt-6 flex justify-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gold">{suggestions.length}</div>
                <div className="text-sm text-gold-300">Suggestions</div>
              </div>
              <div className="w-px bg-gold-800"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold">
                  {suggestions.filter(s => s.impact === 'high').length}
                </div>
                <div className="text-sm text-gold-300">High Impact</div>
              </div>
              <div className="w-px bg-gold-800"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold">
                  {suggestions.filter(s => s.effort === 'easy').length}
                </div>
                <div className="text-sm text-gold-300">Quick Wins</div>
              </div>
            </div>
          </div>

          {/* Category Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <div key={metric.id} className="stat-card">
                <div className="flex justify-between items-start mb-2">
                  <div className="stat-card-title">{metric.title}</div>
                  <div className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>
                    {metric.score}
                  </div>
                </div>
                <p className="text-sm text-gold-100 mb-2">{metric.description}</p>
                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${getImpactColor(metric.impact)}`}>
                  {metric.impact.toUpperCase()} IMPACT
                </span>
              </div>
            ))}
          </div>

          {/* Quick Wins */}
          <div className="panel-dark border-gold">
            <h3 className="text-xl font-bold text-gold mb-4">🚀 Quick Wins</h3>
            <div className="space-y-3">
              {suggestions
                .filter(s => s.effort === 'easy' && s.impact === 'high')
                .slice(0, 3)
                .map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="p-4 bg-black-900 rounded-lg border border-gold-800 hover:border-gold-600 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gold">{suggestion.title}</h4>
                      <span className="text-xs badge-gold">{suggestion.category}</span>
                    </div>
                    <p className="text-sm text-gold-100 mb-2">{suggestion.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gold-300">
                        ⚡ {suggestion.estimatedImprovement}
                      </span>
                      <button className="btn-gold px-4 py-1 text-sm">Implement</button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold capitalize transition-all ${
                  selectedCategory === category
                    ? 'btn-gold'
                    : 'btn-gold-ghost'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Suggestions List */}
          <div className="space-y-4">
            {filteredSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="panel-dark border-gold">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-2">
                      <h4 className="text-lg font-bold text-gold">{suggestion.title}</h4>
                      <span className="badge-gold text-xs">{suggestion.category}</span>
                    </div>
                    <p className="text-gold-100 mb-3">{suggestion.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded text-xs font-semibold border ${getImpactColor(suggestion.impact)}`}>
                        {suggestion.impact.toUpperCase()} IMPACT
                      </span>
                      <span className={`px-3 py-1 rounded text-xs font-semibold border ${getEffortColor(suggestion.effort)}`}>
                        {suggestion.effort.toUpperCase()} EFFORT
                      </span>
                      <span className="px-3 py-1 rounded text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/50">
                        {suggestion.estimatedImprovement}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-gold-ghost">Learn More</button>
                    <button className="btn-gold">Apply Fix</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="space-y-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="panel-dark border-gold">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-bold text-gold mb-1">{metric.title}</h4>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${getImpactColor(metric.impact)}`}>
                    {metric.impact.toUpperCase()} IMPACT
                  </span>
                </div>
                <div className={`text-4xl font-bold ${getScoreColor(metric.score)}`}>
                  {metric.score}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-black-900 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      metric.score >= 90
                        ? 'bg-green-500'
                        : metric.score >= 70
                        ? 'bg-gold-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${metric.score}%` }}
                  />
                </div>
              </div>

              <p className="text-gold-100 mb-3">{metric.description}</p>
              <div className="p-4 bg-black-900 rounded-lg border border-gold-800">
                <div className="text-sm font-semibold text-gold-300 mb-1">
                  💡 Recommendation:
                </div>
                <div className="text-gold-100">{metric.recommendation}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PerformanceOptimizer;
