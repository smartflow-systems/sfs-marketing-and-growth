import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  UserGroupIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  HeartIcon,
  ArrowRightIcon,
  ChartBarIcon,
  FunnelIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface JourneyStage {
  id: string
  name: string
  icon: any
  color: string
  visitors: number
  conversionRate: number
  avgTimeSpent: string
  dropOffRate: number
  touchpoints: string[]
}

interface CustomerSegment {
  name: string
  percentage: number
  color: string
  avgValue: number
}

export default function CustomerJourney() {
  const [selectedStage, setSelectedStage] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('30d')

  // Mock journey stages data
  const journeyStages: JourneyStage[] = [
    {
      id: 'awareness',
      name: 'Awareness',
      icon: UserGroupIcon,
      color: 'from-blue-500 to-cyan-500',
      visitors: 15420,
      conversionRate: 45.2,
      avgTimeSpent: '2m 15s',
      dropOffRate: 54.8,
      touchpoints: ['Social Media', 'SEO', 'Paid Ads', 'Word of Mouth']
    },
    {
      id: 'consideration',
      name: 'Consideration',
      icon: ChartBarIcon,
      color: 'from-purple-500 to-pink-500',
      visitors: 6970,
      conversionRate: 62.5,
      avgTimeSpent: '5m 42s',
      dropOffRate: 37.5,
      touchpoints: ['Product Pages', 'Reviews', 'Comparison Tools', 'Email']
    },
    {
      id: 'conversion',
      name: 'Purchase',
      icon: ShoppingCartIcon,
      color: 'from-green-500 to-emerald-500',
      visitors: 4356,
      conversionRate: 78.3,
      avgTimeSpent: '8m 20s',
      dropOffRate: 21.7,
      touchpoints: ['Checkout', 'Payment', 'Upsells', 'Cart Recovery']
    },
    {
      id: 'retention',
      name: 'Retention',
      icon: HeartIcon,
      color: 'from-orange-500 to-red-500',
      visitors: 3410,
      conversionRate: 42.1,
      avgTimeSpent: '12m 05s',
      dropOffRate: 57.9,
      touchpoints: ['Onboarding', 'Support', 'Email Campaigns', 'Loyalty Program']
    },
    {
      id: 'advocacy',
      name: 'Advocacy',
      icon: CreditCardIcon,
      color: 'from-pink-500 to-rose-500',
      visitors: 1436,
      conversionRate: 100,
      avgTimeSpent: '15m 30s',
      dropOffRate: 0,
      touchpoints: ['Referrals', 'Reviews', 'Social Sharing', 'Community']
    }
  ]

  // Mock customer segments
  const segments: CustomerSegment[] = [
    { name: 'New Visitors', percentage: 42, color: 'bg-blue-500', avgValue: 45 },
    { name: 'Returning Customers', percentage: 31, color: 'bg-green-500', avgValue: 125 },
    { name: 'VIP Customers', percentage: 18, color: 'bg-purple-500', avgValue: 450 },
    { name: 'Churned Users', percentage: 9, color: 'bg-gray-500', avgValue: 0 }
  ]

  // Calculate overall funnel metrics
  const totalVisitors = journeyStages[0].visitors
  const totalPurchases = journeyStages[2].visitors
  const overallConversionRate = ((totalPurchases / totalVisitors) * 100).toFixed(1)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-4"
        >
          <FunnelIcon className="h-8 w-8 text-purple-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Customer Journey Mapping
          </h1>
        </motion.div>
        <p className="text-gray-400">
          Visualize and optimize every stage of your customer's journey from awareness to advocacy.
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-8">
        {['7d', '30d', '90d', 'all'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeRange === range
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {range === '7d' && 'Last 7 days'}
            {range === '30d' && 'Last 30 days'}
            {range === '90d' && 'Last 90 days'}
            {range === 'all' && 'All time'}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        >
          <div className="text-sm text-gray-400 mb-2">Total Visitors</div>
          <div className="text-3xl font-bold text-white mb-1">
            {totalVisitors.toLocaleString()}
          </div>
          <div className="text-sm text-green-400">↑ 12.5% vs last period</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        >
          <div className="text-sm text-gray-400 mb-2">Overall Conversion Rate</div>
          <div className="text-3xl font-bold text-white mb-1">{overallConversionRate}%</div>
          <div className="text-sm text-green-400">↑ 3.2% vs last period</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        >
          <div className="text-sm text-gray-400 mb-2">Avg. Customer Value</div>
          <div className="text-3xl font-bold text-white mb-1">$247</div>
          <div className="text-sm text-red-400">↓ 2.1% vs last period</div>
        </motion.div>
      </div>

      {/* Journey Funnel Visualization */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Journey Funnel</h2>

        <div className="space-y-6">
          {journeyStages.map((stage, index) => {
            const widthPercentage = (stage.visitors / totalVisitors) * 100
            const isSelected = selectedStage === stage.id

            return (
              <div key={stage.id}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedStage(isSelected ? null : stage.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${stage.color}`}>
                      <stage.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg font-semibold text-white">{stage.name}</span>
                        <span className="text-sm text-gray-400">
                          {stage.visitors.toLocaleString()} visitors
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="relative h-8 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${widthPercentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className={`h-full bg-gradient-to-r ${stage.color} flex items-center justify-end pr-4`}
                        >
                          <span className="text-sm font-medium text-white">
                            {stage.conversionRate}% conversion
                          </span>
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-16 mt-4 bg-white/5 rounded-lg p-6 border border-white/10"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Avg. Time Spent</div>
                          <div className="text-lg font-semibold text-white flex items-center gap-2">
                            <ClockIcon className="h-4 w-4" />
                            {stage.avgTimeSpent}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Drop-off Rate</div>
                          <div className="text-lg font-semibold text-red-400">
                            {stage.dropOffRate}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Conversion Rate</div>
                          <div className="text-lg font-semibold text-green-400">
                            {stage.conversionRate}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-1">Visitors</div>
                          <div className="text-lg font-semibold text-white">
                            {stage.visitors.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-300 mb-3">Key Touchpoints</div>
                        <div className="flex flex-wrap gap-2">
                          {stage.touchpoints.map((touchpoint) => (
                            <span
                              key={touchpoint}
                              className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sm text-gray-300"
                            >
                              {touchpoint}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Arrow between stages */}
                {index < journeyStages.length - 1 && (
                  <div className="flex justify-center my-2">
                    <ArrowRightIcon className="h-6 w-6 text-gray-600 rotate-90" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Customer Segments */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Customer Segments</h2>

        <div className="space-y-4">
          {segments.map((segment, index) => (
            <motion.div
              key={segment.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{segment.name}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">{segment.percentage}% of users</span>
                    <span className="text-gray-300">
                      Avg: ${segment.avgValue}
                    </span>
                  </div>
                </div>
                <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${segment.percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-full ${segment.color}`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Insights */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Key Insights</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold">
                ✓
              </div>
              <p className="text-sm text-gray-300">
                <strong>High consideration rate:</strong> 62.5% of aware users move to consideration - your messaging is resonating well.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 text-xs font-bold">
                !
              </div>
              <p className="text-sm text-gray-300">
                <strong>Retention opportunity:</strong> 57.9% drop-off after purchase. Improve onboarding and post-purchase engagement.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">
                ★
              </div>
              <p className="text-sm text-gray-300">
                <strong>VIP segment growth:</strong> Your top 18% of customers generate 68% of revenue. Focus on expanding this segment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
